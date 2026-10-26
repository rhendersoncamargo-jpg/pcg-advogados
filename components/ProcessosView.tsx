'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, SlidersHorizontal, ArrowDownToLine, 
  FilePlus, Layers, FileText, CheckCircle, Clock, 
  ChevronLeft, ChevronRight, Gavel, Calendar, ArrowUpRight,
  ShieldAlert, Filter, Trash2, RotateCcw, AlertTriangle, Eye, User
} from 'lucide-react';
import { Process } from '@/lib/mockData';
import { canUserDeleteProcess } from './ProcessoDetailView';

interface ProcessosViewProps {
  processes: Process[];
  users?: any[];
  onSelectProcess: (id: string) => void;
  onOpenAddModal: () => void;
  currentUser?: {
    id?: string;
    name?: string;
    username?: string;
    role?: string;
  } | null;
  initialFilters?: {
    activeTab?: string;
    responsibleFilter?: string;
    courtFilter?: string;
    searchQuery?: string;
  };
}

export default function ProcessosView({ processes, users, onSelectProcess, onOpenAddModal, currentUser, initialFilters }: ProcessosViewProps) {
  const [activeTab, setActiveTab] = useState(initialFilters?.activeTab || 'Visão Geral');
  const [caseTypeFilter, setCaseTypeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [responsibleFilter, setResponsibleFilter] = useState(initialFilters?.responsibleFilter || 'Todos');
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');

  const activeUsersList = React.useMemo(() => {
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

  const isUserAuthorizedForDeleted = canUserDeleteProcess(currentUser);

  // Filter processes: by default filter out soft-deleted processes unless activeTab is 'Excluídos'
  const activeProcesses = processes.filter(p => !p.deleted);
  const deletedProcesses = processes.filter(p => p.deleted);

  // Statistics
  const totalAtivos = activeProcesses.filter(p => (p.status || 'Ativo') === 'Ativo').length;
  const totalJudiciais = activeProcesses.filter(p => (p.caseType || 'Judicial') === 'Judicial').length;
  const totalAdministrativos = activeProcesses.filter(p => p.caseType === 'Administrativo').length;
  const totalExtrajudiciais = activeProcesses.filter(p => p.caseType === 'Extrajudicial').length;
  const totalSuspensos = activeProcesses.filter(p => p.status === 'Suspenso').length;
  const totalEncerrados = activeProcesses.filter(p => p.status === 'Encerrado' || p.status === 'Arquivado').length;

  // Filtered List
  const displayList = (activeTab === 'Excluídos' ? deletedProcesses : activeProcesses).filter(p => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match = 
        p.cnj.includes(q) ||
        p.client.toLowerCase().includes(q) ||
        (p.additionalClients && p.additionalClients.some(ac => ac.name.toLowerCase().includes(q) || (ac.cpfCnpj && ac.cpfCnpj.includes(q)))) ||
        (p.opposingParty && p.opposingParty.toLowerCase().includes(q)) ||
        (p.caseDescription && p.caseDescription.toLowerCase().includes(q)) ||
        (p.subject && p.subject.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Case type
    if (caseTypeFilter !== 'Todos' && p.caseType !== caseTypeFilter) {
      return false;
    }

    // Status
    if (statusFilter !== 'Todos' && p.status !== statusFilter) {
      return false;
    }

    // Sub tab filters
    if (activeTab === 'Judiciais' && p.caseType !== 'Judicial') return false;
    if (activeTab === 'Administrativos' && p.caseType !== 'Administrativo') return false;
    if (activeTab === 'Extrajudiciais' && p.caseType !== 'Extrajudicial') return false;
    if (activeTab === 'Encerrados' && (p.status !== 'Encerrado' && p.status !== 'Arquivado')) return false;

    // Responsible
    if (responsibleFilter !== 'Todos' && !p.responsible.toLowerCase().includes(responsibleFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0d2f43] tracking-tight">
            Prontuário de Casos e Processos
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestão jurídica centralizada com integração ao CRM, acompanhamento de prazos e histórico de andamentos.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-[#0d2f43] hover:bg-[#0b2839] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all self-start md:self-auto cursor-pointer"
        >
          <FilePlus className="w-4 h-4 text-blue-300" />
          <span>Cadastrar Novo Processo</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ativos</span>
          <p className="text-xl font-black text-[#0d2f43] mt-1">{totalAtivos}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Judiciais</span>
          <p className="text-xl font-black text-blue-800 mt-1">{totalJudiciais}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrativos</span>
          <p className="text-xl font-black text-slate-800 mt-1">{totalAdministrativos}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extrajudiciais</span>
          <p className="text-xl font-black text-slate-800 mt-1">{totalExtrajudiciais}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suspensos</span>
          <p className="text-xl font-black text-amber-700 mt-1">{totalSuspensos}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Encerrados</span>
          <p className="text-xl font-black text-slate-500 mt-1">{totalEncerrados}</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-4 text-xs font-bold text-slate-500 bg-white px-4 rounded-xl border border-slate-200/80 shadow-2xs">
        {[
          { id: 'Visão Geral', label: 'Todos os Casos' },
          { id: 'Judiciais', label: 'Judiciais' },
          { id: 'Administrativos', label: 'Administrativos' },
          { id: 'Extrajudiciais', label: 'Extrajudiciais' },
          { id: 'Encerrados', label: 'Encerrados / Arquivados' },
          ...(isUserAuthorizedForDeleted ? [{ id: 'Excluídos', label: `Processos Excluídos (${deletedProcesses.length})` }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0d2f43] text-[#0d2f43] font-black'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por CNJ, cliente, parte contrária..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#0d2f43] font-medium"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-bold text-slate-500 text-[11px]">Tipo:</span>
            <select
              value={caseTypeFilter}
              onChange={(e) => setCaseTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Judicial">Judicial</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Extrajudicial">Extrajudicial</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-bold text-slate-500 text-[11px]">Situação:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none"
            >
              <option value="Todos">Todas</option>
              <option value="Ativo">Ativo</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Encerrado">Encerrado</option>
              <option value="Arquivado">Arquivado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-bold text-slate-500 text-[11px]">Responsável:</span>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              {activeUsersList.map(u => (
                <option key={u.id || u.name} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Rendering */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Número CNJ</th>
                <th className="px-6 py-3.5">Cliente (CRM)</th>
                <th className="px-6 py-3.5">Parte Contrária</th>
                <th className="px-6 py-3.5">Ação / Fato</th>
                <th className="px-6 py-3.5">Fase</th>
                <th className="px-6 py-3.5">Situação</th>
                <th className="px-6 py-3.5">Responsável</th>
                <th className="px-6 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayList.map((proc) => (
                <tr
                  key={proc.id}
                  onClick={() => onSelectProcess(proc.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{proc.cnj}</td>
                  <td className="px-6 py-4 font-bold text-[#0d2f43]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{proc.client}</span>
                      {proc.additionalClients && proc.additionalClients.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          +{proc.additionalClients.length} cliente(s)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{proc.opposingParty || '-'}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium max-w-xs truncate">{proc.caseDescription}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{proc.phase}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      proc.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' :
                      proc.status === 'Suspenso' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {proc.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-bold">{proc.responsible}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProcess(proc.id);
                      }}
                      className="px-3 py-1 bg-[#0d2f43] text-white rounded-lg text-xs font-bold hover:bg-[#0b2839]"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}

              {displayList.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-xs">
                    Nenhum processo encontrado com os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
