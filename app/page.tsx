'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gavel, Users, Calendar, Clock, DollarSign, Settings, LayoutDashboard, 
  LogOut, Bell, Search, ShieldCheck, HelpCircle, Menu, X, Plus, FileText, BarChart3, CheckSquare, Briefcase,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

import { 
  initialProcesses, initialCrmLeads, initialDeadlines, initialEvents, 
  initialTransactions, initialUsers, Process, CrmLead, Deadline, 
  CalendarEvent, FinancialTransaction, SystemUser, ProcessHistoryItem
} from '@/lib/mockData';

import LoginView from '@/components/LoginView';
import DashboardView from '@/components/DashboardView';
import PainelOperacionalView from '@/components/PainelOperacionalView';
import CrmView from '@/components/CrmView';
import ProcessosView from '@/components/ProcessosView';
import ProcessoDetailView from '@/components/ProcessoDetailView';
import PrazosView from '@/components/PrazosView';
import AgendaView from '@/components/AgendaView';
import FinanceiroView from '@/components/FinanceiroView';
import ConfiguracoesView from '@/components/ConfiguracoesView';
import DocumentosView from '@/components/DocumentosView';
import RelatoriosView from '@/components/RelatoriosView';
import { NewProcessModal } from '@/components/NewProcessModal';
import { isDeadlineDone } from '@/lib/deadlineUtils';

