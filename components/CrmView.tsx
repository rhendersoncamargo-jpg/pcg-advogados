'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, User, Building2, Trash2, Edit,
  Mail, Phone, MapPin, FileText, CheckCircle2, 
  Clock, ArrowLeft, Save, Calendar, Check,
  AlertCircle, Briefcase, ArrowUpRight, Shield,
  CreditCard, Filter, ChevronRight, UserCheck,
  MessageSquare, Lock, X, ExternalLink,
  ChevronDown, ArrowUpDown, FileCheck2, UserX,
  PhoneCall, Send, AlertTriangle, MoreVertical
} from 'lucide-react';
import { CrmLead, CrmAtendimento, BankAccount, Process } from '@/lib/mockData';

interface CrmViewProps {
  leads: CrmLead[];
  users?: any[];
  onAddLead: (lead: Omit<CrmLead, 'id'>) => void;
  onDeleteLead: (id: string) => void;
  onUpdateLead: (lead: CrmLead) => void;
  initialFilters?: {
    searchQuery?: string;
    typeFilter?: 'ALL' | 'PF' | 'PJ';
    statusFilter?: string;
    filter?: string;
    captadorFilter?: string;
  };
  processes?: Process[];
  currentUser?: any;
  onAddDeadline?: (deadline: any) => void;
  onSelectProcess?: (id: string) => void;
  onNavigateTab?: (tab: string, filters?: any) => void;
  initialSelectedLeadId?: string | null;
}

// Mask Helpers
const formatCpf = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatCnpj = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCep = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const cleanDoc = (doc?: string) => (doc || '').replace(/\D/g, '');

const ORIGIN_OPTIONS = [
  'Indicação de cliente',
  'Indicação de profissional',
  'Site',
  'Google',
  'Instagram',
  'WhatsApp',
  'Atendimento presencial',
  'Evento',
  'Parceiro',
  'Cliente antigo',
  'Outro'
];

const SITUATION_OPTIONS = [
  'Pré-atendimento',
  'Aguardando documentação',
  'Pendente de análise',
  'Pendente de proposta',
  'Pendente de contratação',
  'Contratado',
  'Ativo',
  'Em pausa',
  'Inativo',
  'Encerrado',
  'Arquivado'
];

const ATENDIMENTO_TYPES = [
  'Ligação recebida',
  'Ligação realizada',
  'WhatsApp',
  'E-mail',
  'Atendimento presencial',
  'Visita ao escritório',
  'Reunião',
  'Videoconferência',
  'Entrega de documentos',
  'Solicitação de documentos',
  'Devolutiva',
  'Outro'
];

