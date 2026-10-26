'use client';

import React, { useState } from 'react';
import { FileText, Plus, Search, DollarSign, Calendar, CheckCircle2, AlertCircle, Trash2, Ban } from 'lucide-react';
import { FeeContract, LegalCase } from '@/lib/mockData';

interface ContratosViewProps {
  contracts: FeeContract[];
  cases: LegalCase[];
  userRole: string;
  onAddContract: (newContract: Omit<FeeContract, 'id' | 'createdAt'>) => void;
  onUpdateContract: (updatedContract: FeeContract) => void;
  onDeleteContract: (id: string) => void;
}

export default function ContratosView({
  contracts,
  cases,
  userRole,
  onAddContract,
  onUpdateContract,
  onDeleteContract
}: ContratosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [paymentFilter, setPaymentFilter] = useState('Todos');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'À Vista' | 'Parcelado' | 'Êxito'>('À Vista');
  const [installments, setInstallments] = useState('1');
  const [contractStatus, setContractStatus] = useState<'Assinado' | 'Pendente' | 'Cancelado'>('Pendente');

  // RBAC checks
  const canModify = userRole === 'CEO/Proprietário' || userRole === 'Administrador' || userRole === 'Financeiro';
  const isEstagiario = userRole === 'Estagiário';
  const isConsulta = userRole === 'Consulta';

  // Confidential cases check
  const confidentialCaseIds = new Set(
    cases.filter(c => c.isConfidential).map(c => c.id)
  );

  const filteredContracts = contracts.filter(c => {
    if (c.deleted) return false;

    // RBAC: Estagiario & Financeiro cannot see contracts associated with confidential legal strategies
    if (confidentialCaseIds.has(c.caseId) && (isEstagiario || userRole === 'Financeiro')) {
      return false;
    }

    const matchesSearch = c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.caseTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const matchesPayment = paymentFilter === 'Todos' || c.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const activeCases = cases.filter(c => {
    if (c.deleted) return false;
    if (c.isConfidential && (isEstagiario || userRole === 'Financeiro')) return false;
    return true;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !contractValue) {
      alert('Por favor, selecione um caso jurídico e informe o valor contratual.');
      return;
    }

    const matchedCase = cases.find(c => c.id === selectedCaseId);
    if (!matchedCase) return;

    const parsedValue = parseFloat(contractValue) || 0;
    const contractNumber = `PCG-${new Date().getFullYear()}-${String(contracts.length + 101)}`;

    onAddContract({
      contractNumber,
      caseId: selectedCaseId,
      caseTitle: matchedCase.title,
      clientId: matchedCase.clientId,
      clientName: matchedCase.clientName,
      value: parsedValue,
      paymentMethod,
      installments: paymentMethod === 'Parcelado' ? parseInt(installments) || 1 : undefined,
      status: contractStatus,
      signedAt: contractStatus === 'Assinado' ? new Date().toISOString().split('T')[0] : undefined
    });

    // Reset Form
    setSelectedCaseId('');
    setContractValue('');
    setPaymentMethod('À Vista');
    setInstallments('1');
    setContractStatus('Pendente');
    setIsAddModalOpen(false);
    alert(`Contrato de Honorários ${contractNumber} registrado com sucesso!`);
  };

  const handleStatusChange = (contract: FeeContract, newStatus: 'Assinado' | 'Pendente' | 'Cancelado') => {
    onUpdateContract({
      ...contract,
      status: newStatus,
      signedAt: newStatus === 'Assinado' ? new Date().toISOString().split('T')[0] : undefined
    });
    alert(`Contrato ${contract.contractNumber} alterado para: ${newStatus}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Contratos de Honorários</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Gestão integrada de valores, forma de cobrança e alinhamento financeiro dos honorários advocatícios.
          </p>
        </div>
        {canModify && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl shadow-sm transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Contrato</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nº contrato, cliente ou caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium text-slate-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
        >
          <option value="Todos">Todos os Status</option>
          <option value="Assinado">Assinados</option>
          <option value="Pendente">Pendentes</option>
          <option value="Cancelado">Cancelados</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
        >
          <option value="Todos">Todas as Cobranças</option>
          <option value="À Vista">À Vista</option>
          <option value="Parcelado">Parcelado</option>
          <option value="Êxito">Êxito</option>
        </select>
      </div>

      {/* Contracts Table / Card layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0d2f43] text-white font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                <th className="p-4">Nº Contrato</th>
                <th className="p-4">Cliente / Caso Jurídico</th>
                <th className="p-4">Forma de Pagamento</th>
                <th className="p-4">Valor Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assinado Em</th>
                {canModify && <th className="p-4 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={canModify ? 7 : 6} className="p-8 text-center text-slate-400">
                    Nenhum contrato de honorários cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                filteredContracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{c.contractNumber}</td>
                    <td className="p-4">
                      <p className="font-extrabold text-slate-800">{c.clientName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{c.caseTitle}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{c.paymentMethod}</span>
                      {c.paymentMethod === 'Parcelado' && (
                        <span className="text-[10px] text-slate-400 block font-semibold">{c.installments}x parcelas</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#0d2f43]">{formatCurrency(c.value)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        c.status === 'Assinado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        c.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{c.signedAt || 'Não Assinado'}</td>
                    {canModify && (
                      <td className="p-4 flex gap-2 justify-center">
                        {c.status !== 'Assinado' && (
                          <button
                            onClick={() => handleStatusChange(c, 'Assinado')}
                            className="p-1 hover:bg-emerald-50 text-emerald-600 rounded border border-emerald-100 flex items-center gap-1 text-[9px] px-1.5 font-bold"
                            title="Marcar como Assinado"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Assinar
                          </button>
                        )}
                        {c.status !== 'Cancelado' && (
                          <button
                            onClick={() => handleStatusChange(c, 'Cancelado')}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded border border-rose-100 flex items-center gap-1 text-[9px] px-1.5 font-bold"
                            title="Cancelar Contrato"
                          >
                            <Ban className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Deseja realmente remover este contrato? (Soft Delete)')) {
                              onDeleteContract(c.id);
                            }
                          }}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded border border-slate-200"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                ✍️ Formalizar Contrato de Honorários
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Caso Jurídico Relacionado</label>
                <select
                  required
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 bg-white font-semibold"
                >
                  <option value="">Selecione o caso...</option>
                  {activeCases.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.clientName})</option>
                  ))}
                </select>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">O Cliente cadastrado no CRM será vinculado automaticamente.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor Contratual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="Ex: 25000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Método de Cobrança</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 bg-white font-semibold"
                  >
                    <option value="À Vista">À Vista</option>
                    <option value="Parcelado">Parcelado</option>
                    <option value="Êxito">Êxito</option>
                  </select>
                </div>
              </div>

              {paymentMethod === 'Parcelado' && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantidade de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status de Assinatura</label>
                <select
                  value={contractStatus}
                  onChange={(e: any) => setContractStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 bg-white font-semibold"
                >
                  <option value="Pendente">Aguardando Assinatura (Pendente)</option>
                  <option value="Assinado">Já Assinado</option>
                </select>
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
                  Gerar e Registrar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