export default function RootPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  // Navigation / Control state
  const [currentTab, setCurrentTab] = useState('painel_operacional');
  const [dashboardFilters, setDashboardFilters] = useState<Record<string, any>>({});
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [selectedCrmLeadId, setSelectedCrmLeadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('pcgos_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          setCurrentUser(null);
        }
      }
      const savedCollapsed = localStorage.getItem('pcg_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsSidebarCollapsed(savedCollapsed === 'true');
      }
    }
  }, []);

  // Core Database States
  const [processes, setProcesses] = useState<Process[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  // Compute active real system users dynamically
  const activeSystemUsers = React.useMemo(() => {
    if (systemUsers && systemUsers.length > 0) {
      const active = systemUsers.filter((u: any) => 
        u.mfa !== false && 
        u.status !== 'Inativo' && 
        u.status !== 'Desativado' && 
        u.status !== 'Bloqueado'
      );
      if (active.length > 0) return active;
    }
    return [
      { id: 'usr-ceo-1', name: 'Larissa Paiva', role: 'CEO/Proprietário' },
      { id: 'usr-ceo-2', name: 'Pedro Godoy', role: 'CEO/Proprietário' },
      { id: 'usr-ceo-3', name: 'Rhenderson Camargo', role: 'CEO/Proprietário' }
    ];
  }, [systemUsers]);

  // Permissão temporária da aba Documentos: visível exclusivamente para o usuário "PCG" (assessoria@pcgadvogados.com.br)
  const isPcgUser = React.useMemo(() => {
    if (!currentUser) return false;
    const email = (currentUser.email || '').toLowerCase().trim();
    const name = (currentUser.name || '').trim();
    const username = (currentUser.username || '').trim();
    return (
      email === 'assessoria@pcgadvogados.com.br' ||
      name === 'PCG' ||
      username === 'PCG' ||
      currentUser.id === 'usr-1785529811896'
    );
  }, [currentUser]);

  const effectiveTab = (currentTab === 'documentos' && !isPcgUser) ? 'painel_operacional' : currentTab;

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pcg_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  // Load database arrays from server
  const isSyncingRef = useRef(false);

  const loadAllData = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      const res = await fetch('/api/data');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();

        const procs = data.processes || [];
        const crm = data.crmLeads || [];
        const dl = data.deadlines || [];
        const ev = data.events || [];
        const tx = data.transactions || [];

        setProcesses(procs);
        setCrmLeads(crm);
        setDeadlines(dl);
        setEvents(ev);
        setTransactions(tx);

        localStorage.setItem('pcgos_processes', JSON.stringify(procs));
        localStorage.setItem('pcgos_crm', JSON.stringify(crm));
        localStorage.setItem('pcgos_deadlines', JSON.stringify(dl));
        localStorage.setItem('pcgos_events', JSON.stringify(ev));
        localStorage.setItem('pcgos_transactions', JSON.stringify(tx));
      }

      const usersRes = await fetch('/api/users');
      if (usersRes.ok && usersRes.headers.get('content-type')?.includes('application/json')) {
        const usersData = await usersRes.json();
        setSystemUsers(usersData || []);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do servidor:', err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Helper function to persist changes to the server
  const persistToServer = async (action: 'CREATE' | 'UPDATE' | 'DELETE', type: string, payload: any) => {
    try {
      const actorId = currentUser?.id || 'system';
      const actorName = currentUser?.name || 'Membro do Sistema';
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId,
          actorName,
          action,
          type,
          payload
        })
      });
      if (res.ok) {
        const responseData = await res.json();
        if (responseData.processes) {
          setProcesses(responseData.processes);
          localStorage.setItem('pcgos_processes', JSON.stringify(responseData.processes));
        }
        if (responseData.crmLeads) {
          setCrmLeads(responseData.crmLeads);
          localStorage.setItem('pcgos_crm', JSON.stringify(responseData.crmLeads));
        }
        if (responseData.deadlines) {
          setDeadlines(responseData.deadlines);
          localStorage.setItem('pcgos_deadlines', JSON.stringify(responseData.deadlines));
        }
        if (responseData.events) {
          setEvents(responseData.events);
          localStorage.setItem('pcgos_events', JSON.stringify(responseData.events));
        }
        if (responseData.transactions) {
          setTransactions(responseData.transactions);
          localStorage.setItem('pcgos_transactions', JSON.stringify(responseData.transactions));
        }
      } else {
        console.warn(`[persistToServer] Status ${res.status} error for ${action} ${type}`);
      }
    } catch (err) {
      console.error('Erro de persistência no servidor:', err);
    }
  };

  // Load from LocalStorage + Server on mount with periodic background synchronization across users
  useEffect(() => {
    try {
      const localProc = localStorage.getItem('pcgos_processes');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localProc) setProcesses(JSON.parse(localProc));
      const localCrm = localStorage.getItem('pcgos_crm');
      if (localCrm) setCrmLeads(JSON.parse(localCrm));
      const localDeadlines = localStorage.getItem('pcgos_deadlines');
      if (localDeadlines) setDeadlines(JSON.parse(localDeadlines));
      const localEvents = localStorage.getItem('pcgos_events');
      if (localEvents) setEvents(JSON.parse(localEvents));

      // Financial reset check: clean slate starting 2026-09-04
      const RESET_KEY = 'pcgos_financial_clean_slate_2026_09_04';
      if (localStorage.getItem(RESET_KEY) !== 'true') {
        localStorage.removeItem('pcgos_transactions');
        localStorage.setItem(RESET_KEY, 'true');
      } else {
        const localTx = localStorage.getItem('pcgos_transactions');
        if (localTx) setTransactions(JSON.parse(localTx));
      }
    } catch (e) {
      console.error('Erro ao ler do localStorage:', e);
    }

    loadAllData();

    // Auto-synchronize every 15 seconds so any commitment created by any user automatically appears for everyone
    const syncInterval = setInterval(() => {
      loadAllData();
    }, 15000);

    // Sync when user focuses or returns to the browser tab
    const handleFocus = () => {
      loadAllData();
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [currentUser?.id]);

  // Save states to localStorage on change
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    saveState('pcgos_user', user);
    setCurrentTab('painel_operacional');
    loadAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pcgos_user');
  };

  // State update actions
  const handleAddNewProcess = async (newProc: Process) => {
    const updated = [newProc, ...processes.filter(p => p.id !== newProc.id)];
    setProcesses(updated);
    saveState('pcgos_processes', updated);
    await persistToServer('CREATE', 'processes', newProc);
    setIsNewProcessModalOpen(false);
    setSelectedProcessId(newProc.id);
    setCurrentTab('processo_detail');
  };

  const handleUpdateProcess = (updatedProc: Process) => {
    const updated = processes.map(p => p.id === updatedProc.id ? updatedProc : p);
    setProcesses(updated);
    saveState('pcgos_processes', updated);
    persistToServer('UPDATE', 'processes', updatedProc);
  };

  const handleDeleteProcess = (id: string, reason: string) => {
    const actorName = currentUser?.name || 'Administrador';
    const now = new Date().toLocaleDateString('pt-BR');

    const targetProc = processes.find(p => p.id === id);
    if (!targetProc) return;

    const updatedProc: Process = {
      ...targetProc,
      deleted: true,
      deletedAt: now,
      deletedBy: actorName,
      deletionReason: reason
    };

    const updated = processes.map(p => p.id === id ? updatedProc : p);
    setProcesses(updated);
    saveState('pcgos_processes', updated);
    persistToServer('UPDATE', 'processes', updatedProc);
    setCurrentTab('processos');
  };

  const handleRestoreProcess = (id: string) => {
    const targetProc = processes.find(p => p.id === id);
    if (!targetProc) return;

    const updatedProc: Process = {
      ...targetProc,
      deleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      deletionReason: undefined
    };

    const updated = processes.map(p => p.id === id ? updatedProc : p);
    setProcesses(updated);
    saveState('pcgos_processes', updated);
    persistToServer('UPDATE', 'processes', updatedProc);
  };

  const handleAddLead = (lead: Omit<CrmLead, 'id'>) => {
    const newLead: CrmLead = {
      ...lead,
      id: `lead-${Date.now()}`,
    };
    const updated = [newLead, ...crmLeads];
    setCrmLeads(updated);
    saveState('pcgos_crm', updated);
    persistToServer('CREATE', 'crmLeads', newLead);
  };

  const handleDeleteLead = (id: string) => {
    const updated = crmLeads.filter(l => l.id !== id);
    setCrmLeads(updated);
    saveState('pcgos_crm', updated);
    persistToServer('DELETE', 'crmLeads', { id });
  };

  const handleUpdateLead = (updatedLead: CrmLead) => {
    const updated = crmLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
    setCrmLeads(updated);
    saveState('pcgos_crm', updated);
    persistToServer('UPDATE', 'crmLeads', updatedLead);
  };

  const handleToggleDeadline = (id: string) => {
    let toggledDeadline: any = null;
    const updated = deadlines.map(d => {
      if (d.id === id) {
        const isDone = isDeadlineDone(d.status, d.completed);
        const newStatus = isDone ? 'Em andamento' : (d.itemKind === 'tarefa' ? 'Concluída' : 'Cumprido');
        toggledDeadline = {
          ...d,
          status: newStatus as any,
          completed: !isDone,
          updatedAt: Date.now()
        };
        return toggledDeadline;
      }
      return d;
    });
    setDeadlines(updated);
    saveState('pcgos_deadlines', updated);

    // Cross-sync to linked process in local state
    if (toggledDeadline && (toggledDeadline.processCnj || toggledDeadline.processId)) {
      const isDone = isDeadlineDone(toggledDeadline.status, toggledDeadline.completed);
      const newProcs = processes.map(p => {
        if (p.cnj === toggledDeadline.processCnj || p.id === toggledDeadline.processId) {
          const updatedTasks = (p.deadlinesAndTasks || []).map(t => {
            if (t.id === id || t.title === (toggledDeadline.title || toggledDeadline.description)) {
              return { ...t, status: isDone ? 'Concluído' : 'Pendente' as any };
            }
            return t;
          });
          const pending = updatedTasks.filter(t => t.status !== 'Concluído');
          return { ...p, deadlinesAndTasks: updatedTasks, pendingTasksCount: pending.length };
        }
        return p;
      });
      setProcesses(newProcs);
      saveState('pcgos_processes', newProcs);
    }

    if (toggledDeadline) {
      persistToServer('UPDATE', 'deadlines', toggledDeadline);
    }
  };

  const handleUpdateDeadline = (updatedDl: Deadline) => {
    const updatedWithTs = {
      ...updatedDl,
      updatedAt: Date.now()
    };
    const updated = deadlines.map(d => d.id === updatedWithTs.id ? updatedWithTs : d);
    setDeadlines(updated);
    saveState('pcgos_deadlines', updated);

    // Cross-sync into process
    if (updatedWithTs.processCnj || updatedWithTs.processId) {
      const isDone = isDeadlineDone(updatedWithTs.status, updatedWithTs.completed);
      const newProcs = processes.map(p => {
        if (p.cnj === updatedWithTs.processCnj || p.id === updatedWithTs.processId) {
          const updatedTasks = (p.deadlinesAndTasks || []).map(t => {
            if (t.id === updatedWithTs.id || t.title === (updatedWithTs.title || updatedWithTs.description)) {
              return {
                ...t,
                title: updatedWithTs.title || updatedWithTs.description || t.title,
                dueDate: updatedWithTs.dueDate || t.dueDate,
                dueTime: updatedWithTs.dueTime || t.dueTime,
                responsible: updatedWithTs.responsible || t.responsible,
                priority: updatedWithTs.priority || t.priority,
                status: isDone ? 'Concluído' : 'Pendente' as any
              };
            }
            return t;
          });
          const pending = updatedTasks.filter(t => t.status !== 'Concluído');
          return { ...p, deadlinesAndTasks: updatedTasks, pendingTasksCount: pending.length };
        }
        return p;
      });
      setProcesses(newProcs);
      saveState('pcgos_processes', newProcs);
    }

    persistToServer('UPDATE', 'deadlines', updatedWithTs);
  };

  const handleDeleteDeadline = async (id: string, reason?: string) => {
    const itemToDelete = deadlines.find(d => d.id === id);

    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    saveState('pcgos_deadlines', updated);

    // If linked to a process, remove from process deadlinesAndTasks
    if (itemToDelete?.processCnj || itemToDelete?.processId) {
      const procMatch = processes.find(p => p.cnj === itemToDelete.processCnj || p.id === itemToDelete.processId);
      if (procMatch) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR');
        const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const isPrazo = itemToDelete.itemKind === 'prazo' || itemToDelete.type === 'processual';
        const auditHistoryItem: ProcessHistoryItem = {
          id: `hist-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: isPrazo ? 'Prazo Excluído' : 'Tarefa Excluída',
          description: `${isPrazo ? 'Prazo' : 'Tarefa'} "${itemToDelete.title || itemToDelete.description}" foi excluído do sistema por ${currentUser?.name || 'Membro do Sistema'}.${reason ? ` Motivo: ${reason.trim()}` : ''}`
        };
        const updatedTasks = (procMatch.deadlinesAndTasks || []).filter(d => d.id !== id && d.title !== (itemToDelete.title || itemToDelete.description));
        const pending = updatedTasks.filter(t => t.status !== 'Concluído');
        const updatedProcess = {
          ...procMatch,
          deadlinesAndTasks: updatedTasks,
          pendingTasksCount: pending.length,
          history: [auditHistoryItem, ...(procMatch.history || [])]
        };
        const newProcs = processes.map(p => p.id === procMatch.id ? updatedProcess : p);
        setProcesses(newProcs);
        saveState('pcgos_processes', newProcs);
        persistToServer('UPDATE', 'processes', updatedProcess);
      }
    }

    persistToServer('DELETE', 'deadlines', { id, reason: reason || 'Exclusão de prazo/tarefa' });
  };

  const handleAddDeadline = (dl: Partial<Deadline>) => {
    const newDl: Deadline = {
      id: `dl-${Date.now()}`,
      description: dl.description || dl.title || '',
      responsible: dl.responsible || '',
      dueDate: dl.dueDate || '',
      processCnj: dl.processCnj || '',
      status: dl.status || 'Aberto',
      ...dl,
    };
    const updated = [newDl, ...deadlines];
    setDeadlines(updated);
    saveState('pcgos_deadlines', updated);
    persistToServer('CREATE', 'deadlines', newDl);
  };

  const handleAddEvent = (evt: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...evt,
      id: `ev-${Date.now()}`,
    };
    const updated = [newEvt, ...events];
    setEvents(updated);
    saveState('pcgos_events', updated);
    persistToServer('CREATE', 'events', newEvt);
  };

  const handleUpdateEvent = (updatedEvt: CalendarEvent) => {
    const updated = events.map(e => e.id === updatedEvt.id ? updatedEvt : e);
    setEvents(updated);
    saveState('pcgos_events', updated);
    persistToServer('UPDATE', 'events', updatedEvt);
  };

  const handleDeleteEvent = (id: string, reason?: string) => {
    const itemToDelete = events.find(e => e.id === id);
    if (!itemToDelete) return;

    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveState('pcgos_events', updated);

    if (itemToDelete.processId || (itemToDelete.process && itemToDelete.process !== 'Geral')) {
      const procMatch = processes.find(p => p.id === itemToDelete.processId || p.cnj === itemToDelete.process);
      if (procMatch) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR');
        const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const auditHistoryItem: ProcessHistoryItem = {
          id: `hist-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: 'Compromisso Excluído',
          description: `Compromisso da agenda "${itemToDelete.title}" foi excluído por ${currentUser?.name || 'Membro do Sistema'}.${reason ? ` Motivo: ${reason.trim()}` : ''}`
        };
        const updatedProcess = {
          ...procMatch,
          history: [auditHistoryItem, ...(procMatch.history || [])]
        };
        const newProcs = processes.map(p => p.id === procMatch.id ? updatedProcess : p);
        setProcesses(newProcs);
        saveState('pcgos_processes', newProcs);
        persistToServer('UPDATE', 'processes', updatedProcess);
      }
    }

    persistToServer('DELETE', 'events', { id, reason: reason || 'Exclusão de compromisso da agenda' });
  };

  const handleAddTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveState('pcgos_transactions', updated);
    persistToServer('CREATE', 'transactions', newTx);
  };

  const handleAddBatchTransactions = (txs: Omit<FinancialTransaction, 'id'>[]) => {
    const now = Date.now();
    const newTxs: FinancialTransaction[] = txs.map((tx, index) => ({
      ...tx,
      id: `tx-${now}-${index}`,
    }));
    const updated = [...newTxs, ...transactions];
    setTransactions(updated);
    saveState('pcgos_transactions', updated);
    persistToServer('CREATE', 'transactions_batch', newTxs);
  };

  const handleUpdateTransaction = (updatedTx: FinancialTransaction) => {
    const updated = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    setTransactions(updated);
    saveState('pcgos_transactions', updated);
    persistToServer('UPDATE', 'transactions', updatedTx);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveState('pcgos_transactions', updated);
    persistToServer('DELETE', 'transactions', { id });
  };

  const handleNavigateTab = (tab: string, filters?: any) => {
    const targetTab = (tab === 'documentos' && !isPcgUser) ? 'painel_operacional' : tab;
    if (filters) {
      setDashboardFilters(prev => ({ ...prev, [targetTab]: filters }));
    } else {
      setDashboardFilters(prev => ({ ...prev, [targetTab]: {} }));
    }
    setCurrentTab(targetTab);
  };

  const navigateToProcessDetail = (id: string) => {
    setSelectedProcessId(id);
    setCurrentTab('processo_detail');
  };

  const navigateToCrmLead = (leadId: string) => {
    setSelectedCrmLeadId(leadId);
    setCurrentTab('crm');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0d2f43] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-300">Carregando Sistema PCG OS...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Find process for detail view
  const selectedProcess = processes.find(p => p.id === selectedProcessId) || processes[0];

  // Tab rendering helper
  const renderTabContent = () => {
    switch (effectiveTab) {
      case 'painel_operacional':
        return (
          <PainelOperacionalView
            processes={processes}
            deadlines={deadlines}
            events={events}
            crmLeads={crmLeads}
            currentUser={currentUser}
            onNavigateTab={handleNavigateTab}
            onSelectProcess={navigateToProcessDetail}
            onToggleDeadline={handleToggleDeadline}
            onAddDeadline={handleAddDeadline}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            processes={processes}
            crmLeads={crmLeads}
            deadlines={deadlines}
            events={events}
            transactions={transactions}
            users={activeSystemUsers}
            currentUser={currentUser}
            onNavigateTab={handleNavigateTab}
            onSelectProcess={navigateToProcessDetail}
            onAddDeadline={handleAddDeadline}
            initialFilters={dashboardFilters['dashboard']}
          />
        );
      case 'crm':
        return (
          <CrmView
            leads={crmLeads}
            processes={processes}
            users={activeSystemUsers}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onAddDeadline={handleAddDeadline}
            onNavigateTab={handleNavigateTab}
            onSelectProcess={navigateToProcessDetail}
            initialSelectedLeadId={selectedCrmLeadId}
          />
        );
      case 'processos':
        return (
          <ProcessosView
            processes={processes}
            users={activeSystemUsers}
            onSelectProcess={navigateToProcessDetail}
            onOpenAddModal={() => setIsNewProcessModalOpen(true)}
            currentUser={currentUser}
            initialFilters={dashboardFilters['processos']}
          />
        );
      case 'processo_detail':
        return (
          <ProcessoDetailView
            process={selectedProcess}
            crmLeads={crmLeads}
            users={activeSystemUsers}
            currentUser={currentUser}
            onBack={() => setCurrentTab('processos')}
            onUpdateProcess={handleUpdateProcess}
            onDeleteProcess={handleDeleteProcess}
            onRestoreProcess={handleRestoreProcess}
            onNavigateToCrmLead={navigateToCrmLead}
            onAddDeadline={handleAddDeadline}
            onUpdateDeadline={handleUpdateDeadline}
            onDeleteDeadline={handleDeleteDeadline}
            onToggleDeadline={handleToggleDeadline}
            onAddEvent={handleAddEvent}
          />
        );
      case 'prazos':
        return (
          <PrazosView
            deadlines={deadlines}
            processes={processes}
            events={events}
            users={activeSystemUsers}
            currentUser={currentUser}
            onToggleDeadline={handleToggleDeadline}
            onAddDeadline={handleAddDeadline}
            onUpdateDeadline={handleUpdateDeadline}
            onDeleteDeadline={handleDeleteDeadline}
            onAddEvent={handleAddEvent}
            onUpdateProcess={handleUpdateProcess}
            onSelectProcess={navigateToProcessDetail}
            onNavigateTab={handleNavigateTab}
            initialFilters={dashboardFilters['prazos']}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            events={events}
            deadlines={deadlines}
            processes={processes}
            crmLeads={crmLeads}
            users={activeSystemUsers}
            currentUser={currentUser}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onDeleteDeadline={handleDeleteDeadline}
            onUpdateProcess={handleUpdateProcess}
            onUpdateCrmLead={handleUpdateLead}
            onSelectProcess={navigateToProcessDetail}
            onSelectClient={navigateToCrmLead}
            onNavigateTab={handleNavigateTab}
            initialFilters={dashboardFilters['agenda']}
          />
        );
      case 'documentos':
        if (!isPcgUser) {
          return (
            <PainelOperacionalView
              processes={processes}
              deadlines={deadlines}
              events={events}
              crmLeads={crmLeads}
              currentUser={currentUser}
              onNavigateTab={handleNavigateTab}
              onSelectProcess={navigateToProcessDetail}
              onToggleDeadline={handleToggleDeadline}
              onAddDeadline={handleAddDeadline}
            />
          );
        }
        return (
          <DocumentosView
            processes={processes}
            crmLeads={crmLeads}
            currentUser={currentUser}
            onUpdateProcess={handleUpdateProcess}
            onUpdateCrmLead={handleUpdateLead}
          />
        );
      case 'financeiro':
        return (
          <FinanceiroView
            transactions={transactions}
            processes={processes}
            crmLeads={crmLeads}
            users={activeSystemUsers}
            currentUser={currentUser}
            onAddTransaction={handleAddTransaction}
            onAddBatchTransactions={handleAddBatchTransactions}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'relatorios':
        return (
          <RelatoriosView
            processes={processes}
            crmLeads={crmLeads}
            deadlines={deadlines}
            transactions={transactions}
            events={events}
            users={activeSystemUsers}
            currentUser={currentUser}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'configuracoes':
        return (
          <ConfiguracoesView
            currentUser={currentUser}
            systemUsers={systemUsers}
            onUsersChange={loadAllData}
          />
        );
      default:
        return (
          <PainelOperacionalView
            processes={processes}
            deadlines={deadlines}
            events={events}
            crmLeads={crmLeads}
            currentUser={currentUser}
            onNavigateTab={handleNavigateTab}
            onSelectProcess={navigateToProcessDetail}
            onToggleDeadline={handleToggleDeadline}
            onAddDeadline={handleAddDeadline}
          />
        );
    }
  };

  const navigationGroups = [
    {
      label: 'Escritório',
      items: [
        { id: 'painel_operacional', label: 'Painel Operacional', icon: <CheckSquare className="w-5 h-5" /> },
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Gestão Jurídica',
      items: [
        { id: 'crm', label: 'CRM e Clientes', icon: <Users className="w-5 h-5" /> },
        { id: 'processos', label: 'Casos e Processos', icon: <Gavel className="w-5 h-5" /> },
        { id: 'prazos', label: 'Prazos e Tarefas', icon: <Clock className="w-5 h-5" /> },
        { id: 'agenda', label: 'Agenda e Compromissos', icon: <Calendar className="w-5 h-5" /> },
        ...(isPcgUser ? [{ id: 'documentos', label: 'Documentos', icon: <FileText className="w-5 h-5" /> }] : []),
      ],
    },
    {
      label: 'Gestão de Negócios',
      items: [
        { id: 'financeiro', label: 'Financeiro', icon: <DollarSign className="w-5 h-5" /> },
        { id: 'relatorios', label: 'Relatórios Gerenciais', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'configuracoes', label: 'Equipe e permissões', icon: <Settings className="w-5 h-5" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-[#0d2f43] selection:text-white">
      {/* Sidebar Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 bg-[#0d2f43] text-white z-50 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-x-hidden lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'
      } ${isSidebarCollapsed ? 'w-64 lg:w-20' : 'w-64'}`}>
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
          {/* Brand Header */}
          <div className={`p-4 border-b border-slate-700/60 flex items-center shrink-0 transition-all ${
            isSidebarCollapsed ? 'lg:flex-col lg:gap-3 lg:justify-center justify-between' : 'justify-between'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
                PCG
              </div>
              <div className={`min-w-0 ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                <h2 className="font-extrabold text-base tracking-tight text-white leading-tight truncate">PCG.OS</h2>
                <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider truncate">Advocacia Digital</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Toggle Collapse/Expand Button */}
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                className="hidden lg:flex p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors group relative cursor-pointer items-center justify-center"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-blue-300" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-slate-300" />
                )}
                {/* Floating Tooltip */}
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#0a2535] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50">
                  {isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0a2535]" />
                </div>
              </button>

              {/* Mobile Close Button */}
              <button type="button" className="lg:hidden text-slate-400 hover:text-white p-1.5" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 flex flex-col gap-3 flex-1">
            {navigationGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1.5">
                <div className={`px-3.5 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-300/80 ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const isActive = effectiveTab === item.id || (effectiveTab === 'processo_detail' && item.id === 'processos');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setIsSidebarOpen(false);
                        if (item.id === 'crm') setSelectedCrmLeadId(null);
                      }}
                      className={`group relative w-full flex items-center transition-all cursor-pointer rounded-xl ${
                        isSidebarCollapsed
                          ? 'lg:justify-center lg:px-0 px-3.5 py-3'
                          : 'px-3.5 py-2.5 gap-3'
                      } ${
                        isActive
                          ? 'bg-white/15 text-white shadow-xs font-black border border-white/20'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="relative flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <span className={`text-xs font-bold truncate ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                        {item.label}
                      </span>
                      {isSidebarCollapsed && (
                        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#0a2535] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0a2535]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: User Card */}
        <div className="shrink-0 border-t border-slate-700/60 bg-[#0a2535]">
          {/* User Card */}
          <div className="p-3 border-t border-slate-700/40">
            <div className={`flex items-center ${isSidebarCollapsed ? 'lg:flex-col lg:gap-3 justify-between' : 'justify-between'}`}>
              <div className="group relative flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-extrabold text-xs shrink-0 ring-2 ring-blue-500/30">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={`min-w-0 ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                  <p className="font-bold text-xs text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
                </div>

                {/* User Info Floating Tooltip when Collapsed */}
                {isSidebarCollapsed && (
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#0a2535] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50">
                    <p className="text-white font-extrabold">{currentUser.name}</p>
                    <p className="text-[10px] text-blue-300 font-medium">{currentUser.role}</p>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0a2535]" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sair do sistema"
                className="group relative p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-300 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                {/* Floating Tooltip for Logout when Collapsed */}
                {isSidebarCollapsed && (
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#0a2535] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap z-50">
                    Sair do sistema
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0a2535]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main App Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-1.5 hover:bg-slate-100 rounded text-slate-600" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar em todo o PCG.OS..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
              <span>● SISTEMA ON-LINE</span>
            </div>

            <button 
              onClick={() => alert('Central de notificações: nenhuma pendência crítica não listada.')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 relative"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <button 
              onClick={() => alert('Canal de suporte técnico PCG.OS aberto.')}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Content Stage */}
        <main className="p-6 md:p-8 max-w-[1800px] w-full mx-auto flex-1 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Process Creation Modal */}
      <NewProcessModal
        isOpen={isNewProcessModalOpen}
        onClose={() => setIsNewProcessModalOpen(false)}
        crmLeads={crmLeads}
        activeSystemUsers={activeSystemUsers}
        processes={processes}
        onAddProcess={handleAddNewProcess}
        currentUser={currentUser || undefined}
      />
    </div>
  );
}

function FinancialTransactionView(props: any) {
  return <FinanceiroView {...props} />;
}