export default function CrmView({ 
  leads, 
  users,
  onAddLead, 
  onDeleteLead, 
  onUpdateLead, 
  initialFilters,
  processes = [],
  currentUser,
  onAddDeadline,
  onSelectProcess,
  onNavigateTab,
  initialSelectedLeadId
}: CrmViewProps) {
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
  // Navigation & selection state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialSelectedLeadId || null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  
  // Prontuário Active Tab
  const [activeProntuarioTab, setActiveProntuarioTab] = useState<
    'visao_geral' | 'dados_cadastrais' | 'historico' | 'processos' | 'documentos' | 'dados_bancarios' | 'observacoes'
  >('visao_geral');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PF' | 'PJ'>(initialFilters?.typeFilter || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.statusFilter || 'ALL');
  const [originFilter, setOriginFilter] = useState<string>('ALL');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('ALL');
  const [captadorFilter, setCaptadorFilter] = useState<string>(initialFilters?.captadorFilter || 'ALL');
  const [quickFilter, setQuickFilter] = useState<string>(initialFilters?.filter || 'ALL');

  // Sorting
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Role permissions check (Requirement 21)
  const userRole = (currentUser?.role || 'Advogado Pleno').toLowerCase();
  const canAccessBankData = userRole.includes('ceo') || userRole.includes('sócio') || userRole.includes('socio') || userRole.includes('admin') || userRole.includes('financeiro') || userRole.includes('gestor');

  // NEW CLIENT FORM STATES
  const [formType, setFormType] = useState<'PF' | 'PJ'>('PF');
  const [formName, setFormName] = useState('');
  const [formCpfCnpj, setFormCpfCnpj] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOrigin, setFormOrigin] = useState('Indicação de cliente');
  const [formIndicatedBy, setFormIndicatedBy] = useState('');
  const [formResponsible, setFormResponsible] = useState(currentUser?.name || 'Larissa Paiva');
  const [formCaptador, setFormCaptador] = useState(currentUser?.name || 'Larissa Paiva');
  const [formTeam, setFormTeam] = useState('Equipe Cível');
  const [formSituation, setFormSituation] = useState('Pré-atendimento');
  
  // Additional PF fields
  const [formNacionalidade, setFormNacionalidade] = useState('Brasileiro(a)');
  const [formEstadoCivil, setFormEstadoCivil] = useState('Solteiro(a)');
  const [formProfissao, setFormProfissao] = useState('');
  const [formRg, setFormRg] = useState('');
  const [formRgOrgao, setFormRgOrgao] = useState('SSP');
  const [formRgUf, setFormRgUf] = useState('SP');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formFiliacao, setFormFiliacao] = useState('');

  // Additional PJ fields
  const [formFantasia, setFormFantasia] = useState('');
  const [formRepName, setFormRepName] = useState('');
  const [formRepCpf, setFormRepCpf] = useState('');
  const [formRepRg, setFormRepRg] = useState('');
  const [formRepRole, setFormRepRole] = useState('Sócio-Administrador');
  const [formRepQualificacao, setFormRepQualificacao] = useState('');

  // Address fields
  const [formCep, setFormCep] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('SP');
  const [formNotes, setFormNotes] = useState('');

  // Duplication error state (Requirement 6)
  const [duplicateClientMatch, setDuplicateClientMatch] = useState<CrmLead | null>(null);

  // NEW ATENDIMENTO MODAL STATES (Requirement 12 & 14)
  const [isAtendimentoModalOpen, setIsAtendimentoModalOpen] = useState(false);
  const [atendType, setAtendType] = useState('Ligação recebida');
  const [atendDate, setAtendDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [atendTime, setAtendTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [atendDesc, setAtendDesc] = useState('');
  const [atendResult, setAtendResult] = useState('');
  const [atendNeedsReturn, setAtendNeedsReturn] = useState(false);
  const [atendReturnResp, setAtendReturnResp] = useState(currentUser?.name || 'Dr. Ricardo Camargo');
  const [atendReturnDate, setAtendReturnDate] = useState('');
  const [atendReturnTime, setAtendReturnTime] = useState('14:00');
  const [atendCreateTask, setAtendCreateTask] = useState(true);
  const [atendProcessCnj, setAtendProcessCnj] = useState('');

  // NEW BANK ACCOUNT MODAL STATES (Requirement 16)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankName, setBankName] = useState('Banco do Brasil (001)');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [bankAccountType, setBankAccountType] = useState<'Corrente' | 'Poupança' | 'Pagamento'>('Corrente');
  const [bankHolder, setBankHolder] = useState('');
  const [bankHolderCpf, setBankHolderCpf] = useState('');
  const [bankPixKey, setBankPixKey] = useState('');
  const [bankPixType, setBankPixType] = useState<'CPF/CNPJ' | 'E-mail' | 'Telefone' | 'Chave Aleatória'>('CPF/CNPJ');
  const [bankIsMain, setBankIsMain] = useState(true);
  const [bankNotes, setBankNotes] = useState('');

  // Selected Lead
  const activeLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);

  // Lead associated processes
  const clientProcesses = useMemo(() => {
    if (!activeLead) return [];
    return processes.filter(p => 
      p.client?.toLowerCase().includes(activeLead.name.toLowerCase()) ||
      (activeLead.cpfCnpj && p.client?.includes(activeLead.cpfCnpj))
    );
  }, [processes, activeLead]);

  // Handle document input mask and duplication check
  const handleDocChange = (val: string) => {
    const formatted = formType === 'PF' ? formatCpf(val) : formatCnpj(val);
    setFormCpfCnpj(formatted);

    // Duplicity check
    const cleanNew = cleanDoc(formatted);
    if (cleanNew.length >= 11) {
      const match = leads.find(l => cleanDoc(l.cpfCnpj) === cleanNew);
      if (match) {
        setDuplicateClientMatch(match);
      } else {
        setDuplicateClientMatch(null);
      }
    } else {
      setDuplicateClientMatch(null);
    }
  };

  // Open existing client from duplication warning
  const handleOpenExistingClient = (client: CrmLead) => {
    setDuplicateClientMatch(null);
    setIsAddingLead(false);
    setSelectedLeadId(client.id);
  };

  // Open Edit Client Modal with existing client data
  const handleStartEditClient = (client: CrmLead) => {
    setEditingLeadId(client.id);
    setFormType(client.type || 'PF');
    setFormName(client.name || '');
    setFormCpfCnpj(client.cpfCnpj || '');
    setFormPhone(client.phone || '');
    setFormEmail(client.email || '');
    setFormOrigin(client.origin || 'Indicação de cliente');
    setFormIndicatedBy(client.indicatedBy || '');
    setFormResponsible(client.responsible || currentUser?.name || 'Dr. Ricardo Camargo');
    setFormCaptador(client.captador || currentUser?.name || 'Dr. Ricardo Camargo');
    setFormTeam(client.team || 'Equipe Cível');
    setFormSituation(client.situation || 'Pré-atendimento');
    setFormNacionalidade(client.nacionalidade || 'Brasileiro(a)');
    setFormEstadoCivil(client.estadoCivil || 'Solteiro(a)');
    setFormProfissao(client.profissao || '');
    setFormRg(client.rg || '');
    setFormRgOrgao(client.rgOrgao || 'SSP');
    setFormRgUf(client.rgUf || 'SP');
    setFormBirthDate(client.birthDate || '');
    setFormFiliacao(client.filiacao || '');
    setFormFantasia(client.fantasia || '');
    setFormRepName(client.repName || '');
    setFormRepCpf(client.repCpf || '');
    setFormRepRg(client.repRg || '');
    setFormRepRole(client.repRole || 'Sócio-Administrador');
    setFormRepQualificacao(client.repQualificacao || '');
    setFormCep(client.cep || '');
    setFormAddress(client.address || '');
    setFormNumber(client.number || '');
    setFormComplement(client.complement || '');
    setFormBairro(client.bairro || '');
    setFormCity(client.city || '');
    setFormState(client.state || 'SP');
    setFormNotes(client.notes || '');
    setDuplicateClientMatch(null);
    setIsAddingLead(true);
  };

  // Reset Add / Edit Lead Form
  const resetForm = () => {
    setEditingLeadId(null);
    setFormName('');
    setFormCpfCnpj('');
    setFormPhone('');
    setFormEmail('');
    setFormOrigin('Indicação de cliente');
    setFormIndicatedBy('');
    setFormResponsible(currentUser?.name || 'Dr. Ricardo Camargo');
    setFormCaptador(currentUser?.name || 'Dr. Ricardo Camargo');
    setFormTeam('Equipe Cível');
    setFormSituation('Pré-atendimento');
    setFormNacionalidade('Brasileiro(a)');
    setFormEstadoCivil('Solteiro(a)');
    setFormProfissao('');
    setFormRg('');
    setFormRgOrgao('SSP');
    setFormRgUf('SP');
    setFormBirthDate('');
    setFormFiliacao('');
    setFormFantasia('');
    setFormRepName('');
    setFormRepCpf('');
    setFormRepRg('');
    setFormRepRole('Sócio-Administrador');
    setFormRepQualificacao('');
    setFormCep('');
    setFormAddress('');
    setFormNumber('');
    setFormComplement('');
    setFormBairro('');
    setFormCity('');
    setFormState('SP');
    setFormNotes('');
    setDuplicateClientMatch(null);
  };

  // Submit Handler: Add or Edit Lead
  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory fields check
    if (!formName.trim()) {
      alert('Por favor, informe o Nome Completo ou Razão Social.');
      return;
    }
    if (!formCpfCnpj.trim()) {
      alert(`Por favor, informe o ${formType === 'PF' ? 'CPF' : 'CNPJ'}.`);
      return;
    }
    if (!formPhone.trim()) {
      alert('Por favor, informe o Telefone do cliente.');
      return;
    }
    if (!formOrigin) {
      alert('Por favor, selecione a Origem do cliente.');
      return;
    }
    if (!formResponsible.trim()) {
      alert('Por favor, informe o Profissional Responsável.');
      return;
    }

    // Duplication Check Block (Requirement 6) - skip current lead if editing
    const cleanNew = cleanDoc(formCpfCnpj);
    const match = leads.find(l => l.id !== editingLeadId && cleanDoc(l.cpfCnpj) === cleanNew);
    if (match) {
      setDuplicateClientMatch(match);
      alert('Já existe outro cliente cadastrado com este CPF ou CNPJ.');
      return;
    }

    if (editingLeadId) {
      const existingLead = leads.find(l => l.id === editingLeadId);
      if (!existingLead) return;

      const updatedLead: CrmLead = {
        ...existingLead,
        name: formName.trim(),
        type: formType,
        cpfCnpj: formCpfCnpj.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        origin: formOrigin,
        indicatedBy: formOrigin.includes('Indicação') ? formIndicatedBy : undefined,
        responsible: formResponsible,
        captador: formCaptador,
        team: formTeam,
        status: formSituation === 'Inativo' ? 'INATIVO' : formSituation === 'Aguardando documentação' ? 'AGUARDANDO DOC' : 'ATIVO',
        situation: formSituation,
        
        // PF specific
        nacionalidade: formType === 'PF' ? formNacionalidade : undefined,
        estadoCivil: formType === 'PF' ? formEstadoCivil : undefined,
        profissao: formType === 'PF' ? formProfissao : undefined,
        rg: formType === 'PF' ? formRg : undefined,
        rgOrgao: formType === 'PF' ? formRgOrgao : undefined,
        rgUf: formType === 'PF' ? formRgUf : undefined,
        birthDate: formType === 'PF' ? formBirthDate : undefined,
        filiacao: formType === 'PF' ? formFiliacao : undefined,

        // PJ specific
        fantasia: formType === 'PJ' ? formFantasia : undefined,
        repName: formType === 'PJ' ? formRepName : undefined,
        repCpf: formType === 'PJ' ? formRepCpf : undefined,
        repRg: formType === 'PJ' ? formRepRg : undefined,
        repRole: formType === 'PJ' ? formRepRole : undefined,
        repQualificacao: formType === 'PJ' ? formRepQualificacao : undefined,

        // Address
        cep: formCep,
        address: formAddress,
        number: formNumber,
        complement: formComplement,
        bairro: formBairro,
        city: formCity,
        state: formState,
        notes: formNotes,
      };

      onUpdateLead(updatedLead);
      setIsAddingLead(false);
      resetForm();
    } else {
      const newLead: Omit<CrmLead, 'id'> = {
        name: formName.trim(),
        type: formType,
        cpfCnpj: formCpfCnpj.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        origin: formOrigin,
        indicatedBy: formOrigin.includes('Indicação') ? formIndicatedBy : undefined,
        responsible: formResponsible,
        captador: formCaptador,
        team: formTeam,
        status: formSituation === 'Inativo' ? 'INATIVO' : formSituation === 'Aguardando documentação' ? 'AGUARDANDO DOC' : 'ATIVO',
        situation: formSituation,
        
        // PF specific
        nacionalidade: formType === 'PF' ? formNacionalidade : undefined,
        estadoCivil: formType === 'PF' ? formEstadoCivil : undefined,
        profissao: formType === 'PF' ? formProfissao : undefined,
        rg: formType === 'PF' ? formRg : undefined,
        rgOrgao: formType === 'PF' ? formRgOrgao : undefined,
        rgUf: formType === 'PF' ? formRgUf : undefined,
        birthDate: formType === 'PF' ? formBirthDate : undefined,
        filiacao: formType === 'PF' ? formFiliacao : undefined,

        // PJ specific
        fantasia: formType === 'PJ' ? formFantasia : undefined,
        repName: formType === 'PJ' ? formRepName : undefined,
        repCpf: formType === 'PJ' ? formRepCpf : undefined,
        repRg: formType === 'PJ' ? formRepRg : undefined,
        repRole: formType === 'PJ' ? formRepRole : undefined,
        repQualificacao: formType === 'PJ' ? formRepQualificacao : undefined,

        // Address
        cep: formCep,
        address: formAddress,
        number: formNumber,
        complement: formComplement,
        bairro: formBairro,
        city: formCity,
        state: formState,
        notes: formNotes,

        lastContact: new Date().toLocaleDateString('pt-BR'),
        history: [
          {
            id: `atend-${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: 'Atendimento presencial',
            responsible: currentUser?.name || formResponsible,
            description: 'Cadastro do cliente realizado no sistema PCG.OS.',
            result: 'Cliente cadastrado com sucesso.',
            situation: 'Concluído'
          }
        ],
        createdAt: new Date().toLocaleDateString('pt-BR')
      };

      onAddLead(newLead);
      setIsAddingLead(false);
      resetForm();
    }
  };

  // Submit Handler: Add Atendimento (Requirement 12, 13, 14)
  const handleAddAtendimentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !atendDesc.trim()) return;

    const formattedDate = atendDate ? atendDate.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
    const userDisplay = currentUser?.name || 'Profissional';

    const newAtend: CrmAtendimento = {
      id: `atend-${Date.now()}`,
      date: formattedDate,
      time: atendTime || '14:00',
      type: atendType,
      responsible: userDisplay,
      description: atendDesc.trim(),
      result: atendResult.trim() || 'Atendimento registrado.',
      situation: atendNeedsReturn ? 'Pendente de Devolutiva' : 'Concluído',
      needsReturn: atendNeedsReturn,
      returnResponsible: atendNeedsReturn ? atendReturnResp : undefined,
      returnDate: atendNeedsReturn && atendReturnDate ? atendReturnDate.split('-').reverse().join('/') : undefined,
      returnTime: atendNeedsReturn ? atendReturnTime : undefined,
      processCnj: atendProcessCnj || undefined
    };

    const updatedHistory = [newAtend, ...(activeLead.history || [])];

    // Update Lead Next Action
    const updatedLead: CrmLead = {
      ...activeLead,
      lastContact: formattedDate,
      history: updatedHistory,
      nextAction: atendNeedsReturn ? `Devolutiva: ${atendDesc.slice(0, 30)}...` : activeLead.nextAction,
      nextActionDate: atendNeedsReturn && atendReturnDate ? atendReturnDate.split('-').reverse().join('/') : activeLead.nextActionDate
    };

    onUpdateLead(updatedLead);

    // If Return Task requested, trigger onAddDeadline (Requirement 14)
    if (atendNeedsReturn && atendCreateTask && onAddDeadline) {
      onAddDeadline({
        id: `task-${Date.now()}`,
        processCnj: atendProcessCnj || 'Geral/Interno',
        processClient: activeLead.name,
        description: `Retorno a cliente (${activeLead.name}): ${atendDesc.slice(0, 40)}`,
        dueDate: atendReturnDate ? atendReturnDate.split('-').reverse().join('/') : formattedDate,
        status: 'Em Produção',
        responsible: atendReturnResp,
        type: 'interno'
      });
    }

    setIsAtendimentoModalOpen(false);
    setAtendDesc('');
    setAtendResult('');
    setAtendNeedsReturn(false);
  };

  // Submit Handler: Add Bank Account (Requirement 16)
  const handleAddBankAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !bankAccountNum.trim()) return;

    const newAccount: BankAccount = {
      id: `bank-${Date.now()}`,
      bank: bankName,
      agency: bankAgency,
      accountNumber: bankAccountNum,
      accountType: bankAccountType,
      holder: bankHolder || activeLead.name,
      holderCpfCnpj: bankHolderCpf || activeLead.cpfCnpj,
      pixKey: bankPixKey,
      pixKeyType: bankPixType,
      notes: bankNotes,
      isMain: bankIsMain
    };

    let updatedAccounts = [...(activeLead.bankAccounts || [])];
    if (bankIsMain) {
      updatedAccounts = updatedAccounts.map(a => ({ ...a, isMain: false }));
    }
    updatedAccounts.push(newAccount);

    onUpdateLead({
      ...activeLead,
      bankAccounts: updatedAccounts
    });

    setIsBankModalOpen(false);
    setBankAgency('');
    setBankAccountNum('');
    setBankPixKey('');
    setBankNotes('');
  };

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Type Filter
      if (typeFilter !== 'ALL' && l.type !== typeFilter) return false;

      // Relationship Status Filter
      if (statusFilter !== 'ALL' && l.situation !== statusFilter && l.status !== statusFilter) return false;

      // Origin Filter
      if (originFilter !== 'ALL' && l.origin !== originFilter) return false;

      // Responsible Filter
      if (responsibleFilter !== 'ALL' && l.responsible !== responsibleFilter) return false;

      // Captador Filter
      if (captadorFilter !== 'ALL' && l.captador !== captadorFilter) return false;

      // Quick Filter chips
      if (quickFilter === 'retorno_pendente') {
        const hasPending = l.history?.some(h => h.needsReturn && h.situation?.includes('Pendente'));
        if (!hasPending) return false;
      } else if (quickFilter === 'aguardando_doc') {
        if (l.situation !== 'Aguardando documentação' && l.status !== 'AGUARDANDO DOC') return false;
      } else if (quickFilter === 'pendente_contratacao') {
        if (l.situation !== 'Pendente de contratação' && l.situation !== 'Pendente de proposta') return false;
      } else if (quickFilter === 'ativo') {
        if (l.situation !== 'Ativo' && l.status !== 'ATIVO') return false;
      } else if (quickFilter === 'inativo') {
        if (l.situation !== 'Inativo' && l.status !== 'INATIVO') return false;
      }

      // Search Query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = l.name.toLowerCase().includes(q);
        const docMatch = cleanDoc(l.cpfCnpj).includes(cleanDoc(q));
        const phoneMatch = cleanDoc(l.phone).includes(cleanDoc(q));
        const emailMatch = l.email?.toLowerCase().includes(q);
        const respMatch = l.responsible?.toLowerCase().includes(q);
        const captadorMatch = l.captador?.toLowerCase().includes(q);
        const originMatch = l.origin?.toLowerCase().includes(q);
        const sitMatch = l.situation?.toLowerCase().includes(q);

        return nameMatch || docMatch || phoneMatch || emailMatch || respMatch || captadorMatch || originMatch || sitMatch;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a.name;
      let valB: any = b.name;

      if (sortField === 'cpfCnpj') {
        valA = a.cpfCnpj;
        valB = b.cpfCnpj;
      } else if (sortField === 'phone') {
        valA = a.phone;
        valB = b.phone;
      } else if (sortField === 'situation') {
        valA = a.situation || a.status;
        valB = b.situation || b.status;
      } else if (sortField === 'responsible') {
        valA = a.responsible || '';
        valB = b.responsible || '';
      } else if (sortField === 'captador') {
        valA = a.captador || a.responsible || '';
        valB = b.captador || b.responsible || '';
      } else if (sortField === 'lastContact') {
        valA = a.lastContact || '';
        valB = b.lastContact || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, typeFilter, statusFilter, originFilter, responsibleFilter, captadorFilter, quickFilter, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // List of unique responsibles for filters
  const uniqueResponsibles = useMemo(() => {
    const fromUsers = activeUsersList.map(u => u.name);
    const fromLeads = leads.map(l => l.responsible).filter(Boolean);
    return Array.from(new Set([...fromUsers, ...fromLeads]));
  }, [activeUsersList, leads]);

  // List of unique captadores for filters
  const uniqueCaptadores = useMemo(() => {
    const fromUsers = activeUsersList.map(u => u.name);
    const fromLeads = leads.map(l => l.captador).filter(Boolean) as string[];
    return Array.from(new Set([...fromUsers, ...fromLeads]));
  }, [activeUsersList, leads]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* HEADER & NEW CLIENT BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#0d2f43] tracking-tight flex items-center gap-2">
            CRM — Gestão de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Porta de entrada do cliente no escritório. Dados sincronizados com todos os módulos.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedLeadId(null);
            setIsAddingLead(true);
            resetForm();
          }}
          className="flex items-center gap-2 bg-[#0d2f43] text-white hover:bg-[#163e56] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* DETAIL VIEW (PRONTUÁRIO) WHEN A CLIENT IS SELECTED */}
      {selectedLeadId && activeLead ? (
        <div className="flex flex-col gap-6">
          {/* Top Bar with Back Action & Quick Client Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setSelectedLeadId(null)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#0d2f43] text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Lista de Clientes</span>
            </button>

            {/* Quick Actions (Requirement 20) */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleStartEditClient(activeLead)}
                className="flex items-center gap-1.5 bg-[#0d2f43] text-white hover:bg-[#163e56] border border-[#0d2f43] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Alterar Informações</span>
              </button>

              <button 
                onClick={() => setIsAtendimentoModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Registrar Atendimento</span>
              </button>

              <button 
                onClick={() => {
                  setIsAtendimentoModalOpen(true);
                  setAtendNeedsReturn(true);
                }}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Criar Tarefa / Retorno</span>
              </button>

              {onNavigateTab && (
                <button 
                  onClick={() => onNavigateTab('processos', { clientFilter: activeLead.name })}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Novo Processo</span>
                </button>
              )}

              <button 
                onClick={() => onDeleteLead(activeLead.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Excluir cliente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Client Name Banner */}
          <div className="bg-[#0d2f43] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                {activeLead.type === 'PJ' ? <Building2 className="w-6 h-6 text-amber-300" /> : <User className="w-6 h-6 text-blue-300" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">{activeLead.name}</h2>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${activeLead.type === 'PJ' ? 'bg-amber-400/20 text-amber-200' : 'bg-blue-400/20 text-blue-200'}`}>
                    Pessoa {activeLead.type === 'PJ' ? 'Jurídica' : 'Física'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                  <span>CPF/CNPJ: <strong className="text-white">{activeLead.cpfCnpj}</strong></span>
                  <span>Telefone: <strong className="text-white">{activeLead.phone}</strong></span>
                  <span>E-mail: <strong className="text-white">{activeLead.email || 'Não informado'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] text-slate-300 block uppercase font-bold">Situação Atual</span>
                <span className="text-xs font-bold text-amber-300">{activeLead.situation || activeLead.status}</span>
              </div>
            </div>
          </div>

          {/* Prontuário Navigation Tabs (Requirement 10) */}
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
            {[
              { id: 'visao_geral', label: 'Visão Geral' },
              { id: 'dados_cadastrais', label: 'Dados Cadastrais' },
              { id: 'historico', label: 'Histórico de Atendimentos' },
              { id: 'processos', label: `Processos (${clientProcesses.length})` },
              { id: 'documentos', label: 'Documentos' },
              { id: 'dados_bancarios', label: 'Dados Bancários', restricted: true },
              { id: 'observacoes', label: 'Observações' },
            ].map((tab) => {
              if (tab.restricted && !canAccessBankData) return null; // Hide restricted tab if no permission
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveProntuarioTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    activeProntuarioTab === tab.id
                      ? 'border-[#0d2f43] text-[#0d2f43] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: VISÃO GERAL (Requirement 11) */}
          {activeProntuarioTab === 'visao_geral' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Nome / Razão Social</span>
                    <span className="text-sm font-bold text-slate-800">{activeLead.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">CPF / CNPJ</span>
                    <span className="text-sm font-bold text-slate-800">{activeLead.cpfCnpj}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Telefone de Contato</span>
                    <span className="text-sm font-bold text-slate-800">{activeLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Origem do Cliente</span>
                    <span className="text-sm font-bold text-slate-800">
                      {activeLead.origin || 'Não informada'}
                      {activeLead.indicatedBy ? ` (${activeLead.indicatedBy})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Profissional Responsável</span>
                    <span className="text-sm font-bold text-slate-800">{activeLead.responsible || 'Dr. Ricardo Camargo'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Profissional Captador</span>
                    <span className="text-sm font-bold text-slate-800">{activeLead.captador || activeLead.responsible || 'N/A'}</span>
                  </div>
                </div>

                {/* Latest Activity & Next Providência */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                  <h3 className="font-bold text-sm text-[#0d2f43] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Última Interação & Próxima Providência</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Último Atendimento</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{activeLead.lastContact || '22/07/2026'}</span>
                      <p className="text-xs text-slate-600 mt-1">
                        {activeLead.history?.[0]?.description || 'Cadastro inicial realizado.'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-600 block">Próxima Providência</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">
                        {activeLead.nextActionDate || 'A definir'}
                      </span>
                      <p className="text-xs text-slate-600 mt-1">
                        {activeLead.nextAction || 'Nenhuma pendência agendada.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Quick Stats */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Processos Vinculados</span>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-3xl font-black text-[#0d2f43]">{clientProcesses.length}</p>
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Briefcase className="w-5 h-5" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Ações judiciais ativas ou encerradas do cliente.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Situação do Relacionamento</span>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeLead.situation || activeLead.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DADOS CADASTRAIS (Requirement 3 & 4) */}
          {activeProntuarioTab === 'dados_cadastrais' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-[#0d2f43]">
                  Informações Cadastrais Detalhadas ({activeLead.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'})
                </h3>
                <button
                  onClick={() => handleStartEditClient(activeLead)}
                  className="flex items-center gap-1.5 bg-slate-100 text-[#0d2f43] hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Alterar Informações do Cliente</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Nome Completo / Razão Social</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLead.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">CPF / CNPJ</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLead.cpfCnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Telefone</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">E-mail</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeLead.email || 'Não informado'}</span>
                </div>

                {activeLead.type === 'PF' ? (
                  <>
                    <div>
                      <span className="text-slate-400 font-medium block">Nacionalidade</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.nacionalidade || 'Brasileiro(a)'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Estado Civil</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.estadoCivil || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Profissão</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.profissao || 'Não informada'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Número do RG</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.rg || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Órgão Expedidor / UF</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {activeLead.rgOrgao ? `${activeLead.rgOrgao}/${activeLead.rgUf || 'SP'}` : 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Data de Nascimento</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.birthDate || 'Não informada'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Filiação</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.filiacao || 'Não informada'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 font-medium block">Nome Fantasia</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.fantasia || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Representante Legal</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.repName || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">CPF do Representante</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.repCpf || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Cargo / Função</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{activeLead.repRole || 'Não informado'}</span>
                    </div>
                  </>
                )}

                <div className="md:col-span-3 border-t border-slate-100 pt-4">
                  <span className="text-slate-400 font-medium block">Endereço Completo</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {activeLead.address 
                      ? `${activeLead.address}, ${activeLead.number || 'S/N'} ${activeLead.complement ? `- ${activeLead.complement}` : ''} - ${activeLead.bairro || ''}, ${activeLead.city || ''}/${activeLead.state || ''} - CEP: ${activeLead.cep || ''}` 
                      : 'Endereço não cadastrado.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTÓRICO DE ATENDIMENTOS (Requirement 12 & 13) */}
          {activeProntuarioTab === 'historico' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#0d2f43]">Linha do Tempo de Atendimentos</h3>
                  <p className="text-xs text-slate-500">Registros em ordem cronológica inversa (mais recentes primeiro)</p>
                </div>

                <button
                  onClick={() => setIsAtendimentoModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#0d2f43] text-white hover:bg-[#163e56] px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Atendimento</span>
                </button>
              </div>

              {/* Timeline List */}
              <div className="flex flex-col gap-4 relative pl-6 border-l-2 border-slate-200">
                {activeLead.history && activeLead.history.length > 0 ? (
                  activeLead.history.map((atend) => (
                    <div key={atend.id} className="relative bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <span className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-[#0d2f43] border-2 border-white" />

                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        {/* Requirement 12 standard record format */}
                        <span className="text-xs font-bold text-[#0d2f43]">
                          {atend.responsible} registrou {atend.type || 'atendimento'} em {atend.date}, às {atend.time || '14h30'}.
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          atend.situation?.includes('Pendente') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {atend.situation || 'Concluído'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap">{atend.description}</p>

                      {atend.result && (
                        <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                          <strong>Resultado:</strong> {atend.result}
                        </p>
                      )}

                      {atend.needsReturn && (
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Retorno Previsto: <strong>{atend.returnDate || 'Pendente'}</strong> ({atend.returnResponsible})</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4">Nenhum atendimento registrado até o momento.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROCESSOS (Requirement 15) */}
          {activeProntuarioTab === 'processos' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-base text-[#0d2f43] border-b border-slate-100 pb-3">
                Processos Judiciais Vinculados ({clientProcesses.length})
              </h3>

              {clientProcesses.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {clientProcesses.map((proc) => (
                    <div 
                      key={proc.id}
                      onClick={() => onSelectProcess && onSelectProcess(proc.id)}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0d2f43]">{proc.cnj}</span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {proc.court}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">{proc.caseDescription}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <span>Fase: <strong className="text-slate-700">{proc.phase}</strong></span>
                          <span>Responsável: <strong className="text-slate-700">{proc.responsible}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                          <span>Abrir Processo</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Nenhum processo cadastrado para este cliente.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTOS */}
          {activeProntuarioTab === 'documentos' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-base text-[#0d2f43] border-b border-slate-100 pb-3">
                Prontuário Digital de Documentos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Procuração Ad Judicia', 'Contrato de Honorários', 'Documentos de Identificação (RG/CPF)', 'Comprovante de Residência'].map((doc, i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{doc}</span>
                        <span className="text-[10px] text-slate-400">Anexado no cadastro</span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DADOS BANCÁRIOS (Requirement 16 & 21 Restricted Access) */}
          {activeProntuarioTab === 'dados_bancarios' && canAccessBankData && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#0d2f43] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Dados Bancários do Cliente (Acesso Restrito)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Cadastre contas bancárias autorizadas para repasses e reembolsos</p>
                </div>

                <button
                  onClick={() => setIsBankModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#0d2f43] text-white hover:bg-[#163e56] px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Conta</span>
                </button>
              </div>

              {activeLead.bankAccounts && activeLead.bankAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeLead.bankAccounts.map((acc) => (
                    <div key={acc.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col gap-3 relative">
                      {acc.isMain && (
                        <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Conta Principal
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-slate-600" />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">{acc.bank}</span>
                          <span className="text-[10px] text-slate-400">{acc.accountType}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 pt-2">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Agência / Conta</span>
                          <span className="font-bold text-slate-800">{acc.agency} / {acc.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Chave Pix</span>
                          <span className="font-bold text-slate-800">{acc.pixKey || 'Não cadastrada'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 text-[10px] block">Titular / CPF-CNPJ</span>
                          <span className="font-bold text-slate-800">{acc.holder} ({acc.holderCpfCnpj})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Nenhuma conta bancária cadastrada para este cliente.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: OBSERVAÇÕES */}
          {activeProntuarioTab === 'observacoes' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-base text-[#0d2f43] border-b border-slate-100 pb-3">
                Observações Relevantes do Prontuário
              </h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {activeLead.notes || 'Nenhuma observação relevante cadastrada.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* MAIN LIST & TABLE VIEW FOR CLIENTS */
        <div className="flex flex-col gap-6">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search input (Requirement 17) */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome, razão social, CPF, CNPJ, telefone, e-mail, responsável ou origem..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0d2f43] outline-none transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters (Requirement 18) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tipo Filter */}
                <select
                  value={typeFilter}
                  onChange={(e: any) => setTypeFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos os Tipos (PF / PJ)</option>
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>

                {/* Situação Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Todas as Situações</option>
                  {SITUATION_OPTIONS.map(sit => (
                    <option key={sit} value={sit}>{sit}</option>
                  ))}
                </select>

                {/* Origem Filter */}
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Todas as Origens</option>
                  {ORIGIN_OPTIONS.map(orig => (
                    <option key={orig} value={orig}>{orig}</option>
                  ))}
                </select>

                {/* Responsável Filter */}
                <select
                  value={responsibleFilter}
                  onChange={(e) => setResponsibleFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos os Responsáveis</option>
                  {uniqueResponsibles.map(resp => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>

                {/* Profissional Captador Filter */}
                <select
                  value={captadorFilter}
                  onChange={(e) => setCaptadorFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">Todos os Captadores</option>
                  {uniqueCaptadores.map(cap => (
                    <option key={cap} value={cap}>{cap}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold mr-1">Filtros Rápidos:</span>
              {[
                { id: 'ALL', label: 'Todos os Registros' },
                { id: 'retorno_pendente', label: 'Retorno Pendente' },
                { id: 'aguardando_doc', label: 'Aguardando Documentação' },
                { id: 'pendente_contratacao', label: 'Pendente de Contratação' },
                { id: 'ativo', label: 'Clientes Ativos' },
                { id: 'inativo', label: 'Clientes Inativos' },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setQuickFilter(chip.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    quickFilter === chip.id
                      ? 'bg-[#0d2f43] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* CLIENTS TABLE (Requirement 19) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th onClick={() => toggleSort('name')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[200px]">
                      <div className="flex items-center gap-1">
                        <span>Cliente</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => toggleSort('cpfCnpj')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center gap-1">
                        <span>CPF / CNPJ</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => toggleSort('phone')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[125px]">
                      <div className="flex items-center gap-1">
                        <span>Telefone</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => toggleSort('situation')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <span>Situação</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">Origem</th>
                    <th onClick={() => toggleSort('responsible')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <span>Responsável</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => toggleSort('captador')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <span>Captador</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => toggleSort('lastContact')} className="py-3 px-4 cursor-pointer hover:text-slate-800 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <span>Último Atendimento</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap min-w-[180px]">Próxima Ação</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap min-w-[80px]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr 
                        key={lead.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setActiveProntuarioTab('visao_geral');
                        }}
                      >
                        <td className="py-3.5 px-4 font-bold text-[#0d2f43]">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                              lead.type === 'PJ' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {lead.type}
                            </span>
                            <span className="group-hover:underline">{lead.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium whitespace-nowrap">{lead.cpfCnpj}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{lead.phone}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.situation === 'Inativo' || lead.status === 'INATIVO' 
                              ? 'bg-slate-100 text-slate-600'
                              : lead.situation === 'Aguardando documentação' || lead.status === 'AGUARDANDO DOC'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {lead.situation || lead.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">{lead.origin || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">{lead.responsible || 'Dr. Ricardo Camargo'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">{lead.captador || lead.responsible || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{lead.lastContact || '22/07/2026'}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-600 truncate max-w-[280px] block font-medium">
                            {lead.nextAction || 'Sem providência'}
                          </span>
                          {lead.nextActionDate && (
                            <span className="text-[10px] text-slate-400 block">{lead.nextActionDate}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setActiveProntuarioTab('visao_geral');
                              }}
                              className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                              title="Abrir prontuário"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeadId(lead.id);
                                setIsAtendimentoModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Registrar atendimento"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <UserX className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-bold text-slate-600">Nenhum cliente encontrado com os filtros aplicados.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CLIENTE (Requirement 1, 2, 3, 4, 5, 6, 7, 8) */}
      <AnimatePresence>
        {isAddingLead && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="bg-[#0d2f43] text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{editingLeadId ? 'Alterar Informações do Cliente' : 'Cadastro de Novo Cliente'}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{editingLeadId ? 'Atualize os dados cadastrais e salve as alterações' : 'Preencha as informações para a qualificação do cliente'}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsAddingLead(false);
                    resetForm();
                  }}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLeadSubmit} className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                {/* 1. Tipo de Cadastro Switch */}
                <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('PF');
                      setFormCpfCnpj('');
                      setDuplicateClientMatch(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      formType === 'PF' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Pessoa Física (PF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('PJ');
                      setFormCpfCnpj('');
                      setDuplicateClientMatch(null);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      formType === 'PJ' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Pessoa Jurídica (PJ)</span>
                  </button>
                </div>

                {/* Duplication Warning Banner (Requirement 6) */}
                {duplicateClientMatch && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-red-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Já existe um cliente cadastrado com este CPF ou CNPJ.</strong>
                        <span>Cliente: <strong>{duplicateClientMatch.name}</strong> ({duplicateClientMatch.cpfCnpj})</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenExistingClient(duplicateClientMatch)}
                      className="bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs self-start md:self-auto cursor-pointer"
                    >
                      Abrir cadastro existente
                    </button>
                  </div>
                )}

                {/* Main Mandatory Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formType === 'PF' ? 'Nome Completo *' : 'Razão Social *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={formType === 'PF' ? 'Ex: Rhenderson Camargo' : 'Ex: PCG Advogados Associados LTDA'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0d2f43] outline-none"
                    />
                  </div>

                  {formType === 'PJ' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia</label>
                      <input
                        type="text"
                        value={formFantasia}
                        onChange={(e) => setFormFantasia(e.target.value)}
                        placeholder="Ex: PCG Advocacia"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0d2f43] outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formType === 'PF' ? 'CPF *' : 'CNPJ *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formCpfCnpj}
                      onChange={(e) => handleDocChange(e.target.value)}
                      placeholder={formType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:bg-white focus:border-[#0d2f43] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefone *</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0d2f43] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail (Opcional)</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="cliente@email.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0d2f43] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Origem do Cliente *</label>
                    <select
                      value={formOrigin}
                      onChange={(e) => setFormOrigin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:border-[#0d2f43] outline-none cursor-pointer"
                    >
                      {ORIGIN_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {formOrigin.includes('Indicação') && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Quem indicou?</label>
                      <input
                        type="text"
                        value={formIndicatedBy}
                        onChange={(e) => setFormIndicatedBy(e.target.value)}
                        placeholder="Nome da pessoa ou parceiro que fez a indicação"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#0d2f43] outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Profissional Responsável *</label>
                    <select
                      required
                      value={formResponsible}
                      onChange={(e) => setFormResponsible(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:border-[#0d2f43] outline-none cursor-pointer"
                    >
                      {activeUsersList.map(u => (
                        <option key={u.id || u.name} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Profissional Captador</label>
                    <select
                      value={formCaptador}
                      onChange={(e) => setFormCaptador(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:border-[#0d2f43] outline-none cursor-pointer"
                    >
                      {activeUsersList.map(u => (
                        <option key={u.id || u.name} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Situação do Relacionamento</label>
                    <select
                      value={formSituation}
                      onChange={(e) => setFormSituation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:border-[#0d2f43] outline-none cursor-pointer"
                    >
                      {SITUATION_OPTIONS.map(sit => (
                        <option key={sit} value={sit}>{sit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific PF / PJ Complementary Sections */}
                {formType === 'PF' ? (
                  <div className="border-t border-slate-200 pt-4 flex flex-col gap-4">
                    <h4 className="font-bold text-xs text-[#0d2f43] uppercase tracking-wider">Qualificação Complementar (PF)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Nacionalidade</label>
                        <input type="text" value={formNacionalidade} onChange={(e) => setFormNacionalidade(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Estado Civil</label>
                        <input type="text" value={formEstadoCivil} onChange={(e) => setFormEstadoCivil(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Profissão</label>
                        <input type="text" value={formProfissao} onChange={(e) => setFormProfissao(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Número do RG</label>
                        <input type="text" value={formRg} onChange={(e) => setFormRg(e.target.value)} placeholder="00.000.000-0" className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Órgão Expedidor</label>
                        <input type="text" value={formRgOrgao} onChange={(e) => setFormRgOrgao(e.target.value.toUpperCase())} placeholder="Ex: SSP, PC, DETRAN, IFP" className="w-full p-2 border rounded-lg bg-slate-50 uppercase font-medium" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">UF do Expedidor</label>
                        <input type="text" value={formRgUf} onChange={(e) => setFormRgUf(e.target.value.toUpperCase())} maxLength={2} placeholder="SP" className="w-full p-2 border rounded-lg bg-slate-50 uppercase font-bold text-center" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">Data de Nascimento</label>
                        <input type="date" value={formBirthDate} onChange={(e) => setFormBirthDate(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-600 mb-1 font-semibold">Filiação (Nome da Mãe/Pai)</label>
                        <input type="text" value={formFiliacao} onChange={(e) => setFormFiliacao(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-4 flex flex-col gap-4">
                    <h4 className="font-bold text-xs text-[#0d2f43] uppercase tracking-wider">Representante Legal (PJ)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1">Nome do Representante Legal</label>
                        <input type="text" value={formRepName} onChange={(e) => setFormRepName(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">CPF do Representante</label>
                        <input type="text" value={formRepCpf} onChange={(e) => setFormRepCpf(formatCpf(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Cargo / Função</label>
                        <input type="text" value={formRepRole} onChange={(e) => setFormRepRole(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Qualificação Completa</label>
                        <input type="text" value={formRepQualificacao} onChange={(e) => setFormRepQualificacao(e.target.value)} placeholder="Brasileiro, casado, empresário" className="w-full p-2 border rounded-lg bg-slate-50" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Section */}
                <div className="border-t border-slate-200 pt-4 flex flex-col gap-4">
                  <h4 className="font-bold text-xs text-[#0d2f43] uppercase tracking-wider">Endereço Residencial / Sede</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">CEP</label>
                      <input type="text" value={formCep} onChange={(e) => setFormCep(formatCep(e.target.value))} placeholder="00000-000" className="w-full p-2 border rounded-lg bg-slate-50 font-mono" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-600 mb-1">Logradouro / Endereço</label>
                      <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Número</label>
                      <input type="text" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Bairro</label>
                      <input type="text" value={formBairro} onChange={(e) => setFormBairro(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Cidade / UF</label>
                      <div className="flex gap-1">
                        <input type="text" value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="Cidade" className="w-full p-2 border rounded-lg bg-slate-50" />
                        <input type="text" value={formState} onChange={(e) => setFormState(e.target.value)} placeholder="SP" className="w-12 p-2 border rounded-lg bg-slate-50 uppercase text-center" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingLead(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!!duplicateClientMatch}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-[#0d2f43] text-white hover:bg-[#163e56] disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                  >
                    {editingLeadId ? 'Salvar Alterações' : 'Salvar Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTRAR ATENDIMENTO (Requirement 12, 13, 14) */}
      <AnimatePresence>
        {isAtendimentoModalOpen && activeLead && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-[#0d2f43] text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Registrar Atendimento do Cliente</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{activeLead.name}</p>
                </div>
                <button onClick={() => setIsAtendimentoModalOpen(false)} className="p-1 text-slate-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAtendimentoSubmit} className="p-6 flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Atendimento *</label>
                    <select
                      value={atendType}
                      onChange={(e) => setAtendType(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                    >
                      {ATENDIMENTO_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data / Horário</label>
                    <div className="flex gap-1">
                      <input type="date" value={atendDate} onChange={(e) => setAtendDate(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg" />
                      <input type="time" value={atendTime} onChange={(e) => setAtendTime(e.target.value)} className="w-20 p-2 bg-slate-50 border rounded-lg" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição do Atendimento *</label>
                  <textarea
                    rows={3}
                    required
                    value={atendDesc}
                    onChange={(e) => setAtendDesc(e.target.value)}
                    placeholder="Descreva o que foi tratado durante o atendimento..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resultado / Encaminhamento</label>
                  <input
                    type="text"
                    value={atendResult}
                    onChange={(e) => setAtendResult(e.target.value)}
                    placeholder="Ex: Cliente enviará procuração até sexta-feira"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                {/* Return / Pending Task Section (Requirement 14) */}
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={atendNeedsReturn}
                      onChange={(e) => setAtendNeedsReturn(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Marcar Retorno / Devolutiva Pendente</span>
                  </label>

                  {atendNeedsReturn && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                      <div>
                        <label className="block font-bold text-amber-800 mb-1">Responsável pelo Retorno</label>
                        <select
                          value={atendReturnResp}
                          onChange={(e) => setAtendReturnResp(e.target.value)}
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold cursor-pointer"
                        >
                          {activeUsersList.map(u => (
                            <option key={u.id || u.name} value={u.name}>{u.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-amber-800 mb-1">Data da Devolutiva</label>
                        <input
                          type="date"
                          value={atendReturnDate}
                          onChange={(e) => setAtendReturnDate(e.target.value)}
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer text-amber-900 font-bold">
                          <input
                            type="checkbox"
                            checked={atendCreateTask}
                            onChange={(e) => setAtendCreateTask(e.target.checked)}
                            className="w-3.5 h-3.5 text-amber-600"
                          />
                          <span>Criar tarefa institucional no Painel Operacional</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAtendimentoModalOpen(false)}
                    className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg font-bold bg-[#0d2f43] text-white hover:bg-[#163e56] cursor-pointer"
                  >
                    Salvar Atendimento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NOVO DADO BANCÁRIO (Requirement 16) */}
      <AnimatePresence>
        {isBankModalOpen && activeLead && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-[#0d2f43] text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Cadastrar Conta Bancária</h3>
                  <p className="text-xs text-slate-300">{activeLead.name}</p>
                </div>
                <button onClick={() => setIsBankModalOpen(false)} className="p-1 text-slate-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBankAccountSubmit} className="p-6 flex flex-col gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banco *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex: Banco Itaú (341)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agência</label>
                    <input
                      type="text"
                      value={bankAgency}
                      onChange={(e) => setBankAgency(e.target.value)}
                      placeholder="0001"
                      className="w-full p-2 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Número da Conta *</label>
                    <input
                      type="text"
                      required
                      value={bankAccountNum}
                      onChange={(e) => setBankAccountNum(e.target.value)}
                      placeholder="12345-6"
                      className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Conta</label>
                    <select
                      value={bankAccountType}
                      onChange={(e: any) => setBankAccountType(e.target.value)}
                      className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                    >
                      <option value="Corrente">Conta Corrente</option>
                      <option value="Poupança">Conta Poupança</option>
                      <option value="Pagamento">Conta Pagamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Chave Pix</label>
                    <select
                      value={bankPixType}
                      onChange={(e: any) => setBankPixType(e.target.value)}
                      className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                    >
                      <option value="CPF/CNPJ">CPF / CNPJ</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Telefone">Telefone</option>
                      <option value="Chave Aleatória">Chave Aleatória</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chave Pix</label>
                  <input
                    type="text"
                    value={bankPixKey}
                    onChange={(e) => setBankPixKey(e.target.value)}
                    placeholder="Informe a chave Pix"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="bankIsMain"
                    checked={bankIsMain}
                    onChange={(e) => setBankIsMain(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="bankIsMain" className="font-bold text-slate-700 cursor-pointer">
                    Definir como Conta Principal
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBankModalOpen(false)}
                    className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg font-bold bg-[#0d2f43] text-white hover:bg-[#163e56] cursor-pointer"
                  >
                    Salvar Conta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
