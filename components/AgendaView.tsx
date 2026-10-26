/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Filter, Plus, ChevronLeft, ChevronRight, 
  MapPin, User, FileText, CheckCircle2, AlertTriangle, Search,
  Building2, Video, Users, Printer, RotateCcw, Edit3, Trash2, 
  ExternalLink, Copy, Lock, Bell, Layers, Briefcase, ShieldAlert, 
  Tag, MoreVertical, Check, MessageSquare, CalendarRange, List, 
  Grid, Columns, AlertCircle, Eye, RefreshCw, X, Link2, FileCheck,
  CheckSquare, ArrowUpRight, ChevronDown, CheckCircle, Info
} from 'lucide-react';
import { CalendarEvent, Process, Deadline, CrmLead } from '@/lib/mockData';

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  completed: boolean;
  createdBy: string;
  createdAt: string;
  isPersonal: true;
}

interface AgendaViewProps {
  events: CalendarEvent[];
  deadlines?: Deadline[];
  processes?: Process[];
  crmLeads?: CrmLead[];
  users?: any[];
  currentUser?: any;
  onAddEvent: (evt: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent?: (evt: CalendarEvent) => void;
  onDeleteEvent?: (id: string, reason?: string) => void;
  onDeleteDeadline?: (id: string, reason?: string) => void;
  onUpdateProcess?: (updatedProc: any) => void;
  onUpdateCrmLead?: (updatedLead: any) => void;
  onSelectProcess?: (id: string) => void;
  onSelectClient?: (id: string) => void;
  onNavigateTab?: (tab: string, filters?: any) => void;
  initialFilters?: any;
}

export const EVENT_TYPES_MAP: Record<string, { label: string; color: string; bg: string }> = {
  audiencia: { label: 'Audiência', color: 'text-amber-800 border-amber-300', bg: 'bg-amber-50' },
  reuniao: { label: 'Reunião', color: 'text-blue-800 border-blue-300', bg: 'bg-blue-50' },
  atendimento: { label: 'Atendimento', color: 'text-indigo-800 border-indigo-300', bg: 'bg-indigo-50' },
  pericia: { label: 'Perícia', color: 'text-purple-800 border-purple-300', bg: 'bg-purple-50' },
  diligencia: { label: 'Diligência', color: 'text-cyan-800 border-cyan-300', bg: 'bg-cyan-50' },
  conciliacao: { label: 'Conciliação', color: 'text-teal-800 border-teal-300', bg: 'bg-teal-50' },
  mediacao: { label: 'Mediação', color: 'text-emerald-800 border-emerald-300', bg: 'bg-emerald-50' },
  sustentacao_oral: { label: 'Sustentação oral', color: 'text-rose-800 border-rose-300', bg: 'bg-rose-50' },
  sessao_julgamento: { label: 'Sessão de julgamento', color: 'text-red-800 border-red-300', bg: 'bg-red-50' },
  videoconferencia: { label: 'Videoconferência', color: 'text-sky-800 border-sky-300', bg: 'bg-sky-50' },
  visita_escritorio: { label: 'Visita ao escritório', color: 'text-emerald-800 border-emerald-300', bg: 'bg-emerald-50' },
  visita_tecnica: { label: 'Visita técnica', color: 'text-orange-800 border-orange-300', bg: 'bg-orange-50' },
  protocolo_presencial: { label: 'Protocolo presencial', color: 'text-yellow-800 border-yellow-300', bg: 'bg-yellow-50' },
  compromisso_administrativo: { label: 'Compromisso administrativo', color: 'text-slate-800 border-slate-300', bg: 'bg-slate-100' },
  treinamento: { label: 'Treinamento', color: 'text-violet-800 border-violet-300', bg: 'bg-violet-50' },
  deslocamento: { label: 'Deslocamento', color: 'text-zinc-800 border-zinc-300', bg: 'bg-zinc-100' },
  ferias: { label: 'Férias', color: 'text-pink-800 border-pink-300', bg: 'bg-pink-50' },
  bloqueio_agenda: { label: 'Bloqueio de agenda', color: 'text-gray-800 border-gray-400', bg: 'bg-gray-200' },
  outro: { label: 'Outro', color: 'text-slate-700 border-slate-300', bg: 'bg-slate-50' },
  prazo: { label: 'Prazo Processual', color: 'text-red-900 border-red-400 font-semibold', bg: 'bg-red-100' },
  tarefa: { label: 'Tarefa', color: 'text-indigo-900 border-indigo-300', bg: 'bg-indigo-100' },
};

export const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  'Agendado': { label: 'Agendado', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Aguardando confirmação': { label: 'Aguardando confirmação', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Confirmado': { label: 'Confirmado', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Em andamento': { label: 'Em andamento', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  'Realizado': { label: 'Realizado', badgeClass: 'bg-green-100 text-green-800 border-green-200' },
  'Remarcado': { label: 'Remarcado', badgeClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Cancelado': { label: 'Cancelado', badgeClass: 'bg-slate-100 text-slate-500 border-slate-300 line-through' },
  'Não compareceu': { label: 'Não compareceu', badgeClass: 'bg-red-100 text-red-800 border-red-200' },
};

export const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  'Baixa': { label: 'Baixa', color: 'text-slate-600 bg-slate-100 border-slate-200' },
  'Normal': { label: 'Normal', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  'Alta': { label: 'Alta', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  'Crítica': { label: 'Crítica', color: 'text-red-700 bg-red-50 border-red-200 font-bold' },
};

export default function AgendaView({
  events,
  deadlines = [],
  processes = [],
  crmLeads = [],
  users,
  currentUser = { id: 'u1', name: 'Dr. Ricardo Camargo', username: 'ricardo', email: 'ricardo@pcgos.com', role: 'Sócio Gestor' },
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onDeleteDeadline,
  onUpdateProcess,
  onUpdateCrmLead,
  onSelectProcess,
  onSelectClient,
  onNavigateTab,
  initialFilters
}: AgendaViewProps) {
  // Compute active real system users
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
  // View mode state
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes' | 'lista'>('mes');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Calendar Date for month view navigation
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  // Personal tasks loaded from localStorage (private per user)
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);

  useEffect(() => {
    try {
      const userKey = currentUser?.id ? `pcgos_personal_tasks_${currentUser.id}` : 'pcgos_personal_tasks';
      const stored = localStorage.getItem(userKey) || localStorage.getItem('pcgos_personal_tasks');
      if (stored) {
        setPersonalTasks(JSON.parse(stored));
      } else {
        setPersonalTasks([]);
      }
    } catch {
      // ignore
    }
  }, [currentUser?.id]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterResponsible, setFilterResponsible] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todos');
  const [filterModality, setFilterModality] = useState<string>('todos');
  const [filterTeam, setFilterTeam] = useState<string>('todos');
  const [filterArea, setFilterArea] = useState<string>('todos');
  const [includeCanceled, setIncludeCanceled] = useState<boolean>(false);
  const [includeDeadlines, setIncludeDeadlines] = useState<boolean>(true);
  const [includeTasks, setIncludeTasks] = useState<boolean>(true);

  // Modal States
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<any | null>(null);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<any | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form State for New / Edit Event
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<string>('audiencia');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formStart, setFormStart] = useState('10:00');
  const [formEnd, setFormEnd] = useState('11:00');
  const [formIsAllDay, setFormIsAllDay] = useState(false);
  const [formResponsible, setFormResponsible] = useState(currentUser?.name || 'Dr. Ricardo Camargo');
  const [formParticipants, setFormParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [formTeam, setFormTeam] = useState('Geral');
  
  // Linked Client & Process Search state inside Form
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<CrmLead | null>(null);
  const [processSearch, setProcessSearch] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [availableClientProcesses, setAvailableClientProcesses] = useState<Process[]>([]);

  const [formLocation, setFormLocation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formModality, setFormModality] = useState<'presencial' | 'virtual' | 'hibrida'>('presencial');
  const [formVirtualLink, setFormVirtualLink] = useState('');
  const [formPriority, setFormPriority] = useState<string>('Normal');
  const [formStatus, setFormStatus] = useState<string>('Agendado');
  const [formAlerts, setFormAlerts] = useState<string[]>(['1 dia antes', '1 hora antes']);
  const [formRecurrence, setFormRecurrence] = useState<string>('Nenhuma');
  const [formNotes, setFormNotes] = useState('');
  const [formAttachments, setFormAttachments] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);

  // Conflict state
  const [conflictingEventInfo, setConflictingEventInfo] = useState<any | null>(null);
  const [pendingFormSubmitData, setPendingFormSubmitData] = useState<any | null>(null);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel state
  const [cancelReason, setCancelReason] = useState('');

  // Add Note state
  const [newNoteText, setNewNoteText] = useState('');

  // Reset or initialize form
  const handleOpenNewModal = (prefillDate?: string) => {
    setFormId(null);
    setFormTitle('');
    setFormType('audiencia');
    setFormDescription('');
    setFormDate(prefillDate || selectedDate || new Date().toISOString().split('T')[0]);
    setFormStart('10:00');
    setFormEnd('11:00');
    setFormIsAllDay(false);
    setFormResponsible(currentUser?.name || 'Dr. Ricardo Camargo');
    setFormParticipants([]);
    setParticipantInput('');
    setFormTeam('Geral');
    setClientSearch('');
    setSelectedClient(null);
    setProcessSearch('');
    setSelectedProcess(null);
    setAvailableClientProcesses([]);
    setFormLocation('');
    setFormAddress('');
    setFormModality('presencial');
    setFormVirtualLink('');
    setFormPriority('Normal');
    setFormStatus('Agendado');
    setFormAlerts(['1 dia antes', '1 hora antes']);
    setFormRecurrence('Nenhuma');
    setFormNotes('');
    setFormAttachments([]);
    setIsNewEventModalOpen(true);
  };

  const handleOpenEditModal = (evt: CalendarEvent) => {
    setFormId(evt.id);
    setFormTitle(evt.title);
    setFormType(evt.type);
    setFormDescription(evt.description || '');
    setFormDate(evt.date);
    setFormStart(evt.start);
    setFormEnd(evt.end);
    setFormIsAllDay(!!evt.isAllDay);
    setFormResponsible(evt.responsible);
    setFormParticipants(evt.participants || []);
    setFormTeam(evt.team || 'Geral');
    
    // Find client
    if (evt.clientName) {
      const matchClient = crmLeads.find(c => c.name === evt.clientName || c.id === evt.clientId);
      if (matchClient) setSelectedClient(matchClient);
      setClientSearch(evt.clientName);
    } else {
      setSelectedClient(null);
      setClientSearch('');
    }

    // Find process
    if (evt.processId || (evt.process && evt.process !== 'Geral')) {
      const matchProc = processes.find(p => p.id === evt.processId || p.cnj === evt.process);
      if (matchProc) setSelectedProcess(matchProc);
      setProcessSearch(evt.process);
    } else {
      setSelectedProcess(null);
      setProcessSearch('');
    }

    setFormLocation(evt.location || '');
    setFormAddress(evt.address || '');
    setFormModality((evt.modality as any) || 'presencial');
    setFormVirtualLink(evt.virtualLink || '');
    setFormPriority(evt.priority || 'Normal');
    setFormStatus(evt.status || 'Agendado');
    setFormAlerts(Array.isArray(evt.advanceAlert) ? evt.advanceAlert : evt.advanceAlert ? [evt.advanceAlert] : ['1 dia antes']);
    setFormRecurrence(evt.recurrence || 'Nenhuma');
    setFormNotes(evt.notes || '');
    setFormAttachments(evt.attachments || []);
    setIsNewEventModalOpen(true);
  };

  // Client selection handler
  const handleSelectClientInForm = (client: CrmLead) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    // Find active processes linked to this client
    const linked = processes.filter(p => p.client === client.name || p.clientId === client.id);
    setAvailableClientProcesses(linked);
    if (!selectedProcess && linked.length === 1) {
      handleSelectProcessInForm(linked[0]);
    }
  };

  // Process selection handler
  const handleSelectProcessInForm = (proc: Process) => {
    setSelectedProcess(proc);
    setProcessSearch(proc.cnj);
    setFormTeam(proc.team || 'Geral');
    setFormResponsible(proc.responsible || currentUser?.name || 'Dr. Ricardo Camargo');
    
    // Auto fill client if present
    if (proc.client) {
      const clientMatch = crmLeads.find(c => c.name === proc.client || c.id === proc.clientId);
      if (clientMatch) setSelectedClient(clientMatch);
      setClientSearch(proc.client);
    }
  };

  // Conflict checking function
  const checkForConflicts = (date: string, start: string, end: string, resp: string, participants: string[], ignoreId?: string | null) => {
    return events.find(e => {
      if (e.id === ignoreId) return false;
      if (e.date !== date) return false;
      if (e.status === 'Cancelado') return false;

      // Check time overlap
      const startA = start;
      const endA = end;
      const startB = e.start;
      const endB = e.end;

      const overlap = (startA < endB) && (endA > startB);
      if (!overlap) return false;

      // Check responsible or participant collision
      const respMatches = e.responsible === resp || e.participants?.includes(resp);
      const participantMatches = participants.some(p => p === e.responsible || e.participants?.includes(p));

      return respMatches || participantMatches;
    });
  };

  // Save Event submit
  const handleSaveEventSubmit = (e?: React.FormEvent, forceProceed = false) => {
    if (e) e.preventDefault();
    if (!formTitle.trim()) {
      alert('Por favor, informe o título do compromisso.');
      return;
    }

    const payload: Omit<CalendarEvent, 'id'> = {
      title: formTitle.trim(),
      type: formType,
      description: formDescription,
      date: formDate,
      start: formStart,
      end: formEnd,
      isAllDay: formIsAllDay,
      responsible: formResponsible,
      participants: formParticipants,
      team: formTeam,
      clientId: selectedClient?.id,
      clientName: selectedClient?.name || clientSearch || undefined,
      clientCpfCnpj: selectedClient?.cpfCnpj || undefined,
      processId: selectedProcess?.id,
      process: selectedProcess?.cnj || processSearch || 'Geral',
      opposingParty: selectedProcess?.opposingParty || undefined,
      area: selectedProcess?.area || undefined,
      location: formLocation,
      address: formAddress,
      modality: formModality,
      virtualLink: formVirtualLink,
      priority: formPriority,
      status: formStatus,
      advanceAlert: formAlerts,
      recurrence: formRecurrence,
      notes: formNotes,
      attachments: formAttachments,
      createdBy: currentUser?.name || 'Dr. Ricardo Camargo',
      createdAtDate: new Date().toLocaleDateString('pt-BR'),
      createdAtTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    if (!forceProceed) {
      const conflict = checkForConflicts(formDate, formStart, formEnd, formResponsible, formParticipants, formId);
      if (conflict) {
        setConflictingEventInfo(conflict);
        setPendingFormSubmitData(payload);
        setIsConflictModalOpen(true);
        return;
      }
    }

    // Process save
    const nowStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (formId) {
      // Editing existing event
      const existing = events.find(ev => ev.id === formId);
      if (existing && onUpdateEvent) {
        const updatedEvt: CalendarEvent = {
          ...existing,
          ...payload,
          id: formId,
          updatedBy: currentUser?.name,
          updatedAtDate: nowStr,
          updatedAtTime: timeStr,
          history: [
            ...(existing.history || []),
            {
              id: `log-${Date.now()}`,
              date: nowStr,
              time: timeStr,
              user: currentUser?.name || 'Sistema',
              actionType: 'Alteração',
              description: `${currentUser?.name} alterou as informações do compromisso "${formTitle}".`,
            }
          ]
        };
        onUpdateEvent(updatedEvt);
      }
    } else {
      // Creating new event
      onAddEvent(payload);
    }

    // Auto record in Process History
    if (selectedProcess && onUpdateProcess) {
      const actionLabel = formId ? 'alterou compromisso' : 'cadastrou compromisso';
      const typeLabel = EVENT_TYPES_MAP[formType]?.label || formType;
      const historyEntry = {
        id: `h-${Date.now()}`,
        date: nowStr,
        time: timeStr,
        type: 'Agenda',
        title: `${typeLabel} - ${formTitle}`,
        description: `${currentUser?.name} ${actionLabel} (${typeLabel}): "${formTitle}" para ${formDate} às ${formStart}.`,
        user: currentUser?.name || 'Sistema'
      };

      const updatedProc = {
        ...selectedProcess,
        history: [historyEntry, ...(selectedProcess.history || [])]
      };
      onUpdateProcess(updatedProc);
    }

    // Auto record in Client CRM History
    if (selectedClient && !selectedProcess && onUpdateCrmLead) {
      const typeLabel = EVENT_TYPES_MAP[formType]?.label || formType;
      const noteEntry = `[Agenda] ${currentUser?.name} agendou ${typeLabel}: "${formTitle}" para ${formDate} às ${formStart}.`;
      const updatedLead = {
        ...selectedClient,
        notes: selectedClient.notes ? `${selectedClient.notes}\n${noteEntry}` : noteEntry
      };
      onUpdateCrmLead(updatedLead);
    }

    setIsNewEventModalOpen(false);
    setIsConflictModalOpen(false);
    setSelectedDate(formDate);
  };

  // Handle Reschedule
  const handleConfirmReschedule = () => {
    if (!selectedEventForDetail || !rescheduleDate || !rescheduleReason.trim()) {
      alert('Por favor, informe a nova data e o motivo da remarcação.');
      return;
    }

    const nowStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const prevDate = selectedEventForDetail.date;
    const prevStart = selectedEventForDetail.start;
    const prevEnd = selectedEventForDetail.end;

    const updatedEvt: CalendarEvent = {
      ...selectedEventForDetail,
      date: rescheduleDate,
      start: rescheduleStart || selectedEventForDetail.start,
      end: rescheduleEnd || selectedEventForDetail.end,
      status: 'Remarcado',
      rescheduleReason: rescheduleReason.trim(),
      updatedBy: currentUser?.name,
      updatedAtDate: nowStr,
      updatedAtTime: timeStr,
      history: [
        ...(selectedEventForDetail.history || []),
        {
          id: `log-${Date.now()}`,
          date: nowStr,
          time: timeStr,
          user: currentUser?.name || 'Sistema',
          actionType: 'Remarcação',
          description: `${currentUser?.name} remarcou de ${prevDate} (${prevStart}) para ${rescheduleDate} (${rescheduleStart || prevStart}). Motivo: ${rescheduleReason.trim()}`,
          previousValue: `${prevDate} ${prevStart}-${prevEnd}`,
          newValue: `${rescheduleDate} ${rescheduleStart || prevStart}-${rescheduleEnd || prevEnd}`
        }
      ]
    };

    if (onUpdateEvent) onUpdateEvent(updatedEvt);

    // Update Process History
    if (selectedEventForDetail.processId && onUpdateProcess) {
      const proc = processes.find(p => p.id === selectedEventForDetail.processId);
      if (proc) {
        const historyEntry = {
          id: `h-${Date.now()}`,
          date: nowStr,
          time: timeStr,
          type: 'Agenda',
          title: `Remarcação - ${selectedEventForDetail.title}`,
          description: `${currentUser?.name} remarcou o compromisso "${selectedEventForDetail.title}" para ${rescheduleDate} às ${rescheduleStart || prevStart}. Motivo: ${rescheduleReason.trim()}`,
          user: currentUser?.name || 'Sistema'
        };
        onUpdateProcess({ ...proc, history: [historyEntry, ...(proc.history || [])] });
      }
    }

    setIsRescheduleModalOpen(false);
    setSelectedEventForDetail(updatedEvt);
  };

  // Handle Cancel Event
  const handleConfirmCancel = () => {
    if (!selectedEventForDetail || !cancelReason.trim()) {
      alert('Por favor, informe a justificativa de cancelamento.');
      return;
    }

    const nowStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updatedEvt: CalendarEvent = {
      ...selectedEventForDetail,
      status: 'Cancelado',
      cancelReason: cancelReason.trim(),
      updatedBy: currentUser?.name,
      updatedAtDate: nowStr,
      updatedAtTime: timeStr,
      history: [
        ...(selectedEventForDetail.history || []),
        {
          id: `log-${Date.now()}`,
          date: nowStr,
          time: timeStr,
          user: currentUser?.name || 'Sistema',
          actionType: 'Cancelamento',
          description: `${currentUser?.name} cancelou o compromisso. Motivo: ${cancelReason.trim()}`,
        }
      ]
    };

    if (onUpdateEvent) onUpdateEvent(updatedEvt);

    // Update Process History
    if (selectedEventForDetail.processId && onUpdateProcess) {
      const proc = processes.find(p => p.id === selectedEventForDetail.processId);
      if (proc) {
        const historyEntry = {
          id: `h-${Date.now()}`,
          date: nowStr,
          time: timeStr,
          type: 'Agenda',
          title: `Cancelamento - ${selectedEventForDetail.title}`,
          description: `${currentUser?.name} cancelou o compromisso "${selectedEventForDetail.title}". Motivo: ${cancelReason.trim()}`,
          user: currentUser?.name || 'Sistema'
        };
        onUpdateProcess({ ...proc, history: [historyEntry, ...(proc.history || [])] });
      }
    }

    setIsCancelModalOpen(false);
    setSelectedEventForDetail(updatedEvt);
  };

  // Handle Delete Event / Deadline / Personal Task from Agenda
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForDelete) return;

    const itemReason = deleteReason.trim() || 'Exclusão solicitada pelo usuário na agenda';

    // 1. Personal Task
    if (selectedItemForDelete.isPersonal) {
      const updatedPersonal = personalTasks.filter(pt => pt.id !== selectedItemForDelete.id);
      setPersonalTasks(updatedPersonal);
      try {
        const userKey = currentUser?.id ? `pcgos_personal_tasks_${currentUser.id}` : 'pcgos_personal_tasks';
        localStorage.setItem(userKey, JSON.stringify(updatedPersonal));
      } catch {
        // ignore
      }
      alert('Tarefa pessoal excluída da agenda!');
    }
    // 2. Deadline / Task from Prazos module
    else if (selectedItemForDelete.isDeadlineItem) {
      const deadlineId = selectedItemForDelete.deadlineRef?.id || String(selectedItemForDelete.id).replace('dl-', '');
      if (onDeleteDeadline) {
        onDeleteDeadline(deadlineId, itemReason);
      } else if (onUpdateProcess && selectedItemForDelete.processId) {
        const proc = processes.find(p => p.id === selectedItemForDelete.processId);
        if (proc) {
          const updatedItems = (proc.deadlinesAndTasks || []).filter(d => d.id !== deadlineId);
          onUpdateProcess({ ...proc, deadlinesAndTasks: updatedItems });
        }
      }
      alert('Prazo/Tarefa excluído com sucesso!');
    }
    // 3. Standard Calendar Event
    else {
      if (onDeleteEvent) {
        onDeleteEvent(selectedItemForDelete.id, itemReason);
      }
      alert('Compromisso da agenda excluído com sucesso!');
    }

    setSelectedItemForDelete(null);
    setDeleteReason('');
    setSelectedEventForDetail(null);
  };

