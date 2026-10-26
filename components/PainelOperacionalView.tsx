'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, Clock, Calendar, AlertTriangle, UserCheck, 
  Plus, Settings, Filter, Shield, Lock, Eye, EyeOff, 
  ChevronRight, ArrowUpRight, ArrowRight, MapPin, Link2, 
  FileText, Briefcase, RefreshCw, CheckCircle2, Play, 
  AlertCircle, MessageSquare, ExternalLink, Trash2, Edit3, X,
  Building, User, Sparkles
} from 'lucide-react';

import { Process, Deadline, CalendarEvent, CrmLead, SystemUser } from '@/lib/mockData';
import { isDeadlineDone, isDeadlineCanceled } from '@/lib/deadlineUtils';

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  reminder?: boolean;
  completed: boolean;
  createdBy: string;
  createdAt: string;
  isPersonal: true;
}

interface PainelOperacionalViewProps {
  processes: Process[];
  deadlines: Deadline[];
  events: CalendarEvent[];
  crmLeads: CrmLead[];
  currentUser?: SystemUser | null;
  onToggleDeadline: (id: string) => void;
  onAddDeadline?: (dl: Omit<Deadline, 'id'>) => void;
  onAddEvent?: (evt: Omit<CalendarEvent, 'id'>) => void;
  onNavigateTab: (tab: string, filters?: any) => void;
  onSelectProcess: (id: string) => void;
}

