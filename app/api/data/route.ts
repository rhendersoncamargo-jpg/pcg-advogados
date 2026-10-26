import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb, logAudit, registerDeletedId } from '@/lib/dbService';
import { db as dbFirestore, disableFirestore } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// Sequential write queue to eliminate race conditions between concurrent requests
let writeQueue: Promise<any> = Promise.resolve();

export async function GET(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    
    // Ensure state collections are arrays
    let updated = false;
    if (!db.processes) {
      db.processes = [];
      updated = true;
    }
    if (!db.crmLeads) {
      db.crmLeads = [];
      updated = true;
    }
    if (!db.deadlines) {
      db.deadlines = [];
      updated = true;
    }
    if (!db.events) {
      db.events = [];
      updated = true;
    }
    if (!db.transactions) {
      db.transactions = [];
      updated = true;
    }
    if (!db.legalCases) {
      db.legalCases = [];
      updated = true;
    }
    if (!db.legalDocuments) {
      db.legalDocuments = [];
      updated = true;
    }
    if (!db.feeContracts) {
      db.feeContracts = [];
      updated = true;
    }
    if (!db.notifications) {
      db.notifications = [];
      updated = true;
    }
    
    if (updated) {
      saveDb(db);
    }

    return NextResponse.json({
      processes: db.processes || [],
      crmLeads: db.crmLeads || [],
      deadlines: db.deadlines || [],
      events: db.events || [],
      transactions: db.transactions || [],
      legalCases: db.legalCases || [],
      legalDocuments: db.legalDocuments || [],
      feeContracts: db.feeContracts || [],
      notifications: db.notifications || [],
    });
  } catch (error: any) {
    console.error('Fetch data error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados do sistema.' }, { status: 500 });
  }
}