  // Quick Status Change (Confirm, Mark Realized)
  const handleQuickStatusChange = (evt: CalendarEvent, newStatus: string) => {
    const nowStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updatedEvt: CalendarEvent = {
      ...evt,
      status: newStatus,
      updatedBy: currentUser?.name,
      updatedAtDate: nowStr,
      updatedAtTime: timeStr,
      history: [
        ...(evt.history || []),
        {
          id: `log-${Date.now()}`,
          date: nowStr,
          time: timeStr,
          user: currentUser?.name || 'Sistema',
          actionType: 'Status',
          description: `${currentUser?.name} alterou o status do compromisso de "${evt.status || 'Agendado'}" para "${newStatus}".`,
          previousValue: evt.status || 'Agendado',
          newValue: newStatus
        }
      ]
    };

    if (onUpdateEvent) onUpdateEvent(updatedEvt);
    if (selectedEventForDetail?.id === evt.id) setSelectedEventForDetail(updatedEvt);
  };

  // Add Note to Event
  const handleAddNoteToEvent = () => {
    if (!selectedEventForDetail || !newNoteText.trim()) return;

    const nowStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updatedNotes = selectedEventForDetail.notes 
      ? `${selectedEventForDetail.notes}\n[${nowStr} ${timeStr} - ${currentUser?.name}]: ${newNoteText.trim()}`
      : `[${nowStr} ${timeStr} - ${currentUser?.name}]: ${newNoteText.trim()}`;

    const updatedEvt: CalendarEvent = {
      ...selectedEventForDetail,
      notes: updatedNotes,
      updatedBy: currentUser?.name,
      updatedAtDate: nowStr,
      updatedAtTime: timeStr
    };

    if (onUpdateEvent) onUpdateEvent(updatedEvt);
    setSelectedEventForDetail(updatedEvt);
    setNewNoteText('');
    setIsNoteModalOpen(false);
  };

