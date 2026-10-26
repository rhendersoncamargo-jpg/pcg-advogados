'use client';

import React, { useState } from 'react';
import { Briefcase, Users, Plus, Search, ShieldAlert, FolderOpen, Calendar, HelpCircle, EyeOff, Gavel, FileText } from 'lucide-react';
import { LegalCase, CrmLead, Process } from '@/lib/mockData';

interface CasosViewProps {
  cases: LegalCase[];
  leads: CrmLead[];
  processes: Process[];
  userRole: string;
  onAddCase: (newCase: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCase: (updatedCase: LegalCase) => void;
  onDeleteCase: (id: string) => void;
  onNavigateToProcess: (id: string) => void;
}

export default function CasosView({
  cases,
  leads,
  processes,
  userRole,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onNavigateToProcess
}: CasosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Arquivado' | 'Pendente'>('Todos');
  const [teamFilter, setTeamFilter] = useState('Todos');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  // Add form states
  const [newTitle, setNewTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'Ativo' | 'Arquivado' | 'Pendente'>('Ativo');
  const [newResponsible, setNewResponsible] = useState('Dr. Rodrigo Godoy');
  const [newTeam, setNewTeam] = useState('Contencioso Cível');
  const [newIsConfidential, setNewIsConfidential] = useState(false);

  // RBAC checks
  const canModify = userRole === 'CEO/Proprietário' || userRole === 'Administrador' || userRole === 'Controladoria Jurídica';
  const isEstagiario = userRole === 'Estagiário';
  const isConsulta = userRole === 'Consulta';

  // Filter out soft deleted cases and respect confidentiality
  const filteredCases = cases.filter(c => {
    if (c.deleted) return false;
    
    // Confidentially check: Estagiario & Financeiro cannot see confidential cases
    if (c.isConfidential && (isEstagiario || userRole === 'Financeiro')) {
      return false;
    }

    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const matchesTeam = teamFilter === 'Todos' || c.team === teamFilter;

    return matchesSearch && matchesStatus && matchesTeam;
  });

  const activeLeads = leads.filter(l => !l.deleted && l.status === 'ATIVO');

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !selectedClientId) {
      alert('Por favor, preencha o título do caso e selecione o cliente.');
      return;
    }

    const lead = leads.find(l => l.id === selectedClientId);
    if (!lead) return;

    onAddCase({
      title: newTitle,
      clientId: selectedClientId,
      clientName: lead.name,
      description: newDescription,
      status: newStatus,
      responsible: newResponsible,
      team: newTeam,
      isConfidential: newIsConfidential
    });

    // Reset fields
    setNewTitle('');
    setSelectedClientId('');
    setNewDescription('');
    setNewStatus('Ativo');
    setNewIsConfidential(false);
    setIsAddModalOpen(false);
    alert('Caso Jurídico criado com sucesso!');
  };

