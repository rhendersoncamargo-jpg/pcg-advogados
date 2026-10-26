import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb, logAudit, logNotification } from '@/lib/dbService';
import { db as dbFirestore } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    return NextResponse.json(db.teams || []);
  } catch (error: any) {
    console.error('Fetch teams error:', error);
    return NextResponse.json({ error: 'Erro ao carregar equipes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    const body = await req.json();
    const { actorId, action, teamData } = body;
    const data = teamData || body;

    const actor = db.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'CEO/Proprietário') {
      return NextResponse.json(
        { error: 'Apenas sócios-diretores com o perfil "CEO/Proprietário" possuem permissão para gerenciar equipes.' },
        { status: 403 }
      );
    }

    if (!db.teams) db.teams = [];

    switch (action) {
      case 'CREATE': {
        const coordinatorUser = db.users.find(u => u.id === data.coordinatorId);
        const substituteUser = db.users.find(u => u.id === data.substituteResponsibleId || u.id === data.substituteId);

        const newTeam = {
          id: `team-${Date.now()}`,
          name: (data.name || '').trim(),
          description: (data.description || '').trim(),
          coordinatorId: data.coordinatorId || '',
          coordinatorName: data.coordinatorName || coordinatorUser?.name || '',
          legalArea: data.legalArea || 'Geral',
          memberIds: data.memberIds || data.members || [],
          substituteResponsibleId: data.substituteResponsibleId || data.substituteId || '',
          substituteResponsibleName: data.substituteResponsibleName || substituteUser?.name || '',
          status: data.status || 'Ativo',
          createdAt: new Date().toISOString(),
          notes: data.notes || '',
          accessRules: data.accessRules || 'Acesso padrão',
          linkedProcessIds: [],
          linkedClientIds: [],
          linkedDocumentIds: []
        };

        db.teams.push(newTeam);
        saveDb(db);

        if (dbFirestore) {
          try {
            const cleanTeam = JSON.parse(JSON.stringify(newTeam));
            delete cleanTeam.id;
            await setDoc(doc(dbFirestore, 'teams', newTeam.id), cleanTeam);
          } catch (fErr) {
            console.warn('Direct Firestore newTeam write error:', fErr);
          }
        }

        logAudit(
          actor.id,
          actor.name,
          'TEAM_CHANGE',
          'system',
          'Equipes',
          `Criou a equipe "${newTeam.name}" coordenada por ${newTeam.coordinatorName || 'não atribuído'}.`
        );

        logNotification(
          'all',
          'Nova Equipe Criada',
          `A equipe "${newTeam.name}" foi constituída sob coordenação de ${newTeam.coordinatorName || 'diretoria'}.`,
          'config'
        );

        return NextResponse.json({ success: true, team: newTeam });
      }

      case 'UPDATE': {
        const targetId = data.id || body.id;
        const idx = db.teams.findIndex(t => t.id === targetId);
        if (idx === -1) {
          return NextResponse.json({ error: 'Equipe não encontrada.' }, { status: 404 });
        }

        const coordinatorUser = db.users.find(u => u.id === data.coordinatorId);
        const substituteUser = db.users.find(u => u.id === data.substituteResponsibleId || u.id === data.substituteId);

        const oldTeam = db.teams[idx];
        const updatedTeam = {
          ...oldTeam,
          name: (data.name || '').trim(),
          description: (data.description || '').trim(),
          coordinatorId: data.coordinatorId || oldTeam.coordinatorId,
          coordinatorName: data.coordinatorName || coordinatorUser?.name || oldTeam.coordinatorName,
          legalArea: data.legalArea || oldTeam.legalArea,
          memberIds: data.memberIds || data.members || oldTeam.memberIds,
          substituteResponsibleId: data.substituteResponsibleId || data.substituteId || oldTeam.substituteResponsibleId,
          substituteResponsibleName: data.substituteResponsibleName || substituteUser?.name || oldTeam.substituteResponsibleName,
          status: data.status || oldTeam.status,
          notes: data.notes !== undefined ? data.notes : oldTeam.notes,
          accessRules: data.accessRules || oldTeam.accessRules,
        };

        db.teams[idx] = updatedTeam;
        saveDb(db);

        if (dbFirestore) {
          try {
            const cleanTeam = JSON.parse(JSON.stringify(updatedTeam));
            delete cleanTeam.id;
            await setDoc(doc(dbFirestore, 'teams', updatedTeam.id), cleanTeam);
          } catch (fErr) {
            console.warn('Direct Firestore updatedTeam write error:', fErr);
          }
        }

        logAudit(
          actor.id,
          actor.name,
          'TEAM_CHANGE',
          'system',
          'Equipes',
          `Atualizou dados da equipe "${updatedTeam.name}".`
        );

        return NextResponse.json({ success: true, team: updatedTeam });
      }

      case 'DELETE': {
        const idToDelete = data.id || body.id;
        const team = db.teams.find(t => t.id === idToDelete);
        if (!team) {
          return NextResponse.json({ error: 'Equipe não encontrada.' }, { status: 404 });
        }

        db.teams = db.teams.filter(t => t.id !== idToDelete);
        saveDb(db);

        if (dbFirestore) {
          try {
            await deleteDoc(doc(dbFirestore, 'teams', idToDelete));
          } catch (fErr) {
            console.warn('Direct Firestore team delete error:', fErr);
          }
        }

        logAudit(
          actor.id,
          actor.name,
          'TEAM_CHANGE',
          'system',
          'Equipes',
          `Excluiu a equipe "${team.name}".`
        );

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Teams manage error:', error);
    return NextResponse.json({ error: 'Erro interno ao gerenciar equipes.' }, { status: 500 });
  }
}
