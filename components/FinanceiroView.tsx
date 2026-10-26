/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Calendar, Filter, Plus, FileText, CheckCircle2, Clock, Trash2, 
  Search, ShieldAlert, Eye, Edit3, CornerUpLeft, Copy, Link as LinkIcon, 
  Users, Building2, Printer, AlertTriangle, FileCheck, RefreshCw, X, 
  Check, ChevronRight, UserCheck, Shield, PieChart, Layers, HelpCircle,
  Paperclip, Briefcase, FileSpreadsheet, Percent
} from 'lucide-react';
import { FinancialTransaction, RepasseItem, FinancialHistoryLog, Process, CrmLead } from '@/lib/mockData';

interface FinanceiroViewProps {
  transactions: FinancialTransaction[];
  processes?: Process[];
  crmLeads?: CrmLead[];
  users?: any[];
  currentUser?: any;
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  onAddBatchTransactions?: (txs: Omit<FinancialTransaction, 'id'>[]) => void;
  onUpdateTransaction?: (tx: FinancialTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  initialFilters?: {
    selectedMonth?: string;
    activeFilter?: 'todos' | 'revenue' | 'expense';
    statusFilter?: string;
  };
}

/// Clean slate for financial transactions
const DEMO_TRANSACTIONS: FinancialTransaction[] = [];

export default function FinanceiroView({
  transactions: propsTransactions = [],
  processes = [],
  crmLeads = [],
  users,
  currentUser,
  onAddTransaction,
  onAddBatchTransactions,
  onUpdateTransaction,
  onDeleteTransaction,
  initialFilters
}: FinanceiroViewProps) {
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

  // Use props transactions directly
  const allTransactions = useMemo(() => {
    return propsTransactions;
  }, [propsTransactions]);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'visao_geral' | 'entradas' | 'saidas' | 'contas_receber' | 'contas_pagar' | 'repasses' | 'historico'
  >('visao_geral');

  // Period Filter State (Req 1)
  const [periodOption, setPeriodOption] = useState<
    'hoje' | 'semana' | 'mes' | 'trimestre' | 'semestre' | 'ano' | 'custom' | 'todos'
  >('mes');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Secondary Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [clientFilter, setClientFilter] = useState('todos');
  const [processFilter, setProcessFilter] = useState('todos');
  const [professionalFilter, setProfessionalFilter] = useState('todos');

  // Modals & Action Drawers
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [modalTransactionType, setModalTransactionType] = useState<'revenue' | 'expense'>('revenue');
  
  // Specific Action Modals
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<FinancialTransaction | null>(null);
  const [selectedTxForPayment, setSelectedTxForPayment] = useState<FinancialTransaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDateInput, setPaymentDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentAccountInput, setPaymentAccountInput] = useState<string>('Conta Única');
  const [paymentMethodInput, setPaymentMethodInput] = useState<string>('Pix');

  // Repasse Modal State
  const [isRepasseModalOpen, setIsRepasseModalOpen] = useState(false);
  const [repasseOriginTx, setRepasseOriginTx] = useState<FinancialTransaction | null>(null);
  const [selectedOriginTxId, setSelectedOriginTxId] = useState<string>('');
  const [repasseSearchQuery, setRepasseSearchQuery] = useState('');
  const [repasseBeneficiary, setRepasseBeneficiary] = useState(currentUser?.name || 'Larissa Paiva');
  const [repasseValue, setRepasseValue] = useState('');
  const [repassePercentage, setRepassePercentage] = useState('');
  const [repasseExpectedDate, setRepasseExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [repasseObs, setRepasseObs] = useState('');

  // Edit Repasse State
  const [editingRepasse, setEditingRepasse] = useState<{
    item: RepasseItem & { parentTx: FinancialTransaction };
  } | null>(null);
  const [editRepasseBeneficiary, setEditRepasseBeneficiary] = useState('');
  const [editRepasseValue, setEditRepasseValue] = useState('');
  const [editRepassePercentage, setEditRepassePercentage] = useState('');
  const [editRepasseExpectedDate, setEditRepasseExpectedDate] = useState('');
  const [editRepassePaymentDate, setEditRepassePaymentDate] = useState('');
  const [editRepasseStatus, setEditRepasseStatus] = useState<'Pendente' | 'Realizado' | 'Cancelado'>('Pendente');
  const [editRepasseObs, setEditRepasseObs] = useState('');

  // Cancellation / Refund Justification Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelActionType, setCancelActionType] = useState<'cancelar' | 'estornar'>('cancelar');
  const [cancelTx, setCancelTx] = useState<FinancialTransaction | null>(null);
  const [cancelJustification, setCancelJustification] = useState('');

  // Collection Note Modal
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionTx, setCollectionTx] = useState<FinancialTransaction | null>(null);
  const [collectionContactDate, setCollectionContactDate] = useState('');
  const [collectionNextStep, setCollectionNextStep] = useState('');

  // Client & Process Search Picker Modals
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [isProcessPickerOpen, setIsProcessPickerOpen] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');

  // Form State for New Entry/Exit
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Honorários contratuais');
  const [formValue, setFormValue] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formSelectedClient, setFormSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [formSelectedProcess, setFormSelectedProcess] = useState<{ id: string; cnj: string; client: string; area: string; resp: string } | null>(null);
  const [formExpectedDate, setFormExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('Pix');
  const [formAccount, setFormAccount] = useState('Conta Única');
  const [formInstallments, setFormInstallments] = useState('1');
  const [isCustomInstallments, setIsCustomInstallments] = useState(false);
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formRecurrenceFreq, setFormRecurrenceFreq] = useState<'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'>('Mensal');
  const [formReceivedValue, setFormReceivedValue] = useState('');
  const [formStatus, setFormStatus] = useState<string>('A receber');
  const [formObservations, setFormObservations] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');