  // Combine Events + Deadlines + Personal Tasks into unified dataset
  const unifiedCalendarItems = useMemo(() => {
    const items: any[] = [];

    // 1. Calendar Events
    events.forEach(evt => {
      // Privacy check: confidential or personal
      if (evt.isPrivate && evt.createdBy !== currentUser?.name && currentUser?.role !== 'Administrador') {
        items.push({
          ...evt,
          title: 'Horário Ocupado (Compromisso Reservado)',
          isConfidentialMask: true,
          clientName: undefined,
          process: 'Múltiplos / Sigiloso',
          description: undefined,
          notes: undefined,
        });
      } else {
        items.push(evt);
      }
    });

    // 2. Deadlines and Tasks from "Prazos e Tarefas" module
    if (includeDeadlines) {
      deadlines.forEach(dl => {
        if (!dl.dueDate) return;
        const isCompleted = dl.status === 'Cumprido' || dl.status === 'Concluída';
        const isCanceled = dl.status === 'Cancelado';

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        let alertBadge = '';
        if (!isCompleted && !isCanceled) {
          if (dl.dueDate === todayStr) {
            alertBadge = 'Prazo crítico — vencimento hoje';
          } else if (dl.dueDate < todayStr) {
            alertBadge = 'Prazo vencido';
          } else {
            const parseDateLocal = (s: string) => {
              if (s.includes('/')) {
                const p = s.split('/');
                if (p.length === 3) return new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
              } else if (s.includes('-')) {
                const p = s.split('T')[0].split('-');
                if (p.length === 3) return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
              }
              return new Date(s);
            };
            const dueObj = parseDateLocal(dl.dueDate);
            const todayObj = parseDateLocal(todayStr);
            const diffDays = Math.round((dueObj.getTime() - todayObj.getTime()) / (1000 * 3600 * 24));
            if (diffDays <= 5) {
              alertBadge = `Prazo vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
            }
          }
        }

        items.push({
          id: `dl-${dl.id}`,
          title: dl.title || dl.description,
          type: dl.itemKind === 'tarefa' ? 'tarefa' : 'prazo',
          description: dl.description,
          date: dl.dueDate,
          start: dl.dueTime || '18:00',
          end: dl.dueTime || '18:00',
          responsible: dl.responsible,
          process: dl.processCnj,
          processId: dl.processId,
          clientName: dl.processClient,
          status: isCompleted ? 'Realizado' : isCanceled ? 'Cancelado' : 'Agendado',
          priority: dl.priority || 'Normal',
          isDeadlineItem: true,
          deadlineRef: dl,
          deadlineAlertBadge: alertBadge,
          area: dl.area,
        });
      });
    }

    // 3. Personal Tasks created in Painel Operacional
    if (includeTasks) {
      personalTasks.forEach(pt => {
        // Visible only to creator
        if (pt.createdBy === currentUser?.name || pt.createdBy === currentUser?.username) {
          items.push({
            id: pt.id,
            title: pt.title,
            type: 'tarefa',
            description: pt.description,
            date: pt.date,
            start: pt.time || '09:00',
            end: pt.time || '10:00',
            responsible: pt.createdBy,
            status: pt.completed ? 'Realizado' : 'Agendado',
            priority: pt.priority === 'Alta' ? 'Alta' : pt.priority === 'Baixa' ? 'Baixa' : 'Normal',
            isPersonalTask: true,
            isPrivate: true,
          });
        }
      });
    }

    return items;
  }, [events, deadlines, personalTasks, includeDeadlines, includeTasks, currentUser]);

  // Filtered list of calendar items
  const filteredCalendarItems = useMemo(() => {
    return unifiedCalendarItems.filter(item => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesClient = item.clientName?.toLowerCase().includes(q);
        const matchesProcess = item.process?.toLowerCase().includes(q);
        const matchesOpposing = item.opposingParty?.toLowerCase().includes(q);
        const matchesResp = item.responsible?.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesClient && !matchesProcess && !matchesOpposing && !matchesResp && !matchesLoc) {
          return false;
        }
      }

      // Canceled filter
      if (!includeCanceled && item.status === 'Cancelado') return false;

      // Type filter
      if (filterType !== 'todos' && item.type !== filterType) return false;

      // Responsible filter
      if (filterResponsible !== 'todos' && item.responsible !== filterResponsible) return false;

      // Status filter
      if (filterStatus !== 'todos' && item.status !== filterStatus) return false;

      // Priority filter
      if (filterPriority !== 'todos' && item.priority !== filterPriority) return false;

      // Modality filter
      if (filterModality !== 'todos' && item.modality !== filterModality) return false;

      // Team filter
      if (filterTeam !== 'todos' && item.team !== filterTeam) return false;

      // Area filter
      if (filterArea !== 'todos' && item.area !== filterArea) return false;

      return true;
    });
  }, [unifiedCalendarItems, searchQuery, includeCanceled, filterType, filterResponsible, filterStatus, filterPriority, filterModality, filterTeam, filterArea]);

  // Calendar calculations for Month View
  const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentYear = calendarMonth.getFullYear();
  const currentMonthIndex = calendarMonth.getMonth();
  const monthName = MONTH_NAMES[currentMonthIndex];

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const startWeekday = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun, 1 = Mon...
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySpots = Array.from({ length: startWeekday });

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Week calculation for Week View
  const getWeekDays = (baseDateStr: string) => {
    const base = new Date(baseDateStr);
    const dayOfWeek = base.getDay();
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Unique lists for filters
  const uniqueResponsibles = useMemo(() => {
    const set = new Set<string>();
    activeUsersList.forEach(u => set.add(u.name));
    unifiedCalendarItems.forEach(i => { if (i.responsible) set.add(i.responsible); });
    return Array.from(set);
  }, [activeUsersList, unifiedCalendarItems]);

  const uniqueTeams = useMemo(() => {
    const set = new Set<string>();
    unifiedCalendarItems.forEach(i => { if (i.team) set.add(i.team); });
    return Array.from(set);
  }, [unifiedCalendarItems]);

  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    unifiedCalendarItems.forEach(i => { if (i.area) set.add(i.area); });
    return Array.from(set);
  }, [unifiedCalendarItems]);

  // Statistics for reports
  const reportStats = useMemo(() => {
    const stats = {
      audiencia: 0,
      reuniao: 0,
      atendimento: 0,
      pericia: 0,
      diligencia: 0,
      sustentacao: 0,
      realizados: 0,
      cancelados: 0,
      totalActive: 0
    };
    filteredCalendarItems.forEach(i => {
      if (i.status === 'Cancelado') stats.cancelados++;
      else stats.totalActive++;

      if (i.status === 'Realizado') stats.realizados++;
      if (i.type === 'audiencia') stats.audiencia++;
      if (i.type === 'reuniao') stats.reuniao++;
      if (i.type === 'atendimento') stats.atendimento++;
      if (i.type === 'pericia') stats.pericia++;
      if (i.type === 'diligencia') stats.diligencia++;
      if (i.type === 'sustentacao_oral') stats.sustentacao++;
    });
    return stats;
  }, [filteredCalendarItems]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Printable CSS style rule */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-agenda-section, #printable-agenda-section * {
            visibility: visible;
          }
          #printable-agenda-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#0d2f43] tracking-tight">Agenda Integrada</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              PCG.OS Central
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Central de compromissos do escritório com integração automática a CRM, Processos, Prazos e Painel Operacional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir Agenda</span>
          </button>

          <button
            onClick={() => handleOpenNewModal()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0d2f43] hover:bg-[#16435f] rounded-lg shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Report Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Audiências</span>
          <span className="text-lg font-bold text-[#0d2f43]">{reportStats.audiencia}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Reuniões</span>
          <span className="text-lg font-bold text-blue-700">{reportStats.reuniao}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Atendimentos</span>
          <span className="text-lg font-bold text-indigo-700">{reportStats.atendimento}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Perícias</span>
          <span className="text-lg font-bold text-purple-700">{reportStats.pericia}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Diligências</span>
          <span className="text-lg font-bold text-cyan-700">{reportStats.diligencia}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Sustentações</span>
          <span className="text-lg font-bold text-rose-700">{reportStats.sustentacao}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Realizados</span>
          <span className="text-lg font-bold text-emerald-700">{reportStats.realizados}</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <span className="text-xs font-medium text-slate-500">Cancelados</span>
          <span className="text-lg font-bold text-slate-400">{reportStats.cancelados}</span>
        </div>
      </div>

      {/* Control Bar: Views Selector + Search & Main Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setViewMode('dia')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'dia' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Dia</span>
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'semana' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>
            <button
              onClick={() => setViewMode('mes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'mes' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mês</span>
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'lista' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título, cliente, processo, parte, responsável ou local..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Date Picker for quick navigation */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Data Base:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtros:</span>
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todos os Tipos</option>
            {Object.keys(EVENT_TYPES_MAP).map(key => (
              <option key={key} value={key}>{EVENT_TYPES_MAP[key].label}</option>
            ))}
          </select>

          {/* Filter Responsible */}
          <select
            value={filterResponsible}
            onChange={e => setFilterResponsible(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todos os Responsáveis</option>
            {uniqueResponsibles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            {Object.keys(STATUS_MAP).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Filter Priority */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todas as Prioridades</option>
            <option value="Baixa">Baixa</option>
            <option value="Normal">Normal</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>

          {/* Filter Modality */}
          <select
            value={filterModality}
            onChange={e => setFilterModality(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todas as Modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrida">Híbrida</option>
          </select>

          {/* Filter Team */}
          {uniqueTeams.length > 0 && (
            <select
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="todos">Todas as Equipes</option>
              {uniqueTeams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {/* Checkboxes for includes */}
          <label className="flex items-center gap-1 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDeadlines}
              onChange={e => setIncludeDeadlines(e.target.checked)}
              className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span>Incluir Prazos</span>
          </label>

          <label className="flex items-center gap-1 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeTasks}
              onChange={e => setIncludeTasks(e.target.checked)}
              className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span>Incluir Tarefas</span>
          </label>

          <label className="flex items-center gap-1 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCanceled}
              onChange={e => setIncludeCanceled(e.target.checked)}
              className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span>Incluir Cancelados</span>
          </label>
        </div>
      </div>

      {/* VIEW: DIA (Daily Timeline) */}
      {viewMode === 'dia' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0d2f43]" />
              <h2 className="font-display font-bold text-lg text-[#0d2f43]">
                Agenda do Dia — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <button
              onClick={() => handleOpenNewModal(selectedDate)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              + Adicionar neste dia
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {filteredCalendarItems.filter(item => item.date === selectedDate).length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <CalendarRange className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">Nenhum compromisso agendado para este dia.</p>
                <p className="text-xs text-slate-500 mt-1">Clique em &quot;Novo Compromisso&quot; para registrar um evento.</p>
              </div>
            ) : (
              filteredCalendarItems
                .filter(item => item.date === selectedDate)
                .sort((a, b) => a.start.localeCompare(b.start))
                .map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEventForDetail(item)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      item.status === 'Cancelado' 
                        ? 'bg-slate-50 border-slate-200 opacity-60' 
                        : item.isDeadlineItem 
                        ? 'bg-red-50/50 border-red-200' 
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center bg-slate-100 p-2.5 rounded-lg border border-slate-200 min-w-[70px]">
                        <span className="font-bold text-sm text-[#0d2f43]">{item.start}</span>
                        <span className="text-[10px] text-slate-500">{item.end}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${EVENT_TYPES_MAP[item.type]?.bg || 'bg-slate-100'} ${EVENT_TYPES_MAP[item.type]?.color || 'text-slate-700'}`}>
                            {EVENT_TYPES_MAP[item.type]?.label || item.type}
                          </span>
                          {item.status && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_MAP[item.status]?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                              {item.status}
                            </span>
                          )}
                          {item.priority && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] border ${PRIORITY_MAP[item.priority]?.color || ''}`}>
                              {item.priority}
                            </span>
                          )}
                          {item.deadlineAlertBadge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              {item.deadlineAlertBadge}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-[#0d2f43]">{item.title}</h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          {item.clientName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <strong className="text-slate-700">Cliente:</strong> {item.clientName}
                            </span>
                          )}
                          {item.process && item.process !== 'Geral' && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <strong className="text-slate-700">Proc:</strong> {item.process}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-700">Resp:</strong> {item.responsible}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForDetail(item);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                      >
                        Abrir Detalhes
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: SEMANA (Weekly Grid) */}
      {viewMode === 'semana' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <h2 className="font-display font-bold text-lg text-[#0d2f43]">
              Visão Semanal — {new Date(weekDays[0] + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a {new Date(weekDays[6] + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 7);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 7);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
            {weekDays.map(dateStr => {
              const dayItems = filteredCalendarItems.filter(item => item.date === dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const dateObj = new Date(dateStr + 'T00:00:00');

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col rounded-lg border p-3 min-h-[300px] ${
                    isToday ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-100' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-500 capitalize">
                        {dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                      <span className={`text-base font-bold ${isToday ? 'text-blue-700' : 'text-[#0d2f43]'}`}>
                        {dateObj.getDate()} {dateObj.toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenNewModal(dateStr)}
                      className="p-1 hover:bg-white rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Adicionar compromisso neste dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                    {dayItems.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic text-center py-4">Sem eventos</span>
                    ) : (
                      dayItems.sort((a,b) => a.start.localeCompare(b.start)).map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedEventForDetail(item)}
                          className={`p-2 rounded border text-xs cursor-pointer hover:shadow-xs transition-all ${
                            item.status === 'Cancelado' ? 'bg-slate-100 border-slate-200 text-slate-400' :
                            item.isDeadlineItem ? 'bg-red-100/80 border-red-300 text-red-900' : 'bg-white border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[10px] text-slate-500 mb-0.5">
                            <span>{item.start} - {item.end}</span>
                            <span className="truncate max-w-[70px]">{EVENT_TYPES_MAP[item.type]?.label}</span>
                          </div>
                          <div className="font-semibold text-slate-800 line-clamp-2">{item.title}</div>
                          {item.clientName && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.clientName}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: MÊS (Month Grid) */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-xl text-[#0d2f43] capitalize">
                {monthName} {currentYear}
              </span>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
              >
                Mês Atual
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {emptySpots.map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-slate-50/40 rounded-lg h-28 border border-transparent" />
            ))}

            {daysArray.map(d => {
              const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayItems = filteredCalendarItems.filter(item => item.date === dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={d}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`rounded-lg border p-2 h-28 flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20' :
                    isToday ? 'bg-amber-50/30 border-amber-300' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                      {d}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 my-1 overflow-hidden">
                    {dayItems.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForDetail(item);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                          item.status === 'Cancelado' ? 'bg-slate-100 text-slate-400 line-through' :
                          item.isDeadlineItem ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-blue-50 text-blue-900 border border-blue-100 hover:bg-blue-100'
                        }`}
                      >
                        {item.start} {item.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="text-[9px] font-semibold text-slate-500 text-center">
                        +{dayItems.length - 2} mais
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenNewModal(dateStr);
                    }}
                    className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-0.5 justify-center py-0.5 hover:bg-slate-50 rounded"
                  >
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: LISTA (Table View) */}
      {viewMode === 'lista' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-display font-bold text-base text-[#0d2f43]">
              Lista Completa de Compromissos Integrados ({filteredCalendarItems.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <th className="p-3">Data / Horário</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Processo</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Local / Modalidade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCalendarItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      Nenhum compromisso encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCalendarItems
                    .sort((a,b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))
                    .map(item => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          item.status === 'Cancelado' ? 'bg-slate-50/70 text-slate-400' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                          {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          <br />
                          <span className="text-[11px] font-normal text-slate-500">{item.start} - {item.end}</span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${EVENT_TYPES_MAP[item.type]?.bg || 'bg-slate-100'} ${EVENT_TYPES_MAP[item.type]?.color || 'text-slate-700'}`}>
                            {EVENT_TYPES_MAP[item.type]?.label || item.type}
                          </span>
                        </td>

                        <td className="p-3 font-medium text-slate-900 min-w-[180px]">
                          <span className="hover:underline cursor-pointer" onClick={() => setSelectedEventForDetail(item)}>
                            {item.title}
                          </span>
                          {item.deadlineAlertBadge && (
                            <div className="text-[10px] font-bold text-red-600 mt-0.5">
                              {item.deadlineAlertBadge}
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-slate-700">
                          {item.clientName ? (
                            <button
                              onClick={() => {
                                if (onSelectClient && item.clientId) onSelectClient(item.clientId);
                              }}
                              className="text-blue-700 hover:underline font-medium cursor-pointer"
                            >
                              {item.clientName}
                            </button>
                          ) : '-'}
                        </td>

                        <td className="p-3 text-slate-700 whitespace-nowrap">
                          {item.process && item.process !== 'Geral' ? (
                            <button
                              onClick={() => {
                                if (onSelectProcess && item.processId) onSelectProcess(item.processId);
                              }}
                              className="text-blue-700 hover:underline font-mono text-[11px] cursor-pointer"
                            >
                              {item.process}
                            </button>
                          ) : 'Geral'}
                        </td>

                        <td className="p-3 text-slate-700 whitespace-nowrap">{item.responsible}</td>

                        <td className="p-3 text-slate-600">
                          <div>{item.location || 'Não especificado'}</div>
                          {item.modality && (
                            <span className="text-[10px] text-slate-500 capitalize">({item.modality})</span>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_MAP[item.status]?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                            {item.status || 'Agendado'}
                          </span>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEventForDetail(item)}
                              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
                            >
                              Detalhes
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItemForDelete(item);
                                setDeleteReason('');
                              }}
                              title="Excluir item da agenda"
                              className="p-1 hover:bg-rose-50 hover:text-rose-700 text-slate-400 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: EVENT DETAIL & QUICK ACTIONS */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="bg-[#0d2f43] text-white p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${EVENT_TYPES_MAP[selectedEventForDetail.type]?.bg || 'bg-slate-100'} ${EVENT_TYPES_MAP[selectedEventForDetail.type]?.color || 'text-slate-800'}`}>
                    {EVENT_TYPES_MAP[selectedEventForDetail.type]?.label || selectedEventForDetail.type}
                  </span>
                  {selectedEventForDetail.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_MAP[selectedEventForDetail.status]?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                      {selectedEventForDetail.status}
                    </span>
                  )}
                  {selectedEventForDetail.isDeadlineItem && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                      Item de Prazos e Tarefas
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold font-display">{selectedEventForDetail.title}</h2>
              </div>

              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              {/* Alert Badge for Deadlines */}
              {selectedEventForDetail.deadlineAlertBadge && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 text-red-900 font-bold">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{selectedEventForDetail.deadlineAlertBadge}</span>
                </div>
              )}

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Data e Horário:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {new Date(selectedEventForDetail.date + 'T00:00:00').toLocaleDateString('pt-BR')} ({selectedEventForDetail.start} às {selectedEventForDetail.end})
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Responsável:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedEventForDetail.responsible}</p>
                </div>

                {selectedEventForDetail.clientName && (
                  <div>
                    <span className="text-slate-500 font-medium">Cliente:</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedEventForDetail.clientName}</p>
                  </div>
                )}

                {selectedEventForDetail.process && (
                  <div>
                    <span className="text-slate-500 font-medium">Processo:</span>
                    <p className="font-bold text-slate-900 text-sm font-mono">{selectedEventForDetail.process}</p>
                  </div>
                )}

                {selectedEventForDetail.location && (
                  <div>
                    <span className="text-slate-500 font-medium">Local:</span>
                    <p className="font-bold text-slate-900">{selectedEventForDetail.location}</p>
                  </div>
                )}

                {selectedEventForDetail.modality && (
                  <div>
                    <span className="text-slate-500 font-medium">Modalidade:</span>
                    <p className="font-bold text-slate-900 capitalize">{selectedEventForDetail.modality}</p>
                  </div>
                )}
              </div>

              {/* Description & Virtual Link */}
              {selectedEventForDetail.description && (
                <div>
                  <span className="font-bold text-slate-800">Descrição:</span>
                  <p className="mt-1 p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap">
                    {selectedEventForDetail.description}
                  </p>
                </div>
              )}

              {selectedEventForDetail.virtualLink && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 font-medium">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Link da Reunião Virtual:</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedEventForDetail.virtualLink);
                      alert('Link da reunião copiado com sucesso!');
                    }}
                    className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar Link
                  </button>
                </div>
              )}

              {/* History Log */}
              {selectedEventForDetail.history && selectedEventForDetail.history.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 mb-2 block">Histórico de Alterações do Evento:</span>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded border border-slate-200">
                    {selectedEventForDetail.history.map((log: any) => (
                      <div key={log.id} className="text-[11px] pb-1 border-b border-slate-200 last:border-none">
                        <strong className="text-slate-900">{log.user}</strong> em {log.date} {log.time} — <span className="text-blue-700 font-medium">{log.actionType}</span>
                        <p className="text-slate-600 mt-0.5">{log.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Quick Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Confirm Action */}
                <button
                  onClick={() => handleQuickStatusChange(selectedEventForDetail, 'Confirmado')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  Confirmar
                </button>

                {/* Mark Realized */}
                <button
                  onClick={() => handleQuickStatusChange(selectedEventForDetail, 'Realizado')}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  Marcar Realizado
                </button>

                {/* Reschedule Button */}
                {!selectedEventForDetail.isDeadlineItem && (
                  <button
                    onClick={() => {
                      setRescheduleDate(selectedEventForDetail.date);
                      setRescheduleStart(selectedEventForDetail.start);
                      setRescheduleEnd(selectedEventForDetail.end);
                      setRescheduleReason('');
                      setIsRescheduleModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Remarcar
                  </button>
                )}

                {/* Cancel Button */}
                {!selectedEventForDetail.isDeadlineItem && (
                  <button
                    onClick={() => {
                      setCancelReason('');
                      setIsCancelModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => {
                    const itemToDel = selectedEventForDetail;
                    setSelectedEventForDetail(null);
                    setSelectedItemForDelete(itemToDel);
                    setDeleteReason('');
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded text-xs transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                  title="Excluir item da agenda"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedEventForDetail.processId && onSelectProcess && (
                  <button
                    onClick={() => {
                      onSelectProcess(selectedEventForDetail.processId);
                      setSelectedEventForDetail(null);
                    }}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-semibold text-xs cursor-pointer"
                  >
                    Abrir Processo
                  </button>
                )}

                {selectedEventForDetail.isDeadlineItem && onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab('prazos');
                      setSelectedEventForDetail(null);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded font-semibold text-xs cursor-pointer"
                  >
                    Abrir em Prazos e Tarefas
                  </button>
                )}

                {!selectedEventForDetail.isDeadlineItem && (
                  <button
                    onClick={() => {
                      handleOpenEditModal(selectedEventForDetail);
                      setSelectedEventForDetail(null);
                    }}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: NOVO / EDITAR COMPROMISSO */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8"
          >
            <div className="bg-[#0d2f43] text-white p-4 flex justify-between items-center">
              <h2 className="font-display font-bold text-lg">
                {formId ? 'Editar Compromisso' : 'Novo Compromisso da Agenda Integrada'}
              </h2>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventSubmit} className="p-6 flex flex-col gap-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Row 1: Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Título do Compromisso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Ex: Audiência de Instrução e Julgamento"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Evento</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(EVENT_TYPES_MAP).filter(k => k !== 'prazo' && k !== 'tarefa').map(k => (
                      <option key={k} value={k}>{EVENT_TYPES_MAP[k].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Search Client & Process (Integrated Search - No free text!) */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl flex flex-col gap-3">
                <span className="font-bold text-blue-900 text-xs">
                  Integração Obrigatória: Selecione um Cliente ou Processo cadastrado
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Search */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pesquisar Cliente (Nome, CPF, CNPJ, Tel)</label>
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={e => {
                        setClientSearch(e.target.value);
                        if (!e.target.value) setSelectedClient(null);
                      }}
                      placeholder="Digite para pesquisar no CRM..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    {/* Client Dropdown suggestions */}
                    {clientSearch.trim() && !selectedClient && (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg max-h-32 overflow-y-auto mt-1">
                        {crmLeads
                          .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.cpfCnpj && c.cpfCnpj.includes(clientSearch)))
                          .map(c => (
                            <div
                              key={c.id}
                              onClick={() => handleSelectClientInForm(c)}
                              className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-none"
                            >
                              <div className="font-semibold text-slate-900">{c.name}</div>
                              <div className="text-[10px] text-slate-500">{c.cpfCnpj || 'Sem CPF/CNPJ'} | {c.email || ''}</div>
                            </div>
                          ))}
                      </div>
                    )}

                    {selectedClient && (
                      <div className="mt-1 text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 flex items-center justify-between">
                        <span>Cliente Selecionado: <strong>{selectedClient.name}</strong></span>
                        <button type="button" onClick={() => setSelectedClient(null)} className="text-red-600 font-bold">Limpar</button>
                      </div>
                    )}
                  </div>

                  {/* Process Search */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pesquisar Processo (Número CNJ, Parte, Assunto)</label>
                    <input
                      type="text"
                      value={processSearch}
                      onChange={e => {
                        setProcessSearch(e.target.value);
                        if (!e.target.value) setSelectedProcess(null);
                      }}
                      placeholder="Digite o número CNJ do Processo..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    {/* Process Dropdown suggestions */}
                    {processSearch.trim() && !selectedProcess && (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg max-h-32 overflow-y-auto mt-1">
                        {processes
                          .filter(p => p.cnj.toLowerCase().includes(processSearch.toLowerCase()) || p.client.toLowerCase().includes(processSearch.toLowerCase()) || p.opposingParty?.toLowerCase().includes(processSearch.toLowerCase()))
                          .map(p => (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProcessInForm(p)}
                              className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-none"
                            >
                              <div className="font-semibold text-slate-900 font-mono">{p.cnj}</div>
                              <div className="text-[10px] text-slate-500">Cliente: {p.client} vs {p.opposingParty || 'Parte'}</div>
                            </div>
                          ))}
                      </div>
                    )}

                    {selectedProcess && (
                      <div className="mt-1 text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 flex items-center justify-between">
                        <span>Processo Selecionado: <strong className="font-mono">{selectedProcess.cnj}</strong></span>
                        <button type="button" onClick={() => setSelectedProcess(null)} className="text-red-600 font-bold">Limpar</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Process List when Client is selected */}
                {selectedClient && availableClientProcesses.length > 0 && !selectedProcess && (
                  <div className="p-2 bg-white rounded border border-blue-200 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">Processos ativos deste cliente:</span>
                    <div className="flex flex-wrap gap-2">
                      {availableClientProcesses.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProcessInForm(p)}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-100 text-blue-900 rounded font-mono text-[11px] border border-slate-300"
                        >
                          {p.cnj}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horário Inicial</label>
                  <input
                    type="time"
                    disabled={formIsAllDay}
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horário Final</label>
                  <input
                    type="time"
                    disabled={formIsAllDay}
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs disabled:opacity-50"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsAllDay}
                      onChange={e => setFormIsAllDay(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Dia Inteiro</span>
                  </label>
                </div>
              </div>

              {/* Row 4: Responsible & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsável</label>
                  <select
                    value={formResponsible}
                    onChange={e => setFormResponsible(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer font-bold"
                  >
                    {activeUsersList.map(u => (
                      <option key={u.id || u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioridade</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {Object.keys(STATUS_MAP).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Location, Address, Modality & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modalidade</label>
                  <select
                    value={formModality}
                    onChange={e => setFormModality(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Local</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="Ex: Sala 302 / Teams"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Link Virtual (se houver)</label>
                  <input
                    type="url"
                    value={formVirtualLink}
                    onChange={e => setFormVirtualLink(e.target.value)}
                    placeholder="https://teams.microsoft.com/..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Row 6: Description & Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição / Observações</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Detalhamento do compromisso, orientações ou pauta..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>



              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0d2f43] hover:bg-[#16435f] text-white rounded-lg font-semibold shadow cursor-pointer"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: RESCHEDULE (REMARCAÇÃO) */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
            <h3 className="font-display font-bold text-lg text-[#0d2f43] mb-3">Remarcar Compromisso</h3>
            <p className="text-xs text-slate-600 mb-4">
              Ao remarcar, a agenda dos participantes, os lembretes e o histórico do processo/cliente serão atualizados automaticamente.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nova Data *</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Novo Horário Inicial</label>
                  <input
                    type="time"
                    value={rescheduleStart}
                    onChange={e => setRescheduleStart(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Novo Horário Final</label>
                  <input
                    type="time"
                    value={rescheduleEnd}
                    onChange={e => setRescheduleEnd(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Justificativa da Remarcação (Obrigatória) *</label>
                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                  placeholder="Informe o motivo da alteração da data..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setIsRescheduleModalOpen(false)} className="px-3 py-1.5 border rounded text-xs font-medium cursor-pointer">
                Voltar
              </button>
              <button onClick={handleConfirmReschedule} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer">
                Confirmar Remarcação
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: CANCEL EVENT */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
            <h3 className="font-display font-bold text-lg text-red-900 mb-2">Cancelar Compromisso</h3>
            <p className="text-xs text-slate-600 mb-4">
              O compromisso não será apagado definitivamente. Ele será mantido nos históricos de auditoria do processo e do cliente.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo do Cancelamento (Obrigatório) *</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Justifique o motivo do cancelamento..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setIsCancelModalOpen(false)} className="px-3 py-1.5 border rounded text-xs font-medium cursor-pointer">
                Voltar
              </button>
              <button onClick={handleConfirmCancel} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold cursor-pointer">
                Confirmar Cancelamento
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: CONFLICT ALERT */}
      {isConflictModalOpen && conflictingEventInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md border-t-4 border-amber-500">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Aviso de Conflito de Horário</span>
            </div>

            <p className="text-xs text-slate-700 mb-3">
              O profissional <strong>{conflictingEventInfo.responsible}</strong> já possui um compromisso agendado no mesmo horário:
            </p>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs mb-4">
              <div className="font-bold text-amber-950">{conflictingEventInfo.title}</div>
              <div className="text-amber-800 font-medium">
                Data: {conflictingEventInfo.date} | Horário: {conflictingEventInfo.start} às {conflictingEventInfo.end}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsConflictModalOpen(false)} className="px-3 py-1.5 border rounded text-xs font-medium cursor-pointer">
                Voltar e Ajustar
              </button>
              <button
                onClick={() => {
                  if (pendingFormSubmitData) {
                    handleSaveEventSubmit(undefined, true);
                  }
                }}
                className="px-4 py-1.5 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 cursor-pointer"
              >
                Prosseguir Assim Mesmo
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: PRINT PREVIEW */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl p-8 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-300 no-print">
              <h2 className="font-display font-bold text-lg text-[#0d2f43]">Visualização de Impressão da Agenda</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#0d2f43] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="px-3 py-1.5 border rounded text-xs font-semibold cursor-pointer">
                  Fechar
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-agenda-section" className="mt-4 flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b-2 border-slate-900">
                <div>
                  <h1 className="text-xl font-extrabold text-[#0d2f43]">PCG.OS — Advocacia Digital</h1>
                  <h2 className="text-sm font-bold text-slate-700">Relatório da Agenda Integrada de Compromissos</h2>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p>Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>Usuário: {currentUser?.name}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-wrap gap-4 text-[11px]">
                <span><strong>Modo de Visão:</strong> {viewMode.toUpperCase()}</span>
                <span><strong>Total Exibido:</strong> {filteredCalendarItems.length} registros</span>
                <span><strong>Filtro Tipo:</strong> {EVENT_TYPES_MAP[filterType]?.label || filterType}</span>
                <span><strong>Filtro Responsável:</strong> {filterResponsible}</span>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                    <th className="p-2 border border-slate-300">Data / Horário</th>
                    <th className="p-2 border border-slate-300">Tipo</th>
                    <th className="p-2 border border-slate-300">Título</th>
                    <th className="p-2 border border-slate-300">Cliente / Processo</th>
                    <th className="p-2 border border-slate-300">Responsável</th>
                    <th className="p-2 border border-slate-300">Local / Modalidade</th>
                    <th className="p-2 border border-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalendarItems.map(item => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-2 border border-slate-300 font-medium">
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR')} ({item.start} - {item.end})
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold">{EVENT_TYPES_MAP[item.type]?.label || item.type}</td>
                      <td className="p-2 border border-slate-300 font-bold">{item.title}</td>
                      <td className="p-2 border border-slate-300">
                        {item.clientName || 'Geral'}<br />
                        <span className="font-mono text-[10px]">{item.process}</span>
                      </td>
                      <td className="p-2 border border-slate-300">{item.responsible}</td>
                      <td className="p-2 border border-slate-300">{item.location || '-'} ({item.modality || 'Presencial'})</td>
                      <td className="p-2 border border-slate-300 font-semibold">{item.status || 'Agendado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500">
                PCG.OS — Sistema de Gestão para Advocacia | Documento Gerado para Uso Interno
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO DE ITEM DA AGENDA */}
      {selectedItemForDelete && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="bg-rose-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Excluir Item da Agenda</span>
              </h3>
              <button
                onClick={() => setSelectedItemForDelete(null)}
                className="hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDelete} className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-xs">Confirmação de Exclusão da Agenda</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-rose-800">
                    O item será removido permanentemente da sua agenda e a alteração será devidamente registrada no histórico de auditoria do sistema.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Item a ser excluído:</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  &quot;{selectedItemForDelete.title}&quot;
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Data: <strong className="text-slate-700">{selectedItemForDelete.date}</strong> ({selectedItemForDelete.start} - {selectedItemForDelete.end}) • Responsável: <strong className="text-slate-700">{selectedItemForDelete.responsible}</strong>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo da Exclusão / Justificativa *</label>
                <textarea
                  rows={3}
                  required
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Informe o motivo da exclusão (ex: Cancelado pelo cliente, erro no lançamento, audiência desmarcada...)"
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500/20 font-medium text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedItemForDelete(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


    </div>
  );
}
