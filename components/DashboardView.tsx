'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, AlertTriangle, CheckSquare, CheckCircle2, 
  Calendar, Scale, Users, Plus, Eye, ArrowRight, 
  X, User, ChevronRight, Briefcase, FileText, Check
} from 'lucide-react';
import { Process, Deadline, CalendarEvent, CrmLead, FinancialTransaction, SystemUser } from '@/lib/mockData';
import { isDeadlineDone } from '@/lib/deadlineUtils';

interface DashboardViewProps {
  processes: Process[];
  deadlines: Deadline[];
  events: CalendarEvent[];
  crmLeads?: CrmLead[];
  transactions?: FinancialTransaction[];
  users?: any[];
  currentUser?: any;
  onNavigateTab: (tab: string, filters?: any) => void;
  onSelectProcess?: (id: string) => void;
  onAddDeadline?: (deadline: Partial<Deadline>) => void;
  initialFilters?: any;
}

export default function DashboardView({
  processes = [],
  deadlines = [],
  events = [],
  crmLeads = [],
  users = [],
  currentUser,
  onNavigateTab,
  onSelectProcess,
  onAddDeadline,
}: DashboardViewProps) {
  // Selected team member filter
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // Modal states
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [selectedCollaboratorDetail, setSelectedCollaboratorDetail] = useState<any | null>(null);

  // Normalize and build consolidated list of active collaborators
  const teamMembers = useMemo(() => {
    // Standard template default collaborators to match design and real users
    const defaultRoster = [
      { id: 'usr-1', name: 'Eduardo Silva', role: 'Sócio Administrador', isSocio: true, avatarBg: 'bg-[#614d3f]' },
      { id: 'usr-2', name: 'Marina Costa', role: 'Advogada Sênior - Cível & Tributário', isSocio: false, avatarBg: 'bg-[#0d2f43]' },
      { id: 'usr-3', name: 'Lucas Martins', role: 'Advogado Pleno - Trabalhista', isSocio: false, avatarBg: 'bg-slate-700' },
      { id: 'usr-4', name: 'Camila Torres', role: 'Advogada - Contratos & Societário', isSocio: false, avatarBg: 'bg-amber-800' }
    ];

    if (users && users.length > 0) {
      // Merge with real users from system
      const mapped = users.map((u, index) => {
        const isSocio = u.role?.toLowerCase().includes('sócio') || 
                        u.role?.toLowerCase().includes('socio') || 
                        u.role?.toLowerCase().includes('ceo') || 
                        u.role?.toLowerCase().includes('proprietário');
        const roleLabel = u.cargo || u.role || (isSocio ? 'Sócio Administrador' : 'Advogado');
        const avatarBgs = ['bg-[#614d3f]', 'bg-[#0d2f43]', 'bg-slate-700', 'bg-amber-800', 'bg-emerald-800', 'bg-blue-900'];
        return {
          id: u.id || `usr-${index}`,
          name: u.name,
          role: roleLabel,
          isSocio: isSocio,
          avatarBg: avatarBgs[index % avatarBgs.length]
        };
      });

      // If mapped users has at least 2 members, use them, otherwise supplement with default roster
      if (mapped.length >= 3) {
        return mapped;
      }
    }

    return defaultRoster;
  }, [users]);

  // New Deadline / Task form state
  const [newType, setNewType] = useState<'prazo' | 'tarefa'>('prazo');
  const [newTitle, setNewTitle] = useState('');
  const [newResponsible, setNewResponsible] = useState(teamMembers[0]?.name || 'Eduardo Silva');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newProcessId, setNewProcessId] = useState('');
  const [newPriority, setNewPriority] = useState<'Normal' | 'Alta' | 'Crítica'>('Alta');
  const [newDescription, setNewDescription] = useState('');

  // Today helper string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const todayBrStr = useMemo(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }, []);

  // Filtered datasets based on selected collaborator
  const isMemberMatch = (responsibleName?: string) => {
    if (selectedMember === 'all') return true;
    if (!responsibleName) return false;
    return responsibleName.toLowerCase().includes(selectedMember.toLowerCase());
  };

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(d => isMemberMatch(d.responsible));
  }, [deadlines, selectedMember]);

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => !p.deleted && isMemberMatch(p.responsible));
  }, [processes, selectedMember]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => e.status !== 'Cancelado' && isMemberMatch(e.responsible));
  }, [events, selectedMember]);

  // Top Metrics Calculations
  // 1. Prazos Abertos (judicial deadlines pending/in progress)
  const countPrazosAbertos = useMemo(() => {
    return filteredDeadlines.filter(d => 
      (d.type === 'prazo' || !d.type || d.type === 'fatal') &&
      !isDeadlineDone(d.status, d.completed) && d.status !== 'Cancelado' && d.status !== 'Vencido'
    ).length;
  }, [filteredDeadlines]);

  // 2. Vencidos (overdue items)
  const countVencidos = useMemo(() => {
    return filteredDeadlines.filter(d => 
      !isDeadlineDone(d.status, d.completed) && (d.status === 'Vencido' || d.status === 'Crítico' || d.status === 'Atrasado')
    ).length;
  }, [filteredDeadlines]);

  // 3. Tarefas (internal tasks pending)
  const countTarefas = useMemo(() => {
    return filteredDeadlines.filter(d => 
      (d.type === 'tarefa' || d.type === 'interno') &&
      !isDeadlineDone(d.status, d.completed) && d.status !== 'Cancelado'
    ).length;
  }, [filteredDeadlines]);

  // 4. Concluídas
  const countConcluidas = useMemo(() => {
    return filteredDeadlines.filter(d => 
      isDeadlineDone(d.status, d.completed)
    ).length;
  }, [filteredDeadlines]);

  // 5. Audiências
  const countAudiencias = useMemo(() => {
    return filteredEvents.filter(e => 
      e.type === 'audiencia' || e.type === 'sustentacao_oral' || e.type === 'pericia'
    ).length;
  }, [filteredEvents]);

  // 6. Processos Ativos
  const countProcessosAtivos = useMemo(() => {
    return filteredProcesses.filter(p => 
      p.status === 'Ativo' || p.status === 'Em Andamento' || !p.status || p.status === 'Suspenso'
    ).length;
  }, [filteredProcesses]);

  // Taxa Geral de Conclusão Percentage
  const totalDemandas = countConcluidas + countPrazosAbertos + countTarefas + countVencidos;
  const taxaConclusao = totalDemandas > 0 ? Math.round((countConcluidas / totalDemandas) * 100) : 0;

  // Collaborator Workload breakdown
  const collaboratorWorkloads = useMemo(() => {
    return teamMembers.map(member => {
      const memberDeadlines = deadlines.filter(d => d.responsible && d.responsible.toLowerCase().includes(member.name.toLowerCase()));
      
      const realPrazos = memberDeadlines.filter(d => 
        (d.type === 'prazo' || !d.type || d.type === 'fatal') &&
        !isDeadlineDone(d.status, d.completed) && d.status !== 'Cancelado'
      ).length;

      const realTarefas = memberDeadlines.filter(d => 
        (d.type === 'tarefa' || d.type === 'interno') &&
        !isDeadlineDone(d.status, d.completed) && d.status !== 'Cancelado'
      ).length;

      const realHoje = memberDeadlines.filter(d => 
        (d.dueDate === todayStr || d.dueDate === todayBrStr) &&
        !isDeadlineDone(d.status, d.completed)
      ).length;

      const realAtrasadas = memberDeadlines.filter(d => 
        !isDeadlineDone(d.status, d.completed) && (d.status === 'Vencido' || d.status === 'Atrasado')
      ).length;

      const realConcluidas = memberDeadlines.filter(d => 
        isDeadlineDone(d.status, d.completed)
      ).length;

      return {
        ...member,
        prazos: realPrazos,
        tarefas: realTarefas,
        hoje: realHoje,
        atrasadas: realAtrasadas,
        concluidas: realConcluidas
      };
    });
  }, [teamMembers, deadlines, todayStr, todayBrStr]);

  // Carteira por Área do Direito
  const areaDistribution = useMemo(() => {
    const baseAreas = [
      { area: 'Cível', count: 2, pct: 40 },
      { area: 'Trabalhista', count: 1, pct: 20 },
      { area: 'Tributário', count: 1, pct: 20 },
      { area: 'Societário', count: 1, pct: 20 },
    ];

    if (filteredProcesses.length > 0) {
      const counts: Record<string, number> = {};
      filteredProcesses.forEach(p => {
        const a = p.area || 'Cível';
        counts[a] = (counts[a] || 0) + 1;
      });

      const total = filteredProcesses.length;
      const calculated = Object.entries(counts).map(([area, count]) => ({
        area,
        count,
        pct: Math.round((count / total) * 100)
      }));

      // If we have at least 2 areas with data, return calculated, otherwise return base
      if (calculated.length >= 2) {
        return calculated;
      }
    }

    return baseAreas;
  }, [filteredProcesses]);

  // Handle Distribute Submit
  const handleDistributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Informe o título do prazo ou tarefa.');
      return;
    }

    const linkedProcess = processes.find(p => p.id === newProcessId);

    const deadlinePayload: Partial<Deadline> = {
      id: `dl-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      responsible: newResponsible || teamMembers[0]?.name || 'Eduardo Silva',
      dueDate: newDueDate || todayBrStr,
      dueTime: newDueTime || '17:00',
      priority: newPriority,
      status: 'Pendente',
      client: linkedProcess ? linkedProcess.client : 'Geral do Escritório',
      processCnj: linkedProcess ? linkedProcess.cnj : 'Geral/Interno',
      processId: linkedProcess ? linkedProcess.id : undefined,
      description: newDescription || undefined
    };

    if (onAddDeadline) {
      onAddDeadline(deadlinePayload);
    }

    // Reset & close
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setIsDistributeModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Top Pill Badge & Subtitle */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] text-[11px] font-black uppercase rounded tracking-wider border border-[#fde68a]">
              VISÃO GERENCIAL
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Painel de Controle do Sócio
            </span>
          </div>

          {/* Main Title & Description */}
          <h1 className="font-display text-2xl lg:text-3xl font-black text-[#0d2f43] tracking-tight">
            Dashboard Executivo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Resumo de produtividade, gargalos operacionais e performance da equipe.
          </p>
        </div>

        {/* Right Header Controls: Team Member Dropdown & + Distribuir Prazo */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dropdown Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
            <Users className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 cursor-pointer pr-2"
            >
              <option value="all">Toda a Equipe</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name} ({member.isSocio ? 'Sócio' : 'Advogado'})
                </option>
              ))}
            </select>
          </div>

          {/* + Distribuir Prazo Button */}
          <button
            onClick={() => setIsDistributeModalOpen(true)}
            className="px-4 py-2.5 bg-[#142834] hover:bg-[#0d2f43] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Distribuir Prazo</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC SUMMARY CARDS ROW (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Prazos Abertos */}
        <div
          onClick={() => onNavigateTab('prazos', { statusFilter: 'Pendente' })}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              PRAZOS ABERTOS
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {countPrazosAbertos}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Em andamento
              </p>
            </div>
            <Clock className="w-4 h-4 text-slate-400 mb-1 shrink-0" />
          </div>
        </div>

        {/* Card 2: Vencidos (Critical Red) */}
        <div
          onClick={() => onNavigateTab('prazos', { statusFilter: 'Vencido' })}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">
              VENCIDOS
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl lg:text-3xl font-black text-red-600 tracking-tight leading-none">
                {countVencidos}
              </p>
              <p className="text-[11px] font-bold text-red-600 mt-1">
                Atenção crítica
              </p>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500 mb-1 shrink-0" />
          </div>
        </div>

        {/* Card 3: Tarefas */}
        <div
          onClick={() => onNavigateTab('prazos', { typeFilter: 'tarefa' })}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              TAREFAS
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {countTarefas}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Pendentes de entrega
              </p>
            </div>
            <CheckSquare className="w-4 h-4 text-slate-400 mb-1 shrink-0" />
          </div>
        </div>

        {/* Card 4: Concluídas */}
        <div
          onClick={() => onNavigateTab('prazos', { statusFilter: 'Cumprido' })}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              CONCLUÍDAS
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {countConcluidas}
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                {taxaConclusao}% taxa entrega
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-slate-400 mb-1 shrink-0" />
          </div>
        </div>

        {/* Card 5: Audiências */}
        <div
          onClick={() => onNavigateTab('agenda', { typeFilter: 'audiencia' })}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              AUDIÊNCIAS
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {countAudiencias}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Agendadas
              </p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400 mb-1 shrink-0" />
          </div>
        </div>

        {/* Card 6: Processos Ativos (Navy Card #142834) */}
        <div
          onClick={() => onNavigateTab('processos', { statusFilter: 'Ativo' })}
          className="bg-[#142834] rounded-2xl border border-slate-800 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-white group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-amber-200/90 uppercase tracking-wider">
              PROCESSOS ATIVOS
            </span>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                {countProcessosAtivos}
              </p>
              <p className="text-[11px] font-bold text-slate-300 mt-1 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                <span>Ver carteira</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
            <Scale className="w-4 h-4 text-slate-400 mb-1 shrink-0" />
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION GRID (Left Col ~65%, Right Col ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Equipe Operacional & Carga de Trabalho */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
            <div>
              <h2 className="font-display font-extrabold text-base text-slate-900 tracking-tight">
                Equipe Operacional & Carga de Trabalho
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Clique no colaborador para detalhar prazos, tarefas e status individual.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0 self-start sm:self-auto">
              {collaboratorWorkloads.length} Colaboradores
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">COLABORADOR</th>
                  <th className="px-4 py-3 text-center">PRAZOS</th>
                  <th className="px-4 py-3 text-center">TAREFAS</th>
                  <th className="px-4 py-3 text-center">HOJE</th>
                  <th className="px-4 py-3 text-center">ATRASADAS</th>
                  <th className="px-4 py-3 text-center">CONCLUÍDAS</th>
                  <th className="px-6 py-3 text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {collaboratorWorkloads.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => setSelectedCollaboratorDetail(member)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Colaborador Info */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full ${member.avatarBg} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs`}>
                          {member.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {member.name}
                            </span>
                            {member.isSocio && (
                              <span className="px-1.5 py-0.2 bg-[#fef3c7] text-[#92400e] text-[9px] font-black rounded border border-[#fde68a] uppercase">
                                SÓCIO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Prazos */}
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {member.prazos}
                    </td>

                    {/* Tarefas */}
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {member.tarefas}
                    </td>

                    {/* Hoje */}
                    <td className="px-4 py-3.5 text-center">
                      {member.hoje > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#fef3c7] text-[#92400e] font-black text-[11px] border border-[#fde68a]">
                          {member.hoje}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400">0</span>
                      )}
                    </td>

                    {/* Atrasadas */}
                    <td className="px-4 py-3.5 text-center">
                      {member.atrasadas > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 font-black text-[11px] border border-red-200">
                          {member.atrasadas}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-400">0</span>
                      )}
                    </td>

                    {/* Concluídas */}
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {member.concluidas}
                    </td>

                    {/* Ação Button */}
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCollaboratorDetail(member);
                        }}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0d2f43] font-bold text-xs py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: 2 Cards (Taxa de Conclusão & Carteira por Área) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Taxa Geral de Conclusão */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
            <h2 className="font-display font-extrabold text-base text-slate-900 tracking-tight">
              Taxa Geral de Conclusão
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Percentual de prazos e tarefas cumpridos no período.
            </p>

            {/* Circular Gauge / Donut */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="text-slate-100 stroke-current"
                    strokeWidth="11"
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="text-[#614d3f] stroke-current"
                    strokeWidth="11"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - taxaConclusao / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display font-black text-2xl text-slate-900 leading-none">
                    {taxaConclusao}%
                  </span>
                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mt-1">
                    CUMPRIMENTO
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Stats: Total Concluídas & Pendências Ativas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Concluídas</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{countConcluidas}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Pendências Ativas</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{countPrazosAbertos + countTarefas}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Carteira por Área do Direito */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
            <h2 className="font-display font-extrabold text-base text-slate-900 tracking-tight">
              Carteira por Área do Direito
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5 mb-4">
              Distribuição dos processos ativos.
            </p>

            {/* List of Areas with Progress Bars */}
            <div className="flex flex-col gap-3.5">
              {areaDistribution.map((item) => (
                <div key={item.area} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-800">{item.area}</span>
                    <span className="font-semibold text-slate-500 text-[11px]">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#614d3f] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.pct, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL: + DISTRIBUIR PRAZO */}
      <AnimatePresence>
        {isDistributeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-5 bg-[#142834] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-sm tracking-wide">Distribuir Novo Prazo / Tarefa</h3>
                </div>
                <button
                  onClick={() => setIsDistributeModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDistributeSubmit} className="p-6 flex flex-col gap-4 text-xs">
                {/* Type toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('prazo')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all border ${
                      newType === 'prazo'
                        ? 'bg-[#142834] text-white border-[#142834]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Prazo Processual / Judicial
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('tarefa')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all border ${
                      newType === 'tarefa'
                        ? 'bg-[#142834] text-white border-[#142834]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Tarefa Interna / Administrativa
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Título da Demanda *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={newType === 'prazo' ? 'Ex: Contestar Ação Ordinária' : 'Ex: Revisão de minuta contratual'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium"
                  />
                </div>

                {/* Responsible & Process */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Colaborador Responsável *</label>
                    <select
                      value={newResponsible}
                      onChange={(e) => setNewResponsible(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium bg-white"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.name}>{m.name} ({m.role.split('-')[0].trim()})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Vincular a Processo</label>
                    <select
                      value={newProcessId}
                      onChange={(e) => setNewProcessId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium bg-white"
                    >
                      <option value="">Nenhum (Demanda Geral)</option>
                      {processes.map(p => (
                        <option key={p.id} value={p.id}>{p.cnj} - {p.client}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date, Time & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Data Fatal / Limite</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Horário Limite</label>
                    <input
                      type="time"
                      value={newDueTime}
                      onChange={(e) => setNewDueTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Prioridade</label>
                    <select
                      value={newPriority}
                      onChange={(e: any) => setNewPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium bg-white"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Instruções / Observações</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Instruções operacionais para o colaborador..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0d2f43] font-medium resize-none"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDistributeModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#142834] hover:bg-[#0d2f43] text-white rounded-lg font-bold transition-all shadow-xs"
                  >
                    Distribuir Demanda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL: DETALHES DO COLABORADOR */}
      <AnimatePresence>
        {selectedCollaboratorDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-5 bg-[#142834] text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${selectedCollaboratorDetail.avatarBg} text-white flex items-center justify-center text-xs font-black shadow-2xs`}>
                    {selectedCollaboratorDetail.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{selectedCollaboratorDetail.name}</span>
                      {selectedCollaboratorDetail.isSocio && (
                        <span className="px-1.5 py-0.2 bg-[#fef3c7] text-[#92400e] text-[9px] font-black rounded border border-[#fde68a] uppercase">
                          SÓCIO
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300">{selectedCollaboratorDetail.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCollaboratorDetail(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs">
                {/* Metric Summary Grid for this Member */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Prazos</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{selectedCollaboratorDetail.prazos}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Tarefas</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{selectedCollaboratorDetail.tarefas}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Hoje</span>
                    <p className={`text-xl font-black mt-0.5 ${selectedCollaboratorDetail.hoje > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {selectedCollaboratorDetail.hoje}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Atrasadas</span>
                    <p className={`text-xl font-black mt-0.5 ${selectedCollaboratorDetail.atrasadas > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {selectedCollaboratorDetail.atrasadas}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Concluídas</span>
                    <p className="text-xl font-black text-emerald-600 mt-0.5">{selectedCollaboratorDetail.concluidas}</p>
                  </div>
                </div>

                {/* Deadlines & Tasks Assigned */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Demandas e Prazos do Colaborador</span>
                    <button
                      onClick={() => {
                        setSelectedCollaboratorDetail(null);
                        onNavigateTab('prazos', { responsibleFilter: selectedCollaboratorDetail.name });
                      }}
                      className="text-[11px] font-bold text-[#0d2f43] hover:underline flex items-center gap-1"
                    >
                      <span>Abrir na tela de Prazos</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {deadlines
                      .filter(d => d.responsible && d.responsible.toLowerCase().includes(selectedCollaboratorDetail.name.toLowerCase()))
                      .slice(0, 5)
                      .map(d => (
                        <div key={d.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{d.title}</p>
                            <p className="text-[11px] text-slate-400">
                              {d.client || 'Geral'} • Vence em: <strong className="text-slate-700">{d.dueDate} às {d.dueTime || '17:00'}</strong>
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                            d.status === 'Cumprido' || d.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' :
                            d.status === 'Vencido' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status || 'Pendente'}
                          </span>
                        </div>
                      ))}

                    {deadlines.filter(d => d.responsible && d.responsible.toLowerCase().includes(selectedCollaboratorDetail.name.toLowerCase())).length === 0 && (
                      <div className="p-6 text-center text-slate-400 font-medium">
                        Nenhum prazo judicial pendente no momento para este colaborador.
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Processes Assigned */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Processos sob Responsabilidade</span>
                    <button
                      onClick={() => {
                        setSelectedCollaboratorDetail(null);
                        onNavigateTab('processos', { responsibleFilter: selectedCollaboratorDetail.name });
                      }}
                      className="text-[11px] font-bold text-[#0d2f43] hover:underline flex items-center gap-1"
                    >
                      <span>Ver Carteira de Processos</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {processes
                      .filter(p => !p.deleted && p.responsible && p.responsible.toLowerCase().includes(selectedCollaboratorDetail.name.toLowerCase()))
                      .slice(0, 4)
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedCollaboratorDetail(null);
                            if (onSelectProcess) onSelectProcess(p.id);
                          }}
                          className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-slate-900 text-xs">{p.cnj}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Cliente: <strong className="text-slate-700">{p.client}</strong> • {p.area || 'Cível'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold shrink-0">
                            {p.phase || 'Instrução'}
                          </span>
                        </div>
                      ))}

                    {processes.filter(p => !p.deleted && p.responsible && p.responsible.toLowerCase().includes(selectedCollaboratorDetail.name.toLowerCase())).length === 0 && (
                      <div className="p-6 text-center text-slate-400 font-medium">
                        Nenhum processo vinculado como responsável principal.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedCollaboratorDetail(null)}
                  className="px-4 py-2 bg-[#142834] text-white rounded-lg font-bold text-xs hover:bg-[#0d2f43] transition-colors cursor-pointer"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