async function handleMutation(body: any) {
  const { actorId, actorName, action, type, payload } = body;

  if (!actorId || !action || !type || !payload) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  }

  const db = await syncFromFirestore();

  // Ensure state collections are loaded
  if (!db.processes) db.processes = [];
  if (!db.crmLeads) db.crmLeads = [];
  if (!db.deadlines) db.deadlines = [];
  if (!db.events) db.events = [];
  if (!db.transactions) db.transactions = [];
  if (!db.legalCases) db.legalCases = [];
  if (!db.legalDocuments) db.legalDocuments = [];
  if (!db.feeContracts) db.feeContracts = [];
  if (!db.notifications) db.notifications = [];

  const prefixMap: Record<string, string> = {
    processes: 'proc',
    crmLeads: 'crm',
    deadlines: 'dead',
    events: 'evt',
    transactions: 'tx',
    transactions_batch: 'tx',
    legalCases: 'case',
    legalDocuments: 'doc',
    feeContracts: 'contract',
    notifications: 'notif'
  };

  const prefix = prefixMap[type];

  if (!prefix) {
    return NextResponse.json({ error: 'Tipo de coleção desconhecido.' }, { status: 400 });
  }

  let itemDetails = '';
  let targetName = '';

  if (action === 'CREATE') {
    const nowTs = Date.now();
    const newItem = {
      ...payload,
      id: payload.id || `${prefix}-${nowTs}`,
      updatedAt: payload.updatedAt || nowTs
    };
    
    if (type === 'processes') {
      db.processes = [newItem, ...(db.processes || [])];
      itemDetails = `Adicionou o processo CNJ: ${newItem.cnj} (Cliente: ${newItem.client})`;
      targetName = newItem.cnj;
    } else if (type === 'crmLeads') {
      db.crmLeads = [newItem, ...(db.crmLeads || [])];
      itemDetails = `Criou o lead de CRM: ${newItem.name} (${newItem.cpfCnpj})`;
      targetName = newItem.name;
    } else if (type === 'deadlines') {
      db.deadlines = [newItem, ...(db.deadlines || [])];
      itemDetails = `Criou o prazo: "${newItem.description || newItem.title}" para o processo CNJ: ${newItem.processCnj}`;
      targetName = newItem.description || newItem.title;

      // Sync into process if linked
      if (newItem.processCnj) {
        db.processes = (db.processes || []).map(p => {
          if (p.cnj === newItem.processCnj) {
            const existingTasks = p.deadlinesAndTasks || [];
            if (!existingTasks.some(t => t.id === newItem.id)) {
              const updatedTasks = [
                ...existingTasks,
                {
                  id: newItem.id,
                  type: (newItem.itemKind === 'tarefa' ? 'tarefa' : 'prazo') as 'prazo' | 'tarefa',
                  title: newItem.title || newItem.description,
                  dueDate: newItem.dueDate,
                  dueTime: newItem.dueTime || '17:00',
                  responsible: newItem.responsible,
                  status: newItem.status === 'Cumprido' || newItem.status === 'Concluída' ? 'Concluído' : 'Pendente',
                  priority: newItem.priority || 'Normal'
                }
              ];
              const pending = updatedTasks.filter(t => t.status !== 'Concluído');
              return { ...p, deadlinesAndTasks: updatedTasks, pendingTasksCount: pending.length };
            }
          }
          return p;
        });
      }
    } else if (type === 'events') {
      db.events = [newItem, ...(db.events || [])];
      itemDetails = `Criou o evento na agenda: "${newItem.title}" com o processo: ${newItem.process}`;
      targetName = newItem.title;
    } else if (type === 'transactions') {
      db.transactions = [newItem, ...(db.transactions || [])];
      itemDetails = `Lançou a transação financeira: ${newItem.type === 'revenue' ? 'Receita' : 'Despesa'} de R$ ${newItem.value} para ${newItem.client}`;
      targetName = newItem.client;
    } else if (type === 'transactions_batch' && Array.isArray(payload)) {
      db.transactions = [...payload, ...(db.transactions || [])];
      itemDetails = `Lançou ${payload.length} parcelas financeiras em lote.`;
      targetName = 'Lote Financeiro';
    } else if (type === 'legalCases') {
      db.legalCases = [newItem, ...(db.legalCases || [])];
      itemDetails = `Adicionou o caso legal: ${newItem.title} (Cliente: ${newItem.clientName})`;
      targetName = newItem.title;
    } else if (type === 'legalDocuments') {
      db.legalDocuments = [newItem, ...(db.legalDocuments || [])];
      itemDetails = `Adicionou o documento legal: ${newItem.name}`;
      targetName = newItem.name;
    } else if (type === 'feeContracts') {
      db.feeContracts = [newItem, ...(db.feeContracts || [])];
      itemDetails = `Adicionou o contrato de honorários: ${newItem.contractNumber} para ${newItem.clientName}`;
      targetName = newItem.clientName;
    } else if (type === 'notifications') {
      db.notifications = [newItem, ...(db.notifications || [])];
      itemDetails = `Criou a notificação: ${newItem.title}`;
      targetName = newItem.title;
    }

    if (type === 'transactions_batch' && Array.isArray(payload)) {
      if (dbFirestore) {
        for (const item of payload) {
          try {
            const cleanItem = JSON.parse(JSON.stringify(item));
            delete cleanItem.id;
            await setDoc(doc(dbFirestore, 'transactions', item.id), cleanItem);
          } catch (fErr) {
            console.warn('Direct Firestore batch tx write error:', fErr);
          }
        }
      }
    } else if (newItem && newItem.id && dbFirestore) {
      try {
        const cleanItem = JSON.parse(JSON.stringify(newItem));
        delete cleanItem.id;
        await setDoc(doc(dbFirestore, type, newItem.id), cleanItem);
      } catch (fErr) {
        console.warn(`Direct Firestore ${type} create write error:`, fErr);
      }
    }

    logAudit(actorId, actorName || 'Membro do Sistema', 'CREATE', newItem ? newItem.id : 'batch', targetName, itemDetails);
  } else if (action === 'UPDATE') {
    const id = payload.id;
    if (!id) {
      return NextResponse.json({ error: 'ID ausente para atualização.' }, { status: 400 });
    }

    const updatePayload = {
      ...payload,
      updatedAt: payload.updatedAt || Date.now()
    };

    if (type === 'processes') {
      const exists = (db.processes || []).some(p => p.id === id);
      db.processes = exists 
        ? (db.processes || []).map(p => p.id === id ? { ...p, ...updatePayload } : p)
        : [{ ...updatePayload }, ...(db.processes || [])];
      itemDetails = `Atualizou o processo CNJ: ${updatePayload.cnj} (${updatePayload.client})`;
      targetName = updatePayload.cnj;

      // Cross-sync deadlines inside process.deadlinesAndTasks to db.deadlines
      if (Array.isArray(updatePayload.deadlinesAndTasks)) {
        updatePayload.deadlinesAndTasks.forEach((dt: any) => {
          const dtIsDone = dt.status === 'Concluído';
          db.deadlines = (db.deadlines || []).map(dl => {
            if (dl.id === dt.id || (dl.processCnj === updatePayload.cnj && (dl.title === dt.title || dl.description === dt.title))) {
              return {
                ...dl,
                title: dt.title || dl.title,
                dueDate: dt.dueDate || dl.dueDate,
                dueTime: dt.dueTime || dl.dueTime,
                responsible: dt.responsible || dl.responsible,
                priority: dt.priority || dl.priority,
                status: dtIsDone ? (dl.itemKind === 'tarefa' ? 'Concluída' : 'Cumprido') : (dt.status === 'Pendente' ? 'Em andamento' : dl.status)
              };
            }
            return dl;
          });
        });
      }
    } else if (type === 'crmLeads') {
      const exists = (db.crmLeads || []).some(l => l.id === id);
      db.crmLeads = exists 
        ? (db.crmLeads || []).map(l => l.id === id ? { ...l, ...updatePayload } : l)
        : [{ ...updatePayload }, ...(db.crmLeads || [])];
      itemDetails = `Atualizou o lead de CRM: ${updatePayload.name}`;
      targetName = updatePayload.name;
    } else if (type === 'deadlines') {
      const exists = (db.deadlines || []).some(d => d.id === id);
      db.deadlines = exists 
        ? (db.deadlines || []).map(d => d.id === id ? { ...d, ...updatePayload } : d)
        : [{ ...updatePayload }, ...(db.deadlines || [])];
      itemDetails = `Atualizou o prazo: "${updatePayload.description || updatePayload.title}"`;
      targetName = updatePayload.description || updatePayload.title || id;

      // Cross-sync to linked process
      if (updatePayload.processCnj) {
        const isDone = updatePayload.status === 'Cumprido' || updatePayload.status === 'Concluída' || updatePayload.status === 'Concluído';
        db.processes = (db.processes || []).map(p => {
          if (p.cnj === updatePayload.processCnj) {
            const existingTasks = p.deadlinesAndTasks || [];
            let matched = false;
            const updatedTasks = existingTasks.map(t => {
              if (t.id === id || t.title === (updatePayload.title || updatePayload.description)) {
                matched = true;
                return {
                  ...t,
                  title: updatePayload.title || updatePayload.description || t.title,
                  dueDate: updatePayload.dueDate || t.dueDate,
                  dueTime: updatePayload.dueTime || t.dueTime,
                  responsible: updatePayload.responsible || t.responsible,
                  priority: updatePayload.priority || t.priority,
                  status: isDone ? 'Concluído' : (updatePayload.status === 'Em andamento' || updatePayload.status === 'Aberto' ? 'Pendente' : (updatePayload.status || t.status))
                };
              }
              return t;
            });
            if (!matched && !isDone) {
              updatedTasks.push({
                id,
                type: (updatePayload.itemKind === 'tarefa' ? 'tarefa' : 'prazo') as 'prazo' | 'tarefa',
                title: updatePayload.title || updatePayload.description,
                dueDate: updatePayload.dueDate,
                dueTime: updatePayload.dueTime,
                responsible: updatePayload.responsible,
                priority: updatePayload.priority || 'Normal',
                status: 'Pendente'
              });
            }
            const pending = updatedTasks.filter(t => t.status !== 'Concluído');
            return { ...p, deadlinesAndTasks: updatedTasks, pendingTasksCount: pending.length };
          }
          return p;
        });
      }
    } else if (type === 'events') {
      const exists = (db.events || []).some(e => e.id === id);
      db.events = exists 
        ? (db.events || []).map(e => e.id === id ? { ...e, ...updatePayload } : e)
        : [{ ...updatePayload }, ...(db.events || [])];
      itemDetails = `Atualizou o evento: "${updatePayload.title}"`;
      targetName = updatePayload.title;
    } else if (type === 'transactions') {
      const exists = (db.transactions || []).some(t => t.id === id);
      db.transactions = exists 
        ? (db.transactions || []).map(t => t.id === id ? { ...t, ...updatePayload } : t)
        : [{ ...updatePayload }, ...(db.transactions || [])];
      itemDetails = `Atualizou a transação financeira de R$ ${updatePayload.value} de ${updatePayload.client || updatePayload.supplierOrBeneficiary || 'Sem nome'}`;
      targetName = updatePayload.client || updatePayload.supplierOrBeneficiary || id;
    } else if (type === 'legalCases') {
      const exists = (db.legalCases || []).some(p => p.id === id);
      db.legalCases = exists 
        ? (db.legalCases || []).map(p => p.id === id ? { ...p, ...updatePayload } : p)
        : [{ ...updatePayload }, ...(db.legalCases || [])];
      itemDetails = `Atualizou o caso legal: ${updatePayload.title} (${updatePayload.clientName})`;
      targetName = updatePayload.title;
    } else if (type === 'legalDocuments') {
      const exists = (db.legalDocuments || []).some(d => d.id === id);
      db.legalDocuments = exists 
        ? (db.legalDocuments || []).map(d => d.id === id ? { ...d, ...updatePayload } : d)
        : [{ ...updatePayload }, ...(db.legalDocuments || [])];
      itemDetails = `Atualizou o documento legal: ${updatePayload.name}`;
      targetName = updatePayload.name;
    } else if (type === 'feeContracts') {
      const exists = (db.feeContracts || []).some(c => c.id === id);
      db.feeContracts = exists 
        ? (db.feeContracts || []).map(c => c.id === id ? { ...c, ...updatePayload } : c)
        : [{ ...updatePayload }, ...(db.feeContracts || [])];
      itemDetails = `Atualizou o contrato de honorários: ${updatePayload.contractNumber}`;
      targetName = updatePayload.clientName;
    } else if (type === 'notifications') {
      const exists = (db.notifications || []).some(n => n.id === id);
      db.notifications = exists 
        ? (db.notifications || []).map(n => n.id === id ? { ...n, ...updatePayload } : n)
        : [{ ...updatePayload }, ...(db.notifications || [])];
      itemDetails = `Atualizou a notificação: ${updatePayload.title}`;
      targetName = updatePayload.title;
    }

    if (dbFirestore) {
      try {
        const cleanItem = JSON.parse(JSON.stringify(updatePayload));
        delete cleanItem.id;
        await setDoc(doc(dbFirestore, type, id), cleanItem);
      } catch (fErr) {
        console.warn(`Direct Firestore ${type} update write error:`, fErr);
      }
    }

    logAudit(actorId, actorName || 'Membro do Sistema', 'UPDATE', id, targetName, itemDetails);
  } else if (action === 'DELETE') {
    const id = payload.id;
    if (!id) {
      return NextResponse.json({ error: 'ID ausente para exclusão.' }, { status: 400 });
    }

    // Register tombstone so it's never resurrected by syncFromFirestore
    registerDeletedId(id);

    if (type === 'processes') {
      const item = (db.processes || []).find(p => p.id === id);
      db.processes = (db.processes || []).filter(p => p.id !== id);
      itemDetails = `Excluiu o processo CNJ: ${item?.cnj || id}`;
      targetName = item?.cnj || id;
    } else if (type === 'crmLeads') {
      const item = (db.crmLeads || []).find(l => l.id === id);
      db.crmLeads = (db.crmLeads || []).filter(l => l.id !== id);
      itemDetails = `Excluiu o lead de CRM: ${item?.name || id}`;
      targetName = item?.name || id;
    } else if (type === 'deadlines') {
      const item = (db.deadlines || []).find(d => d.id === id);
      db.deadlines = (db.deadlines || []).filter(d => d.id !== id);
      itemDetails = `Excluiu o prazo: "${item?.description || item?.title || id}"`;
      targetName = item?.description || item?.title || id;

      // Also remove from matching process
      if (item?.processCnj || item?.processId) {
        db.processes = (db.processes || []).map(p => {
          if (p.cnj === item.processCnj || p.id === item.processId) {
            const updatedTasks = (p.deadlinesAndTasks || []).filter(d => d.id !== id && d.title !== (item.title || item.description));
            const pending = updatedTasks.filter(t => t.status !== 'Concluído');
            return { ...p, deadlinesAndTasks: updatedTasks, pendingTasksCount: pending.length };
          }
          return p;
        });
      }
    } else if (type === 'events') {
      const item = (db.events || []).find(e => e.id === id);
      db.events = (db.events || []).filter(e => e.id !== id);
      itemDetails = `Excluiu o evento: "${item?.title || id}"`;
      targetName = item?.title || id;
    } else if (type === 'transactions') {
      const item = (db.transactions || []).find(t => t.id === id);
      db.transactions = (db.transactions || []).filter(t => t.id !== id);
      itemDetails = `Excluiu a transação financeira de R$ ${item?.value || 0} de ${item?.client || id}`;
      targetName = item?.client || id;
    } else if (type === 'legalCases') {
      const item = (db.legalCases || []).find(p => p.id === id);
      db.legalCases = (db.legalCases || []).filter(p => p.id !== id);
      itemDetails = `Excluiu o caso legal: ${item?.title || id}`;
      targetName = item?.title || id;
    } else if (type === 'legalDocuments') {
      const item = (db.legalDocuments || []).find(d => d.id === id);
      db.legalDocuments = (db.legalDocuments || []).filter(d => d.id !== id);
      itemDetails = `Excluiu o documento legal: ${item?.name || id}`;
      targetName = item?.name || id;
    } else if (type === 'feeContracts') {
      const item = (db.feeContracts || []).find(c => c.id === id);
      db.feeContracts = (db.feeContracts || []).filter(c => c.id !== id);
      itemDetails = `Excluiu o contrato de honorários: ${item?.contractNumber || id}`;
      targetName = item?.clientName || id;
    } else if (type === 'notifications') {
      const item = (db.notifications || []).find(n => n.id === id);
      db.notifications = (db.notifications || []).filter(n => n.id !== id);
      itemDetails = `Excluiu a notificação: ${item?.title || id}`;
      targetName = item?.title || id;
    }

    if (dbFirestore) {
      try {
        await deleteDoc(doc(dbFirestore, type, id));
      } catch (fErr) {
        console.warn(`Direct Firestore ${type} delete write error:`, fErr);
      }
    }

    logAudit(actorId, actorName || 'Membro do Sistema', 'DELETE', id, targetName, itemDetails);
  }

  saveDb(db);

  return NextResponse.json({
    success: true,
    processes: db.processes || [],
    crmLeads: db.crmLeads || [],
    deadlines: db.deadlines || [],
    events: db.events || [],
    transactions: db.transactions || [],
    legalCases: db.legalCases || [],
    legalDocuments: db.legalDocuments || [],
    feeContracts: db.feeContracts || [],
    notifications: db.notifications || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return new Promise<Response>((resolve) => {
      writeQueue = writeQueue.then(async () => {
        try {
          const res = await handleMutation(body);
          resolve(res);
        } catch (err: any) {
          console.error('Save data mutation error:', err);
          resolve(NextResponse.json({ error: 'Erro ao salvar dados no servidor.' }, { status: 500 }));
        }
      });
    });
  } catch (error: any) {
    console.error('Save data error:', error);
    return NextResponse.json({ error: 'Erro ao processar requisição.' }, { status: 500 });
  }
}