  const handleSoftDelete = (id: string) => {
    if (confirm('Tem certeza que deseja arquivar este caso? Ele poderá ser reativado posteriormente.')) {
      onDeleteCase(id);
      setSelectedCase(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Casos Jurídicos</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Gestão integrada de pastas, demandas estratégicas e relacionamento de processos judiciais.
          </p>
        </div>
        {!isConsulta && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl shadow-sm transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Caso Jurídico</span>
          </button>
        )}
      </div>

      {/* Grid: Filters and Left List & Right Detail Panel */}
      <div className="grid grid-cols-12 gap-6">
        {/* Cases List Area */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por caso, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativos</option>
              <option value="Pendente">Pendentes</option>
              <option value="Arquivado">Arquivados</option>
            </select>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
            >
              <option value="Todos">Todos as Áreas</option>
              <option value="Contencioso Cível">Contencioso Cível</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Societário">Societário</option>
            </select>
          </div>

          {/* Cases Cards */}
          <div className="flex flex-col gap-3">
            {filteredCases.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">Nenhum caso jurídico encontrado.</p>
              </div>
            ) : (
              filteredCases.map((c) => {
                const linkedProcs = processes.filter(p => p.caseId === c.id && !p.deleted);
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`bg-white rounded-xl border p-5 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col gap-3 ${
                      selectedCase?.id === c.id ? 'border-[#0d2f43] ring-1 ring-[#0d2f43]' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#0d2f43]" />
                        <span className="font-mono text-[9px] font-black uppercase text-slate-400">ID: {c.id}</span>
                        {c.isConfidential && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[8px] font-black border border-red-100 rounded-full flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" /> SIGILOSO
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        c.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        c.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-extrabold text-xs text-slate-800 leading-tight">{c.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">Cliente: {c.clientName}</p>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 font-medium">
                      {c.description}
                    </p>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{c.team}</span>
                        <span>•</span>
                        <span>Resp: {c.responsible}</span>
                      </div>
                      <span className="text-[#0d2f43] font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                        {linkedProcs.length} {linkedProcs.length === 1 ? 'Processo' : 'Processos'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Case Detail Panel */}
        <div className="col-span-12 lg:col-span-5">
          {selectedCase ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24 flex flex-col gap-5 text-slate-800 animate-fade-in">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#0d2f43] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{selectedCase.team}</span>
                    {selectedCase.isConfidential && (
                      <span className="text-[8px] font-bold text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">Confidencial</span>
                    )}
                  </div>
                  <h2 className="font-display font-extrabold text-sm text-slate-800 mt-1.5">{selectedCase.title}</h2>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Cliente: {selectedCase.clientName}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição do Caso</span>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedCase.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</span>
                  <p className="mt-0.5 text-slate-800">{selectedCase.responsible}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Geral</span>
                  <p className="mt-0.5 text-slate-800">{selectedCase.status}</p>
                </div>
              </div>

              {/* Linked Processes */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processos Associados</span>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {processes.filter(p => p.caseId === selectedCase.id && !p.deleted).length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold py-2">Nenhum processo autuado neste caso.</p>
                  ) : (
                    processes.filter(p => p.caseId === selectedCase.id && !p.deleted).map(p => (
                      <div
                        key={p.id}
                        onClick={() => onNavigateToProcess(p.id)}
                        className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-150 flex justify-between items-center cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.cnj}</p>
                          <p className="text-[9px] text-slate-400 font-bold truncate">{p.vara} - {p.court}</p>
                        </div>
                        <Gavel className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Case Action Buttons */}
              {canModify && (
                <div className="border-t border-slate-100 pt-4 flex justify-between gap-3 mt-2">
                  <button
                    onClick={() => handleSoftDelete(selectedCase.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors"
                  >
                    Arquivar Caso
                  </button>
                  <button
                    onClick={() => {
                      const newStatus = selectedCase.status === 'Ativo' ? 'Arquivado' : 'Ativo';
                      onUpdateCase({ ...selectedCase, status: newStatus });
                      setSelectedCase({ ...selectedCase, status: newStatus });
                      alert(`Caso alterado para: ${newStatus}`);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Mudar Status
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 sticky top-24">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold">Selecione um caso para visualizar detalhes integrados, processos associados e histórico completo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Case Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                📁 Criar Pasta de Caso Jurídico
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Título do Caso</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Assessoria Societária - TechCorp"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cliente Associado (Do CRM)</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 bg-white font-semibold"
                >
                  <option value="">Selecione um cliente ativo...</option>
                  {activeLeads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.cpfCnpj})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição Estratégica</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Especifique o escopo geral, premissas contratuais e metas jurídicas para esta demanda..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Área Competente</label>
                  <select
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 bg-white font-semibold"
                  >
                    <option value="Contencioso Cível">Contencioso Cível</option>
                    <option value="Trabalhista">Trabalhista</option>
                    <option value="Societário">Societário</option>
                    <option value="Tributário">Tributário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Responsável Inicial</label>
                  <select
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 bg-white font-semibold"
                  >
                    <option value="Dr. Rodrigo Godoy">Dr. Rodrigo Godoy</option>
                    <option value="Dra. Luiza Alves">Dra. Luiza Alves</option>
                    <option value="Dr. Fabio Paiva">Dr. Fabio Paiva</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isConfidential"
                  checked={newIsConfidential}
                  onChange={(e) => setNewIsConfidential(e.target.checked)}
                  className="w-4 h-4 text-[#0d2f43] border-slate-300 rounded focus:ring-[#0d2f43]/15"
                />
                <label htmlFor="isConfidential" className="text-xs font-semibold text-slate-600 select-none cursor-pointer">
                  Caso sob Segredo de Justiça / Confidencialidade Alta (Restringe visualização)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-lg shadow-sm"
                >
                  Criar Pasta Integrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
