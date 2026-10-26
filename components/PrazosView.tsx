/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, SlidersHorizontal, Calendar, CheckSquare, 
  Square, AlertTriangle, Clock, Play, UserPlus, FileText,
  Plus, Gavel, Filter, ChevronRight, X, CheckCircle2,
  AlertCircle, ArrowRight, User, ShieldAlert, History,
  RotateCcw, Paperclip, ChevronDown, ListFilter, LayoutGrid,
  CalendarDays, Tag, Shield, AlertOctagon, HelpCircle, Eye,
  Building, Check, Ban, ExternalLink, RefreshCw, Send, ArrowUpRight, Trash2
} from 'lucide-react';
import { 
  Deadline, Process, CalendarEvent, DeadlineChecklistItem, 
  LinkedTaskItem, ProcessHistoryItem 
} from '@/lib/mockData';

interface PrazosViewProps {
  deadlines: Deadline[];
  processes?: Process[];
  events?: CalendarEvent[];
  users?: any[];
  currentUser?: any;
  onToggleDeadline?: (id: string) => void;
  onAddDeadline: (deadline: Omit<Deadline, 'id'>) => void;
  onUpdateDeadline?: (deadline: Deadline) => void;
  onDeleteDeadline?: (id: string, reason?: string) => void;
  onAddEvent?: (evt: Omit<CalendarEvent, 'id'>) => void;
  onUpdateProcess?: (updatedProc: Process) => void;
  onSelectProcess?: (id: string) => void;
  onNavigateTab?: (tab: string, filters?: any) => void;
  initialFilters?: {
    activeTab?: string;
    searchQuery?: string;
  };
}

// Preset Checklists for Common Legal Procedures
const CHECKLIST_PRESETS: Record<string, string[]> = {
  Contestação: [
    'Solicitar documentos ao cliente',
    'Analisar a petição inicial e documentos anexos',
    'Arguir preliminares e prejudiciais de mérito',
    'Formular tese defensiva principal e subsidiária',
    'Elaborar a minuta da contestação',
    'Revisar a peça e precedentes jurisprudenciais',
    'Protocolar no portal do Tribunal',
    'Anexar o comprovante de protocolo no sistema'
  ],
  Apelação: [
    'Analisar os fundamentos da sentença',
    'Verificar prazo e tempestividade do recurso',
    'Solicitar guia de preparo ou comprovar gratuidade',
    'Redigir razões de apelação',
    'Revisão técnica e citação de jurisprudência atualizada',
    'Protocolar o recurso de apelação',
    'Anexar o comprovante e guias no prontuário'
  ],
  'Agravo de Instrumento': [
    'Analisar a decisão interlocutória e situação de urgência',
    'Reunir peças obrigatórias e facultativas',
    'Elaborar pedido de efeito suspensivo / antecipação da tutela',
    'Redigir razões do agravo',
    'Protocolar no Tribunal de 2ª Instância',
    'Comunicar o juízo a quo (art. 1.018 do CPC)'
  ],
  'Recurso Especial / Extraordinário': [
    'Analisar acórdão e omissões/contradições',
    'Demonstrar prequestionamento e repercussão geral/interesse federal',
    'Elaborar minuta do recurso',
    'Recolher preparo e porte de remessa',
    'Protocolar recurso no Tribunal de Origem'
  ],
  'Audiência / Perícia': [
    'Confirmar intimação das testemunhas e peritos',
    'Reunir cliente 24h antes para alinhamento probatório',
    'Elaborar roteiro de quesitos e perguntas',
    'Participar do ato processual/diligência',
    'Juntar ata da audiência / laudo pericial no processo'
  ]
};

const SYSTEM_USERS_LIST = [
  'Dr. Rodrigo Godoy',
  'Dra. Ana Paula',
  'Dr. Pedro Godoy',
  'Dra. Larissa Paiva',
  'Dr. Ricardo G.',
  'Secretaria Operacional'
];