export default function PainelOperacionalView({
  processes,
  deadlines,
  events,
  crmLeads,
  currentUser,
  onToggleDeadline,
  onAddDeadline,
  onAddEvent,
  onNavigateTab,
  onSelectProcess,
}: PainelOperacionalViewProps) {
  // Period filter: 'today' | '7_days' | 'week' | 'month' | 'all'
  const [periodFilter, setPeriodFilter] = useState<'today' | '7_days' | 'week' | 'month' | 'all'>('today');

  // Selected summary metric card filter for quick listing view
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<
    'all' | 'prazos_hoje' | 'proximos_prazos' | 'tarefas_hoje' | 'tarefas_atrasadas' | 'compromissos_hoje' | 'retornos_pendentes'
  >('all');

  // Agenda sub-tab inside user agenda section
  const [agendaTab, setAgendaTab] = useState<'hoje' | 'semana' | '7_dias'>('hoje');

  // Personal tasks state (saved in localStorage per user)
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>(() => {
    if (typeof window !== 'undefined' && currentUser?.id) {
      const savedTasks = localStorage.getItem(`pcgos_personal_tasks_${currentUser.id}`);
      if (savedTasks) {
        try {
          return JSON.parse(savedTasks);
        } catch (e) {
          console.error('Erro ao carregar tarefas pessoais:', e);
        }
      }
    }
    return [];
  });

  // Layout customization state (saved in localStorage per user)
  const [blockVisibility, setBlockVisibility] = useState<Record<string, boolean>>(() => {
    const baseLayout = {
      prazos_vencidos: true, // Protected
      prazos_fatais: true,   // Protected
      audiencias_dia: true,  // Protected
      alertas_criticos: true,// Protected
      prazos_usuario: true,
      compromissos: true,
      tarefas_institucionais: true,
      tarefas_pessoais: true,
      agenda_resumida: true,
    };
    if (typeof window !== 'undefined' && currentUser?.id) {
      const savedLayout = localStorage.getItem(`pcgos_operational_layout_${currentUser.id}`);
      if (savedLayout) {
        try {
          return {
            ...baseLayout,
            ...JSON.parse(savedLayout),
            prazos_vencidos: true,
            prazos_fatais: true,
            audiencias_dia: true,
            alertas_criticos: true,
          };
        } catch (e) {
          console.error('Erro ao carregar layout:', e);
        }
      }
    }
    return baseLayout;
  });

  // Modal states
  const [isPersonalTaskModalOpen, setIsPersonalTaskModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Personal task form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskPriority, setNewTaskPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [newTaskReminder, setNewTaskReminder] = useState(true);

  // Sync personal tasks to localStorage
  const savePersonalTasks = (updated: PersonalTask[]) => {
    setPersonalTasks(updated);
    if (typeof window !== 'undefined' && currentUser?.id) {
      localStorage.setItem(`pcgos_personal_tasks_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  // Sync block visibility to localStorage
  const saveBlockVisibility = (updated: Record<string, boolean>) => {
    const protectedEnforced = {
      ...updated,
      prazos_vencidos: true,
      prazos_fatais: true,
      audiencias_dia: true,
      alertas_criticos: true,
    };
    setBlockVisibility(protectedEnforced);
    if (typeof window !== 'undefined' && currentUser?.id) {
      localStorage.setItem(`pcgos_operational_layout_${currentUser.id}`, JSON.stringify(protectedEnforced));
    }
  };

  const handleRestoreDefaultLayout = () => {
    const defaultLayout = {
      prazos_vencidos: true,
      prazos_fatais: true,
      audiencias_dia: true,
      alertas_criticos: true,
      prazos_usuario: true,
      compromissos: true,
      tarefas_institucionais: true,
      tarefas_pessoais: true,
      agenda_resumida: true,
    };
    saveBlockVisibility(defaultLayout);
  };

  // Create personal task
  const handleCreatePersonalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: PersonalTask = {
      id: `ptask-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      date: newTaskDate,
      time: newTaskTime,
      priority: newTaskPriority,
      reminder: newTaskReminder,
      completed: false,
      createdBy: currentUser?.id || 'u1',
      createdAt: new Date().toISOString(),
      isPersonal: true,
    };

    const updated = [newTask, ...personalTasks];
    savePersonalTasks(updated);

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsPersonalTaskModalOpen(false);
  };

  const handleTogglePersonalTask = (id: string) => {
    const updated = personalTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    savePersonalTasks(updated);
  };

  const handleDeletePersonalTask = (id: string) => {
    const updated = personalTasks.filter(t => t.id !== id);
    savePersonalTasks(updated);
  };

  // Current real date formatted
  const getTodayFormatted = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Campo_Grande',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const today = new Date();
    const str = today.toLocaleDateString('pt-BR', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getTodayIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayIso = getTodayIso();

  const parseLocalDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim();
    if (cleanStr.includes('/')) {
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    } else if (cleanStr.includes('-')) {
      const parts = cleanStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return null;
  };

  // Helper calculation for days remaining
  const calculateDaysDiff = (dateStr: string) => {
    if (!dateStr) return 0;
    if (dateStr.toLowerCase().includes('hoje')) return 0;

    const targetDate = parseLocalDate(dateStr);

    if (!targetDate || isNaN(targetDate.getTime())) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 3600 * 24));
  };

  // Filter items assigned to logged user or relevant
  const userNameLower = (currentUser?.name || '').toLowerCase();

  const isUserResponsible = (respName?: string) => {
    if (!respName) return true;
    const respLower = respName.toLowerCase();
    if (userNameLower.includes('rodrigo') && respLower.includes('rodrigo')) return true;
    if (userNameLower.includes('rhenderson') || userNameLower.includes('rodrigo')) return true; // CEO/Proprietário access
    return respLower.includes(userNameLower) || userNameLower.includes(respLower);
  };

  // Filtered Deadlines for User
  const userDeadlines = deadlines.filter(d => isUserResponsible(d.responsible));

  // Deadlines categories
  const overdueDeadlines = userDeadlines.filter(d => !isDeadlineDone(d.status, d.completed) && !isDeadlineCanceled(d.status) && (d.status === 'Vencido' || calculateDaysDiff(d.dueDate) < 0));
  const todayDeadlines = userDeadlines.filter(d => !isDeadlineDone(d.status, d.completed) && !isDeadlineCanceled(d.status) && (d.dueDate.toLowerCase().includes('hoje') || d.dueDate === todayIso || calculateDaysDiff(d.dueDate) === 0));
  const upcomingDeadlines = userDeadlines.filter(d => !isDeadlineDone(d.status, d.completed) && !isDeadlineCanceled(d.status) && calculateDaysDiff(d.dueDate) > 0);

  // Filtered Events for User (active, non-canceled)
  const userEvents = events.filter(e => isUserResponsible(e.responsible) && e.status !== 'Cancelado');
  const todayEvents = userEvents.filter(e => e.date === todayIso || e.date.toLowerCase().includes('hoje'));

  // Pending CRM retornos
  const pendingCrmRetornos = crmLeads.filter(l => l.status === 'AGUARDANDO DOC' || l.status === 'ATIVO');

  // Personal tasks for user
  const userPersonalTasks = personalTasks.filter(t => !currentUser?.id || t.createdBy === currentUser.id);
  const todayPersonalTasks = userPersonalTasks.filter(t => !t.completed && (t.date === todayIso || calculateDaysDiff(t.date) === 0));
  const overduePersonalTasks = userPersonalTasks.filter(t => !t.completed && calculateDaysDiff(t.date) < 0);

  // Counts for Metric Cards
  const countPrazosHoje = todayDeadlines.length;
  const countProximosPrazos = upcomingDeadlines.length;
  const countTarefasHoje = userDeadlines.filter(d => (d.type === 'interno' || d.itemKind === 'tarefa') && !isDeadlineDone(d.status, d.completed) && !isDeadlineCanceled(d.status) && calculateDaysDiff(d.dueDate) === 0).length + todayPersonalTasks.length;
  const countTarefasAtrasadas = overdueDeadlines.length + overduePersonalTasks.length;
  const countCompromissosHoje = todayEvents.length;
  const countRetornosPendentes = pendingCrmRetornos.length;

  // Find Process CNJ
  const getProcessByCnj = (cnjStr: string) => {
    return processes.find(p => p.cnj === cnjStr || p.id === cnjStr);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0d2f43] border border-blue-100">
              <User className="w-3 h-3" />
              {currentUser?.name} ({currentUser?.role})
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">{getTodayFormatted()}</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0d2f43] tracking-tight">
            Painel Operacional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central de execução individual com prazos, compromissos e tarefas do dia.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="7_days">Próximos 7 dias</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="all">Todo o Período</option>
            </select>
          </div>

          {/* Personalize Button */}
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
            title="Personalizar visualização dos blocos"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Personalizar Painel</span>
          </button>

          {/* New Personal Task Button */}
          <button
            onClick={() => setIsPersonalTaskModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#0d2f43] hover:bg-[#123e59] px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa Pessoal</span>
          </button>
        </div>
      </div>

      {/* 2. RESUMO DO DIA (Clickable Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            id: 'prazos_hoje',
            title: 'Prazos de Hoje',
            count: countPrazosHoje,
            icon: <Clock className="w-4 h-4 text-amber-600" />,
            bgColor: 'bg-amber-50/70',
            borderColor: selectedMetricFilter === 'prazos_hoje' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-200/80',
            textColor: 'text-amber-900',
            badgeBg: 'bg-amber-100 text-amber-800'
          },
          {
            id: 'proximos_prazos',
            title: 'Próximos Prazos',
            count: countProximosPrazos,
            icon: <Calendar className="w-4 h-4 text-blue-600" />,
            bgColor: 'bg-blue-50/70',
            borderColor: selectedMetricFilter === 'proximos_prazos' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200/80',
            textColor: 'text-blue-900',
            badgeBg: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'tarefas_hoje',
            title: 'Tarefas de Hoje',
            count: countTarefasHoje,
            icon: <CheckSquare className="w-4 h-4 text-emerald-600" />,
            bgColor: 'bg-emerald-50/70',
            borderColor: selectedMetricFilter === 'tarefas_hoje' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-200/80',
            textColor: 'text-emerald-900',
            badgeBg: 'bg-emerald-100 text-emerald-800'
          },
          {
            id: 'tarefas_atrasadas',
            title: 'Tarefas Atrasadas',
            count: countTarefasAtrasadas,
            icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
            bgColor: 'bg-rose-50/70',
            borderColor: selectedMetricFilter === 'tarefas_atrasadas' ? 'border-rose-500 ring-2 ring-rose-200' : 'border-rose-200/80',
            textColor: 'text-rose-900',
            badgeBg: 'bg-rose-100 text-rose-800'
          },
          {
            id: 'compromissos_hoje',
            title: 'Compromissos Hoje',
            count: countCompromissosHoje,
            icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
            bgColor: 'bg-indigo-50/70',
            borderColor: selectedMetricFilter === 'compromissos_hoje' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-indigo-200/80',
            textColor: 'text-indigo-900',
            badgeBg: 'bg-indigo-100 text-indigo-800'
          },
          {
            id: 'retornos_pendentes',
            title: 'Retornos Pendentes',
            count: countRetornosPendentes,
            icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
            bgColor: 'bg-purple-50/70',
            borderColor: selectedMetricFilter === 'retornos_pendentes' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-200/80',
            textColor: 'text-purple-900',
            badgeBg: 'bg-purple-100 text-purple-800'
          },
        ].map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedMetricFilter(selectedMetricFilter === card.id ? 'all' : card.id as any)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${card.bgColor} ${card.borderColor} hover:shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-slate-600 truncate">{card.title}</span>
              <div className="p-1 rounded-lg bg-white/80 border border-slate-200/50">{card.icon}</div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-2xl font-black ${card.textColor}`}>{card.count}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                {selectedMetricFilter === card.id ? 'Ativo' : 'Filtrar'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Metric Filter Alert Banner */}
      {selectedMetricFilter !== 'all' && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtro rápido ativo: <strong>{selectedMetricFilter.replace('_', ' ').toUpperCase()}</strong></span>
          </div>
          <button
            onClick={() => setSelectedMetricFilter('all')}
            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
          >
            Limpar filtro
          </button>
        </div>
      )}

      {/* 8. CRITICAL ALERTS SECTION (PROTECTED BLOCK - ALWAYS VISIBLE) */}
      {blockVisibility.alertas_criticos && (overdueDeadlines.length > 0 || todayDeadlines.length > 0 || overduePersonalTasks.length > 0) && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-sm text-rose-950 uppercase tracking-wider">
                Alertas Críticos & Prazos Vencidos
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                Obrigatório
              </span>
            </div>
            <span className="text-xs text-rose-700 font-medium">Ação imediata recomendada</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueDeadlines.map(d => (
              <div key={`alert-d-${d.id}`} className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-rose-700 uppercase tracking-tight">Prazo Vencido</span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {d.dueDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{d.description}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    Proc: {d.processCnj} {d.processClient ? `• ${d.processClient}` : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onToggleDeadline(d.id)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir Agora</span>
                  </button>
                  <button
                    onClick={() => {
                      const proc = getProcessByCnj(d.processCnj);
                      if (proc) onSelectProcess(proc.id);
                      else onNavigateTab('prazos');
                    }}
                    className="text-[11px] font-bold text-[#0d2f43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Processo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {todayDeadlines.map(d => (
              <div key={`alert-td-${d.id}`} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-amber-800 uppercase tracking-tight">Prazo Fatal Hoje</span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Vence Hoje
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{d.description}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    Proc: {d.processCnj} {d.processClient ? `• ${d.processClient}` : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onToggleDeadline(d.id)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir</span>
                  </button>
                  <button
                    onClick={() => {
                      const proc = getProcessByCnj(d.processCnj);
                      if (proc) onSelectProcess(proc.id);
                      else onNavigateTab('prazos');
                    }}
                    className="text-[11px] font-bold text-[#0d2f43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Processo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN OPERATIONAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Prazos, Compromissos, Tarefas Institucionais (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* 3. PRAZOS DO USUÁRIO */}
          {blockVisibility.prazos_usuario && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-base text-[#0d2f43]">
                    Prazos sob sua Responsabilidade
                  </h2>
                </div>
                <button
                  onClick={() => onNavigateTab('prazos')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Módulo Completo</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Prazos Groups */}
              <div className="flex flex-col gap-5">
                {/* Group 1: Prazos de Hoje */}
                {(selectedMetricFilter === 'all' || selectedMetricFilter === 'prazos_hoje') && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Prazos de Hoje ({todayDeadlines.length})
                      </h3>
                    </div>

                    {todayDeadlines.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        Nenhum prazo fatal agendado para o dia de hoje.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {todayDeadlines.map((d) => {
                          const proc = getProcessByCnj(d.processCnj);
                          return (
                            <div key={d.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition-all flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => onToggleDeadline(d.id)}
                                  className="mt-0.5 p-1 rounded-md border border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Marcar como Cumprido"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <div>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-bold text-xs text-slate-900">{d.description}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                      Fatal Hoje
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                                    <span>CNJ: <strong>{d.processCnj}</strong></span>
                                    {d.processClient && <span>• Cliente: <strong>{d.processClient}</strong></span>}
                                    <span>• Resp: <strong>{d.responsible}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {proc && (
                                  <button
                                    onClick={() => onSelectProcess(proc.id)}
                                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-[#0d2f43] hover:bg-slate-50 cursor-pointer"
                                  >
                                    Ver Processo
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Group 2: Próximos Prazos */}
                {(selectedMetricFilter === 'all' || selectedMetricFilter === 'proximos_prazos') && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Próximos Prazos ({upcomingDeadlines.length})
                      </h3>
                    </div>

                    {upcomingDeadlines.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        Nenhum próximo prazo cadastrado nos próximos dias.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {upcomingDeadlines.map((d) => {
                          const diff = calculateDaysDiff(d.dueDate);
                          const proc = getProcessByCnj(d.processCnj);
                          return (
                            <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => onToggleDeadline(d.id)}
                                  className="mt-0.5 p-1 rounded-md border border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Marcar como Cumprido"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <div>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-bold text-xs text-slate-900">{d.description}</h4>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                      Vence em {diff} dia{diff > 1 ? 's' : ''} ({d.dueDate})
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                                    <span>CNJ: <strong>{d.processCnj}</strong></span>
                                    {d.processClient && <span>• Cliente: <strong>{d.processClient}</strong></span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {proc && (
                                  <button
                                    onClick={() => onSelectProcess(proc.id)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-[#0d2f43] hover:bg-slate-100 cursor-pointer"
                                  >
                                    Ver Processo
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. COMPROMISSOS (AGENDA) */}
          {blockVisibility.compromissos && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-base text-[#0d2f43]">
                    Compromissos Agendados
                  </h2>
                </div>
                <button
                  onClick={() => onNavigateTab('agenda')}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir Agenda</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {userEvents.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Nenhum compromisso marcado para você neste período.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {userEvents.map((e) => (
                    <div key={e.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-purple-200 transition-all flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-100 min-w-[54px]">
                          <span className="text-[10px] font-bold uppercase">{e.type}</span>
                          <span className="text-xs font-extrabold">{e.start}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{e.title}</h4>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Data: <strong>{e.date}</strong></span>
                            <span>• Horário: <strong>{e.start} - {e.end}</strong></span>
                            {e.process && <span>• Ref: <strong>{e.process}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          e.status === 'Realizado' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          e.status === 'Agendado' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {e.status || 'Confirmado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. TAREFAS INSTITUCIONAIS */}
          {blockVisibility.tarefas_institucionais && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <Building className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-base text-[#0d2f43]">
                    Tarefas Institucionais
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">Atribuídas pelo escritório</span>
              </div>

              {deadlines.filter(d => d.type === 'interno').length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Nenhuma tarefa institucional cadastrada.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {deadlines.filter(d => d.type === 'interno').map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition-all flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${t.status === 'Cumprido' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <h4 className="font-bold text-xs text-slate-900">{t.description}</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.status === 'Cumprido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 mt-1">
                        <span>Vencimento: <strong>{t.dueDate}</strong> • Resp: <strong>{t.responsible}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleDeadline(t.id)}
                            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            {t.status === 'Cumprido' ? 'Reabrir' : 'Concluir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Tarefas Pessoais & Agenda Resumida (1 Col) */}
        <div className="flex flex-col gap-6">

          {/* 6. TAREFAS PESSOAIS */}
          {blockVisibility.tarefas_pessoais && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-[#0d2f43]">Tarefas Pessoais</h2>
                    <p className="text-[10px] text-slate-400">Privadas do seu usuário</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPersonalTaskModalOpen(true)}
                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                  title="Nova Tarefa Pessoal"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {userPersonalTasks.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Você não possui tarefas pessoais.</p>
                  <button
                    onClick={() => setIsPersonalTaskModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    + Criar primeira tarefa
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {userPersonalTasks.map((pt) => (
                    <div
                      key={pt.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                        pt.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => handleTogglePersonalTask(pt.id)}
                          className={`mt-0.5 p-1 rounded-md border text-xs transition-colors cursor-pointer ${
                            pt.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500 text-transparent'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <h4 className={`text-xs font-bold ${pt.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {pt.title}
                          </h4>
                          {pt.description && <p className="text-[11px] text-slate-500 mt-0.5">{pt.description}</p>}
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>Data: {pt.date} {pt.time ? `• ${pt.time}` : ''}</span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">Pessoal</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePersonalTask(pt.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. AGENDA RESUMIDA DO USUÁRIO */}
          {blockVisibility.agenda_resumida && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-bold text-sm text-[#0d2f43]">Agenda do Usuário</h2>
                </div>

                {/* Sub-tabs: Hoje | Semana | Próximos 7 dias */}
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
                  {[
                    { id: 'hoje', label: 'Hoje' },
                    { id: 'semana', label: 'Semana' },
                    { id: '7_dias', label: '7 Dias' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAgendaTab(tab.id as any)}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        agendaTab === tab.id ? 'bg-white text-[#0d2f43] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consolidated Items Timeline */}
              <div className="flex flex-col gap-2">
                {todayDeadlines.map(d => (
                  <div key={`ag-d-${d.id}`} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[160px]">{d.description}</p>
                        <p className="text-[10px] text-amber-800 font-medium">Prazo Processual</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      Hoje
                    </span>
                  </div>
                ))}

                {todayEvents.map(e => (
                  <div key={`ag-e-${e.id}`} className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[160px]">{e.title}</p>
                        <p className="text-[10px] text-purple-800 font-medium">{e.type.toUpperCase()} • {e.start}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                      {e.start}
                    </span>
                  </div>
                ))}

                {todayPersonalTasks.map(pt => (
                  <div key={`ag-pt-${pt.id}`} className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[160px]">{pt.title}</p>
                        <p className="text-[10px] text-indigo-800 font-medium">Tarefa Pessoal</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                      {pt.time || 'Dia todo'}
                    </span>
                  </div>
                ))}

                {todayDeadlines.length === 0 && todayEvents.length === 0 && todayPersonalTasks.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    Nenhum item agendado na visão consolidada da agenda.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: NOVA TAREFA PESSOAL */}
      <AnimatePresence>
        {isPersonalTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0d2f43]">Nova Tarefa Pessoal</h3>
                </div>
                <button
                  onClick={() => setIsPersonalTaskModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Explicit Label Box */}
              <div className="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl flex items-start gap-2 text-xs text-indigo-950 font-medium">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Esta tarefa é pessoal e somente você poderá visualizá-la.</span>
              </div>

              <form onSubmit={handleCreatePersonalTask} className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Título da Tarefa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lembrete de estudo ou reunião pessoal"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Descrição (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes adicionais..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Data</label>
                    <input
                      type="date"
                      required
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Horário</label>
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Prioridade</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPersonalTaskModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#0d2f43] hover:bg-[#123e59] rounded-xl shadow-xs cursor-pointer"
                  >
                    Salvar Tarefa Pessoal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PERSONALIZAR PAINEL */}
      <AnimatePresence>
        {isCustomizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-700" />
                  <h3 className="font-display font-bold text-base text-[#0d2f43]">Personalizar Blocos do Painel</h3>
                </div>
                <button
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Selecione quais blocos deseja exibir na sua área de trabalho. Blocos com selo de proteção são obrigatórios.
              </p>

              <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                {[
                  { id: 'alertas_criticos', label: 'Alertas Críticos & Prazos Vencidos', protected: true },
                  { id: 'prazos_usuario', label: 'Prazos sob sua Responsabilidade', protected: false },
                  { id: 'compromissos', label: 'Compromissos Agendados (Agenda)', protected: false },
                  { id: 'tarefas_institucionais', label: 'Tarefas Institucionais', protected: false },
                  { id: 'tarefas_pessoais', label: 'Tarefas Pessoais Privadas', protected: false },
                  { id: 'agenda_resumida', label: 'Agenda Consolidada do Usuário', protected: false },
                ].map((block) => (
                  <div key={block.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-800">{block.label}</span>
                    {block.protected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        <Lock className="w-3 h-3" />
                        Obrigatório
                      </span>
                    ) : (
                      <button
                        onClick={() => saveBlockVisibility({ ...blockVisibility, [block.id]: !blockVisibility[block.id] })}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          blockVisibility[block.id] ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {blockVisibility[block.id] ? 'Exibido' : 'Oculto'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={handleRestoreDefaultLayout}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Restaurar Layout Padrão
                </button>
                <button
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0d2f43] hover:bg-[#123e59] rounded-xl cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Missing icon component definition inline helper
function AlertOctagon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
