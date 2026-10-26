import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb, deleteFromFirestore, logAudit, logNotification, DBUser } from '@/lib/dbService';
import { generateSalt, hashPassword } from '@/lib/cryptoHelper';
import { db as firestoreDb } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const PROTECTED_IDS = ['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actorId, action, ...params } = body;

    if (!actorId || !action) {
      return NextResponse.json(
        { error: 'Parâmetros insuficientes: actorId e action são obrigatórios.' },
        { status: 400 }
      );
    }

    const db = await syncFromFirestore();

    // Verify actor exists
    const actor = db.users.find((u) => u.id === actorId);
    if (!actor) {
      return NextResponse.json(
        { error: 'Membro do sistema não encontrado.' },
        { status: 403 }
      );
    }

    // Role administration rule: Only "CEO/Proprietário" can perform administrative actions on users
    if (actor.role !== 'CEO/Proprietário') {
      return NextResponse.json(
        { error: 'Apenas sócios-diretores com o perfil "CEO/Proprietário" possuem permissão para executar esta ação administrativa.' },
        { status: 403 }
      );
    }

    // Verify actor is active
    if (!actor.mfa || actor.status === 'Desativado' || actor.status === 'Bloqueado') {
      return NextResponse.json(
        { error: 'Seu usuário está inativo ou bloqueado e não pode executar ações de administração.' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'CREATE': {
        const { 
          name, email, team, role, username, phone, cargo, 
          additionalTeams, legalAreas, customPermissions, status, 
          startDate, endDate, allowedAccessHours, adminNotes 
        } = params;

        if (!name || !email || !team || !role || !username) {
          return NextResponse.json(
            { error: 'Nome, e-mail, equipe principal, cargo e login são obrigatórios.' },
            { status: 400 }
          );
        }

        // Validate username login formatting
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(username)) {
          return NextResponse.json(
            { error: 'O login do usuário deve conter apenas letras, números, pontos, hífens ou underlines.' },
            { status: 400 }
          );
        }

        // Check duplicates
        const existsUsername = db.users.some(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        if (existsUsername) {
          return NextResponse.json(
            { error: `O login "${username}" já está em uso.` },
            { status: 400 }
          );
        }

        const existsEmail = db.users.some(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existsEmail) {
          return NextResponse.json(
            { error: `O e-mail "${email}" já está em uso.` },
            { status: 400 }
          );
        }

        // Generate salt & password
        const salt = generateSalt();
        const hash = hashPassword('PCG123456', salt);

        const newUser: DBUser = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          team: team.trim(),
          role: role.trim(),
          mfa: status !== 'Desativado' && status !== 'Bloqueado', // Active boolean representation
          lastAccess: 'Nunca acessou',
          passwordSalt: salt,
          passwordHash: hash,
          mustChangePassword: true,
          
          // Rich extended properties
          phone: phone?.trim() || '',
          cargo: cargo?.trim() || role,
          additionalTeams: additionalTeams || [],
          legalAreas: legalAreas || [],
          customPermissions: customPermissions || [],
          status: status || 'Convite pendente',
          startDate: startDate || '',
          endDate: endDate || '',
          allowedAccessHours: allowedAccessHours || '',
          adminNotes: adminNotes || ''
        };

        db.users.push(newUser);
        saveDb(db);

        if (firestoreDb) {
          try {
            const cleanUser = JSON.parse(JSON.stringify(newUser));
            delete cleanUser.id;
            await setDoc(doc(firestoreDb, 'users', newUser.id), cleanUser);
          } catch (fErr) {
            console.warn('Direct Firestore newUser write error:', fErr);
          }
        }

        logAudit(
          actor.id,
          actor.name,
          'CREATE',
          newUser.id,
          newUser.name,
          `Criou o novo usuário "${newUser.username}" com status "${newUser.status}" e perfil "${newUser.role}".`
        );

        logNotification(
          'all',
          'Novo Usuário Convidado',
          `O usuário "${newUser.name}" (${newUser.role}) foi convidado por ${actor.name} com login "${newUser.username}".`,
          'sistema'
        );

        return NextResponse.json({ success: true, user: newUser });
      }

      case 'UPDATE': {
        const { 
          id, name, email, team, role, username, phone, cargo, 
          additionalTeams, legalAreas, customPermissions, status, 
          startDate, endDate, allowedAccessHours, adminNotes, justification 
        } = params;

        if (!id || !name || !email || !team || !role || !username) {
          return NextResponse.json(
            { error: 'Campos incompletos para edição.' },
            { status: 400 }
          );
        }

        const userIndex = db.users.findIndex((u) => u.id === id);
        if (userIndex === -1) {
          return NextResponse.json(
            { error: 'Usuário não encontrado.' },
            { status: 404 }
          );
        }

        const existingUser = db.users[userIndex];
        const isProtected = PROTECTED_IDS.includes(id);

        // Security constraints for protected Proprietário accounts
        if (isProtected) {
          if (role !== 'CEO/Proprietário') {
            return NextResponse.json(
              { error: 'Este usuário proprietário principal é protegido e não pode perder a função de CEO/Proprietário.' },
              { status: 400 }
            );
          }
          if (status !== 'Ativo') {
            return NextResponse.json(
              { error: 'Este usuário proprietário principal é protegido e seu status deve permanecer Ativo.' },
              { status: 400 }
            );
          }
          if (!justification || justification.trim().length < 5) {
            return NextResponse.json(
              { error: 'Alterações cadastrais sensíveis em contas de Sócios Proprietários exigem uma justificativa fundamentada por escrito.' },
              { status: 400 }
            );
          }
        }

        // Check constraints
        const usernameConflict = db.users.some(
          (u) => u.id !== id && u.username.toLowerCase() === username.trim().toLowerCase()
        );
        if (usernameConflict) {
          return NextResponse.json(
            { error: `O login "${username}" já está sendo usado por outro usuário.` },
            { status: 400 }
          );
        }

        const emailConflict = db.users.some(
          (u) => u.id !== id && u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (emailConflict) {
          return NextResponse.json(
            { error: `O e-mail "${email}" já está sendo usado por outro usuário.` },
            { status: 400 }
          );
        }

        // Audit trace status changes
        const formerStatus = existingUser.status || 'Ativo';
        const newStatus = status || 'Ativo';
        const statusChanged = formerStatus !== newStatus;

        // Apply changes
        existingUser.name = name.trim();
        existingUser.username = username.trim();
        existingUser.email = email.trim().toLowerCase();
        existingUser.team = team.trim();
        existingUser.role = role.trim();
        existingUser.mfa = newStatus !== 'Desativado' && newStatus !== 'Bloqueado';
        
        // Extended parameters
        existingUser.phone = phone?.trim() || '';
        existingUser.cargo = cargo?.trim() || role;
        existingUser.additionalTeams = additionalTeams || [];
        existingUser.legalAreas = legalAreas || [];
        existingUser.customPermissions = customPermissions || [];
        existingUser.status = newStatus;
        existingUser.startDate = startDate || '';
        existingUser.endDate = endDate || '';
        existingUser.allowedAccessHours = allowedAccessHours || '';
        existingUser.adminNotes = adminNotes || '';

        saveDb(db);

        if (firestoreDb) {
          try {
            const cleanUser = JSON.parse(JSON.stringify(existingUser));
            delete cleanUser.id;
            await setDoc(doc(firestoreDb, 'users', existingUser.id), cleanUser);
          } catch (fErr) {
            console.warn('Direct Firestore updated user write error:', fErr);
          }
        }

        // Detailed Audit
        let detailsMsg = `Editou dados do usuário "${existingUser.username}".`;
        if (statusChanged) {
          detailsMsg += ` Mudança de status: de "${formerStatus}" para "${newStatus}".`;
        }
        if (isProtected && justification) {
          detailsMsg += ` Justificativa fundamentada: "${justification}".`;
        }

        logAudit(
          actor.id,
          actor.name,
          statusChanged ? 'STATUS_CHANGE' : 'UPDATE',
          existingUser.id,
          existingUser.name,
          detailsMsg
        );

        // Notify other owners if it was a protected account change
        if (isProtected) {
          PROTECTED_IDS.forEach((ownerId) => {
            if (ownerId !== actor.id) {
              logNotification(
                ownerId,
                'Alteração em Conta de Proprietário',
                `A conta de Sócio Proprietário de "${existingUser.name}" teve dados cadastrais editados por ${actor.name}. Justificativa: "${justification}".`,
                'sistema'
              );
            }
          });
        }

        return NextResponse.json({ success: true, user: existingUser });
      }

      case 'CHECK_RESPONSIBILITIES': {
        const { userId } = params;
        if (!userId) {
          return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
        }

        const user = db.users.find(u => u.id === userId);
        if (!user) {
          return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
        }

        const uName = user.name;

        // Query collections for records under this user's name
        const associatedProcesses = (db.processes || []).filter(p => p.responsible === uName);
        const associatedDeadlines = (db.deadlines || []).filter(d => d.responsible === uName && d.status !== 'Cumprido');
        const associatedEvents = (db.events || []).filter(e => e.responsible === uName);
        const associatedLeads = (db.crmLeads || []).filter(l => l.responsible === uName);

        const counts = {
          processes: associatedProcesses.length,
          deadlines: associatedDeadlines.length,
          events: associatedEvents.length,
          leads: associatedLeads.length
        };

        const total = counts.processes + counts.deadlines + counts.events + counts.leads;

        return NextResponse.json({
          success: true,
          userId,
          userName: uName,
          hasResponsibilities: total > 0,
          counts,
          responsibilities: {
            processes: associatedProcesses.map(p => ({ id: p.id, title: p.caseDescription, subtitle: p.client, identifier: p.cnj })),
            deadlines: associatedDeadlines.map(d => ({ id: d.id, title: d.description, subtitle: d.processClient, identifier: d.dueDate })),
            events: associatedEvents.map(e => ({ id: e.id, title: e.title, subtitle: e.process, identifier: `${e.date} ${e.start}` })),
            leads: associatedLeads.map(l => ({ id: l.id, title: l.name, subtitle: l.email, identifier: l.phone }))
          }
        });
      }

      case 'DEACTIVATE_WITH_TRANSFER': {
        const { userId, substituteId, justification } = params;
        if (!userId || !substituteId) {
          return NextResponse.json(
            { error: 'Parâmetros insuficientes: userId e substituteId são obrigatórios.' },
            { status: 400 }
          );
        }

        if (PROTECTED_IDS.includes(userId)) {
          return NextResponse.json(
            { error: 'Este usuário proprietário principal é protegido e não pode ser desativado.' },
            { status: 400 }
          );
        }

        const user = db.users.find(u => u.id === userId);
        const substitute = db.users.find(u => u.id === substituteId);

        if (!user || !substitute) {
          return NextResponse.json({ error: 'Usuário ou substituto não encontrado.' }, { status: 404 });
        }

        const uName = user.name;
        const subName = substitute.name;

        // Perform the atomic redistribution transactions in the database
        let transferredProcessesCount = 0;
        if (db.processes) {
          db.processes = db.processes.map(p => {
            if (p.responsible === uName) {
              transferredProcessesCount++;
              // Add historic record
              if (!p.history) p.history = [];
              p.history.unshift({
                id: `hist-${Date.now()}`,
                date: 'Hoje',
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                user: 'Sistema - PCG.OS',
                actionType: 'Redistribuição de Responsável',
                description: `Responsabilidade redistribuída de ${uName} para ${subName} (Assistente de Desativação).`
              });
              return { ...p, responsible: subName };
            }
            return p;
          });
        }

        let transferredDeadlinesCount = 0;
        if (db.deadlines) {
          db.deadlines = db.deadlines.map(d => {
            if (d.responsible === uName && d.status !== 'Cumprido') {
              transferredDeadlinesCount++;
              return { ...d, responsible: subName };
            }
            return d;
          });
        }

        let transferredEventsCount = 0;
        if (db.events) {
          db.events = db.events.map(e => {
            if (e.responsible === uName) {
              transferredEventsCount++;
              return { ...e, responsible: subName };
            }
            return e;
          });
        }

        let transferredLeadsCount = 0;
        if (db.crmLeads) {
          db.crmLeads = db.crmLeads.map(l => {
            if (l.responsible === uName) {
              transferredLeadsCount++;
              if (!l.history) l.history = [];
              l.history.unshift({
                id: `h-trans-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                responsible: subName,
                situation: 'Transferido',
                description: `Responsabilidade redistribuída de ${uName} para ${subName} (Assistente de Desativação).`
              });
              return { ...l, responsible: subName };
            }
            return l;
          });
        }

        // Change user status to inactive
        const oldStatus = user.status || 'Ativo';
        user.status = 'Desativado';
        user.mfa = false; // Lock out
        user.adminNotes = `Desativado por ${actor.name} em ${new Date().toLocaleDateString('pt-BR')}. Justificativa: "${justification || 'Nenhuma'}".`;

        saveDb(db);

        const auditDetails = `Desativou o usuário "${user.username}" (${user.name}) com justificativa: "${justification || 'Nenhuma'}" e redistribuiu todas as responsabilidades para "${subName}". Itens transferidos: ${transferredProcessesCount} processos, ${transferredDeadlinesCount} prazos, ${transferredEventsCount} eventos, ${transferredLeadsCount} leads.`;

        logAudit(
          actor.id,
          actor.name,
          'DEACTIVATE',
          user.id,
          user.name,
          auditDetails
        );

        logNotification(
          'all',
          'Usuário Desativado & Ativos Redistribuídos',
          `O usuário "${user.name}" foi desativado. Todas as suas pendências operacionais foram transferidas automaticamente para "${subName}".`,
          'sistema'
        );

        return NextResponse.json({
          success: true,
          transferred: {
            processes: transferredProcessesCount,
            deadlines: transferredDeadlinesCount,
            events: transferredEventsCount,
            leads: transferredLeadsCount
          }
        });
      }

      case 'TOGGLE_STATUS': {
        const { id, status, justification } = params;

        if (!id || !status) {
          return NextResponse.json(
            { error: 'Campos insuficientes para alteração de status.' },
            { status: 400 }
          );
        }

        const user = db.users.find((u) => u.id === id);
        if (!user) {
          return NextResponse.json(
            { error: 'Usuário não encontrado.' },
            { status: 404 }
          );
        }

        // Protection constraints
        if (PROTECTED_IDS.includes(id)) {
          if (status !== 'Ativo') {
            return NextResponse.json(
              { error: 'Este usuário proprietário principal é protegido e seu status não pode ser alterado para inativo, afastado, suspenso ou bloqueado.' },
              { status: 400 }
            );
          }
        }

        const formerStatus = user.status || 'Ativo';
        user.status = status;
        user.mfa = status !== 'Desativado' && status !== 'Bloqueado'; // representation lock
        
        saveDb(db);

        if (firestoreDb) {
          try {
            const cleanUser = JSON.parse(JSON.stringify(user));
            delete cleanUser.id;
            await setDoc(doc(firestoreDb, 'users', user.id), cleanUser);
          } catch (fErr) {
            console.warn('Direct Firestore toggle_status write error:', fErr);
          }
        }

        logAudit(
          actor.id,
          actor.name,
          'STATUS_CHANGE',
          user.id,
          user.name,
          `Mudança de status do usuário "${user.username}" de "${formerStatus}" para "${status}". Justificativa: "${justification || 'Nenhuma Specified'}".`
        );

        return NextResponse.json({ success: true, user });
      }

      case 'DELETE': {
        const { id, justification } = params;

        if (!id) {
          return NextResponse.json(
            { error: 'ID do usuário é obrigatório para exclusão.' },
            { status: 400 }
          );
        }

        // Protection: Can't delete protected CEOs
        if (PROTECTED_IDS.includes(id)) {
          return NextResponse.json(
            { error: 'Este usuário proprietário principal é estritamente protegido contra exclusão.' },
            { status: 400 }
          );
        }

        const user = db.users.find((u) => u.id === id);
        if (!user) {
          return NextResponse.json(
            { error: 'Usuário não encontrado.' },
            { status: 404 }
          );
        }

        // Check if there are active ties before delete too!
        const uName = user.name;
        const totalResponsibilities = 
          (db.processes || []).filter(p => p.responsible === uName).length +
          (db.deadlines || []).filter(d => d.responsible === uName && d.status !== 'Cumprido').length +
          (db.events || []).filter(e => e.responsible === uName).length +
          (db.crmLeads || []).filter(l => l.responsible === uName).length;

        if (totalResponsibilities > 0) {
          return NextResponse.json(
            { error: `O usuário possui ${totalResponsibilities} atribuições ativas no sistema. Use o Assistente de Desativação para transferi-las antes de removê-lo.` },
            { status: 400 }
          );
        }

        // Perform deletion
        db.users = db.users.filter((u) => u.id !== id);
        saveDb(db);
        await deleteFromFirestore('users', id);

        logAudit(
          actor.id,
          actor.name,
          'DELETE',
          id,
          user.name,
          `Excluiu definitivamente o cadastro do usuário "${user.username}" (${user.name}) com justificativa: "${justification || 'Nenhuma'}".`
        );

        logNotification(
          'all',
          'Cadastro de Usuário Excluído',
          `O cadastro do usuário "${user.name}" foi permanentemente removido por ${actor.name}.`,
          'sistema'
        );

        return NextResponse.json({ success: true });
      }

      case 'RESET_PASSWORD': {
        const { id, justification } = params;

        if (!id) {
          return NextResponse.json(
            { error: 'ID do usuário é obrigatório para redefinir senha.' },
            { status: 400 }
          );
        }

        const user = db.users.find((u) => u.id === id);
        if (!user) {
          return NextResponse.json(
            { error: 'Usuário não encontrado.' },
            { status: 404 }
          );
        }

        // Owner protection: reset requires justification
        if (PROTECTED_IDS.includes(id)) {
          if (!justification || justification.trim().length < 5) {
            return NextResponse.json(
              { error: 'A redefinição de senha para um Sócio Proprietário é uma operação crítica e exige uma justificativa fundamentada.' },
              { status: 400 }
            );
          }
        }

        // Reset password to default PCG123456
        const salt = generateSalt();
        user.passwordSalt = salt;
        user.passwordHash = hashPassword('PCG123456', salt);
        user.mustChangePassword = true; // Exige alteração no próximo acesso

        saveDb(db);

        if (firestoreDb) {
          try {
            const cleanUser = JSON.parse(JSON.stringify(user));
            delete cleanUser.id;
            await setDoc(doc(firestoreDb, 'users', user.id), cleanUser);
          } catch (fErr) {
            console.warn('Direct Firestore reset_password write error:', fErr);
          }
        }

        logAudit(
          actor.id,
          actor.name,
          'CHANGE_PASSWORD',
          user.id,
          user.name,
          `Redefiniu a senha do usuário "${user.username}" para o padrão inicial "PCG123456" com alteração obrigatória. Justificativa: "${justification || 'Solicitado pelo administrador'}".`
        );

        if (PROTECTED_IDS.includes(id)) {
          PROTECTED_IDS.forEach((ownerId) => {
            if (ownerId !== actor.id) {
              logNotification(
                ownerId,
                'Senha de Proprietário Redefinida',
                `A senha da conta de Sócio Proprietário de "${user.name}" foi redefinida por ${actor.name}. Justificativa: "${justification}".`,
                'sistema'
              );
            }
          });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Ação de gerenciamento desconhecida.' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Users manage error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar operação de gerenciamento de usuários.' },
      { status: 500 }
    );
  }
}