export default function PrazosView({
  deadlines,
  processes = [],
  events = [],
  users,
  currentUser,
  onToggleDeadline,
  onAddDeadline,
  onUpdateDeadline,
  onDeleteDeadline,
  onAddEvent,
  onUpdateProcess,
  onSelectProcess,
  onNavigateTab,
  initialFilters
}: PrazosViewProps) {
  // Active real system users
  const activeUsersList = useMemo(() => {
    if (users && users.length > 0) {
      const active = users.filter((u: any) => u.mfa !== false && u.status !== 'Inativo' && u.status !== 'Desativado' && u.status !== 'Bloqueado');
      if (active.length > 0) return active;
    }
    return [
      { id: 'usr-ceo-1', name: 'Larissa Paiva' },
      { id: 'usr-ceo-2', name: 'Pedro Godoy' },
      { id: 'usr-ceo-3', name: 'Rhenderson Camargo' },
    ];
  }, [users]);
  // Main View Mode: 'list' | 'week' | 'month'
  const [viewMode, setViewMode] = useState<'list' | 'week' | 'month'>('list');

  // Filter States
  const [metricFilter, setMetricFilter] = useState<string>('todos');
  const [kindFilter, setKindFilter] = useState<'todos' | 'prazo' | 'tarefa'>('todos');
  const [periodFilter, setPeriodFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes' | 'vencidos' | 'futuros'>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos');
  const [areaFilter, setAreaFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');

  // Active Modals
  const [isNewDeadlineModalOpen, setIsNewDeadlineModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Deadline | null>(null);
  const [selectedItemForConclude, setSelectedItemForConclude] = useState<Deadline | null>(null);
  const [selectedItemForReschedule, setSelectedItemForReschedule] = useState<Deadline | null>(null);
  const [selectedItemForCancel, setSelectedItemForCancel] = useState<Deadline | null>(null);
  const [selectedItemForReopen, setSelectedItemForReopen] = useState<Deadline | null>(null);
  const [selectedItemForAddTask, setSelectedItemForAddTask] = useState<Deadline | null>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<Deadline | null>(null);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<Deadline | null>(null);

  // Form State: Process Search
  const [processSearchQuery, setProcessSearchQuery] = useState('');
  const [selectedProcessForModal, setSelectedProcessForModal] = useState<Process | null>(null);

  // Form State: Novo Prazo
  const [prazoTitle, setPrazoTitle] = useState('');
  const [prazoDesc, setPrazoDesc] = useState('');
  const [prazoType, setPrazoType] = useState('Processual');
  const [prazoStartDate, setPrazoStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [prazoDueDate, setPrazoDueDate] = useState('');
  const [prazoDueTime, setPrazoDueTime] = useState('23:59');
  const [prazoResponsible, setPrazoResponsible] = useState(currentUser?.name || 'Larissa Paiva');
  const [prazoParticipants, setPrazoParticipants] = useState<string[]>([]);
  const [prazoPriority, setPrazoPriority] = useState<'Baixa' | 'Normal' | 'Alta' | 'Crítica'>('Alta');
  const [prazoOrigin, setPrazoOrigin] = useState('Publicação/Intimação');
  const [prazoAdvanceAlert, setPrazoAdvanceAlert] = useState('1 dia antes');
  const [prazoChecklist, setPrazoChecklist] = useState<DeadlineChecklistItem[]>([]);
  const [prazoNotes, setPrazoNotes] = useState('');
  const [prazoLinkedTasks, setPrazoLinkedTasks] = useState<LinkedTaskItem[]>([]);
  const [newChecklistInput, setNewChecklistInput] = useState('');
  const [newLinkedTaskTitle, setNewLinkedTaskTitle] = useState('');

  // Form State: Nova Tarefa
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [tarefaDesc, setTarefaDesc] = useState('');
  const [tarefaProcess, setTarefaProcess] = useState<Process | null>(null);
  const [tarefaParentDeadlineId, setTarefaParentDeadlineId] = useState('');
  const [tarefaResponsible, setTarefaResponsible] = useState(currentUser?.name || 'Larissa Paiva');
  const [tarefaParticipants, setTarefaParticipants] = useState<string[]>([]);
  const [tarefaStartDate, setTarefaStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tarefaDueDate, setTarefaDueDate] = useState('');
  const [tarefaDueTime, setTarefaDueTime] = useState('18:00');
  const [tarefaPriority, setTarefaPriority] = useState<'Baixa' | 'Normal' | 'Alta' | 'Crítica'>('Normal');
  const [tarefaStatus, setTarefaStatus] = useState('A fazer');
  const [tarefaWaitingReason, setTarefaWaitingReason] = useState('Aguardando cliente');
  const [tarefaOrigin, setTarefaOrigin] = useState('Rotina Interna');
  const [tarefaAdvanceAlert, setTarefaAdvanceAlert] = useState('1 dia antes');
  const [tarefaChecklist, setTarefaChecklist] = useState<DeadlineChecklistItem[]>([]);
  const [tarefaNotes, setTarefaNotes] = useState('');

  // Form State: Modal Actions (Conclusão, Reagendamento, Cancelamento, Reabertura)
  const [concludeDate, setConcludeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [concludeTime, setConcludeTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [concludeProtocolNumber, setConcludeProtocolNumber] = useState('');
  const [concludeProtocolDate, setConcludeProtocolDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [concludeReceiptUrl, setConcludeReceiptUrl] = useState('');
  const [concludeFinalNotes, setConcludeFinalNotes] = useState('');

  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('23:59');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [cancelReason, setCancelReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  const [inlineTaskResp, setInlineTaskResp] = useState(currentUser?.name || 'Larissa Paiva');
  const [inlineTaskDate, setInlineTaskDate] = useState('');

  // Auto-calculate permissions
  const canManageCriticalActions = useMemo(() => {
    if (!currentUser) return true; // default open in local environment
    const role = currentUser.role.toLowerCase();
    return role.includes('sócio') || role.includes('administrador') || role.includes('sênior') || role.includes('pleno') || role.includes('advogado');
  }, [currentUser]);

  // Today Date Strings
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Sync Process History Helper
  const logProcessHistory = (processCnj: string, actionType: string, description: string) => {
    if (!processCnj || processCnj === 'Geral / Institucional') return;
    const targetProcess = processes.find(p => p.cnj === processCnj);
    if (!targetProcess) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType,
      description
    };

    const updatedProc: Process = {
      ...targetProcess,
      history: [newHistoryItem, ...(targetProcess.history || [])]
    };

    if (onUpdateProcess) {
      onUpdateProcess(updatedProc);
    }
  };

  // Helper: Format Time Remaining
  const getTimeRemaining = (item: Deadline) => {
    if (item.status === 'Cumprido' || item.status === 'Concluída') return { label: 'Concluído', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (item.status === 'Cancelado' || item.status === 'Cancelada') return { label: 'Cancelado', color: 'text-slate-500 bg-slate-100 border-slate-200' };

    const due = new Date(item.dueDate);
    const today = new Date(todayStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Vencido há ${Math.abs(diffDays)}d`, color: 'text-red-700 bg-red-100 border-red-300 font-black animate-pulse' };
    }
    if (diffDays === 0) {
      return { label: `Vence HOJE (${item.dueTime || '23:59'})`, color: 'text-amber-800 bg-amber-100 border-amber-300 font-extrabold' };
    }
    if (diffDays === 1) {
      return { label: 'Vence Amanhã', color: 'text-orange-700 bg-orange-50 border-orange-200 font-bold' };
    }
    return { label: `Em ${diffDays} dias`, color: 'text-slate-700 bg-slate-100 border-slate-200' };
  };

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    let prazosHoje = 0;
    let prazosCriticos = 0;
    let prazosVencidos = 0;
    let proximosPrazos = 0;
    let tarefasPendentes = 0;
    let tarefasAtrasadas = 0;
    let emRevisao = 0;
    let concluidosPeriodo = 0;

    deadlines.forEach(d => {
      const isDone = d.status === 'Cumprido' || d.status === 'Concluída';
      const isCanceled = d.status === 'Cancelado' || d.status === 'Cancelada';
      const isPrazo = d.itemKind === 'prazo' || d.type === 'processual';

      if (isDone) {
        concluidosPeriodo++;
        return;
      }
      if (isCanceled) return;

      const isOverdue = d.dueDate < todayStr || d.status === 'Vencido';
      const isToday = d.dueDate === todayStr;
      const isFuture = d.dueDate > todayStr;

      if (isPrazo) {
        if (isToday) prazosHoje++;
        if (d.priority === 'Crítica' || d.status === 'Crítico' || isToday || isOverdue) prazosCriticos++;
        if (isOverdue) prazosVencidos++;
        if (isFuture) proximosPrazos++;
      } else {
        if (d.status !== 'Concluída') tarefasPendentes++;
        if (isOverdue) tarefasAtrasadas++;
      }

      if (d.status === 'Em revisão') emRevisao++;
    });

    return {
      prazosHoje,
      prazosCriticos,
      prazosVencidos,
      proximosPrazos,
      tarefasPendentes,
      tarefasAtrasadas,
      emRevisao,
      concluidosPeriodo
    };
  }, [deadlines, todayStr]);

  // Filtered Process List for Form Modal
  const filteredProcessesForModal = useMemo(() => {
    const q = processSearchQuery.toLowerCase().trim();
    if (!q) return processes.slice(0, 8);
    return processes.filter(p => 
      !p.deleted && (
        p.cnj.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        (p.clientCpfCnpj && p.clientCpfCnpj.includes(q)) ||
        (p.opposingParty && p.opposingParty.toLowerCase().includes(q)) ||
        (p.subject && p.subject.toLowerCase().includes(q))
      )
    );
  }, [processes, processSearchQuery]);

  // Filtered Main List
  const filteredItems = useMemo(() => {
    return deadlines.filter(item => {
      // Metric card quick filters
      if (metricFilter === 'prazos_hoje' && (item.dueDate !== todayStr || item.status === 'Cumprido')) return false;
      if (metricFilter === 'prazos_criticos' && (item.priority !== 'Crítica' && item.status !== 'Crítico' && item.dueDate !== todayStr && item.dueDate >= todayStr)) return false;
      if (metricFilter === 'prazos_vencidos' && (item.dueDate >= todayStr || item.status === 'Cumprido' || item.status === 'Concluída')) return false;
      if (metricFilter === 'proximos_prazos' && (item.dueDate <= todayStr || item.status === 'Cumprido' || item.status === 'Concluída')) return false;
      if (metricFilter === 'tarefas_pendentes' && (item.itemKind !== 'tarefa' || item.status === 'Concluída')) return false;
      if (metricFilter === 'tarefas_atrasadas' && (item.itemKind !== 'tarefa' || item.dueDate >= todayStr || item.status === 'Concluída')) return false;
      if (metricFilter === 'em_revisao' && item.status !== 'Em revisão') return false;
      if (metricFilter === 'concluidos' && item.status !== 'Cumprido' && item.status !== 'Concluída') return false;

      // Item Kind
      if (kindFilter === 'prazo' && item.itemKind === 'tarefa') return false;
      if (kindFilter === 'tarefa' && item.itemKind !== 'tarefa') return false;

      // Period Filter
      if (periodFilter === 'hoje' && item.dueDate !== todayStr) return false;
      if (periodFilter === 'vencidos' && (item.dueDate >= todayStr || item.status === 'Cumprido' || item.status === 'Concluída')) return false;
      if (periodFilter === 'futuros' && item.dueDate <= todayStr) return false;

      // Status
      if (statusFilter !== 'todos' && item.status !== statusFilter) return false;

      // Priority
      if (priorityFilter !== 'todos' && item.priority !== priorityFilter) return false;

      // Responsible
      if (responsibleFilter !== 'todos' && item.responsible !== responsibleFilter) return false;

      // Area
      if (areaFilter !== 'todos' && item.area !== areaFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCnj = item.processCnj.toLowerCase().includes(q);
        const matchClient = (item.processClient || '').toLowerCase().includes(q);
        const matchOpposing = (item.opposingParty || '').toLowerCase().includes(q);
        const matchResp = item.responsible.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCnj && !matchClient && !matchOpposing && !matchResp) {
          return false;
        }
      }

      return true;
    });
  }, [deadlines, metricFilter, kindFilter, periodFilter, statusFilter, priorityFilter, responsibleFilter, areaFilter, searchQuery, todayStr]);

  // Load Preset Checklist
  const handleLoadPresetChecklist = (presetKey: string) => {
    const items = CHECKLIST_PRESETS[presetKey];
    if (!items) return;
    const formatted: DeadlineChecklistItem[] = items.map((title, i) => ({
      id: `chk-${Date.now()}-${i}`,
      title,
      status: 'Pendente'
    }));
    setPrazoChecklist(prev => [...prev, ...formatted]);
  };

  // Submit Novo Prazo
  const handleCreatePrazoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProcessForModal) {
      alert('Selecione obrigatoriamente um processo cadastrado para autuar o prazo.');
      return;
    }

    if (!prazoTitle.trim() || !prazoDueDate) {
      alert('Preencha o título e a data limite de cumprimento.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newPrazo: Omit<Deadline, 'id'> = {
      itemKind: 'prazo',
      title: prazoTitle.trim(),
      description: prazoDesc.trim() || prazoTitle.trim(),
      processId: selectedProcessForModal.id,
      processCnj: selectedProcessForModal.cnj,
      processClient: selectedProcessForModal.client,
      clientCpfCnpj: selectedProcessForModal.clientCpfCnpj,
      clientPolo: selectedProcessForModal.clientPolo,
      opposingParty: selectedProcessForModal.opposingParty,
      area: selectedProcessForModal.area,
      courtVaraComarca: `${selectedProcessForModal.court || ''} ${selectedProcessForModal.vara || ''} ${selectedProcessForModal.comarca || ''}`.trim(),
      phase: selectedProcessForModal.phase,
      startDate: prazoStartDate,
      dueDate: prazoDueDate,
      dueTime: prazoDueTime,
      createdBy: currentUser?.name || 'Membro do Sistema',
      createdAtDate: formattedDate,
      createdAtTime: formattedTime,
      responsible: prazoResponsible,
      participants: prazoParticipants,
      priority: prazoPriority,
      status: 'Aberto',
      type: prazoType,
      origin: prazoOrigin,
      advanceAlert: prazoAdvanceAlert,
      checklist: prazoChecklist,
      notes: prazoNotes,
      linkedTasks: prazoLinkedTasks,
      isPrivate: false,
      history: [
        {
          id: `log-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: 'Prazo Cadastrado',
          description: `Prazo "${prazoTitle.trim()}" autuado no sistema com vencimento para ${prazoDueDate} às ${prazoDueTime}. Responsável: ${prazoResponsible}.`
        }
      ]
    };

    onAddDeadline(newPrazo);

    // Auto-log in process history
    logProcessHistory(
      selectedProcessForModal.cnj,
      'Prazo Processual Cadastrado',
      `Prazo "${prazoTitle.trim()}" cadastrado no PCG.OS com vencimento em ${prazoDueDate} às ${prazoDueTime}. Responsável: ${prazoResponsible}.`
    );

    // Auto-create Event in Agenda if requested
    if (onAddEvent && prazoAdvanceAlert) {
      onAddEvent({
        title: `🚨 Prazo: ${prazoTitle.trim()}`,
        type: 'diligencia',
        process: selectedProcessForModal.cnj,
        date: prazoDueDate,
        start: prazoDueTime || '09:00',
        end: '18:00',
        responsible: prazoResponsible
      });
    }

    // Reset Form Modal
    setPrazoTitle('');
    setPrazoDesc('');
    setPrazoDueDate('');
    setSelectedProcessForModal(null);
    setProcessSearchQuery('');
    setPrazoChecklist([]);
    setPrazoLinkedTasks([]);
    setPrazoNotes('');
    setIsNewDeadlineModalOpen(false);

    alert('Prazo processual cadastrado com sucesso e integrado ao sistema!');
  };

  // Submit Nova Tarefa
  const handleCreateTarefaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tarefaTitle.trim() || !tarefaDueDate) {
      alert('Preencha o título e a data de vencimento da tarefa.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newTarefa: Omit<Deadline, 'id'> = {
      itemKind: 'tarefa',
      title: tarefaTitle.trim(),
      description: tarefaDesc.trim() || tarefaTitle.trim(),
      processId: tarefaProcess?.id || undefined,
      processCnj: tarefaProcess?.cnj || 'Geral / Institucional',
      processClient: tarefaProcess?.client || 'Escritório PCG',
      clientCpfCnpj: tarefaProcess?.clientCpfCnpj || '',
      area: tarefaProcess?.area || 'Geral',
      parentDeadlineId: tarefaParentDeadlineId || undefined,
      startDate: tarefaStartDate,
      dueDate: tarefaDueDate,
      dueTime: tarefaDueTime,
      createdBy: currentUser?.name || 'Membro do Sistema',
      createdAtDate: formattedDate,
      createdAtTime: formattedTime,
      responsible: tarefaResponsible,
      participants: tarefaParticipants,
      priority: tarefaPriority,
      status: tarefaStatus,
      waitingReason: tarefaStatus === 'Aguardando' ? tarefaWaitingReason : undefined,
      type: 'interno',
      origin: tarefaOrigin,
      advanceAlert: tarefaAdvanceAlert,
      checklist: tarefaChecklist,
      notes: tarefaNotes,
      isPrivate: false,
      history: [
        {
          id: `log-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: 'Tarefa Criada',
          description: `Tarefa institucional "${tarefaTitle.trim()}" criada com vencimento para ${tarefaDueDate} às ${tarefaDueTime}. Responsável: ${tarefaResponsible}.`
        }
      ]
    };

    onAddDeadline(newTarefa);

    // Auto-log in process history if linked to process
    if (tarefaProcess) {
      logProcessHistory(
        tarefaProcess.cnj,
        'Tarefa Institucional Criada',
        `Tarefa "${tarefaTitle.trim()}" criada e vinculada ao processo com vencimento em ${tarefaDueDate}. Responsável: ${tarefaResponsible}.`
      );
    }

    // Reset Modal
    setTarefaTitle('');
    setTarefaDesc('');
    setTarefaDueDate('');
    setTarefaProcess(null);
    setTarefaChecklist([]);
    setTarefaNotes('');
    setIsNewTaskModalOpen(false);

    alert('Tarefa institucional cadastrada com sucesso!');
  };

  // Conclude Item Handler
  const handleConfirmConclude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForConclude || !onUpdateDeadline) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const isPrazo = selectedItemForConclude.itemKind === 'prazo' || selectedItemForConclude.type === 'processual';
    const newStatus = isPrazo ? 'Cumprido' : 'Concluída';

    const updatedItem: Deadline = {
      ...selectedItemForConclude,
      status: newStatus,
      completedBy: currentUser?.name || 'Membro do Sistema',
      completedAtDate: concludeDate || formattedDate,
      completedAtTime: concludeTime || formattedTime,
      protocolNumber: concludeProtocolNumber.trim(),
      protocolDate: concludeProtocolDate,
      receiptUrl: concludeReceiptUrl.trim(),
      finalNotes: concludeFinalNotes.trim(),
      history: [
        {
          id: `log-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: isPrazo ? 'Prazo Cumprido' : 'Tarefa Concluída',
          description: `${isPrazo ? 'Prazo cumprido' : 'Tarefa concluída'} com sucesso.${concludeProtocolNumber ? ` Protocolo nº ${concludeProtocolNumber}.` : ''} Obs: ${concludeFinalNotes || 'Sem observações.'}`
        },
        ...(selectedItemForConclude.history || [])
      ]
    };

    onUpdateDeadline(updatedItem);

    // Log to Process
    logProcessHistory(
      selectedItemForConclude.processCnj,
      isPrazo ? 'Prazo Cumprido' : 'Tarefa Concluída',
      `${isPrazo ? 'Prazo' : 'Tarefa'} "${selectedItemForConclude.title || selectedItemForConclude.description}" finalizado por ${currentUser?.name || 'Membro do Sistema'}.${concludeProtocolNumber ? ` Protocolo: ${concludeProtocolNumber}` : ''}`
    );

    setSelectedItemForConclude(null);
    setConcludeProtocolNumber('');
    setConcludeFinalNotes('');
    alert('Atividade marcada como concluída/cumprida!');
  };

  // Reschedule Item Handler
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForReschedule || !onUpdateDeadline) return;

    if (!canManageCriticalActions) {
      alert('Você não possui permissão para alterar a data limite/vencimento de prazos.');
      return;
    }

    if (!rescheduleDate || !rescheduleReason.trim()) {
      alert('A nova data e a justificativa do reagendamento são obrigatórias!');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const oldDate = selectedItemForReschedule.dueDate;
    const oldTime = selectedItemForReschedule.dueTime || '23:59';

    const updatedItem: Deadline = {
      ...selectedItemForReschedule,
      dueDate: rescheduleDate,
      dueTime: rescheduleTime,
      rescheduleReason: rescheduleReason.trim(),
      updatedBy: currentUser?.name || 'Membro do Sistema',
      updatedAtDate: formattedDate,
      updatedAtTime: formattedTime,
      history: [
        {
          id: `log-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: 'Data Reagendada',
          description: `Vencimento alterado de ${oldDate} (${oldTime}) para ${rescheduleDate} (${rescheduleTime}). Motivo: ${rescheduleReason.trim()}`
        },
        ...(selectedItemForReschedule.history || [])
      ]
    };

    onUpdateDeadline(updatedItem);

    logProcessHistory(
      selectedItemForReschedule.processCnj,
      'Reagendamento de Vencimento',
      `Vencimento de "${selectedItemForReschedule.title || selectedItemForReschedule.description}" alterado de ${oldDate} para ${rescheduleDate}. Motivo: ${rescheduleReason.trim()}`
    );

    setSelectedItemForReschedule(null);
    setRescheduleDate('');
    setRescheduleReason('');
    alert('Data reagendada e histórico preservado com sucesso!');
  };

  // Cancel Item Handler
  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForCancel || !onUpdateDeadline) return;

    if (!canManageCriticalActions) {
      alert('Somente usuários autorizados podem cancelar prazos ou tarefas.');
      return;
    }

    if (!cancelReason.trim()) {
      alert('Digite o motivo obrigatório do cancelamento.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updatedItem: Deadline = {
      ...selectedItemForCancel,
      status: 'Cancelado',
      cancellationReason: cancelReason.trim(),
      updatedBy: currentUser?.name || 'Membro do Sistema',
      updatedAtDate: formattedDate,
      updatedAtTime: formattedTime,
      history: [
        {
          id: `log-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: 'Atividade Cancelada',
          description: `Item cancelado por ${currentUser?.name || 'Membro do Sistema'}. Motivo: ${cancelReason.trim()}`
        },
        ...(selectedItemForCancel.history || [])
      ]
    };

    onUpdateDeadline(updatedItem);

    logProcessHistory(
      selectedItemForCancel.processCnj,
      'Atividade Cancelada',
      `"${selectedItemForCancel.title || selectedItemForCancel.description}" cancelado. Motivo: ${cancelReason.trim()}`
    );

    setSelectedItemForCancel(null);
    setCancelReason('');
    alert('Registro cancelado com sucesso.');
  };

  // Reopen Item Handler
  const handleConfirmReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForReopen || !onUpdateDeadline) return;

    if (!reopenReason.trim()) {
      alert('Digite a justificativa da reabertura.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const isPrazo = selectedItemForReopen.itemKind === 'prazo' || selectedItemForReopen.type === 'processual';

    const updatedItem: Deadline = {
      ...selectedItemForReopen,
      status: isPrazo ? 'Aberto' : 'A fazer',
      reopenReason: reopenReason.trim(),
      history: [
        {
          id: `log-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: 'Atividade Reaberta',
          description: `Reaberto por ${currentUser?.name || 'Membro do Sistema'}. Justificativa: ${reopenReason.trim()}`
        },
        ...(selectedItemForReopen.history || [])
      ]
    };

    onUpdateDeadline(updatedItem);

    logProcessHistory(
      selectedItemForReopen.processCnj,
      'Atividade Reaberta',
      `"${selectedItemForReopen.title || selectedItemForReopen.description}" reaberto no sistema. Motivo: ${reopenReason.trim()}`
    );

    setSelectedItemForReopen(null);
    setReopenReason('');
    alert('Atividade reaberta com sucesso!');
  };

  // Delete Item Handler
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForDelete) return;

    if (!canManageCriticalActions) {
      alert('Somente usuários autorizados podem apagar prazos ou tarefas.');
      return;
    }

    const itemReason = deleteReason.trim() || 'Exclusão solicitada pelo usuário';

    if (onDeleteDeadline) {
      onDeleteDeadline(selectedItemForDelete.id, itemReason);
    } else if (onUpdateDeadline) {
      const updatedItem: Deadline = {
        ...selectedItemForDelete,
        status: 'Cancelado',
        cancellationReason: `EXCLUÍDO: ${itemReason}`,
        history: [
          {
            id: `log-${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            user: currentUser?.name || 'Membro do Sistema',
            actionType: 'Prazo/Tarefa Excluído',
            description: `Registro apagado do sistema por ${currentUser?.name || 'Membro do Sistema'}. Motivo: ${itemReason}`
          },
          ...(selectedItemForDelete.history || [])
        ]
      };
      onUpdateDeadline(updatedItem);
    }

    if (selectedItemForDelete.processCnj && selectedItemForDelete.processCnj !== 'Geral / Institucional') {
      const isPrazo = selectedItemForDelete.itemKind === 'prazo' || selectedItemForDelete.type === 'processual';
      logProcessHistory(
        selectedItemForDelete.processCnj,
        isPrazo ? 'Prazo Excluído' : 'Tarefa Excluída',
        `"${selectedItemForDelete.title || selectedItemForDelete.description}" foi apagado do sistema por ${currentUser?.name || 'Membro do Sistema'}. Motivo: ${itemReason}`
      );
    }

    setSelectedItemForDelete(null);
    setDeleteReason('');
    alert('Prazo / Tarefa apagado com sucesso! O registro foi arquivado na auditoria do sistema.');
  };

  // Inline Add Subtask Handler
  const handleConfirmAddLinkedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAddTask || !onUpdateDeadline) return;

    if (!inlineTaskTitle.trim()) {
      alert('Digite o título da tarefa vinculada.');
      return;
    }

    const newTask: LinkedTaskItem = {
      id: `task-${Date.now()}`,
      title: inlineTaskTitle.trim(),
      responsible: inlineTaskResp,
      dueDate: inlineTaskDate || selectedItemForAddTask.dueDate,
      status: 'A fazer'
    };

    const updatedTasks = [...(selectedItemForAddTask.linkedTasks || []), newTask];

    const updatedItem: Deadline = {
      ...selectedItemForAddTask,
      linkedTasks: updatedTasks
    };

    onUpdateDeadline(updatedItem);

    logProcessHistory(
      selectedItemForAddTask.processCnj,
      'Tarefa Vinculada Adicionada',
      `Tarefa "${inlineTaskTitle.trim()}" vinculada ao prazo "${selectedItemForAddTask.title || selectedItemForAddTask.description}". Responsável: ${inlineTaskResp}.`
    );

    setSelectedItemForAddTask(null);
    setInlineTaskTitle('');
    alert('Tarefa vinculada adicionada com sucesso!');
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0d2f43] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              NÚCLEO DE EXECUÇÃO
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Institucional PCG.OS</span>
          </div>
          <h1 className="font-extrabold text-2xl text-[#0d2f43] tracking-tight mt-1">
            Prazos e Tarefas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão unificada de obrigações processuais fatais, providências operacionais e checklists institucionais.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsNewDeadlineModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Gavel className="w-4 h-4 text-blue-300" />
            <span>Novo Prazo</span>
          </button>

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-blue-100" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS (CLICKABLE FILTERS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { key: 'prazos_hoje', label: 'Prazos de Hoje', count: metrics.prazosHoje, color: 'border-amber-200 bg-amber-50/50 text-amber-900', icon: <Clock className="w-4 h-4 text-amber-600" /> },
          { key: 'prazos_criticos', label: 'Prazos Críticos', count: metrics.prazosCriticos, color: 'border-orange-200 bg-orange-50/50 text-orange-900', icon: <AlertTriangle className="w-4 h-4 text-orange-600" /> },
          { key: 'prazos_vencidos', label: 'Prazos Vencidos', count: metrics.prazosVencidos, color: 'border-red-200 bg-red-50/60 text-red-900', icon: <AlertOctagon className="w-4 h-4 text-red-600" /> },
          { key: 'proximos_prazos', label: 'Próximos Prazos', count: metrics.proximosPrazos, color: 'border-blue-200 bg-blue-50/50 text-blue-900', icon: <Calendar className="w-4 h-4 text-blue-600" /> },
          { key: 'tarefas_pendentes', label: 'Tarefas Pendentes', count: metrics.tarefasPendentes, color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900', icon: <CheckSquare className="w-4 h-4 text-indigo-600" /> },
          { key: 'tarefas_atrasadas', label: 'Tarefas Atrasadas', count: metrics.tarefasAtrasadas, color: 'border-rose-200 bg-rose-50/50 text-rose-900', icon: <Clock className="w-4 h-4 text-rose-600" /> },
          { key: 'em_revisao', label: 'Em Revisão', count: metrics.emRevisao, color: 'border-purple-200 bg-purple-50/50 text-purple-900', icon: <Eye className="w-4 h-4 text-purple-600" /> },
          { key: 'concluidos', label: 'Concluídos no Período', count: metrics.concluidosPeriodo, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
        ].map((card) => (
          <button
            key={card.key}
            onClick={() => setMetricFilter(prev => prev === card.key ? 'todos' : card.key)}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${card.color} ${
              metricFilter === card.key ? 'ring-2 ring-[#0d2f43] shadow-md font-bold' : 'hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-tight">
                {card.label}
              </span>
              {card.icon}
            </div>
            <span className="text-xl font-black">{card.count}</span>
          </button>
        ))}
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-[#0d2f43] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Lista Detalhada</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week' ? 'bg-[#0d2f43] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Visão Semanal</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-[#0d2f43] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Visão Mensal</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por Título, CNJ, Cliente, Parte ou Responsável..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs border-t border-slate-100 pt-3">
          {/* Kind */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Tipo</label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="prazo">Somente Prazos</option>
              <option value="tarefa">Somente Tarefas</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Período</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
            >
              <option value="todos">Qualquer Data</option>
              <option value="hoje">Vencendo Hoje</option>
              <option value="vencidos">Vencidos</option>
              <option value="futuros">Próximos Dias</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
            >
              <option value="todos">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Em revisão">Em revisão</option>
              <option value="Cumprido">Cumprido / Concluído</option>
              <option value="Vencido">Vencido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Prioridade</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
            >
              <option value="todos">Todas Prioridades</option>
              <option value="Crítica">Crítica 🚨</option>
              <option value="Alta">Alta</option>
              <option value="Normal">Normal</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          {/* Responsible */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Responsável</label>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
            >
              <option value="todos">Todos Responsáveis</option>
              {activeUsersList.map(u => (
                <option key={u.id || u.name} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Área do Direito</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
            >
              <option value="todos">Todas as Áreas</option>
              <option value="Cível">Cível</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Tributário">Tributário</option>
              <option value="Família e Sucessões">Família e Sucessões</option>
              <option value="Empresarial">Empresarial</option>
              <option value="Consumidor">Consumidor</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {metricFilter !== 'todos' && (
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="font-bold text-[#0d2f43]">
              Filtro ativo por cartão: <span className="uppercase">{metricFilter.replace('_', ' ')}</span> ({filteredItems.length} registros)
            </span>
            <button onClick={() => setMetricFilter('todos')} className="text-blue-700 font-bold hover:underline text-xs">
              Limpar Filtro
            </button>
          </div>
        )}
      </div>

      {/* VIEW CONTENT STAGE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Tipo & Título</th>
                  <th className="p-4">Processo & Cliente</th>
                  <th className="p-4">Responsável</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Prioridade & Status</th>
                  <th className="p-4">Tempo Restante</th>
                  <th className="p-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhum prazo ou tarefa localizado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const timeRem = getTimeRemaining(item);
                    const isPrazo = item.itemKind === 'prazo' || item.type === 'processual';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Tipo & Título */}
                        <td className="p-4 max-w-xs">
                          <div className="flex items-start gap-2.5">
                            <span className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                              isPrazo ? 'bg-[#0d2f43] text-white' : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}>
                              {isPrazo ? 'Prazo' : 'Tarefa'}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                                {item.title || item.description}
                              </p>
                              {item.title && item.description && item.description !== item.title && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                              {item.parentDeadlineTitle && (
                                <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                                  ↳ Vinculado ao prazo: {item.parentDeadlineTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Processo & Cliente */}
                        <td className="p-4">
                          <div>
                            <p className="font-mono font-bold text-slate-800 text-[11px]">
                              {item.processCnj || 'Geral / Institucional'}
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium truncate">
                              {item.processClient || 'Escritório PCG'}
                            </p>
                            {item.area && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                {item.area}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Responsável */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{item.responsible}</p>
                              {item.participants && item.participants.length > 0 && (
                                <p className="text-[9px] text-slate-400">
                                  +{item.participants.length} participante(s)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Vencimento */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{item.dueDate}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{item.dueTime || '23:59'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Prioridade & Status */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            {/* Status Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              item.status === 'Cumprido' || item.status === 'Concluída' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              item.status === 'Vencido' ? 'bg-red-50 text-red-800 border-red-200' :
                              item.status === 'Cancelado' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                              item.status === 'Aguardando' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              item.status === 'Em revisão' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                              'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {item.status}
                              {item.waitingReason && ` (${item.waitingReason})`}
                            </span>

                            {/* Priority Badge */}
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              item.priority === 'Crítica' ? 'bg-red-100 text-red-900 font-black' :
                              item.priority === 'Alta' ? 'bg-orange-100 text-orange-900' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              Prioridade: {item.priority || 'Normal'}
                            </span>
                          </div>
                        </td>

                        {/* Tempo Restante */}
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${timeRem.color}`}>
                            {timeRem.label}
                          </span>
                        </td>

                        {/* Ações Rápidas */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedItemForDetail(item)}
                              title="Abrir Detalhes"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {item.status !== 'Cumprido' && item.status !== 'Concluída' && item.status !== 'Cancelado' && (
                              <button
                                onClick={() => setSelectedItemForConclude(item)}
                                title="Concluir / Cumprir"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 font-bold flex items-center gap-1 text-[10px]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Concluir</span>
                              </button>
                            )}

                            {item.status !== 'Cumprido' && item.status !== 'Concluída' && (
                              <button
                                onClick={() => {
                                  setSelectedItemForReschedule(item);
                                  setRescheduleDate(item.dueDate);
                                  setRescheduleTime(item.dueTime || '23:59');
                                }}
                                title="Reagendar Vencimento"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            {item.processCnj && item.processCnj !== 'Geral / Institucional' && onSelectProcess && (
                              <button
                                onClick={() => {
                                  const proc = processes.find(p => p.cnj === item.processCnj);
                                  if (proc) onSelectProcess(proc.id);
                                }}
                                title="Abrir Prontuário do Processo"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-[#0d2f43]"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedItemForHistory(item)}
                              title="Histórico e Auditoria"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedItemForDelete(item);
                                setDeleteReason('');
                              }}
                              title="Apagar Prazo ou Tarefa"
                              className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dayName, idx) => (
            <div key={dayName} className="bg-white rounded-xl border border-slate-200 p-3 min-h-[220px] flex flex-col">
              <div className="border-b border-slate-100 pb-2 mb-2 flex justify-between items-center">
                <span className="font-extrabold text-xs text-[#0d2f43]">{dayName}</span>
                <span className="text-[10px] font-bold text-slate-400">Dia {idx + 1}</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {filteredItems.slice(idx * 2, idx * 2 + 3).map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemForDetail(item)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left cursor-pointer transition-all"
                  >
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#0d2f43] text-white">
                      {item.itemKind === 'prazo' ? 'Prazo' : 'Tarefa'}
                    </span>
                    <p className="font-bold text-[11px] text-slate-900 mt-1 line-clamp-2">
                      {item.title || item.description}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{item.responsible}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-sm text-[#0d2f43]">Calendário Mensal de Atividades</h3>
            <span className="text-xs font-bold text-slate-500">Mês Atual</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => {
              const count = (dayNum % 4 === 0) ? 2 : (dayNum % 7 === 0) ? 1 : 0;
              return (
                <div key={dayNum} className="border border-slate-100 rounded-xl p-3 h-20 flex flex-col justify-between bg-slate-50/50">
                  <span className="font-bold text-xs text-slate-700">{dayNum}</span>
                  {count > 0 && (
                    <span className="text-[10px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full w-fit">
                      {count} atividades
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NOVO PRAZO MODAL */}
      {isNewDeadlineModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4 text-blue-300" />
                <span>Autuar Novo Prazo Processual / Fatal</span>
              </h3>
              <button onClick={() => setIsNewDeadlineModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePrazoSubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              {/* Process Selection Component (SEARCHABLE ONLY) */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-[#0d2f43] text-xs">
                    Vincular a Processo Cadastrado (Obrigatório) *
                  </label>
                  <span className="text-[10px] text-blue-800 font-semibold">Pesquisa por CNJ, Cliente ou Parte</span>
                </div>

                <input
                  type="text"
                  value={processSearchQuery}
                  onChange={(e) => setProcessSearchQuery(e.target.value)}
                  placeholder="Digite o CNJ, nome do cliente, CPF/CNPJ ou parte contrária..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/20"
                />

                <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {filteredProcessesForModal.map(proc => (
                    <div
                      key={proc.id}
                      onClick={() => setSelectedProcessForModal(proc)}
                      className={`p-2.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors ${
                        selectedProcessForModal?.id === proc.id ? 'bg-blue-100/80 font-bold border-l-4 border-l-[#0d2f43]' : ''
                      }`}
                    >
                      <div>
                        <p className="font-mono font-bold text-slate-900 text-xs">{proc.cnj}</p>
                        <p className="text-[10px] text-slate-600">{proc.client} ({proc.clientPolo}) vs {proc.opposingParty || 'Sem Parte'}</p>
                      </div>
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                        {proc.area}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedProcessForModal && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-xs">✓ Processo Selecionado: {selectedProcessForModal.cnj}</p>
                      <p className="text-[10px] opacity-80">Cliente: {selectedProcessForModal.client} | Resp: {selectedProcessForModal.responsible}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedProcessForModal(null)} className="text-emerald-800 hover:underline text-[10px]">
                      Trocar
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título do Prazo *</label>
                  <input
                    type="text"
                    required
                    value={prazoTitle}
                    onChange={(e) => setPrazoTitle(e.target.value)}
                    placeholder="Ex: Apresentar Contestação"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Prazo</label>
                  <select
                    value={prazoType}
                    onChange={(e) => setPrazoType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-semibold"
                  >
                    <option value="Processual">Processual Judicial</option>
                    <option value="Fatal">Fatal / Peremptório</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Extrajudicial">Extrajudicial</option>
                  </select>
                </div>
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={prazoStartDate}
                    onChange={(e) => setPrazoStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Limite *</label>
                  <input
                    type="date"
                    required
                    value={prazoDueDate}
                    onChange={(e) => setPrazoDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold text-red-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário Limite</label>
                  <input
                    type="time"
                    value={prazoDueTime}
                    onChange={(e) => setPrazoDueTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Responsible & Priority */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsável *</label>
                  <select
                    value={prazoResponsible}
                    onChange={(e) => setPrazoResponsible(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-bold"
                  >
                    {activeUsersList.map(u => (
                      <option key={u.id || u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={prazoPriority}
                    onChange={(e) => setPrazoPriority(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-bold text-red-700"
                  >
                    <option value="Crítica">Crítica 🚨</option>
                    <option value="Alta">Alta</option>
                    <option value="Normal">Normal</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alertas na Agenda</label>
                  <select
                    value={prazoAdvanceAlert}
                    onChange={(e) => setPrazoAdvanceAlert(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-semibold"
                  >
                    <option value="Horas antes">Horas antes</option>
                    <option value="1 dia antes">1 dia antes</option>
                    <option value="2 dias antes">2 dias antes</option>
                    <option value="5 dias antes">5 dias antes</option>
                  </select>
                </div>
              </div>

              {/* Preset Checklist Loader */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-slate-800 text-xs">Modelos de Checklist Processual</label>
                  <span className="text-[10px] text-slate-400">Clique para carregar etapas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(CHECKLIST_PRESETS).map(presetKey => (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => handleLoadPresetChecklist(presetKey)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition-all"
                    >
                      + {presetKey}
                    </button>
                  ))}
                </div>

                {prazoChecklist.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1">
                    {prazoChecklist.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-xs">{idx + 1}. {item.title}</span>
                        <button
                          type="button"
                          onClick={() => setPrazoChecklist(prev => prev.filter(c => c.id !== item.id))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações e Insttruções</label>
                <textarea
                  rows={2}
                  value={prazoNotes}
                  onChange={(e) => setPrazoNotes(e.target.value)}
                  placeholder="Orientações técnicas para a equipe..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewDeadlineModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0d2f43] hover:bg-[#0b2839] text-white font-bold rounded-lg shadow-sm"
                >
                  Autuar Prazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOVA TAREFA MODAL */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-100" />
                <span>Cadastrar Nova Tarefa Institucional</span>
              </h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTarefaSubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              {/* Optional Process Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Processo Relacionado (Opcional)</label>
                <select
                  value={tarefaProcess?.id || ''}
                  onChange={(e) => {
                    const found = processes.find(p => p.id === e.target.value);
                    setTarefaProcess(found || null);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-semibold"
                >
                  <option value="">-- Sem Processo Especificado (Institucional Geral) --</option>
                  {processes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.cnj} - {p.client}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  value={tarefaTitle}
                  onChange={(e) => setTarefaTitle(e.target.value)}
                  placeholder="Ex: Solicitar cópia de documentos ao cliente"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                />
              </div>

              {/* Dates & Responsible */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={tarefaDueDate}
                    onChange={(e) => setTarefaDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={tarefaDueTime}
                    onChange={(e) => setTarefaDueTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsável *</label>
                  <select
                    value={tarefaResponsible}
                    onChange={(e) => setTarefaResponsible(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-bold"
                  >
                    {activeUsersList.map(u => (
                      <option key={u.id || u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Inicial</label>
                  <select
                    value={tarefaStatus}
                    onChange={(e) => setTarefaStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-bold"
                  >
                    <option value="A fazer">A fazer</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Aguardando">Aguardando...</option>
                    <option value="Em revisão">Em revisão</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={tarefaPriority}
                    onChange={(e) => setTarefaPriority(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica 🚨</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {tarefaStatus === 'Aguardando' && (
                <div>
                  <label className="block font-bold text-amber-800 mb-1">Motivo do Aguardo</label>
                  <select
                    value={tarefaWaitingReason}
                    onChange={(e) => setTarefaWaitingReason(e.target.value as any)}
                    className="w-full border border-amber-300 bg-amber-50 rounded-lg px-3 py-2 outline-none font-bold"
                  >
                    <option value="Aguardando cliente">Aguardando cliente</option>
                    <option value="Aguardando documento">Aguardando documento</option>
                    <option value="Aguardando terceiro">Aguardando terceiro</option>
                    <option value="Aguardando revisão">Aguardando revisão</option>
                    <option value="Aguardando decisão">Aguardando decisão</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Cadastrar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  {selectedItemForDetail.itemKind === 'prazo' ? 'Prazo Processual' : 'Tarefa Institucional'}
                </span>
                <h3 className="font-extrabold text-sm truncate max-w-xs">
                  {selectedItemForDetail.title || selectedItemForDetail.description}
                </h3>
              </div>
              <button onClick={() => setSelectedItemForDetail(null)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Processo</p>
                  <p className="font-mono font-bold text-slate-900">{selectedItemForDetail.processCnj}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Cliente</p>
                  <p className="font-bold text-slate-900">{selectedItemForDetail.processClient}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Responsável</p>
                  <p className="font-bold text-slate-900">{selectedItemForDetail.responsible}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Vencimento</p>
                  <p className="font-bold text-red-700">{selectedItemForDetail.dueDate} às {selectedItemForDetail.dueTime || '23:59'}</p>
                </div>
              </div>

              {selectedItemForDetail.notes && (
                <div>
                  <p className="font-bold text-slate-700 mb-1">Observações:</p>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap">
                    {selectedItemForDetail.notes}
                  </p>
                </div>
              )}

              {/* History Log */}
              {selectedItemForDetail.history && selectedItemForDetail.history.length > 0 && (
                <div>
                  <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Auditoria e Histórico de Ações</span>
                  </p>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                    {selectedItemForDetail.history.map((log) => (
                      <div key={log.id} className="text-[11px] border-b border-slate-200 pb-1.5 last:border-none">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{log.user} ({log.actionType})</span>
                          <span className="text-slate-400 font-mono text-[10px]">{log.date} - {log.time}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{log.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const itemToDel = selectedItemForDetail;
                  setSelectedItemForDetail(null);
                  setSelectedItemForDelete(itemToDel);
                  setDeleteReason('');
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Apagar Registro</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="px-5 py-2 bg-[#0d2f43] text-white font-bold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONCLUSÃO MODAL */}
      {selectedItemForConclude && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Conclusão / Cumprimento</span>
              </h3>
              <button onClick={() => setSelectedItemForConclude(null)} className="hover:bg-white/10 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmConclude} className="p-6 flex flex-col gap-3 text-xs">
              <p className="font-bold text-slate-800">
                Item: &quot;{selectedItemForConclude.title || selectedItemForConclude.description}&quot;
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data do Protocolo/Ato</label>
                  <input
                    type="date"
                    value={concludeProtocolDate}
                    onChange={(e) => setConcludeProtocolDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número do Protocolo</label>
                  <input
                    type="text"
                    value={concludeProtocolNumber}
                    onChange={(e) => setConcludeProtocolNumber(e.target.value)}
                    placeholder="Ex: 1029384/2026"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link/Comprovante de Protocolo</label>
                <input
                  type="text"
                  value={concludeReceiptUrl}
                  onChange={(e) => setConcludeReceiptUrl(e.target.value)}
                  placeholder="Cole a URL do comprovante em nuvem ou drive..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações Finais de Cumprimento</label>
                <textarea
                  rows={2}
                  value={concludeFinalNotes}
                  onChange={(e) => setConcludeFinalNotes(e.target.value)}
                  placeholder="Detalhamento do cumprimento..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedItemForConclude(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirmar Cumprimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAGENDAMENTO MODAL */}
      {selectedItemForReschedule && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-300" />
                <span>Reagendar Data Limite de Vencimento</span>
              </h3>
              <button onClick={() => setSelectedItemForReschedule(null)} className="hover:bg-white/10 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="p-6 flex flex-col gap-3 text-xs">
              <p className="font-bold text-slate-800">
                Item: &quot;{selectedItemForReschedule.title || selectedItemForReschedule.description}&quot;
              </p>
              <p className="text-[11px] text-slate-500">
                Vencimento Atual: <span className="font-bold text-red-700">{selectedItemForReschedule.dueDate}</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nova Data Limite *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold text-red-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Novo Horário</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Justificativa do Reagendamento (Obrigatória) *</label>
                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Motivo formal para a alteração da data fatal..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedItemForReschedule(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0d2f43] hover:bg-[#0b2839] text-white font-bold rounded-lg shadow-sm"
                >
                  Salvar Nova Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTÓRICO MODAL */}
      {selectedItemForHistory && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-blue-300" />
                <span>Histórico Completo de Ações</span>
              </h3>
              <button onClick={() => setSelectedItemForHistory(null)} className="hover:bg-white/10 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-xs max-h-[70vh] overflow-y-auto flex flex-col gap-3">
              {(!selectedItemForHistory.history || selectedItemForHistory.history.length === 0) ? (
                <p className="text-slate-400 text-center py-4">Nenhum registro de alteração ainda.</p>
              ) : (
                selectedItemForHistory.history.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between font-extrabold text-slate-800">
                      <span>{log.user} ({log.actionType})</span>
                      <span className="font-mono text-[10px] text-slate-400">{log.date} - {log.time}</span>
                    </div>
                    <p className="text-slate-600">{log.description}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedItemForHistory(null)} className="px-5 py-2 bg-[#0d2f43] text-white font-bold rounded-lg text-xs">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO DE PRAZO / TAREFA */}
      {selectedItemForDelete && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Apagar Prazo ou Tarefa Cadastrada</span>
              </h3>
              <button onClick={() => setSelectedItemForDelete(null)} className="hover:bg-white/10 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-xs">Confirmação de Exclusão com Auditoria</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-rose-800">
                    Ao apagar este item, a ação e a justificativa fornecida serão gravadas permanentemente no log de auditoria do sistema e no prontuário do processo.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Item Selecionado:</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  &quot;{selectedItemForDelete.title || selectedItemForDelete.description}&quot;
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Processo: <strong className="font-mono text-slate-700">{selectedItemForDelete.processCnj || 'Geral / Institucional'}</strong> • Responsável: <strong className="text-slate-700">{selectedItemForDelete.responsible}</strong>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo da Exclusão / Justificativa *</label>
                <textarea
                  rows={3}
                  required
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Informe o motivo da exclusão ou cancelamento deste prazo/tarefa (ex: Cadastrado por engano, perda do objeto, acordo homologado...)"
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedItemForDelete(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