  // Edit Transaction Modal State
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form Fields
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editProcess, setEditProcess] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editExpectedDate, setEditExpectedDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPaidDate, setEditPaidDate] = useState('');
  const [editReceivedDate, setEditReceivedDate] = useState('');
  const [editStatus, setEditStatus] = useState<string>('A receber');
  const [editPaymentMethod, setEditPaymentMethod] = useState('Pix');
  const [editAccount, setEditAccount] = useState('Conta Única');
  const [editObservations, setEditObservations] = useState('');

  // Access check
  const roleLower = (currentUser?.role || '').toLowerCase();
  const isUnauthorized = roleLower.includes('recep') || roleLower.includes('secretá') || roleLower.includes('estagiá') || roleLower.includes('estag');

  // Formatters
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Helper Date Filter Check
  const matchesPeriod = (dateStr?: string) => {
    if (!dateStr) return true;
    if (periodOption === 'todos') return true;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let targetDate: Date | null = null;
    if (dateStr.includes('/')) {
      const p = dateStr.split('/');
      if (p.length === 3) targetDate = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    } else if (dateStr.includes('-')) {
      const p = dateStr.split('T')[0].split('-');
      if (p.length === 3) targetDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      else targetDate = new Date(dateStr);
    }

    if (!targetDate || isNaN(targetDate.getTime())) return true;

    if (periodOption === 'hoje') {
      const endOfToday = new Date(startOfToday.getTime() + 86400000);
      return targetDate >= startOfToday && targetDate < endOfToday;
    }
    if (periodOption === 'semana') {
      const dayOfWeek = startOfToday.getDay();
      const startOfWeek = new Date(startOfToday.getTime() - dayOfWeek * 86400000);
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
      return targetDate >= startOfWeek && targetDate < endOfWeek;
    }
    if (periodOption === 'mes') {
      return targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear();
    }
    if (periodOption === 'trimestre') {
      const threeMonthsAgo = new Date(startOfToday.getTime() - 90 * 86400000);
      return targetDate >= threeMonthsAgo && targetDate <= startOfToday;
    }
    if (periodOption === 'semestre') {
      const sixMonthsAgo = new Date(startOfToday.getTime() - 180 * 86400000);
      return targetDate >= sixMonthsAgo && targetDate <= startOfToday;
    }
    if (periodOption === 'ano') {
      return targetDate.getFullYear() === today.getFullYear();
    }
    if (periodOption === 'custom') {
      if (customStartDate) {
        const s = new Date(customStartDate);
        if (targetDate < s) return false;
      }
      if (customEndDate) {
        const e = new Date(customEndDate);
        e.setHours(23, 59, 59, 999);
        if (targetDate > e) return false;
      }
      return true;
    }

    return true;
  };

  // Helper to parse date string into timestamp for accurate sorting
  const parseDateToTime = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const str = dateStr.trim();
    if (str.includes('/')) {
      const p = str.split('/');
      if (p.length === 3) {
        const d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        return isNaN(d.getTime()) ? 0 : d.getTime();
      }
    } else if (str.includes('-')) {
      const p = str.split('T')[0].split('-');
      if (p.length === 3) {
        const d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
        return isNaN(d.getTime()) ? 0 : d.getTime();
      }
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // Helper for secondary filters
  const matchesSecondaryFilters = (tx: FinancialTransaction) => {
    if (statusFilter !== 'todos') {
      if (statusFilter === 'vencidas') {
        if (tx.status !== 'Vencida' && tx.status !== 'atrasado') return false;
      } else if (tx.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
    }
    if (categoryFilter !== 'todos' && tx.category !== categoryFilter) return false;
    if (clientFilter !== 'todos' && tx.client !== clientFilter) return false;
    if (processFilter !== 'todos' && tx.process !== processFilter) return false;
    if (professionalFilter !== 'todos' && tx.responsibleUser !== professionalFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchClient = (tx.client || '').toLowerCase().includes(q);
      const matchProc = (tx.process || '').toLowerCase().includes(q);
      const matchSupplier = (tx.supplierOrBeneficiary || '').toLowerCase().includes(q);
      const matchResp = (tx.responsibleUser || '').toLowerCase().includes(q);
      const matchCat = (tx.category || '').toLowerCase().includes(q);
      if (!matchDesc && !matchClient && !matchProc && !matchSupplier && !matchResp && !matchCat) {
        return false;
      }
    }
    return true;
  };

  // 1. VISÃO GERAL: MOVIMENTAÇÕES EFETIVAMENTE REALIZADAS (Req 2)
  const ultimasMovimentacoes = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'entrada' | 'saida' | 'repasse';
      description: string;
      category?: string;
      clientOrBeneficiary: string;
      process: string;
      effectiveDate: string;
      value: number;
      status: string;
      originalTx: FinancialTransaction;
    }> = [];

    allTransactions.forEach(tx => {
      const isCancelled = tx.status === 'Cancelada' || tx.status === 'Estornada';
      if (isCancelled) return;

      if (tx.type === 'revenue') {
        const isReceived = tx.status === 'Recebida' || tx.status === 'pago' || tx.status === 'Parcialmente recebida' || (tx.receivedValue && tx.receivedValue > 0);
        if (isReceived) {
          const effDate = tx.receivedDate || tx.dueDate || tx.date || '';
          if (matchesPeriod(effDate)) {
            list.push({
              id: `mov-in-${tx.id}`,
              type: 'entrada',
              description: tx.description || tx.category || 'Receita',
              category: tx.category,
              clientOrBeneficiary: tx.client || 'Geral',
              process: tx.process || 'Geral',
              effectiveDate: effDate,
              value: tx.receivedValue || tx.value,
              status: tx.status,
              originalTx: tx
            });
          }
        }
      } else if (tx.type === 'expense') {
        const isPaid = tx.status === 'Paga' || tx.status === 'pago' || tx.status === 'Parcialmente paga' || (tx.receivedValue && tx.receivedValue > 0);
        if (isPaid) {
          const effDate = tx.paidDate || tx.dueDate || tx.date || '';
          if (matchesPeriod(effDate)) {
            list.push({
              id: `mov-out-${tx.id}`,
              type: 'saida',
              description: tx.description || tx.category || 'Despesa',
              category: tx.category,
              clientOrBeneficiary: tx.supplierOrBeneficiary || tx.client || 'Geral',
              process: tx.process || 'Geral',
              effectiveDate: effDate,
              value: tx.receivedValue || tx.value,
              status: tx.status,
              originalTx: tx
            });
          }
        }
      }

      if (tx.repasses && tx.repasses.length > 0) {
        tx.repasses.forEach(r => {
          if (r.status === 'Realizado') {
            const effDate = r.expectedDate || r.paymentDate || '';
            if (matchesPeriod(effDate)) {
              list.push({
                id: `mov-rep-${r.id}`,
                type: 'repasse',
                description: `Repasse - ${r.professionalBeneficiary}`,
                category: 'Repasse de Honorários',
                clientOrBeneficiary: r.professionalBeneficiary,
                process: r.process || tx.process || 'Geral',
                effectiveDate: effDate,
                value: r.value,
                status: r.status,
                originalTx: tx
              });
            }
          }
        });
      }
    });

    return list.sort((a, b) => parseDateToTime(b.effectiveDate) - parseDateToTime(a.effectiveDate));
  }, [allTransactions, periodOption, customStartDate, customEndDate]);

  // 2. ENTRADAS (Efetivamente Recebidas, Ordenação Cronológica Crescente por Data de Recebimento)
  const entradasList = useMemo(() => {
    return allTransactions
      .filter(tx => {
        if (tx.type !== 'revenue') return false;
        const isReceived = tx.status === 'Recebida' || tx.status === 'pago' || tx.status === 'Parcialmente recebida' || (tx.receivedValue && tx.receivedValue > 0);
        if (!isReceived) return false;
        if (tx.status === 'Cancelada' || tx.status === 'Estornada') return false;

        const effectiveDate = tx.receivedDate || tx.dueDate || tx.date;
        if (!matchesPeriod(effectiveDate)) return false;

        return matchesSecondaryFilters(tx);
      })
      .sort((a, b) => parseDateToTime(a.receivedDate || a.dueDate || a.date) - parseDateToTime(b.receivedDate || b.dueDate || b.date));
  }, [allTransactions, periodOption, customStartDate, customEndDate, statusFilter, categoryFilter, clientFilter, processFilter, professionalFilter, searchQuery]);

  // 3. SAÍDAS (Efetivamente Pagas, Ordenação Cronológica Crescente por Data de Pagamento)
  const saidasList = useMemo(() => {
    return allTransactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        const isPaid = tx.status === 'Paga' || tx.status === 'pago' || tx.status === 'Parcialmente paga' || (tx.receivedValue && tx.receivedValue > 0);
        if (!isPaid) return false;
        if (tx.status === 'Cancelada' || tx.status === 'Estornada') return false;

        const effectiveDate = tx.paidDate || tx.dueDate || tx.date;
        if (!matchesPeriod(effectiveDate)) return false;

        return matchesSecondaryFilters(tx);
      })
      .sort((a, b) => parseDateToTime(a.paidDate || a.dueDate || a.date) - parseDateToTime(b.paidDate || b.dueDate || b.date));
  }, [allTransactions, periodOption, customStartDate, customEndDate, statusFilter, categoryFilter, clientFilter, processFilter, professionalFilter, searchQuery]);

  // 4. CONTAS A RECEBER (Pendentes, Ordenadas por Vencimento Crescente)
  const contasReceberList = useMemo(() => {
    return allTransactions
      .filter(tx => {
        if (tx.type !== 'revenue') return false;
        if (tx.status === 'Recebida' || tx.status === 'pago' || tx.status === 'Cancelada' || tx.status === 'Estornada') return false;

        const dueDateStr = tx.dueDate || tx.expectedDate || tx.date;
        if (!matchesPeriod(dueDateStr)) return false;

        return matchesSecondaryFilters(tx);
      })
      .sort((a, b) => parseDateToTime(a.dueDate || a.expectedDate || a.date) - parseDateToTime(b.dueDate || b.expectedDate || b.date));
  }, [allTransactions, periodOption, customStartDate, customEndDate, statusFilter, categoryFilter, clientFilter, processFilter, professionalFilter, searchQuery]);

  // 5. CONTAS A PAGAR (Pendentes, Ordenadas por Vencimento Crescente)
  const contasPagarList = useMemo(() => {
    return allTransactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        if (tx.status === 'Paga' || tx.status === 'pago' || tx.status === 'Cancelada' || tx.status === 'Estornada') return false;

        const dueDateStr = tx.dueDate || tx.expectedDate || tx.date;
        if (!matchesPeriod(dueDateStr)) return false;

        return matchesSecondaryFilters(tx);
      })
      .sort((a, b) => parseDateToTime(a.dueDate || a.expectedDate || a.date) - parseDateToTime(b.dueDate || b.expectedDate || b.date));
  }, [allTransactions, periodOption, customStartDate, customEndDate, statusFilter, categoryFilter, clientFilter, processFilter, professionalFilter, searchQuery]);

  // 6. REPASSES LIST (Ordenados por Data Prevista/Realizada Crescente)
  const repassesList = useMemo(() => {
    return allTransactions
      .flatMap(tx => (tx.repasses || []).map(r => ({ ...r, parentTx: tx })))
      .filter(item => {
        const targetDate = item.expectedDate || item.paymentDate;
        if (!matchesPeriod(targetDate)) return false;
        if (professionalFilter !== 'todos' && item.professionalBeneficiary !== professionalFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchBenef = (item.professionalBeneficiary || '').toLowerCase().includes(q);
          const matchIncome = (item.incomeDescription || item.parentTx.description || '').toLowerCase().includes(q);
          const matchClient = (item.client || item.parentTx.client || '').toLowerCase().includes(q);
          if (!matchBenef && !matchIncome && !matchClient) return false;
        }
        return true;
      })
      .sort((a, b) => parseDateToTime(a.expectedDate || a.paymentDate) - parseDateToTime(b.expectedDate || b.paymentDate));
  }, [allTransactions, periodOption, customStartDate, customEndDate, professionalFilter, searchQuery]);

  // 7. HISTÓRICO LIST (Ordenado por Data/Hora Decrescente)
  const historicoList = useMemo(() => {
    return allTransactions
      .flatMap(tx => (tx.history || []).map(h => ({ ...h, txRef: tx })))
      .filter(item => {
        if (!matchesPeriod(item.date)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchAction = (item.action || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          const matchUser = (item.user || '').toLowerCase().includes(q);
          const matchRef = (item.txRef.description || item.txRef.client || '').toLowerCase().includes(q);
          if (!matchAction && !matchDesc && !matchUser && !matchRef) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = parseDateToTime(a.date);
        const dateB = parseDateToTime(b.date);
        if (dateA !== dateB) return dateB - dateA;
        return (b.time || '').localeCompare(a.time || '');
      });
  }, [allTransactions, periodOption, customStartDate, customEndDate, searchQuery]);

  // Backward compatibility alias for current active tab count
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'entradas') return entradasList;
    if (activeTab === 'saidas') return saidasList;
    if (activeTab === 'contas_receber') return contasReceberList;
    if (activeTab === 'contas_pagar') return contasPagarList;
    return allTransactions;
  }, [activeTab, entradasList, saidasList, contasReceberList, contasPagarList, allTransactions]);

  // Derived Indicators & Aggregations (Req 2 & 5 & 7 & 11)
  const stats = useMemo(() => {
    let faturamentoPeriodo = 0; // Total revenues in period
    let valorRecebido = 0;       // Total received revenues
    let contasReceber = 0;       // Pending receivables
    let receitasVencidas = 0;    // Overdue revenues
    let despesasRealizadas = 0;  // Expenses paid
    let contasPagar = 0;          // Pending expenses
    let repassesRealizados = 0;  // Split payouts done
    let repassesPendentes = 0;   // Split payouts pending

    let totalAllReceived = 0;
    let totalAllPaid = 0;
    let totalAllRepassesRealizados = 0;

    allTransactions.forEach(tx => {
      const isCancelled = tx.status === 'Cancelada' || tx.status === 'Estornada';
      if (isCancelled) return;

      const txInPeriod = matchesPeriod(tx.dueDate || tx.receivedDate || tx.paidDate || tx.date);

      if (tx.type === 'revenue') {
        const rVal = tx.receivedValue || (tx.status === 'Recebida' || tx.status === 'pago' ? tx.value : 0);
        totalAllReceived += rVal;

        if (txInPeriod) {
          faturamentoPeriodo += tx.value;
          valorRecebido += rVal;

          if (tx.status === 'Recebida' || tx.status === 'pago') {
            // fully received
          } else if (tx.status === 'Vencida' || tx.status === 'atrasado') {
            receitasVencidas += (tx.value - rVal);
            contasReceber += (tx.value - rVal);
          } else {
            contasReceber += (tx.value - rVal);
          }
        }

        if (tx.repasses && tx.repasses.length > 0) {
          tx.repasses.forEach(r => {
            if (r.status === 'Realizado') {
              totalAllRepassesRealizados += r.value;
              const rInPeriod = matchesPeriod(r.expectedDate || r.paymentDate);
              if (rInPeriod) repassesRealizados += r.value;
            } else if (r.status === 'Pendente' || r.status === 'Previsto') {
              const rInPeriod = matchesPeriod(r.expectedDate || r.paymentDate);
              if (rInPeriod) repassesPendentes += r.value;
            }
          });
        }
      } else {
        const pVal = tx.status === 'Paga' || tx.status === 'pago' ? tx.value : (tx.receivedValue || 0);
        totalAllPaid += pVal;

        if (txInPeriod) {
          if (tx.status === 'Paga' || tx.status === 'pago') {
            despesasRealizadas += tx.value;
          } else {
            contasPagar += (tx.value - pVal);
          }
        }
      }
    });

    const despesasETotaisRepasses = despesasRealizadas + repassesRealizados;
    const lucroLiquido = valorRecebido - despesasETotaisRepasses;
    const saldoCaixa = totalAllReceived - (totalAllPaid + totalAllRepassesRealizados);

    return {
      faturamentoPeriodo,
      valorRecebido,
      contasReceber,
      receitasVencidas,
      despesasRealizadas,
      despesasETotaisRepasses,
      contasPagar,
      lucroLiquido,
      saldoCaixa,
      repassesRealizados,
      repassesPendentes
    };
  }, [allTransactions, periodOption, customStartDate, customEndDate]);

  // Handle Form Submission for New Revenue or Expense
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || !formValue || parseFloat(formValue) <= 0) {
      alert('Preencha obrigatoriamente a descrição e um valor válido.');
      return;
    }

    const val = parseFloat(formValue);
    const numInstallments = parseInt(formInstallments) || 1;
    const recVal = formReceivedValue ? parseFloat(formReceivedValue) : (formStatus === 'Recebida' || formStatus === 'Paga' ? val : 0);
    const pendBal = Math.max(0, val - recVal);

    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();
    const formattedDateNow = now.toLocaleDateString('pt-BR');
    const formattedTimeNow = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (numInstallments > 1 && onAddBatchTransactions) {
      // Installment generation logic (Req 15)
      const installmentValue = parseFloat((val / numInstallments).toFixed(2));
      // eslint-disable-next-line react-hooks/purity
      const parentId = `parent-${Date.now()}`;
      const batchList: Omit<FinancialTransaction, 'id'>[] = [];

      for (let i = 1; i <= numInstallments; i++) {
        const d = new Date(formDueDate);
        d.setMonth(d.getMonth() + (i - 1));
        const dueISO = d.toISOString().split('T')[0];

        batchList.push({
          description: `${formDescription.trim()} (Parcela ${i}/${numInstallments})`,
          type: modalTransactionType,
          category: formCategory,
          value: installmentValue,
          client: formSelectedClient?.name || '',
          clientId: formSelectedClient?.id || '',
          process: formSelectedProcess?.cnj || 'Geral',
          processId: formSelectedProcess?.id || '',
          supplierOrBeneficiary: formSupplier || '',
          expectedDate: formExpectedDate,
          dueDate: dueISO,
          paymentMethod: formPaymentMethod,
          receivingAccount: formAccount,
          installmentsCount: numInstallments,
          installmentNumber: i,
          parentId,
          receivedValue: i === 1 ? recVal : 0,
          pendingBalance: i === 1 ? Math.max(0, installmentValue - recVal) : installmentValue,
          status: i === 1 ? (formStatus as any) : (modalTransactionType === 'revenue' ? 'A receber' : 'A pagar'),
          responsibleUser: currentUserLabel,
          observations: formObservations,
          attachmentName: formAttachmentName || undefined,
          history: [
            {
              // eslint-disable-next-line react-hooks/purity
              id: `h-${Date.now()}-${i}`,
              date: formattedDateNow,
              time: formattedTimeNow,
              user: currentUserLabel,
              action: 'Parcela Gerada',
              description: `Parcela ${i} de ${numInstallments} gerada com vencimento em ${formatDateBR(dueISO)}.`
            }
          ]
        });
      }

      onAddBatchTransactions(batchList);
      alert(`Sucesso! Foram geradas ${numInstallments} parcelas de ${formatBRL(installmentValue)}.`);
    } else {
      // Single transaction
      const newTx: Omit<FinancialTransaction, 'id'> = {
        description: formDescription.trim(),
        type: modalTransactionType,
        category: formCategory,
        value: val,
        client: formSelectedClient?.name || '',
        clientId: formSelectedClient?.id || '',
        process: formSelectedProcess?.cnj || 'Geral',
        processId: formSelectedProcess?.id || '',
        supplierOrBeneficiary: formSupplier || '',
        expectedDate: formExpectedDate,
        dueDate: formDueDate,
        receivedDate: formStatus === 'Recebida' ? formDueDate : undefined,
        paidDate: formStatus === 'Paga' ? formDueDate : undefined,
        paymentMethod: formPaymentMethod,
        receivingAccount: formAccount,
        installmentsCount: 1,
        installmentNumber: 1,
        isRecurring: formIsRecurring,
        recurrenceFrequency: formIsRecurring ? formRecurrenceFreq : undefined,
        receivedValue: recVal,
        pendingBalance: pendBal,
        status: formStatus as any,
        responsibleUser: currentUserLabel,
        observations: formObservations,
        attachmentName: formAttachmentName || undefined,
        history: [
          {
            // eslint-disable-next-line react-hooks/purity
            id: `h-${Date.now()}`,
            date: formattedDateNow,
            time: formattedTimeNow,
            user: currentUserLabel,
            action: 'Lançamento Registrado',
            description: `${modalTransactionType === 'revenue' ? 'Entrada' : 'Saída'} no valor de ${formatBRL(val)} cadastrada.`
          }
        ]
      };

      onAddTransaction(newTx);
      alert('Lançamento financeiro cadastrado com sucesso!');
    }

    // Reset Form
    resetForm();
    setIsNewTransactionModalOpen(false);
  };

  const resetForm = () => {
    setFormDescription('');
    setFormCategory('Honorários contratuais');
    setFormValue('');
    setFormSupplier('');
    setFormSelectedClient(null);
    setFormSelectedProcess(null);
    setFormExpectedDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('Pix');
    setFormAccount('Conta Única');
    setFormInstallments('1');
    setIsCustomInstallments(false);
    setFormIsRecurring(false);
    setFormReceivedValue('');
    setFormStatus('A receber');
    setFormObservations('');
    setFormAttachmentName('');
  };

  // Open New Transaction Modal
  const openNewTransactionModal = (type: 'revenue' | 'expense') => {
    setModalTransactionType(type);
    setFormCategory(type === 'revenue' ? 'Honorários contratuais' : 'Custas processuais');
    setFormStatus(type === 'revenue' ? 'A receber' : 'A pagar');
    setIsNewTransactionModalOpen(true);
  };

  // Quick Action Handler: Register Payment / Receipt (Req 17)
  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForPayment || !onUpdateTransaction) return;

    const payVal = parseFloat(paymentAmount);
    if (isNaN(payVal) || payVal <= 0) {
      alert('Informe um valor de pagamento válido.');
      return;
    }

    const currentReceived = selectedTxForPayment.receivedValue || 0;
    const newTotalReceived = currentReceived + payVal;
    const isFull = newTotalReceived >= selectedTxForPayment.value;
    const newPending = Math.max(0, selectedTxForPayment.value - newTotalReceived);

    const isRevenue = selectedTxForPayment.type === 'revenue';
    let newStatus = selectedTxForPayment.status;
    if (isRevenue) {
      newStatus = isFull ? 'Recebida' : 'Parcialmente recebida';
    } else {
      newStatus = isFull ? 'Paga' : 'Parcialmente paga';
    }

    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();
    const formattedDateNow = now.toLocaleDateString('pt-BR');
    const formattedTimeNow = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newHistoryItem: FinancialHistoryLog = {
      id: `h-${Date.now()}`,
      date: formattedDateNow,
      time: formattedTimeNow,
      user: currentUserLabel,
      action: isRevenue ? 'Recebimento Registrado' : 'Pagamento Registrado',
      description: `Registrado ${isRevenue ? 'recebimento' : 'pagamento'} de ${formatBRL(payVal)} via ${paymentMethodInput} na conta ${paymentAccountInput}.`,
      previousValue: formatBRL(currentReceived),
      newValue: formatBRL(newTotalReceived),
      previousStatus: selectedTxForPayment.status,
      newStatus: newStatus
    };

    const updatedTx: FinancialTransaction = {
      ...selectedTxForPayment,
      receivedValue: newTotalReceived,
      pendingBalance: newPending,
      receivedDate: isRevenue ? paymentDateInput : selectedTxForPayment.receivedDate,
      paidDate: !isRevenue ? paymentDateInput : selectedTxForPayment.paidDate,
      paymentMethod: paymentMethodInput,
      receivingAccount: paymentAccountInput,
      status: newStatus as any,
      history: [newHistoryItem, ...(selectedTxForPayment.history || [])]
    };

    onUpdateTransaction(updatedTx);
    setSelectedTxForPayment(null);
    alert(`${isRevenue ? 'Recebimento' : 'Pagamento'} de ${formatBRL(payVal)} confirmado com sucesso!`);
  };

  // Quick Action Handler: Create Repasse (Req 10 & 11)
  const handleCreateRepasse = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTx = repasseOriginTx || allTransactions.find(t => t.id === selectedOriginTxId);

    const repVal = parseFloat(repasseValue);
    if (isNaN(repVal) || repVal <= 0) {
      alert('Informe um valor de repasse válido.');
      return;
    }

    const newRepasse: RepasseItem = {
      id: `rep-${Date.now()}`,
      incomeOriginId: targetTx ? targetTx.id : 'rep-direct',
      incomeDescription: targetTx ? (targetTx.description || `Receita de ${targetTx.client}`) : 'Repasse Direto à Equipe',
      client: targetTx ? targetTx.client : 'Geral Escritório',
      process: targetTx ? targetTx.process : 'Geral',
      professionalBeneficiary: repasseBeneficiary,
      value: repVal,
      percentage: repassePercentage ? parseFloat(repassePercentage) : undefined,
      expectedDate: repasseExpectedDate,
      status: 'Pendente',
      registeredBy: currentUser?.name || 'Membro da Equipe',
      observations: repasseObs
    };

    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();

    if (targetTx && onUpdateTransaction) {
      const updatedRepasses = [...(targetTx.repasses || []), newRepasse];
      const updatedTx: FinancialTransaction = {
        ...targetTx,
        repasses: updatedRepasses,
        history: [
          {
            id: `h-${Date.now()}`,
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            user: currentUserLabel,
            action: 'Repasse Vinculado',
            description: `Repasse de ${formatBRL(repVal)} registrado para ${repasseBeneficiary}.`
          },
          ...(targetTx.history || [])
        ]
      };
      onUpdateTransaction(updatedTx);
    } else if (onAddTransaction) {
      const newTx: Omit<FinancialTransaction, 'id'> = {
        description: `Lançamento de Repasse - ${repasseBeneficiary}`,
        type: 'revenue',
        category: 'Honorários contratuais',
        value: repVal,
        client: 'Escritório Geral',
        process: 'Geral',
        expectedDate: repasseExpectedDate,
        dueDate: repasseExpectedDate,
        paymentMethod: 'Pix',
        receivingAccount: 'Conta Única',
        receivedValue: 0,
        pendingBalance: repVal,
        status: 'A receber',
        responsibleUser: currentUserLabel,
        observations: repasseObs,
        repasses: [newRepasse],
        history: [
          {
            id: `h-${Date.now()}`,
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            user: currentUserLabel,
            action: 'Repasse Cadastrado',
            description: `Repasse de ${formatBRL(repVal)} cadastrado para ${repasseBeneficiary}.`
          }
        ]
      };
      onAddTransaction(newTx);
    }

    setIsRepasseModalOpen(false);
    setRepasseOriginTx(null);
    setSelectedOriginTxId('');
    setRepasseSearchQuery('');
    setRepasseValue('');
    setRepassePercentage('');
    setRepasseObs('');
    alert(`Repasse para ${repasseBeneficiary} registrado com sucesso!`);
  };

  // Open Edit Repasse Modal
  const handleOpenEditRepasse = (repasseItem: RepasseItem & { parentTx: FinancialTransaction }) => {
    setEditingRepasse({ item: repasseItem });
    setEditRepasseBeneficiary(repasseItem.professionalBeneficiary || 'Larissa Paiva');
    setEditRepasseValue(repasseItem.value.toString());
    setEditRepassePercentage(repasseItem.percentage ? repasseItem.percentage.toString() : '');
    setEditRepasseExpectedDate(repasseItem.expectedDate || new Date().toISOString().split('T')[0]);
    setEditRepassePaymentDate(repasseItem.paymentDate || (repasseItem.status === 'Realizado' ? new Date().toISOString().split('T')[0] : ''));
    const initialStatus = (repasseItem.status === 'Realizado' || repasseItem.status === 'Cancelado') ? repasseItem.status : 'Pendente';
    setEditRepasseStatus(initialStatus);
    setEditRepasseObs(repasseItem.observations || '');
  };

  // Save Edit Repasse
  const handleSaveEditRepasse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepasse || !onUpdateTransaction) return;

    const val = parseFloat(editRepasseValue);
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor válido para o repasse.');
      return;
    }

    const { item } = editingRepasse;
    const parentTx = item.parentTx;
    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();

    const updatedRepasse: RepasseItem = {
      ...item,
      professionalBeneficiary: editRepasseBeneficiary,
      value: val,
      percentage: editRepassePercentage ? parseFloat(editRepassePercentage) : undefined,
      expectedDate: editRepasseExpectedDate,
      paymentDate: editRepasseStatus === 'Realizado' ? (editRepassePaymentDate || new Date().toISOString().split('T')[0]) : undefined,
      status: editRepasseStatus,
      observations: editRepasseObs
    };

    const updatedRepassesList = (parentTx.repasses || []).map(r => r.id === item.id ? updatedRepasse : r);

    const updatedTx: FinancialTransaction = {
      ...parentTx,
      repasses: updatedRepassesList,
      history: [
        {
          id: `h-${Date.now()}`,
          date: now.toLocaleDateString('pt-BR'),
          time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          user: currentUserLabel,
          action: 'Repasse Editado',
          description: `Repasse para ${editRepasseBeneficiary} alterado para ${formatBRL(val)} (${editRepasseStatus}).`
        },
        ...(parentTx.history || [])
      ]
    };

    onUpdateTransaction(updatedTx);
    setEditingRepasse(null);
    alert('Repasse atualizado com sucesso!');
  };

  // Delete Repasse
  const handleDeleteRepasse = (repasseItem: RepasseItem & { parentTx: FinancialTransaction }) => {
    if (!onUpdateTransaction) return;

    const confirmMsg = `Tem certeza que deseja excluir o repasse de ${formatBRL(repasseItem.value)} para ${repasseItem.professionalBeneficiary}?`;
    if (!window.confirm(confirmMsg)) return;

    const parentTx = repasseItem.parentTx;
    const updatedRepasses = (parentTx.repasses || []).filter(r => r.id !== repasseItem.id);

    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();

    const updatedTx: FinancialTransaction = {
      ...parentTx,
      repasses: updatedRepasses,
      history: [
        {
          id: `h-${Date.now()}`,
          date: now.toLocaleDateString('pt-BR'),
          time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          user: currentUserLabel,
          action: 'Repasse Excluído',
          description: `Repasse de ${formatBRL(repasseItem.value)} para ${repasseItem.professionalBeneficiary} foi excluído.`
        },
        ...(parentTx.history || [])
      ]
    };

    onUpdateTransaction(updatedTx);
    alert('Repasse excluído com sucesso.');
  };

  // Quick Action Handler: Cancel or Refund (Req 19)
  const handleConfirmCancelOrRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTx || !onUpdateTransaction) return;

    if (!cancelJustification.trim()) {
      alert('É obrigatório informar o motivo/justificativa.');
      return;
    }

    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();
    const formattedDateNow = now.toLocaleDateString('pt-BR');
    const formattedTimeNow = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newStatus = cancelActionType === 'cancelar' ? 'Cancelada' : 'Estornada';

    const updatedTx: FinancialTransaction = {
      ...cancelTx,
      status: newStatus as any,
      cancelReason: cancelJustification,
      cancelUser: currentUserLabel,
      cancelDate: formattedDateNow,
      history: [
        {
          id: `h-${Date.now()}`,
          date: formattedDateNow,
          time: formattedTimeNow,
          user: currentUserLabel,
          action: cancelActionType === 'cancelar' ? 'Lançamento Cancelado' : 'Lançamento Estornado',
          description: `${cancelActionType === 'cancelar' ? 'Cancelamento' : 'Estorno'} efetuado. Motivo: "${cancelJustification}".`,
          previousStatus: cancelTx.status,
          newStatus: newStatus,
          justification: cancelJustification
        },
        ...(cancelTx.history || [])
      ]
    };

    onUpdateTransaction(updatedTx);
    setIsCancelModalOpen(false);
    setCancelTx(null);
    setCancelJustification('');
    alert(`Operação concluída. Lançamento ${newStatus.toLowerCase()} com registro em histórico.`);
  };

  // Quick Action Handler: Save Collection Providências (Req 8)
  const handleSaveCollectionNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionTx || !onUpdateTransaction) return;

    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();

    const updatedTx: FinancialTransaction = {
      ...collectionTx,
      lastContactDate: collectionContactDate || now.toLocaleDateString('pt-BR'),
      nextCollectionStep: collectionNextStep,
      history: [
        {
          id: `h-${Date.now()}`,
          date: now.toLocaleDateString('pt-BR'),
          time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          user: currentUserLabel,
          action: 'Cobrança Atualizada',
          description: `Último contato: ${collectionContactDate}. Próxima providência: "${collectionNextStep}".`
        },
        ...(collectionTx.history || [])
      ]
    };

    onUpdateTransaction(updatedTx);
    setIsCollectionModalOpen(false);
    setCollectionTx(null);
    alert('Informações de cobrança registradas com sucesso!');
  };

  // Open Edit Modal Handler
  const handleOpenEditModal = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setEditDescription(tx.description || '');
    setEditCategory(tx.category || (tx.type === 'revenue' ? 'Honorários contratuais' : 'Custas processuais'));
    setEditValue(tx.value ? tx.value.toString() : '');
    setEditClient(tx.client || '');
    setEditProcess(tx.process || '');
    setEditSupplier(tx.supplierOrBeneficiary || '');
    setEditExpectedDate(tx.expectedDate || tx.dueDate || new Date().toISOString().split('T')[0]);
    setEditDueDate(tx.dueDate || new Date().toISOString().split('T')[0]);
    setEditPaidDate(tx.paidDate || (tx.status === 'Paga' || tx.status === 'pago' ? (tx.dueDate || new Date().toISOString().split('T')[0]) : ''));
    setEditReceivedDate(tx.receivedDate || (tx.status === 'Recebida' || tx.status === 'pago' ? (tx.dueDate || new Date().toISOString().split('T')[0]) : ''));
    setEditStatus(tx.status || (tx.type === 'revenue' ? 'A receber' : 'A pagar'));
    setEditPaymentMethod(tx.paymentMethod || 'Pix');
    setEditAccount(tx.receivingAccount || 'Conta Única');
    setEditObservations(tx.observations || '');
    setIsEditModalOpen(true);
  };

  // Save Edited Transaction Handler
  const handleSaveEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !onUpdateTransaction) return;

    if (!editDescription.trim() || !editValue || parseFloat(editValue) <= 0) {
      alert('Informe uma descrição válida e um valor maior que zero.');
      return;
    }

    const val = parseFloat(editValue);
    const currentUserLabel = currentUser?.name || 'Membro da Equipe';
    const now = new Date();
    const formattedDateNow = now.toLocaleDateString('pt-BR');
    const formattedTimeNow = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const isPaid = editStatus === 'Paga' || editStatus === 'pago';
    const isReceived = editStatus === 'Recebida' || editStatus === 'pago';
    const isPartialPaid = editStatus === 'Parcialmente paga';
    const isPartialReceived = editStatus === 'Parcialmente recebida';
    const isPaidOrReceived = isPaid || isReceived || isPartialPaid || isPartialReceived;
    const recVal = isPaidOrReceived ? val : (editingTx.receivedValue || 0);

    const calcPaidDate = isPaid ? (editPaidDate || editDueDate || formattedDateNow) : (isPartialPaid ? (editPaidDate || editingTx.paidDate) : undefined);
    const calcReceivedDate = isReceived ? (editReceivedDate || editDueDate || formattedDateNow) : (isPartialReceived ? (editReceivedDate || editingTx.receivedDate) : undefined);

    const updatedTx: FinancialTransaction = {
      ...editingTx,
      description: editDescription.trim(),
      category: editCategory,
      value: val,
      client: editClient,
      process: editProcess,
      supplierOrBeneficiary: editSupplier,
      expectedDate: editExpectedDate || editDueDate,
      dueDate: editDueDate,
      paidDate: calcPaidDate,
      receivedDate: calcReceivedDate,
      status: editStatus as any,
      paymentMethod: editPaymentMethod,
      receivingAccount: editAccount,
      observations: editObservations,
      receivedValue: recVal,
      pendingBalance: Math.max(0, val - recVal),
      updatedAt: Date.now(),
      history: [
        {
          id: `h-${Date.now()}`,
          date: formattedDateNow,
          time: formattedTimeNow,
          user: currentUserLabel,
          action: 'Lançamento Editado',
          description: `Alteração realizada no lançamento: ${editDescription.trim()} - R$ ${val} (${editStatus}).`
        },
        ...(editingTx.history || [])
      ]
    };

    onUpdateTransaction(updatedTx);
    setIsEditModalOpen(false);
    setEditingTx(null);
    if (selectedTxForDetail?.id === updatedTx.id) {
      setSelectedTxForDetail(updatedTx);
    }
    alert('Lançamento atualizado com sucesso!');
  };

  // Delete Transaction Handler
  const handleDeleteTx = (tx: FinancialTransaction) => {
    if (window.confirm(`Tem certeza que deseja apagar o lançamento "${tx.description || tx.client || 'este lançamento'}"? Esta ação não pode ser desfeita.`)) {
      if (onDeleteTransaction) {
        onDeleteTransaction(tx.id);
        if (selectedTxForDetail?.id === tx.id) {
          setSelectedTxForDetail(null);
        }
        alert('Lançamento excluído com sucesso!');
      }
    }
  };

  // Print Report Action (Req 23)
  const handlePrintReport = () => {
    window.print();
  };

  // Check Restricted View
  if (isUnauthorized) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto my-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-[#0d2f43] mb-2">Acesso Restrito ao Módulo Financeiro</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
          Por motivos de sigilo e políticas internas do escritório, o acesso ao faturamento, receitas e despesas é restrito aos gestores, sócios e equipe financeira.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
          <Shield className="w-4 h-4 text-slate-400" />
          <span>Perfil atual: {currentUser?.role || 'Usuário Limitado'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 print:p-0 print:gap-4">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#0d2f43]">PCG.OS - Advocacia & Consultoria</h1>
            <p className="text-xs text-slate-600 font-bold mt-0.5">Relatório do Controle Financeiro do Escritório</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold">Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            <p>Filtro Período: <span className="uppercase font-semibold">{periodOption}</span></p>
          </div>
        </div>
        <div className="mt-3 text-xs bg-slate-100 p-2.5 rounded border border-slate-200 grid grid-cols-4 gap-2 font-mono">
          <div><strong>Faturamento:</strong> {formatBRL(stats.faturamentoPeriodo)}</div>
          <div><strong>Recebido:</strong> {formatBRL(stats.valorRecebido)}</div>
          <div><strong>Despesas:</strong> {formatBRL(stats.despesasRealizadas)}</div>
          <div><strong>Lucro Líquido:</strong> {formatBRL(stats.lucroLiquido)}</div>
        </div>
      </div>

      {/* Screen Header & Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold text-[#0d2f43] tracking-tight">Módulo Financeiro</h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
              Ambiente Seguro
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central de receitas, honorários, contas a pagar/receber, repasses e fluxo de caixa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openNewTransactionModal('revenue')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Entrada</span>
          </button>

          <button
            onClick={() => openNewTransactionModal('expense')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Saída</span>
          </button>

          <button
            onClick={() => {
              setRepasseOriginTx(null);
              setSelectedOriginTxId('');
              setIsRepasseModalOpen(true);
            }}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>+ Novo Repasse</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* 1. FILTRO GERAL DE PERÍODO (Req 1) - Hidden when printing */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0d2f43]" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Período:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: 'hoje', label: 'Hoje' },
              { key: 'semana', label: 'Semana' },
              { key: 'mes', label: 'Mês' },
              { key: 'trimestre', label: 'Trimestre' },
              { key: 'semestre', label: 'Semestre' },
              { key: 'ano', label: 'Ano' },
              { key: 'custom', label: 'Personalizado' },
              { key: 'todos', label: 'Todo Período' }
            ] as const
          ).map(p => (
            <button
              key={p.key}
              onClick={() => setPeriodOption(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodOption === p.key
                  ? 'bg-[#0d2f43] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {periodOption === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded font-mono bg-white outline-none"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded font-mono bg-white outline-none"
            />
          </div>
        )}
      </div>

      {/* 2. INDICADORES PRINCIPAIS (Req 2) - Clickable Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:grid-cols-5 print:gap-2">
        {/* Card 1: Faturamento */}
        <div 
          onClick={() => { setActiveTab('entradas'); setStatusFilter('todos'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturamento</span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-100 transition-all">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-slate-800 tracking-tight">{formatBRL(stats.faturamentoPeriodo)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total previsto no período</p>
        </div>

        {/* Card 2: Valor Recebido */}
        <div 
          onClick={() => { setActiveTab('entradas'); setStatusFilter('recebida'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Recebido</span>
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded group-hover:bg-emerald-100 transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-emerald-600 tracking-tight">{formatBRL(stats.valorRecebido)}</p>
          <p className="text-[10px] text-emerald-700/70 font-medium mt-0.5">Receita caixa confirmada</p>
        </div>

        {/* Card 3: Contas a Receber */}
        <div 
          onClick={() => { setActiveTab('contas_receber'); setStatusFilter('todos'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Receber</span>
            <span className="p-1 bg-amber-50 text-amber-600 rounded group-hover:bg-amber-100 transition-all">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-amber-600 tracking-tight">{formatBRL(stats.contasReceber)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pendentes de quitação</p>
        </div>

        {/* Card 4: Receitas Vencidas */}
        <div 
          onClick={() => { setActiveTab('contas_receber'); setStatusFilter('vencidas'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-red-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entradas Vencidas</span>
            <span className="p-1 bg-red-50 text-red-600 rounded group-hover:bg-red-100 transition-all">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-red-600 tracking-tight">{formatBRL(stats.receitasVencidas)}</p>
          <p className="text-[10px] text-red-500/80 font-medium mt-0.5">Cobranças em atraso</p>
        </div>

        {/* Card 5: Despesas Realizadas */}
        <div 
          onClick={() => { setActiveTab('saidas'); setStatusFilter('paga'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Despesas Pagas</span>
            <span className="p-1 bg-rose-50 text-rose-600 rounded group-hover:bg-rose-100 transition-all">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-rose-600 tracking-tight">{formatBRL(stats.despesasRealizadas)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Saídas liquidadas</p>
        </div>

        {/* Card 6: Contas a Pagar */}
        <div 
          onClick={() => { setActiveTab('contas_pagar'); setStatusFilter('todos'); }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contas a Pagar</span>
            <span className="p-1 bg-slate-100 text-slate-600 rounded group-hover:bg-slate-200 transition-all">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-slate-700 tracking-tight">{formatBRL(stats.contasPagar)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Compromissos a vencer</p>
        </div>

        {/* Card 7: Lucro Líquido */}
        <div 
          onClick={() => setActiveTab('visao_geral')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucro Líquido</span>
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded">
              <PieChart className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className={`text-lg font-black tracking-tight ${stats.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatBRL(stats.lucroLiquido)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Resultado do período</p>
        </div>

        {/* Card 8: Saldo em Caixa */}
        <div 
          onClick={() => setActiveTab('visao_geral')}
          className="p-4 rounded-xl border border-none bg-gradient-to-br from-[#0d2f43] to-[#1a4a68] text-white shadow-2xs hover:opacity-95 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Saldo em Caixa</span>
            <span className="p-1 bg-white/10 text-white rounded">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black tracking-tight">{formatBRL(stats.saldoCaixa)}</p>
          <p className="text-[10px] text-blue-200 font-medium mt-0.5">Acumulado total de caixa</p>
        </div>

        {/* Card 9: Repasses Realizados */}
        <div 
          onClick={() => setActiveTab('repasses')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repasses Pagos</span>
            <span className="p-1 bg-purple-50 text-purple-600 rounded group-hover:bg-purple-100 transition-all">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-purple-700 tracking-tight">{formatBRL(stats.repassesRealizados)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Distribuídos à equipe</p>
        </div>

        {/* Card 10: Repasses Pendentes */}
        <div 
          onClick={() => setActiveTab('repasses')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repasses Pendentes</span>
            <span className="p-1 bg-indigo-50 text-indigo-600 rounded group-hover:bg-indigo-100 transition-all">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-lg font-black text-indigo-600 tracking-tight">{formatBRL(stats.repassesPendentes)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">A repassar à equipe</p>
        </div>
      </div>

      {/* 3. ORGANIZAÇÃO DA PÁGINA - ABAS (Req 3) - Hidden when printing */}
      <div className="border-b border-slate-200 flex items-center justify-between overflow-x-auto no-scrollbar print:hidden">
        <div className="flex gap-1 min-w-max">
          {[
            { id: 'visao_geral', label: 'Visão Geral' },
            { id: 'entradas', label: 'Entradas' },
            { id: 'saidas', label: 'Saídas' },
            { id: 'contas_receber', label: 'Contas a Receber' },
            { id: 'contas_pagar', label: 'Contas a Pagar' },
            { id: 'repasses', label: 'Repasses' },
            { id: 'historico', label: 'Histórico de Movimentações' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setStatusFilter('todos'); }}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#0d2f43] text-[#0d2f43] bg-slate-50/80'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 20. BARRA DE PESQUISA E FILTROS COMPLEMENTARES (Req 20) - Hidden when printing */}
      {activeTab !== 'visao_geral' && activeTab !== 'historico' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por descrição, cliente, processo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#0d2f43]/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Sub-Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="A receber">A receber</option>
              <option value="Recebida">Recebida</option>
              <option value="A pagar">A pagar</option>
              <option value="Paga">Paga</option>
              <option value="vencidas">Vencidas</option>
              <option value="Cancelada">Cancelada / Estornada</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 outline-none"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="Honorários contratuais">Honorários contratuais</option>
              <option value="Honorários de êxito">Honorários de êxito</option>
              <option value="Honorários sucumbenciais">Honorários sucumbenciais</option>
              <option value="Consulta jurídica">Consulta jurídica</option>
              <option value="Custas processuais">Custas processuais</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Sistemas e assinaturas">Sistemas e assinaturas</option>
            </select>

            {/* Reset Filters */}
            {(searchQuery || statusFilter !== 'todos' || categoryFilter !== 'todos') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('todos'); setCategoryFilter('todos'); }}
                className="p-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                title="Limpar Filtros"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: VISÃO GERAL */}
      {activeTab === 'visao_geral' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumo de Caixa e Balanço */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#0d2f43]">Balanço Financeiro do Período</h3>
                    <p className="text-[11px] text-slate-500">Comparativo entre faturamento, receitas arrecadadas e despesas liquidadas.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-600">
                    Período: <span className="uppercase">{periodOption}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Receita Confirmada</span>
                    <span className="text-xl font-black text-emerald-700">{formatBRL(stats.valorRecebido)}</span>
                  </div>

                  <div className="bg-rose-50/60 p-3.5 rounded-lg border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">Despesas & Repasses Pagos</span>
                    <span className="text-xl font-black text-rose-700">{formatBRL(stats.despesasETotaisRepasses)}</span>
                    <span className="text-[9px] text-rose-600 block mt-0.5 font-mono">
                      (Despesas: {formatBRL(stats.despesasRealizadas)} + Repasses: {formatBRL(stats.repassesRealizados)})
                    </span>
                  </div>

                  <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">Resultado Líquido</span>
                    <span className={`text-xl font-black ${stats.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatBRL(stats.lucroLiquido)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress visual bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>Comprometimento das Receitas com Despesas & Repasses</span>
                  <span>{stats.valorRecebido > 0 ? Math.min(100, Math.round((stats.despesasETotaisRepasses / stats.valorRecebido) * 100)) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-rose-500 h-full transition-all" 
                    style={{ width: `${stats.valorRecebido > 0 ? Math.min(100, (stats.despesasETotaisRepasses / stats.valorRecebido) * 100) : 0}%` }}
                  />
                  <div 
                    className="bg-emerald-500 h-full flex-1 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Ações Rápidas em Destaque */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0d2f43] mb-1">Ações Rápidas do Financeiro</h3>
                <p className="text-[11px] text-slate-500 mb-4">Lançamentos expressos e consultas do dia.</p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => openNewTransactionModal('revenue')}
                    className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Lançar Nova Entrada (Receita / Honorário)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                  </button>

                  <button
                    onClick={() => openNewTransactionModal('expense')}
                    className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-rose-600" />
                      <span>Lançar Nova Saída (Despesa / Custo)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-500" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('repasses'); }}
                    className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Gerenciar Repasses aos Advogados</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-500" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                <span>Total de Movimentações:</span>
                <span className="font-bold text-slate-800">{filteredTransactions.length} registros</span>
              </div>
            </div>
          </div>

          {/* Últimas Movimentações */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0d2f43]">Últimas Movimentações Registradas</h3>
                <p className="text-[11px] text-slate-500">Fluxo de caixa efetivamente realizado (Entradas, Saídas e Repasses executados).</p>
              </div>
              <button
                onClick={() => setActiveTab('entradas')}
                className="text-xs font-bold text-[#0d2f43] hover:underline flex items-center gap-1"
              >
                <span>Ver Entradas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Tipo / Descrição</th>
                    <th className="py-2.5 px-3">Cliente / Beneficiário</th>
                    <th className="py-2.5 px-3">Data Baixa / Efetiva</th>
                    <th className="py-2.5 px-3">Valor Realizado</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ultimasMovimentacoes.slice(0, 10).map(mov => (
                    <tr key={mov.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            mov.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' :
                            mov.type === 'saida' ? 'bg-rose-50 text-rose-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {mov.type === 'entrada' ? <ArrowUpRight className="w-4 h-4" /> :
                             mov.type === 'saida' ? <ArrowDownRight className="w-4 h-4" /> :
                             <Users className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{mov.description}</p>
                            <p className="text-[10px] text-slate-400">{mov.category || mov.type.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-700">{mov.clientOrBeneficiary}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{mov.process}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatDateBR(mov.effectiveDate)}
                      </td>
                      <td className={`py-3 px-3 font-bold font-mono ${
                        mov.type === 'entrada' ? 'text-emerald-700' :
                        mov.type === 'saida' ? 'text-rose-600' :
                        'text-purple-700'
                      }`}>
                        {mov.type === 'entrada' ? '+' : '-'} {formatBRL(mov.value)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {mov.status === 'pago' ? 'Realizado' : mov.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedTxForDetail(mov.originalTx)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ultimasMovimentacoes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Nenhuma movimentação realizada no período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ENTRADAS (Somente Receitas Efetivamente Recebidas) */}
      {activeTab === 'entradas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-display font-bold text-sm text-[#0d2f43]">Entradas Efetivamente Recebidas (Fluxo de Caixa Realizado)</h3>
              <p className="text-[11px] text-slate-500">
                Mostrando {entradasList.length} recebimentos efetuados no período (Ordenados cronologicamente por data de recebimento).
              </p>
            </div>
            <button
              onClick={() => openNewTransactionModal('revenue')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Entrada</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3">Descrição / Categoria</th>
                  <th className="py-3 px-3">Cliente / Pagador</th>
                  <th className="py-3 px-3">Processo Ref.</th>
                  <th className="py-3 px-3">Data Recebimento</th>
                  <th className="py-3 px-3">Valor Recebido</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entradasList.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800">{tx.description || tx.category}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">{tx.category}</span>
                        {tx.installmentsCount && tx.installmentsCount > 1 && (
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                            Parcela {tx.installmentNumber}/{tx.installmentsCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-700">{tx.client || 'Geral Escritório'}</p>
                      <p className="text-[10px] text-slate-400">Resp: {tx.responsibleUser}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {tx.process || 'Sem vínculo'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-emerald-800 font-bold">
                      {formatDateBR(tx.receivedDate || tx.dueDate || tx.date)}
                    </td>
                    <td className="py-3.5 px-3 font-bold font-mono text-emerald-700">
                      {formatBRL(tx.receivedValue || tx.value)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTxForDetail(tx)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setRepasseOriginTx(tx); setIsRepasseModalOpen(true); }}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded"
                          title="Criar Repasse a Profissional"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                          title="Editar Lançamento"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTx(tx)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded"
                          title="Apagar Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entradasList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Nenhuma entrada efetivamente recebida para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SAÍDAS (Somente Despesas Efetivamente Pagas) */}
      {activeTab === 'saidas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-display font-bold text-sm text-[#0d2f43]">Saídas Efetivamente Pagas (Despesas Liquidadas)</h3>
              <p className="text-[11px] text-slate-500">
                Mostrando {saidasList.length} pagamentos realizados no período (Ordenados cronologicamente por data de pagamento).
              </p>
            </div>
            <button
              onClick={() => openNewTransactionModal('expense')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Saída</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3">Descrição / Categoria</th>
                  <th className="py-3 px-3">Fornecedor / Beneficiário</th>
                  <th className="py-3 px-3">Processo Ref.</th>
                  <th className="py-3 px-3">Data Pagamento</th>
                  <th className="py-3 px-3">Valor Pago</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saidasList.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800">{tx.description || tx.category}</p>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500">{tx.category}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-700">{tx.supplierOrBeneficiary || tx.client || 'Geral'}</p>
                      <p className="text-[10px] text-slate-400">Resp: {tx.responsibleUser}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {tx.process || 'Sem vínculo'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-rose-800 font-bold">
                      {formatDateBR(tx.paidDate || tx.dueDate || tx.date)}
                    </td>
                    <td className="py-3.5 px-3 font-bold font-mono text-rose-600">
                      {formatBRL(tx.receivedValue || tx.value)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTxForDetail(tx)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                          title="Editar Lançamento"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTx(tx)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded"
                          title="Apagar Lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {saidasList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Nenhuma saída efetivamente realizada para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTAS A RECEBER (Previsões e Pendências de Receita) */}
      {activeTab === 'contas_receber' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-amber-50/50">
            <div>
              <h3 className="font-display font-bold text-sm text-amber-900">Contas a Receber (Honorários Previstos e Inadimplências)</h3>
              <p className="text-[11px] text-amber-700">
                Mostrando {contasReceberList.length} parcelas e honorários pendentes (Ordenados por vencimento).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3">Descrição / Categoria</th>
                  <th className="py-3 px-3">Cliente Ref.</th>
                  <th className="py-3 px-3">Vencimento</th>
                  <th className="py-3 px-3">Valor Previsto</th>
                  <th className="py-3 px-3">Já Recebido</th>
                  <th className="py-3 px-3">Saldo Pendente</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ação / Dar Baixa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contasReceberList.map(tx => {
                  const isOverdue = tx.status === 'Vencida' || tx.status === 'atrasado';
                  const pendingBal = tx.pendingBalance || (tx.value - (tx.receivedValue || 0));

                  return (
                    <tr key={tx.id} className="hover:bg-amber-50/30 transition-all">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800">{tx.description || tx.category}</p>
                        <p className="text-[10px] text-slate-400">{tx.category}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-700">{tx.client}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{tx.process}</p>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold">
                        <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'}>
                          {formatDateBR(tx.dueDate)}
                        </span>
                        {isOverdue && <span className="block text-[9px] font-bold text-red-600">INADIMPLENTE</span>}
                      </td>
                      <td className="py-3.5 px-3 font-bold font-mono text-slate-700">
                        {formatBRL(tx.value)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-emerald-700 font-medium">
                        {formatBRL(tx.receivedValue || 0)}
                      </td>
                      <td className="py-3.5 px-3 font-bold font-mono text-amber-700">
                        {formatBRL(pendingBal)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTxForPayment(tx);
                              setPaymentAmount(pendingBal.toString());
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Dar Baixa (Receber)</span>
                          </button>
                          <button
                            onClick={() => {
                              setCollectionTx(tx);
                              setCollectionContactDate(tx.lastContactDate || new Date().toLocaleDateString('pt-BR'));
                              setCollectionNextStep(tx.nextCollectionStep || '');
                              setIsCollectionModalOpen(true);
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded"
                            title="Registrar Cobrança"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {contasReceberList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      Nenhuma conta a receber pendente para o período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTAS A PAGAR (Obrigações e Compromissos Pendentes) */}
      {activeTab === 'contas_pagar' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-rose-50/50">
            <div>
              <h3 className="font-display font-bold text-sm text-rose-900">Contas a Pagar (Obrigações e Despesas Pendentes)</h3>
              <p className="text-[11px] text-rose-700">
                Mostrando {contasPagarList.length} obrigações a vencer/vencidas (Ordenadas por vencimento).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3">Descrição / Categoria</th>
                  <th className="py-3 px-3">Fornecedor / Favorecido</th>
                  <th className="py-3 px-3">Vencimento</th>
                  <th className="py-3 px-3">Valor Total</th>
                  <th className="py-3 px-3">Já Pago</th>
                  <th className="py-3 px-3">Saldo Devedor</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Ação / Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contasPagarList.map(tx => {
                  const isOverdue = tx.status === 'Vencida' || tx.status === 'atrasado';
                  const pendingBal = tx.pendingBalance || (tx.value - (tx.receivedValue || 0));

                  return (
                    <tr key={tx.id} className="hover:bg-rose-50/30 transition-all">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800">{tx.description || tx.category}</p>
                        <p className="text-[10px] text-slate-400">{tx.category}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-700">{tx.supplierOrBeneficiary || 'Geral'}</p>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold">
                        <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'}>
                          {formatDateBR(tx.dueDate)}
                        </span>
                        {isOverdue && <span className="block text-[9px] font-bold text-red-600">VENCIDA</span>}
                      </td>
                      <td className="py-3.5 px-3 font-bold font-mono text-slate-700">
                        {formatBRL(tx.value)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-emerald-700 font-medium">
                        {formatBRL(tx.receivedValue || 0)}
                      </td>
                      <td className="py-3.5 px-3 font-bold font-mono text-rose-700">
                        {formatBRL(pendingBal)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTxForPayment(tx);
                            setPaymentAmount(pendingBal.toString());
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 justify-end ml-auto"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pagar / Baixar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {contasPagarList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      Nenhuma conta a pagar pendente para o período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTROLE DE REPASSES (Req 10 & 11) */}
      {activeTab === 'repasses' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0d2f43]">Controle de Repasses aos Profissionais</h3>
                <p className="text-[11px] text-slate-500">
                  Distribuição de honorários e comissões para advogados e sócios da equipe.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                  Total Repassado: {formatBRL(stats.repassesRealizados)}
                </span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                  Pendente: {formatBRL(stats.repassesPendentes)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Profissional Beneficiário</th>
                    <th className="py-2.5 px-3">Receita de Origem</th>
                    <th className="py-2.5 px-3">Cliente / Processo</th>
                    <th className="py-2.5 px-3">Data do Repasse</th>
                    <th className="py-2.5 px-3">Valor / %</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repassesList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{item.professionalBeneficiary}</p>
                        <p className="text-[10px] text-slate-400">Reg: {item.registeredBy}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-700">{item.incomeDescription || item.parentTx.description}</p>
                        <p className="text-[10px] text-slate-400">Bruto Origem: {formatBRL(item.parentTx.value)}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-slate-700 font-medium">{item.client || item.parentTx.client}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.process || item.parentTx.process}</p>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600">
                        <span>{formatDateBR(item.expectedDate || item.paymentDate)}</span>
                        {item.status === 'Realizado' && item.paymentDate && item.paymentDate !== item.expectedDate && (
                          <span className="block text-[9px] text-emerald-600 font-sans">
                            Pago em {formatDateBR(item.paymentDate)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold font-mono text-purple-700">
                        {formatBRL(item.value)}
                        {item.percentage && (
                          <span className="block text-[10px] text-slate-400 font-normal">({item.percentage}%)</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Realizado' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'Realizado' && onUpdateTransaction && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedRepasses = (item.parentTx.repasses || []).map(r => 
                                  r.id === item.id ? { ...r, status: 'Realizado', paymentDate: new Date().toISOString().split('T')[0] } : r
                                );
                                onUpdateTransaction({
                                  ...item.parentTx,
                                  repasses: updatedRepasses
                                });
                                alert('Repasse marcado como Realizado!');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                              title="Marcar como pago"
                            >
                              Marcar Pago
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditRepasse(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-all"
                            title="Editar Repasse"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRepasse(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                            title="Excluir Repasse"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {repassesList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        Nenhum repasse registrado para o período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: HISTÓRICO DE MOVIMENTAÇÕES (Req 18) */}
      {activeTab === 'historico' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="font-display font-bold text-sm text-[#0d2f43] mb-1">Trilha de Auditoria e Histórico das Movimentações</h3>
          <p className="text-[11px] text-slate-500 mb-5">Registro imutável de todas as alterações, baixas, cancelamentos e estornos.</p>

          <div className="flex flex-col gap-3">
            {historicoList.map(item => (
              <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="p-1.5 bg-blue-50 text-[#0d2f43] rounded mt-0.5">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{item.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">by {item.user}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Ref: {item.txRef.description || item.txRef.client}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] text-slate-400 shrink-0">
                  <p className="font-bold text-slate-600">{item.date}</p>
                  <p>{item.time}</p>
                </div>
              </div>
            ))}
            {historicoList.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum histórico registrado no período selecionado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO DE NOVA ENTRADA OU SAÍDA (Req 4 & 6) */}
      {isNewTransactionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-sm text-[#0d2f43]">
                {modalTransactionType === 'revenue' ? 'Cadastrar Nova Entrada (Receita)' : 'Cadastrar Nova Saída (Despesa)'}
              </h3>
              <button onClick={() => setIsNewTransactionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-5 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder={modalTransactionType === 'revenue' ? "Ex: Honorários Contratuais de Êxito" : "Ex: Custas Processuais Preparo"}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none bg-white font-semibold"
                  >
                    {modalTransactionType === 'revenue' ? (
                      <>
                        <option value="Honorários contratuais">Honorários contratuais</option>
                        <option value="Honorários de êxito">Honorários de êxito</option>
                        <option value="Honorários sucumbenciais">Honorários sucumbenciais</option>
                        <option value="Consulta jurídica">Consulta jurídica</option>
                        <option value="Acordo">Acordo</option>
                        <option value="Reembolso">Reembolso</option>
                        <option value="Prestação de serviço">Prestação de serviço</option>
                        <option value="Outras receitas">Outras receitas</option>
                      </>
                    ) : (
                      <>
                        <option value="Custas processuais">Custas processuais</option>
                        <option value="Despesas cartorárias">Despesas cartorárias</option>
                        <option value="Perícias">Perícias</option>
                        <option value="Diligências">Diligências</option>
                        <option value="Deslocamentos">Deslocamentos</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Aluguel">Aluguel</option>
                        <option value="Folha de pagamento">Folha de pagamento</option>
                        <option value="Tributos">Tributos</option>
                        <option value="Sistemas e assinaturas">Sistemas e assinaturas</option>
                        <option value="Fornecedores">Fornecedores</option>
                        <option value="Despesas administrativas">Despesas administrativas</option>
                        <option value="Outras despesas">Outras despesas</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="3000.00"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              {/* VÍNCULO DE CLIENTE E PROCESSO - PESQUISA (Req 12) */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente Vinculado</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={formSelectedClient?.name || ''}
                      placeholder="Nenhum selecionado (Opcional)"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setIsClientPickerOpen(true)}
                      className="px-2.5 py-1.5 bg-[#0d2f43] text-white rounded font-bold hover:bg-[#16415a]"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Processo Vinculado</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={formSelectedProcess?.cnj || ''}
                      placeholder="Nenhum selecionado (Opcional)"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setIsProcessPickerOpen(true)}
                      className="px-2.5 py-1.5 bg-[#0d2f43] text-white rounded font-bold hover:bg-[#16415a]"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={formExpectedDate}
                    onChange={e => setFormExpectedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Forma de Pagamento</label>
                  <select
                    value={formPaymentMethod}
                    onChange={e => setFormPaymentMethod(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-semibold"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Transferência / TED">Transferência / TED</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conta de Destino / Origem</label>
                  <select
                    value={formAccount}
                    onChange={e => setFormAccount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-semibold"
                  >
                    <option value="Conta Única">Conta Única</option>
                    <option value="Conta Itaú Principal">Conta Itaú Principal</option>
                    <option value="Conta Santander">Conta Santander</option>
                    <option value="Conta Bradesco">Conta Bradesco</option>
                    <option value="Cofre Físico">Cofre Físico / Espécie</option>
                  </select>
                </div>
              </div>

              {/* PARCELAMENTO E RECORRÊNCIA (Req 15 & 16) */}
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Número de Parcelas</label>
                      {!isCustomInstallments ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomInstallments(true);
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          + Digitar número
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomInstallments(false);
                            setFormInstallments('1');
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Voltar à lista
                        </button>
                      )}
                    </div>

                    {!isCustomInstallments ? (
                      <select
                        value={formInstallments}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            setIsCustomInstallments(true);
                          } else {
                            setFormInstallments(e.target.value);
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white font-semibold text-xs text-slate-800 outline-none"
                      >
                        <option value="1">À Vista (1x)</option>
                        <option value="2">2x parcelas</option>
                        <option value="3">3x parcelas</option>
                        <option value="4">4x parcelas</option>
                        <option value="5">5x parcelas</option>
                        <option value="6">6x parcelas</option>
                        <option value="7">7x parcelas</option>
                        <option value="8">8x parcelas</option>
                        <option value="9">9x parcelas</option>
                        <option value="10">10x parcelas</option>
                        <option value="11">11x parcelas</option>
                        <option value="12">12x parcelas (1 ano)</option>
                        <option value="13">13x parcelas</option>
                        <option value="14">14x parcelas</option>
                        <option value="15">15x parcelas</option>
                        <option value="16">16x parcelas</option>
                        <option value="17">17x parcelas</option>
                        <option value="18">18x parcelas</option>
                        <option value="20">20x parcelas</option>
                        <option value="24">24x parcelas (2 anos)</option>
                        <option value="30">30x parcelas</option>
                        <option value="36">36x parcelas (3 anos)</option>
                        <option value="40">40x parcelas</option>
                        <option value="48">48x parcelas (4 anos)</option>
                        <option value="60">60x parcelas (5 anos)</option>
                        <option value="72">72x parcelas (6 anos)</option>
                        <option value="84">84x parcelas (7 anos)</option>
                        <option value="96">96x parcelas (8 anos)</option>
                        <option value="120">120x parcelas (10 anos)</option>
                        <option value="custom">Outra quantidade (Personalizado)...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="240"
                          value={formInstallments}
                          onChange={e => setFormInstallments(e.target.value)}
                          placeholder="Ex: 18, 36, 60..."
                          className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 bg-white font-semibold text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">x parcelas</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Lançamento Recorrente?</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={formIsRecurring}
                        onChange={e => setFormIsRecurring(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0d2f43]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Sim, recorrente</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observações e Comprovantes</label>
                <textarea
                  rows={2}
                  value={formObservations}
                  onChange={e => setFormObservations(e.target.value)}
                  placeholder="Instruções internas, detalhes ou termos de contrato..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewTransactionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-lg ${
                    modalTransactionType === 'revenue' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS AUXILIARES: CLIENT PICKER */}
      {isClientPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-xs text-[#0d2f43]">Selecionar Cliente do CRM</h4>
              <button onClick={() => setIsClientPickerOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input
              type="text"
              value={pickerSearchQuery}
              onChange={e => setPickerSearchQuery(e.target.value)}
              placeholder="Pesquisar por Nome, CPF, CNPJ, Telefone..."
              className="w-full border border-slate-200 rounded-lg p-2 text-xs mb-3"
            />
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 divide-y divide-slate-100">
              {crmLeads
                .filter(l => (l.name || '').toLowerCase().includes(pickerSearchQuery.toLowerCase()) || (l.cpfCnpj || '').includes(pickerSearchQuery))
                .map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setFormSelectedClient({ id: l.id, name: l.name });
                      setIsClientPickerOpen(false);
                    }}
                    className="p-2 text-left hover:bg-slate-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-800">{l.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{l.cpfCnpj || 'Sem doc'}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS AUXILIARES: PROCESS PICKER */}
      {isProcessPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-xs text-[#0d2f43]">Selecionar Processo</h4>
              <button onClick={() => setIsProcessPickerOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <input
              type="text"
              value={pickerSearchQuery}
              onChange={e => setPickerSearchQuery(e.target.value)}
              placeholder="Pesquisar por CNJ, Cliente, Assunto..."
              className="w-full border border-slate-200 rounded-lg p-2 text-xs mb-3"
            />
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 divide-y divide-slate-100">
              {processes
                .filter(p => (p.cnj || '').includes(pickerSearchQuery) || (p.client || '').toLowerCase().includes(pickerSearchQuery.toLowerCase()))
                .map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFormSelectedProcess({ id: p.id, cnj: p.cnj, client: p.client, area: p.area, resp: p.responsible });
                      setIsProcessPickerOpen(false);
                    }}
                    className="p-2 text-left hover:bg-slate-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold font-mono text-xs text-[#0d2f43]">{p.cnj}</p>
                      <p className="text-[10px] text-slate-500">{p.client} • {p.area}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BAIXA / REGISTRO DE PAGAMENTO OU RECEBIMENTO */}
      {selectedTxForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-5">
            <h3 className="font-bold text-sm text-[#0d2f43] mb-3">
              Registrar {selectedTxForPayment.type === 'revenue' ? 'Recebimento' : 'Pagamento'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lançamento: <strong className="text-slate-800">{selectedTxForPayment.description || selectedTxForPayment.client}</strong>
            </p>

            <form onSubmit={handleRegisterPayment} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor do Pagamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data da Operação</label>
                <input
                  type="date"
                  required
                  value={paymentDateInput}
                  onChange={e => setPaymentDateInput(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Conta de Destino / Origem</label>
                <select
                  value={paymentAccountInput}
                  onChange={e => setPaymentAccountInput(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 bg-white font-semibold text-slate-800"
                >
                  <option value="Conta Única">Conta Única</option>
                  <option value="Conta Itaú Principal">Conta Itaú Principal</option>
                  <option value="Conta Santander">Conta Santander</option>
                  <option value="Conta Bradesco">Conta Bradesco</option>
                  <option value="Cofre Físico">Cofre Físico / Espécie</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTxForPayment(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded">
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRO DE REPASSE (Req 10 & 11) */}
      {isRepasseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0d2f43]">Novo Repasse a Profissional</h3>
                <p className="text-[11px] text-slate-500">Selecione e filtre o pagamento recebido para vincular ao repasse.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRepasseModalOpen(false);
                  setRepasseOriginTx(null);
                  setSelectedOriginTxId('');
                  setRepasseSearchQuery('');
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Vincular a um Pagamento Recebido / Receita
                </label>
                {(selectedOriginTxId || repasseOriginTx) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOriginTxId('');
                      setRepasseOriginTx(null);
                    }}
                    className="text-red-600 hover:underline text-[10px] font-bold"
                  >
                    Remover Vínculo
                  </button>
                )}
              </div>

              {/* Input de Busca / Filtro em Tempo Real */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={repasseSearchQuery}
                  onChange={e => setRepasseSearchQuery(e.target.value)}
                  placeholder="Digite o nome do cliente, descrição, processo ou valor..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-[#0d2f43] focus:ring-1 focus:ring-[#0d2f43]"
                />
              </div>

              {/* Se houver transação selecionada */}
              {selectedOriginTxId || repasseOriginTx ? (
                (() => {
                  const tx = repasseOriginTx || allTransactions.find(t => t.id === selectedOriginTxId);
                  return tx ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2.5 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-emerald-950">{tx.description || tx.client}</p>
                        <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                          Cliente: <strong>{tx.client || 'Geral'}</strong> • Processo: <strong>{tx.process || 'Geral'}</strong> • Valor: <strong>{formatBRL(tx.value)}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                        Selecionado
                      </span>
                    </div>
                  ) : null;
                })()
              ) : (
                /* Lista filtrável de pagamentos */
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-md bg-white divide-y divide-slate-100 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOriginTxId('');
                      setRepasseOriginTx(null);
                    }}
                    className="w-full p-2 text-left hover:bg-slate-50 font-semibold text-slate-600 flex justify-between items-center"
                  >
                    <span>Geral Escritório (Sem Vínculo Direto)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Lançamento Avulso</span>
                  </button>
                  {allTransactions
                    .filter(t => t.type === 'revenue' && t.status !== 'Cancelada' && t.status !== 'Estornada')
                    .filter(t => {
                      if (!repasseSearchQuery.trim()) return true;
                      const q = repasseSearchQuery.toLowerCase().trim();
                      return (
                        (t.description || '').toLowerCase().includes(q) ||
                        (t.client || '').toLowerCase().includes(q) ||
                        (t.process || '').toLowerCase().includes(q) ||
                        (t.category || '').toLowerCase().includes(q) ||
                        t.value.toString().includes(q)
                      );
                    })
                    .map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedOriginTxId(t.id);
                          setRepasseOriginTx(t);
                          setRepasseValue((t.value * 0.3).toFixed(2));
                        }}
                        className="w-full p-2 text-left hover:bg-emerald-50/70 flex justify-between items-center transition-all group"
                      >
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-emerald-900">{t.description || t.client}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Cliente: {t.client || 'Geral'} • {t.process || 'Geral'}
                          </p>
                        </div>
                        <div className="text-right font-mono shrink-0 ml-2">
                          <p className="font-bold text-emerald-700">{formatBRL(t.value)}</p>
                          <p className="text-[9px] text-slate-400">{t.status}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <form onSubmit={handleCreateRepasse} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Profissional Beneficiário</label>
                <select
                  value={repasseBeneficiary}
                  onChange={e => setRepasseBeneficiary(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 bg-white font-semibold cursor-pointer"
                >
                  {activeUsersList.map(u => (
                    <option key={u.id || u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor do Repasse (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={repasseValue}
                    onChange={e => setRepasseValue(e.target.value)}
                    placeholder="1000.00"
                    className="w-full border border-slate-200 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Percentual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={repassePercentage}
                    onChange={e => setRepassePercentage(e.target.value)}
                    placeholder="33.3"
                    className="w-full border border-slate-200 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data do Repasse</label>
                <input
                  type="date"
                  required
                  value={repasseExpectedDate}
                  onChange={e => setRepasseExpectedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => { setIsRepasseModalOpen(false); setRepasseOriginTx(null); setSelectedOriginTxId(''); }}
                  className="px-3 py-1.5 border border-slate-200 rounded font-bold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded">
                  Salvar Repasse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR REPASSE */}
      {editingRepasse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0d2f43]">Editar Repasse</h3>
                <p className="text-[11px] text-slate-500">
                  Origem: <strong>{editingRepasse.item.incomeDescription || editingRepasse.item.parentTx.description || editingRepasse.item.parentTx.client}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRepasse(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRepasse} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Profissional Beneficiário</label>
                <select
                  value={editRepasseBeneficiary}
                  onChange={e => setEditRepasseBeneficiary(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 bg-white text-xs outline-none"
                >
                  {(users && users.length > 0 ? users : [
                    { name: 'Larissa Paiva' },
                    { name: 'Roberto Camargo' },
                    { name: 'Fernanda Lima' },
                    { name: 'Carlos Eduardo' }
                  ]).map(u => (
                    <option key={u.id || u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor do Repasse (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editRepasseValue}
                    onChange={e => setEditRepasseValue(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs font-mono outline-none focus:border-[#0d2f43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Percentual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editRepassePercentage}
                    onChange={e => setEditRepassePercentage(e.target.value)}
                    placeholder="Ex: 30"
                    className="w-full border border-slate-200 rounded p-2 text-xs font-mono outline-none focus:border-[#0d2f43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data do Repasse</label>
                  <input
                    type="date"
                    required
                    value={editRepasseExpectedDate}
                    onChange={e => setEditRepasseExpectedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={editRepasseStatus}
                    onChange={e => {
                      const newStatus = e.target.value as 'Pendente' | 'Realizado' | 'Cancelado';
                      setEditRepasseStatus(newStatus);
                      if (newStatus === 'Realizado' && !editRepassePaymentDate) {
                        setEditRepassePaymentDate(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full border border-slate-200 rounded p-2 bg-white text-xs outline-none"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Realizado">Realizado (Pago)</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {editRepasseStatus === 'Realizado' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Pagamento Efetuado</label>
                  <input
                    type="date"
                    required
                    value={editRepassePaymentDate}
                    onChange={e => setEditRepassePaymentDate(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observações</label>
                <textarea
                  value={editRepasseObs}
                  onChange={e => setEditRepasseObs(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded p-2 text-xs outline-none resize-none"
                  placeholder="Detalhes adicionais do repasse..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRepasse(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0d2f43] text-white rounded text-xs font-bold hover:bg-[#0d2f43]/90"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANCELAMENTO OU ESTORNO (Req 19) */}
      {isCancelModalOpen && cancelTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-5">
            <h3 className="font-bold text-sm text-red-600 mb-2">
              Justificativa de {cancelActionType === 'cancelar' ? 'Cancelamento' : 'Estorno'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lançamento: <strong className="text-slate-800">{cancelTx.description || cancelTx.client}</strong>
            </p>

            <form onSubmit={handleConfirmCancelOrRefund} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Motivo / Justificativa Obrigatória *</label>
                <textarea
                  required
                  rows={3}
                  value={cancelJustification}
                  onChange={e => setCancelJustification(e.target.value)}
                  placeholder="Informe o motivo detalhado para registro na auditoria..."
                  className="w-full border border-slate-200 rounded p-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded font-bold"
                >
                  Voltar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-red-600 text-white font-bold rounded">
                  Confirmar {cancelActionType === 'cancelar' ? 'Cancelamento' : 'Estorno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES COMPLETO DO LANÇAMENTO */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg p-5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#0d2f43]">{selectedTxForDetail.description || 'Detalhes do Lançamento'}</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {selectedTxForDetail.id}</p>
              </div>
              <button onClick={() => setSelectedTxForDetail(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">VALOR TOTAL</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{formatBRL(selectedTxForDetail.value)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">STATUS ATUAL</span>
                <span className="font-bold text-emerald-700">{selectedTxForDetail.status}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">CLIENTE / PROCESSO</span>
                <span className="font-medium text-slate-700">{selectedTxForDetail.client || 'Sem cliente'}</span>
                <span className="block font-mono text-[10px] text-slate-500">{selectedTxForDetail.process || 'Geral'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">RESPONSÁVEL</span>
                <span className="font-medium text-slate-700">{selectedTxForDetail.responsibleUser}</span>
              </div>
            </div>

            {selectedTxForDetail.observations && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs mb-4">
                <span className="font-bold text-slate-700 block text-[10px] mb-0.5 uppercase">Observações:</span>
                <p className="text-slate-600">{selectedTxForDetail.observations}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDeleteTx(selectedTxForDetail)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const txToEdit = selectedTxForDetail;
                    setSelectedTxForDetail(null);
                    handleOpenEditModal(txToEdit);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => setSelectedTxForDetail(null)}
                  className="px-4 py-1.5 bg-[#0d2f43] text-white font-bold rounded text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LANÇAMENTO */}
      {isEditModalOpen && editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg p-5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#0d2f43]">
                Editar Lançamento ({editingTx.type === 'revenue' ? 'Entrada / Receita' : 'Saída / Despesa'})
              </h3>
              <button onClick={() => setIsEditModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveEditTransaction} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cliente / Solicitante</label>
                  <input
                    type="text"
                    value={editClient}
                    onChange={e => setEditClient(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fornecedor / Beneficiário</label>
                  <input
                    type="text"
                    value={editSupplier}
                    onChange={e => setEditSupplier(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2"
                    placeholder="Ex: Cartório, Consultor, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Processo Ref. / CNJ</label>
                  <input
                    type="text"
                    value={editProcess}
                    onChange={e => setEditProcess(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status *</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 bg-white font-semibold"
                  >
                    <option value="A receber">A receber</option>
                    <option value="A pagar">A pagar</option>
                    <option value="Recebida">Recebida</option>
                    <option value="Paga">Paga</option>
                    <option value="Parcialmente recebida">Parcialmente recebida</option>
                    <option value="Parcialmente paga">Parcialmente paga</option>
                    <option value="Vencida">Vencida</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Estornada">Estornada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={editExpectedDate}
                    onChange={e => setEditExpectedDate(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Pagto / Baixa</label>
                  <input
                    type="date"
                    value={editStatus === 'Paga' || editStatus === 'Parcialmente paga' ? editPaidDate : editReceivedDate}
                    onChange={e => {
                      if (editStatus === 'Paga' || editStatus === 'Parcialmente paga') {
                        setEditPaidDate(e.target.value);
                      } else {
                        setEditReceivedDate(e.target.value);
                      }
                    }}
                    className="w-full border border-slate-200 rounded p-2 font-mono bg-amber-50/50"
                    placeholder="Efetivação"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Forma de Pagamento</label>
                  <select
                    value={editPaymentMethod}
                    onChange={e => setEditPaymentMethod(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 bg-white"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Transferência / TED">Transferência / TED</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Conta Bancária</label>
                  <select
                    value={editAccount}
                    onChange={e => setEditAccount(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 bg-white font-semibold text-slate-800"
                  >
                    <option value="Conta Única">Conta Única</option>
                    <option value="Conta Itaú Principal">Conta Itaú Principal</option>
                    <option value="Conta Santander">Conta Santander</option>
                    <option value="Conta Bradesco">Conta Bradesco</option>
                    <option value="Cofre Físico">Cofre Físico / Espécie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={editObservations}
                  onChange={e => setEditObservations(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-200 rounded font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0d2f43] hover:bg-[#16415a] text-white font-bold rounded"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
