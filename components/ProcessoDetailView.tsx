'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, Scale, Calendar, User, Users, Clock, ChevronRight, 
  Plus, ExternalLink, Printer, Trash2, Edit3, CheckCircle2, AlertCircle, 
  Briefcase, Folder, Link2, ShieldAlert, CheckSquare, X, Building2, Phone, Mail, MapPin, Eye, Filter,
  ChevronDown, ChevronUp, FolderOpen, Gavel, Award, FileSpreadsheet, Layers, Search, Info
} from 'lucide-react';
import { Process, CrmLead, ProcessHistoryItem, ProcessParty, ProcessDocument, ProcessDeadlineOrTask, ProcessCommitment, ProcessDecision, SystemUser, AdditionalClient } from '@/lib/mockData';

interface ProcessoDetailViewProps {
  process: Process;
  crmLeads: CrmLead[];
  users?: any[];
  currentUser?: SystemUser | null;
  onBack: () => void;
  onUpdateProcess: (updatedProcess: Process) => void;
  onDeleteProcess: (id: string, reason: string) => void;
  onRestoreProcess?: (id: string) => void;
  onNavigateToCrmLead?: (leadId: string) => void;
  onAddDeadline?: (deadline: any) => void;
  onUpdateDeadline?: (deadline: any) => void;
  onDeleteDeadline?: (id: string, reason?: string) => void;
  onToggleDeadline?: (id: string) => void;
  onAddEvent?: (event: any) => void;
}

export function canUserDeleteProcess(user?: { name?: string; username?: string; role?: string } | null): boolean {
  if (!user) return false;
  const name = (user.name || '').toLowerCase().trim();
  const username = (user.username || '').toLowerCase().trim();
  return (
    name.includes('rhenderson') || username.includes('rhenderson') ||
    name.includes('larissa') || username.includes('larissa') ||
    name.includes('pedro') || username.includes('pedro')
  );
}

export function canViewFinancials(user?: { role?: string } | null): boolean {
  if (!user) return true;
  const role = (user.role || '').toLowerCase();
  return role.includes('ceo') || role.includes('admin') || role.includes('sócio') || role.includes('socio') || role.includes('financeiro') || role.includes('proprietário');
}

export default function ProcessoDetailView({
  process,
  crmLeads,
  users,
  currentUser,
  onBack,
  onUpdateProcess,
  onDeleteProcess,
  onRestoreProcess,
  onNavigateToCrmLead,
  onAddDeadline,
  onUpdateDeadline,
  onDeleteDeadline,
  onToggleDeadline,
  onAddEvent
}: ProcessoDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'dados' | 'andamentos' | 'resumo' | 'prazos' | 'agenda' | 'decisoes' | 'admin'>('dados');

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState(false);

  // Quick Action Modals
  const [isAndamentoModalOpen, setIsAndamentoModalOpen] = useState(false);
  const [newAndamentoDesc, setNewAndamentoDesc] = useState('');
  const [newAndamentoType, setNewAndamentoType] = useState('Andamento do Processo');

  const [isPrazoModalOpen, setIsPrazoModalOpen] = useState(false);
  const [prazoTitle, setPrazoTitle] = useState('');
  const [prazoType, setPrazoType] = useState<'prazo' | 'tarefa'>('prazo');
  const [prazoDueDate, setPrazoDueDate] = useState('');
  const [prazoDueTime, setPrazoDueTime] = useState('17:00');
  const [prazoResp, setPrazoResp] = useState(currentUser?.name || process.responsible || 'Dr. Rodrigo Godoy');
  const [prazoPriority, setPrazoPriority] = useState('Alta');

  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [commitmentTitle, setCommitmentTitle] = useState('');
  const [commitmentType, setCommitmentType] = useState<string>('Audiência');
  const [commitmentDate, setCommitmentDate] = useState('');
  const [commitmentTime, setCommitmentTime] = useState('14:00');
  const [commitmentLocation, setCommitmentLocation] = useState('');
  const [commitmentResp, setCommitmentResp] = useState(currentUser?.name || process.responsible || 'Dr. Rodrigo Godoy');

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Petições');

  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [partyCpfCnpj, setPartyCpfCnpj] = useState('');
  const [partyType, setPartyType] = useState('Parte Contrária');
  const [partyPolo, setPartyPolo] = useState('Passivo');
  const [partyLawyer, setPartyLawyer] = useState('');
  const [partyContacts, setPartyContacts] = useState('');

  // Expand / Collapse parties section
  const [isPartiesExpanded, setIsPartiesExpanded] = useState(false);

  // "Arquivos do Processo" Modal
  const [isArquivosModalOpen, setIsArquivosModalOpen] = useState(false);
  const [filesCategoryFilter, setFilesCategoryFilter] = useState('Todas');
  const [filesSearchQuery, setFilesSearchQuery] = useState('');

  // Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decTitle, setDecTitle] = useState('');
  const [decType, setDecType] = useState('Sentença');
  const [decDate, setDecDate] = useState('');
  const [decPubDate, setDecPubDate] = useState('');
  const [decCourtBody, setDecCourtBody] = useState(process.court || '');
  const [decAuthority, setDecAuthority] = useState(process.judge || '');
  const [decSummary, setDecSummary] = useState('');
  const [decDispositive, setDecDispositive] = useState('');
  const [decPracticalImpact, setDecPracticalImpact] = useState('');
  const [decResult, setDecResult] = useState<string>('Deferido');
  const [decAction, setDecAction] = useState('');
  const [decHasDeadline, setDecHasDeadline] = useState(false);
  const [decDeadlineTitle, setDecDeadlineTitle] = useState('');
  const [decDeadlineDate, setDecDeadlineDate] = useState('');
  const [decDeadlineResp, setDecDeadlineResp] = useState(process.responsible || '');
  const [decNotes, setDecNotes] = useState('');

  // Narrative Summary Modal State
  const [isEditSummaryModalOpen, setIsEditSummaryModalOpen] = useState(false);
  const [editFactsSummary, setEditFactsSummary] = useState(process.factsSummary || process.summary || '');
  const [editActionObject, setEditActionObject] = useState(process.actionObject || process.caseDescription || '');
  const [editClaims, setEditClaims] = useState(process.claims || '');
  const [editStrategy, setEditStrategy] = useState(process.strategy || '');
  const [editAttentionPoints, setEditAttentionPoints] = useState(process.attentionPoints || '');
  const [editInternalNotes, setEditInternalNotes] = useState(process.internalNotes || '');

  // Report Modal State
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSections, setReportSections] = useState({
    dadosGerais: true,
    cliente: true,
    partes: true,
    resumoCaso: true,
    responsaveis: true,
    andamentos: true,
    prazos: true,
    tarefas: true,
    audiencias: true,
    decisoes: true,
    documentos: true
  });

  // Editing Process State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCnj, setEditCnj] = useState(process.cnj);
  const [editControlNumber, setEditControlNumber] = useState(process.controlNumber || '');
  const [editCaseType, setEditCaseType] = useState(process.caseType || 'Judicial');
  const [editClientId, setEditClientId] = useState(process.clientId);
  const [editClientSearch, setEditClientSearch] = useState('');
  const [editClientPolo, setEditClientPolo] = useState(process.clientPolo || 'Autor');
  const [editAdditionalClients, setEditAdditionalClients] = useState<AdditionalClient[]>(process.additionalClients || []);
  const [newAddClientCrmId, setNewAddClientCrmId] = useState('');
  const [newAddClientPolo, setNewAddClientPolo] = useState('Autor');
  const [showEditAddClientForm, setShowEditAddClientForm] = useState(false);
  const [editOpposingParty, setEditOpposingParty] = useState(process.opposingParty || '');
  const [editOpposingPartyPolo, setEditOpposingPartyPolo] = useState(process.opposingPartyPolo || 'Réu');
  const [editClasse, setEditClasse] = useState(process.classe || '');
  const [editSubject, setEditSubject] = useState(process.subject || '');
  const [editSecondarySubjects, setEditSecondarySubjects] = useState(process.secondarySubjects || '');
  const [editArea, setEditArea] = useState(process.area || '');
  const [editCourt, setEditCourt] = useState(process.court || '');
  const [editComarca, setEditComarca] = useState(process.comarca || '');
  const [editVara, setEditVara] = useState(process.vara || '');
  const [editJudge, setEditJudge] = useState(process.judge || '');
  const [editJurisdictionGrade, setEditJurisdictionGrade] = useState(process.jurisdictionGrade || '1º Grau');
  const [editDistribution, setEditDistribution] = useState(process.distribution || '');
  const [editDistributionForm, setEditDistributionForm] = useState(process.distributionForm || 'Sorteio');
  const [editValue, setEditValue] = useState(process.value || 0);
  const [editValueFormatted, setEditValueFormatted] = useState(
    (process.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
  const [editPhase, setEditPhase] = useState(process.phase || '');
  const [editStatus, setEditStatus] = useState(process.status || 'Ativo');
  const [editSegredoJustica, setEditSegredoJustica] = useState(process.segredoJustica || false);
  const [editResponsible, setEditResponsible] = useState(process.responsible || '');
  const [editTeam, setEditTeam] = useState(process.team || '');
  const [editNotes, setEditNotes] = useState(process.notes || '');
  const [editCloudFolderUrl, setEditCloudFolderUrl] = useState(process.cloudFolderUrl || '');

  // Sub-items Edit/Delete Modal States
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [editHistoryDesc, setEditHistoryDesc] = useState('');
  const [editHistoryType, setEditHistoryType] = useState('Andamento');

  const [editingDeadline, setEditingDeadline] = useState<ProcessDeadlineOrTask | null>(null);
  const [editDeadlineTitle, setEditDeadlineTitle] = useState('');
  const [editDeadlineDueDate, setEditDeadlineDueDate] = useState('');
  const [editDeadlineDueTime, setEditDeadlineDueTime] = useState('');
  const [editDeadlineResp, setEditDeadlineResp] = useState('');
  const [editDeadlinePriority, setEditDeadlinePriority] = useState<any>('Normal');

  const [editingCommitment, setEditingCommitment] = useState<ProcessCommitment | null>(null);
  const [editCommTitle, setEditCommTitle] = useState('');
  const [editCommType, setEditCommType] = useState('Audiência');
  const [editCommDate, setEditCommDate] = useState('');
  const [editCommTime, setEditCommTime] = useState('');
  const [editCommLocation, setEditCommLocation] = useState('');
  const [editCommResp, setEditCommResp] = useState('');

  const [editingDecision, setEditingDecision] = useState<ProcessDecision | null>(null);
  const [editDecTitle, setEditDecTitle] = useState('');
  const [editDecType, setEditDecType] = useState('Despacho');
  const [editDecDate, setEditDecDate] = useState('');
  const [editDecResult, setEditDecResult] = useState('Deferido');
  const [editDecSummary, setEditDecSummary] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const isUserAuthorizedToDelete = canUserDeleteProcess(currentUser);
  const userCanSeeFinancials = canViewFinancials(currentUser);

  const selectedCrmLead = crmLeads.find(l => l.id === process.clientId);

  // Action: Add Andamento
  const handleAddAndamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAndamentoDesc.trim()) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: newAndamentoType,
      description: newAndamentoDesc.trim(),
    };

    const updatedProcess: Process = {
      ...process,
      lastUpdateDate: formattedDate,
      lastMovement: newAndamentoDesc.trim(),
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    setNewAndamentoDesc('');
    setIsAndamentoModalOpen(false);
  };

  // Action: Add Prazo or Tarefa
  const handleAddPrazoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prazoTitle.trim() || !prazoDueDate) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newDeadlineItem: ProcessDeadlineOrTask = {
      id: `pt-${Date.now()}`,
      type: prazoType,
      title: prazoTitle.trim(),
      dueDate: prazoDueDate,
      dueTime: prazoDueTime,
      responsible: prazoResp,
      status: 'Pendente',
      priority: prazoPriority
    };

    const historyDescription = prazoType === 'prazo'
      ? `Prazo criado: "${prazoTitle.trim()}" com vencimento para ${prazoDueDate} às ${prazoDueTime} (Responsável: ${prazoResp}).`
      : `Tarefa criada: "${prazoTitle.trim()}" com vencimento para ${prazoDueDate} (Responsável: ${prazoResp}).`;

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: prazoType === 'prazo' ? 'Prazo Criado' : 'Tarefa Criada',
      description: historyDescription
    };

    const updatedDeadlines = [newDeadlineItem, ...(process.deadlinesAndTasks || [])];
    
    // Calculate next deadline
    const pendingDeadlines = updatedDeadlines
      .filter(d => d.type === 'prazo' && d.status !== 'Concluído')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const nextDl = pendingDeadlines[0];

    const updatedProcess: Process = {
      ...process,
      nextDeadlineDate: nextDl ? nextDl.dueDate : process.nextDeadlineDate,
      nextDeadlineTitle: nextDl ? nextDl.title : process.nextDeadlineTitle,
      pendingTasksCount: updatedDeadlines.filter(d => d.status !== 'Concluído').length,
      deadlinesAndTasks: updatedDeadlines,
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);

    // Sync globally if callback exists
    if (onAddDeadline) {
      onAddDeadline({
        id: newDeadlineItem.id,
        processCnj: process.cnj,
        processClient: process.client,
        description: `${prazoType === 'prazo' ? 'PRAZO' : 'TAREFA'}: ${prazoTitle.trim()} - Proc: ${process.cnj}`,
        dueDate: prazoDueDate,
        status: 'Em Produção',
        responsible: prazoResp,
        type: prazoType === 'prazo' ? 'processual' : 'interno'
      });
    }

    setPrazoTitle('');
    setIsPrazoModalOpen(false);
  };

  // Toggle deadline / task status
  const handleToggleDeadlineStatus = (id: string) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let toggledTitle = '';
    let newStatus = '';

    const updatedDeadlines = (process.deadlinesAndTasks || []).map(item => {
      if (item.id === id) {
        toggledTitle = item.title;
        newStatus = item.status === 'Concluído' ? 'Pendente' : 'Concluído';
        return { ...item, status: newStatus };
      }
      return item;
    });

    const newHistoryItem: ProcessHistoryItem = {
      // eslint-disable-next-line react-hooks/purity
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: newStatus === 'Concluído' ? 'Prazo/Tarefa Concluída' : 'Prazo/Tarefa Reaberta',
      description: `${newStatus === 'Concluído' ? 'Concluiu' : 'Reabriu'} a pendência: "${toggledTitle}".`
    };

    const pending = updatedDeadlines.filter(d => d.status !== 'Concluído');

    const updatedProcess: Process = {
      ...process,
      pendingTasksCount: pending.length,
      deadlinesAndTasks: updatedDeadlines,
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    if (onToggleDeadline) {
      onToggleDeadline(id);
    }
  };

  // Action: Add Commitment
  const handleAddCommitmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitmentTitle.trim() || !commitmentDate) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newCommitment: ProcessCommitment = {
      id: `comm-${Date.now()}`,
      title: commitmentTitle.trim(),
      type: commitmentType,
      date: commitmentDate,
      time: commitmentTime,
      location: commitmentLocation.trim(),
      responsible: commitmentResp
    };

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Compromisso Agendado',
      description: `Agendou ${commitmentType}: "${commitmentTitle.trim()}" para ${commitmentDate} às ${commitmentTime} em ${commitmentLocation || 'Local a definir'}.`
    };

    const updatedCommitments = [newCommitment, ...(process.commitments || [])];

    const updatedProcess: Process = {
      ...process,
      nextAudienceDate: commitmentDate,
      nextAudienceTitle: `${commitmentType}: ${commitmentTitle.trim()}`,
      commitments: updatedCommitments,
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);

    if (onAddEvent) {
      onAddEvent({
        id: newCommitment.id,
        title: `${commitmentType}: ${commitmentTitle.trim()} - Proc ${process.cnj}`,
        type: commitmentType.toLowerCase().includes('audi') ? 'audiencia' : 'reuniao',
        process: process.cnj,
        date: commitmentDate,
        start: commitmentTime,
        end: '16:00',
        responsible: commitmentResp
      });
    }

    setCommitmentTitle('');
    setIsCommitmentModalOpen(false);
  };

  // Action: Add Document
  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newDoc: ProcessDocument = {
      id: `doc-${Date.now()}`,
      name: docName.trim(),
      category: docCategory,
      author: currentUser?.name || 'Membro do Sistema',
      date: formattedDate,
      time: formattedTime
    };

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Documento Anexado',
      description: `Adicionou o documento "${docName.trim()}" na categoria ${docCategory}.`
    };

    const updatedProcess: Process = {
      ...process,
      documents: [newDoc, ...(process.documents || [])],
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    setDocName('');
    setIsDocModalOpen(false);
  };

  // Action: Add Party
  const handleAddPartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newParty: ProcessParty = {
      id: `party-${Date.now()}`,
      name: partyName.trim(),
      cpfCnpj: partyCpfCnpj.trim(),
      type: partyType,
      polo: partyPolo,
      lawyer: partyLawyer.trim(),
      contacts: partyContacts.trim()
    };

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Parte Adicionada',
      description: `Incluiu ${partyName.trim()} (${partyType} - Polo ${partyPolo}) no processo.`
    };

    const updatedProcess: Process = {
      ...process,
      parties: [...(process.parties || []), newParty],
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    setPartyName('');
    setPartyCpfCnpj('');
    setIsPartyModalOpen(false);
  };

  // Action: Open Edit Modal
  const handleOpenEditModal = () => {
    setEditCnj(process.cnj);
    setEditControlNumber(process.controlNumber || '');
    setEditCaseType(process.caseType || 'Judicial');
    setEditClientId(process.clientId);
    setEditClientPolo(process.clientPolo || 'Autor');
    setEditAdditionalClients(process.additionalClients || []);
    setShowEditAddClientForm(false);
    setNewAddClientCrmId('');
    setEditOpposingParty(process.opposingParty || '');
    setEditOpposingPartyPolo(process.opposingPartyPolo || 'Réu');
    setEditClasse(process.classe || '');
    setEditSubject(process.subject || '');
    setEditSecondarySubjects(process.secondarySubjects || '');
    setEditArea(process.area || '');
    setEditCourt(process.court || '');
    setEditComarca(process.comarca || '');
    setEditVara(process.vara || '');
    setEditJudge(process.judge || '');
    setEditJurisdictionGrade(process.jurisdictionGrade || '1º Grau');
    setEditDistribution(process.distribution || '');
    setEditDistributionForm(process.distributionForm || 'Sorteio');
    setEditValue(process.value || 0);
    setEditValueFormatted((process.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setEditPhase(process.phase || '');
    setEditStatus(process.status || 'Ativo');
    setEditSegredoJustica(process.segredoJustica || false);
    setEditResponsible(process.responsible || '');
    setEditTeam(process.team || '');
    setEditNotes(process.notes || '');
    setEditCloudFolderUrl(process.cloudFolderUrl || '');
    setIsEditModalOpen(true);
  };

  // --- SUB-ITEM EDIT AND DELETE HANDLERS ---
  // History Item Delete
  const handleDeleteHistoryItem = (idOrIdx: string | number) => {
    if (!confirm('Deseja realmente excluir este andamento do histórico?')) return;
    const updatedHistory = (process.history || []).filter((h, i) => (h.id ? h.id !== idOrIdx : i !== idOrIdx));
    onUpdateProcess({
      ...process,
      history: updatedHistory
    });
  };

  // History Item Edit Save
  const handleSaveHistoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHistoryIndex === null || !editHistoryDesc.trim()) return;
    const updatedHistory = [...(process.history || [])];
    if (updatedHistory[editingHistoryIndex]) {
      updatedHistory[editingHistoryIndex] = {
        ...updatedHistory[editingHistoryIndex],
        actionType: editHistoryType,
        description: editHistoryDesc.trim()
      };
    }
    onUpdateProcess({
      ...process,
      history: updatedHistory
    });
    setEditingHistoryIndex(null);
  };

  // Deadline Delete
  const handleDeleteDeadlineItem = (id: string) => {
    const itemToDel = (process.deadlinesAndTasks || []).find(d => d.id === id);
    const reason = prompt('Informe o motivo da exclusão deste prazo/tarefa para fins de auditoria:');
    if (reason === null) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const auditHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Prazo/Tarefa Excluído',
      description: `Excluiu o prazo/tarefa "${itemToDel?.title || id}" do processo. Motivo: ${reason.trim() || 'Sem justificativa informada'}.`
    };

    const updatedItems = (process.deadlinesAndTasks || []).filter(d => d.id !== id);
    const pending = updatedItems.filter(d => d.status !== 'Concluído');
    onUpdateProcess({
      ...process,
      deadlinesAndTasks: updatedItems,
      pendingTasksCount: pending.length,
      history: [auditHistoryItem, ...(process.history || [])]
    });

    if (onDeleteDeadline) {
      onDeleteDeadline(id, reason);
    }
  };

  // Deadline Edit Save
  const handleSaveDeadlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeadline || !editDeadlineTitle.trim()) return;
    let editedItem: any = null;
    const updatedDeadlines = (process.deadlinesAndTasks || []).map(item => {
      if (item.id === editingDeadline.id) {
        editedItem = {
          ...item,
          title: editDeadlineTitle.trim(),
          dueDate: editDeadlineDueDate,
          dueTime: editDeadlineDueTime,
          responsible: editDeadlineResp,
          priority: editDeadlinePriority
        };
        return editedItem;
      }
      return item;
    });
    onUpdateProcess({
      ...process,
      deadlinesAndTasks: updatedDeadlines
    });
    if (onUpdateDeadline && editedItem) {
      onUpdateDeadline({
        id: editedItem.id,
        processId: process.id,
        processCnj: process.cnj,
        processClient: process.client,
        title: editedItem.title,
        description: editedItem.title,
        dueDate: editedItem.dueDate,
        dueTime: editedItem.dueTime,
        responsible: editedItem.responsible,
        priority: editedItem.priority,
        status: editedItem.status === 'Concluído' ? 'Cumprido' : 'Em andamento'
      });
    }
    setEditingDeadline(null);
  };

  // Commitment Delete
  const handleDeleteCommitment = (id: string) => {
    if (!confirm('Deseja realmente excluir este compromisso?')) return;
    const updatedComm = (process.commitments || []).filter(c => c.id !== id);
    onUpdateProcess({
      ...process,
      commitments: updatedComm
    });
  };

  // Commitment Edit Save
  const handleSaveCommitmentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitment || !editCommTitle.trim()) return;
    const updatedCommitments = (process.commitments || []).map(c => {
      if (c.id === editingCommitment.id) {
        return {
          ...c,
          title: editCommTitle.trim(),
          type: editCommType,
          date: editCommDate,
          time: editCommTime,
          location: editCommLocation.trim(),
          responsible: editCommResp
        };
      }
      return c;
    });
    onUpdateProcess({
      ...process,
      commitments: updatedCommitments
    });
    setEditingCommitment(null);
  };

  // Decision Delete
  const handleDeleteDecision = (id: string) => {
    if (!confirm('Deseja realmente excluir esta decisão judicial?')) return;
    const updatedDecisions = (process.decisions || []).filter(d => d.id !== id);
    onUpdateProcess({
      ...process,
      decisions: updatedDecisions
    });
  };

  // Decision Edit Save
  const handleSaveDecisionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDecision || !editDecTitle.trim()) return;
    const updatedDecisions = (process.decisions || []).map(d => {
      if (d.id === editingDecision.id) {
        return {
          ...d,
          title: editDecTitle.trim(),
          decisionType: editDecType,
          decisionDate: editDecDate,
          result: editDecResult,
          summary: editDecSummary.trim()
        };
      }
      return d;
    });
    onUpdateProcess({
      ...process,
      decisions: updatedDecisions
    });
    setEditingDecision(null);
  };

  // Party Delete
  const handleDeleteParty = (idOrIdx: string | number) => {
    if (!confirm('Deseja realmente remover esta parte do processo?')) return;
    const updatedParties = (process.parties || []).filter((p, i) => (p.id ? p.id !== idOrIdx : i !== idOrIdx));
    onUpdateProcess({
      ...process,
      parties: updatedParties
    });
  };

  // Document Delete
  const handleDeleteDocument = (docId: string) => {
    if (!confirm('Deseja realmente remover este documento?')) return;
    const updatedDocs = (process.documents || []).filter(d => d.id !== docId);
    onUpdateProcess({
      ...process,
      documents: updatedDocs
    });
  };

  // Action: Save Process Edit
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLead = crmLeads.find(l => l.id === editClientId);
    if (!selectedLead) {
      alert('Selecione um cliente válido cadastrado no CRM.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const changes: string[] = [];
    if (editStatus !== process.status) {
      changes.push(`Situação alterada de "${process.status}" para "${editStatus}".`);
    }
    if (editPhase !== process.phase) {
      changes.push(`Fase alterada de "${process.phase}" para "${editPhase}".`);
    }
    if (editResponsible !== process.responsible) {
      changes.push(`Responsável alterado de "${process.responsible}" para "${editResponsible}".`);
    }
    if (editTeam !== process.team) {
      changes.push(`Equipe alterada de "${process.team}" para "${editTeam}".`);
    }

    const historyDescription = changes.length > 0 
      ? `Ficha do processo editada: ${changes.join(' ')}`
      : `Ficha cadastral do processo atualizada por ${currentUser?.name || 'Usuário'}.`;

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Processo Editado',
      description: historyDescription
    };

    // Sync parties list with updated primary & additional clients
    const nonClientParties = (process.parties || []).filter(p => !p.isClient && p.type !== 'Cliente');
    const syncedParties: ProcessParty[] = [
      { name: selectedLead.name, type: 'Cliente', polo: editClientPolo, cpfCnpj: selectedLead.cpfCnpj, isClient: true, crmLeadId: selectedLead.id }
    ];
    editAdditionalClients.forEach(ac => {
      syncedParties.push({
        name: ac.name,
        type: 'Cliente',
        polo: ac.polo || editClientPolo,
        cpfCnpj: ac.cpfCnpj,
        isClient: true,
        crmLeadId: ac.clientId
      });
    });

    const updatedProcess: Process = {
      ...process,
      cnj: editCnj,
      controlNumber: editControlNumber,
      caseType: editCaseType,
      clientId: selectedLead.id,
      client: selectedLead.name,
      clientCpfCnpj: selectedLead.cpfCnpj,
      clientPolo: editClientPolo,
      additionalClients: editAdditionalClients.length > 0 ? editAdditionalClients : undefined,
      parties: [...syncedParties, ...nonClientParties],
      opposingParty: editOpposingParty,
      opposingPartyPolo: editOpposingPartyPolo,
      classe: editClasse,
      subject: editSubject,
      secondarySubjects: editSecondarySubjects,
      area: editArea,
      court: editCourt,
      comarca: editComarca,
      vara: editVara,
      judge: editJudge,
      jurisdictionGrade: editJurisdictionGrade,
      distribution: editDistribution,
      distributionForm: editDistributionForm,
      value: Number(editValue) || 0,
      phase: editPhase,
      status: editStatus,
      segredoJustica: editSegredoJustica,
      responsible: editResponsible,
      team: editTeam,
      notes: editNotes,
      cloudFolderUrl: editCloudFolderUrl,
      lastUpdateDate: formattedDate,
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    setIsEditModalOpen(false);
  };

  // Action: Add Decision
  const handleAddDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decTitle.trim()) {
      alert('Informe o título da decisão.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newDecisionId = `dec-${Date.now()}`;
    let linkedDeadlineId = undefined;

    // If decision generated a deadline
    let updatedDeadlines = [...(process.deadlinesAndTasks || [])];
    if (decHasDeadline && decDeadlineDate) {
      linkedDeadlineId = `dead-${Date.now()}`;
      const newDeadline: ProcessDeadlineOrTask = {
        id: linkedDeadlineId,
        type: 'prazo',
        title: decDeadlineTitle || `Prazo decorrente: ${decTitle}`,
        dueDate: decDeadlineDate,
        dueTime: '17:00',
        responsible: process.responsible || currentUser?.name || 'Dr. Rodrigo Godoy',
        status: 'Pendente',
        priority: 'Alta',
        linkedDecisionId: newDecisionId
      };
      updatedDeadlines.push(newDeadline);

      if (onAddDeadline) {
        onAddDeadline({
          ...newDeadline,
          cnj: process.cnj,
          client: process.client,
          processId: process.id
        });
      }
    }

    const newDecision: ProcessDecision = {
      id: newDecisionId,
      title: decTitle.trim(),
      decisionType: decType,
      decisionDate: decDate || formattedDate,
      publicationDate: decPubDate || undefined,
      courtBody: decCourtBody || process.court,
      authority: decAuthority || process.judge,
      summary: decSummary.trim() || 'Sem resumo cadastrado.',
      mainDispositive: decDispositive.trim() || undefined,
      practicalImpact: decPracticalImpact.trim() || undefined,
      result: decResult,
      necessaryAction: decAction.trim() || undefined,
      hasDeadline: decHasDeadline,
      relatedDeadlineId: linkedDeadlineId,
      notes: decNotes.trim() || undefined,
      createdBy: currentUser?.name || 'Sistema',
      createdAtDate: formattedDate,
      createdAtTime: formattedTime
    };

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Decisão Registrada',
      description: `Registrou decisão: ${decTitle} (${decType} - Resultado: ${decResult}).`
    };

    const updatedProcess: Process = {
      ...process,
      decisions: [newDecision, ...(process.decisions || [])],
      deadlinesAndTasks: updatedDeadlines,
      lastUpdateDate: formattedDate,
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    setIsDecisionModalOpen(false);
    // Reset decision fields
    setDecTitle('');
    setDecSummary('');
    setDecDispositive('');
    setDecPracticalImpact('');
    setDecAction('');
    setDecHasDeadline(false);
    setDecDeadlineTitle('');
    setDecDeadlineDate('');
    setDecNotes('');
  };

  // Action: Save Narrative Summary (Aba Resumo)
  const handleSaveSummarySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newHistoryItem: ProcessHistoryItem = {
      id: `hist-${Date.now()}`,
      date: formattedDate,
      time: formattedTime,
      user: currentUser?.name || 'Membro do Sistema',
      actionType: 'Resumo Atualizado',
      description: `Resumo elaborado pelo escritório foi atualizado por ${currentUser?.name || 'Usuário'}.`
    };

    const updatedProcess: Process = {
      ...process,
      factsSummary: editFactsSummary.trim(),
      actionObject: editActionObject.trim(),
      claims: editClaims.trim(),
      strategy: editStrategy.trim(),
      attentionPoints: editAttentionPoints.trim(),
      internalNotes: editInternalNotes.trim(),
      summary: editFactsSummary.trim() || process.summary,
      summaryUpdatedBy: currentUser?.name || 'Usuário',
      summaryUpdatedAt: `${formattedDate} às ${formattedTime}`,
      lastUpdateDate: formattedDate,
      history: [newHistoryItem, ...(process.history || [])]
    };

    onUpdateProcess(updatedProcess);
    setIsEditSummaryModalOpen(false);
  };

  // Action: Delete Process
  const handleConfirmDelete = () => {
    if (!deleteReason.trim()) {
      alert('Por favor, informe obrigatoriamente o motivo da exclusão.');
      return;
    }
    onDeleteProcess(process.id, deleteReason.trim());
    setIsDeleteModalOpen(false);
  };

  // Filtered CRM leads for edit modal search
  const filteredCrmLeadsForEdit = crmLeads.filter(l => {
    const q = editClientSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      (l.cpfCnpj && l.cpfCnpj.includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q))
    );
  });

  // Clean Process Title for Header (prevents showing giant multi-paragraph narrative as <h1>)
  const processHeaderTitle = React.useMemo(() => {
    if (process.classe && process.subject && process.subject.length <= 80) {
      return `${process.classe} — ${process.subject}`;
    }
    if (process.classe) {
      return `${process.classe}${process.area ? ` — ${process.area}` : ''}`;
    }
    const firstSubjectLine = (process.subject || '').split('\n')[0].split('.')[0].trim();
    if (firstSubjectLine && firstSubjectLine.length > 3 && firstSubjectLine.length <= 80) {
      return firstSubjectLine;
    }
    const firstDescLine = (process.caseDescription || '').split('\n')[0].split('.')[0].trim();
    if (firstDescLine && firstDescLine.length > 3 && firstDescLine.length <= 80) {
      return firstDescLine;
    }
    if (process.client && process.opposingParty) {
      return `${process.area || 'Ação Judicial'} — ${process.client} x ${process.opposingParty}`;
    }
    return `Processo ${process.area || 'Judicial'} — CNJ ${process.cnj}`;
  }, [process.classe, process.subject, process.caseDescription, process.area, process.cnj, process.client, process.opposingParty]);

  const linkedClientLead = crmLeads.find(l => l.id === process.clientId || l.name.toLowerCase() === (process.client || '').toLowerCase());

  return (
    <>
      <div className="flex flex-col gap-6 relative print:hidden">
      {/* Soft Delete Banner if deleted */}
      {process.deleted && (
        <div className="bg-red-500 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">PROCESSO EXCLUÍDO LOGICAMENTE</p>
              <p className="text-xs text-red-100">
                Excluído por: {process.deletedBy || 'Administrador'} em {process.deletedAt || 'Data recente'}. 
                Motivo: {process.deletionReason || 'Sem justificativa registrada.'}
              </p>
            </div>
          </div>

          {isUserAuthorizedToDelete && onRestoreProcess && (
            <button
              onClick={() => onRestoreProcess(process.id)}
              className="bg-white text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Restaurar Processo
            </button>
          )}
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0d2f43] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Listagem de Processos</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedCrmLead && onNavigateToCrmLead && (
            <button
              onClick={() => onNavigateToCrmLead(selectedCrmLead.id)}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-[#0d2f43] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Abrir Cliente no CRM</span>
            </button>
          )}

          {process.cloudFolderUrl && (
            <a
              href={process.cloudFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Acessar Pasta Digital</span>
            </a>
          )}

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Relatório</span>
          </button>

          <button
            onClick={handleOpenEditModal}
            className="px-3.5 py-2 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Processo</span>
          </button>

          {isUserAuthorizedToDelete && !process.deleted && (
            <button
              onClick={() => {
                setDeleteReason('');
                setDeleteConfirmationStep(false);
                setIsDeleteModalOpen(true);
              }}
              className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Processo</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. CABEÇALHO COMPACTO DO PROCESSO */}
      <div className="bg-[#0d2f43] text-white rounded-2xl p-5 md:p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10 border-b border-slate-700/60 pb-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-xs font-bold rounded border border-blue-500/30">
                CNJ: {process.cnj}
              </span>
              <span className="px-2 py-0.5 bg-slate-700/80 text-slate-200 text-xs font-bold rounded border border-slate-600">
                {process.caseType || 'Judicial'}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold uppercase tracking-wider ${
                process.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                process.status === 'Suspenso' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                process.status === 'Encerrado' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}>
                {process.status || 'Ativo'}
              </span>
              {process.segredoJustica && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded border border-amber-500/30">
                  Segredo de Justiça
                </span>
              )}
            </div>

            <h1 className="font-display text-xl md:text-2xl font-extrabold tracking-tight mt-0.5 text-white">
              {processHeaderTitle}
            </h1>

            <div className="text-slate-300 text-xs font-medium flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
              <p className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  {process.additionalClients && process.additionalClients.length > 0 ? 'Clientes' : 'Cliente'} ({process.clientPolo || 'Autor'}):
                </span>
                <strong className="text-white">{process.client}</strong>
                {process.additionalClients && process.additionalClients.length > 0 && (
                  <span className="text-blue-200 font-semibold text-xs">
                    (+ {process.additionalClients.map(c => c.name).join(', ')})
                  </span>
                )}
              </p>
              {process.opposingParty && (
                <p className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Parte Contrária ({process.opposingPartyPolo || 'Réu'}):</span>
                  <strong className="text-white">{process.opposingParty}</strong>
                </p>
              )}
              <p className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Fase:</span>
                <strong className="text-slate-200">{process.phase}</strong>
              </p>
              <p className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Área:</span>
                <strong className="text-slate-200">{process.area}</strong>
              </p>
              <p className="flex items-center gap-1.5 border-l border-slate-700 pl-4">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Responsável:</span>
                <strong className="text-blue-300">{process.responsible}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Quick Buttons */}
        <div className="mt-3 pt-1 flex flex-wrap items-center gap-2 relative z-10 text-xs">
          <button
            onClick={() => setIsAndamentoModalOpen(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-300" />
            <span>Novo Andamento</span>
          </button>

          <button
            onClick={() => {
              setPrazoType('prazo');
              setIsPrazoModalOpen(true);
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Novo Prazo</span>
          </button>

          <button
            onClick={() => {
              setPrazoType('tarefa');
              setIsPrazoModalOpen(true);
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
            <span>Nova Tarefa</span>
          </button>

          <button
            onClick={() => setIsCommitmentModalOpen(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-300" />
            <span>Novo Compromisso / Audiência</span>
          </button>

          <button
            onClick={() => setIsDecisionModalOpen(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-300" />
            <span>Nova Decisão</span>
          </button>
        </div>
      </div>

      {/* ABAS DO PRONTUÁRIO */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 sm:gap-6 text-xs font-bold text-slate-500 bg-white px-4 rounded-xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'dados', label: 'Dados e Partes do Processo', icon: <Scale className="w-4 h-4" /> },
          { id: 'andamentos', label: `Andamentos (${(process.history || []).length})`, icon: <Clock className="w-4 h-4" /> },
          { id: 'resumo', label: 'Resumo Narrativo do Caso', icon: <FileText className="w-4 h-4" /> },
          { id: 'prazos', label: `Prazos e Tarefas (${(process.deadlinesAndTasks || []).filter(d => d.status !== 'Concluído').length})`, icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'agenda', label: `Agenda (${(process.commitments || []).length})`, icon: <Calendar className="w-4 h-4" /> },
          { id: 'decisoes', label: `Decisões (${(process.decisions || []).length})`, icon: <Gavel className="w-4 h-4" /> },
          { id: 'admin', label: 'Informações Administrativas', icon: <Briefcase className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 whitespace-nowrap border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0d2f43] text-[#0d2f43] font-black'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ABA: DADOS E PARTES DO PROCESSO */}
      {activeTab === 'dados' && (
        <div className="flex flex-col gap-6">
          {/* 2. DADOS DO PROCESSO */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#0d2f43]" />
                <h2 className="text-sm font-extrabold text-[#0d2f43] uppercase tracking-wider">
                  Dados do Processo
                </h2>
              </div>
              <button
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-blue-800 hover:text-[#0d2f43] flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número do Processo (CNJ)</span>
                <p className="font-mono font-black text-[#0d2f43] text-sm mt-0.5">{process.cnj}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número de Controle Interno</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.controlNumber || 'Não informado'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo do Processo</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.caseType || 'Judicial'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classe Processual</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.classe || 'Procedimento Comum Cível'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assunto Principal</span>
                <p className="font-bold text-slate-900 mt-0.5 line-clamp-2" title={process.subject}>
                  {process.subject && process.subject.length <= 80 
                    ? process.subject 
                    : (process.subject ? `${process.subject.split('\n')[0].split('.')[0].trim().slice(0, 75)}...` : 'Prestação de Serviços')}
                </p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assuntos Complementares</span>
                <p className="font-medium text-slate-700 mt-0.5">{process.secondarySubjects || 'Nenhum'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área do Direito</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.area || 'Cível'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tribunal</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.court || 'TJSP'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comarca ou Foro</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.comarca || 'Comarca Central'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vara ou Unidade</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.vara || '1ª Vara Cível'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Juiz / Autoridade</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.judge || 'Não informado'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Distribuição</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.distribution || '15/03/2024'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Forma de Distribuição</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.distributionForm || 'Sorteio'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grau de Jurisdição</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.jurisdictionGrade || '1º Grau'}</p>
              </div>

              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Valor da Causa</span>
                <p className="font-mono font-black text-emerald-900 text-sm mt-0.5">{formatCurrency(process.value)}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fase Processual</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.phase}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Situação</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.status || 'Ativo'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nível de Sigilo</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.segredoJustica ? 'Segredo de Justiça (Restrito)' : 'Público'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável Principal</span>
                <p className="font-bold text-[#0d2f43] mt-0.5">{process.responsible}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equipe Responsável</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.team || 'Contencioso Cível'}</p>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Última Atualização</span>
                <p className="font-bold text-slate-800 mt-0.5">{process.lastUpdateDate}</p>
              </div>
            </div>
          </div>

          {/* 3. PARTES DO PROCESSO */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0d2f43]" />
                <h2 className="text-sm font-extrabold text-[#0d2f43] uppercase tracking-wider">
                  Partes do Processo
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPartyModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Parte</span>
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Primary Client Card */}
                <div className="bg-blue-50/30 p-4 rounded-xl border-2 border-blue-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-700" />
                        <span>CLIENTE PRINCIPAL ({process.clientPolo || 'Autor'})</span>
                      </span>
                      {selectedCrmLead && onNavigateToCrmLead && (
                        <button
                          onClick={() => onNavigateToCrmLead(selectedCrmLead.id)}
                          className="px-2 py-0.5 bg-white text-blue-700 border border-blue-200 rounded hover:bg-blue-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Abrir no CRM</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <h4 className="font-black text-slate-900 text-sm">{process.client}</h4>
                    {process.clientCpfCnpj && (
                      <p className="text-xs font-mono text-slate-500 mt-0.5">CPF/CNPJ: {process.clientCpfCnpj}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 font-medium">Responsável pelo Processo: <strong className="text-slate-800">{process.responsible}</strong></p>
                  </div>
                </div>

                {/* Additional Clients Cards */}
                {(process.additionalClients || []).map((ac, idx) => {
                  const acLead = crmLeads.find(l => l.id === ac.clientId || l.name.toLowerCase() === ac.name.toLowerCase());
                  return (
                    <div key={ac.id || idx} className="bg-blue-50/20 p-4 rounded-xl border border-blue-200 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2.5 py-0.5 bg-blue-100/80 text-blue-900 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-600" />
                            <span>CLIENTE #{idx + 2} ({ac.polo || process.clientPolo || 'Autor'})</span>
                          </span>
                          {acLead && onNavigateToCrmLead && (
                            <button
                              onClick={() => onNavigateToCrmLead(acLead.id)}
                              className="px-2 py-0.5 bg-white text-blue-700 border border-blue-200 rounded hover:bg-blue-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Abrir no CRM</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <h4 className="font-black text-slate-900 text-sm">{ac.name}</h4>
                        {ac.cpfCnpj && (
                          <p className="text-xs font-mono text-slate-500 mt-0.5">CPF/CNPJ: {ac.cpfCnpj}</p>
                        )}
                        {ac.phone && <p className="text-xs text-slate-600 mt-1">Telefone: {ac.phone}</p>}
                        {ac.email && <p className="text-xs text-slate-600 mt-0.5">E-mail: {ac.email}</p>}
                      </div>
                    </div>
                  );
                })}

                {/* Primary Opposing Party Card */}
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 text-[10px] font-black uppercase rounded-md block w-max mb-2">
                      PARTE CONTRÁRIA ({process.opposingPartyPolo || 'Réu'})
                    </span>

                    <h4 className="font-extrabold text-slate-900 text-sm">{process.opposingParty || 'Não informada'}</h4>
                    {process.opposingPartyCpfCnpj && (
                      <p className="text-xs font-mono text-slate-500 mt-0.5">CPF/CNPJ: {process.opposingPartyCpfCnpj}</p>
                    )}
                    {process.opposingPartyLawyer && (
                      <p className="text-xs text-slate-600 mt-2 font-medium">Advogado da Parte Contrária: <strong className="text-slate-800">{process.opposingPartyLawyer}</strong></p>
                    )}
                  </div>
                </div>

                {/* Additional Opposing Parties Cards */}
                {(process.additionalOpposingParties || []).map((aop, idx) => (
                  <div key={aop.id || idx} className="bg-rose-50/20 p-4 rounded-xl border border-rose-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 bg-rose-100/80 text-rose-900 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                          <Users className="w-3 h-3 text-rose-600" />
                          <span>PARTE CONTRÁRIA #{idx + 2} ({aop.polo || 'Réu'})</span>
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">{aop.name}</h4>
                      {aop.cpfCnpj && (
                        <p className="text-xs font-mono text-slate-500 mt-0.5">CPF/CNPJ: {aop.cpfCnpj}</p>
                      )}
                      {aop.lawyer && (
                        <p className="text-xs text-slate-600 mt-1">Advogado: {aop.lawyer}</p>
                      )}
                      {aop.contacts && (
                        <p className="text-xs text-slate-500 mt-0.5">Contato: {aop.contacts}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Additional Registered Other Parties */}
                {(() => {
                  const filteredParties = (process.parties || []).filter(p => {
                    if (p.name === process.client || p.name === process.opposingParty) return false;
                    if ((process.additionalClients || []).some(ac => ac.name === p.name)) return false;
                    if ((process.additionalOpposingParties || []).some(aop => aop.name === p.name)) return false;
                    return true;
                  });
                  return (isPartiesExpanded ? filteredParties : filteredParties.slice(0, 4)).map((party, idx) => (
                    <div key={party.id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-md">
                            {party.type} - Polo {party.polo}
                          </span>
                          <div className="flex items-center gap-1">
                            {party.isClient && selectedCrmLead && onNavigateToCrmLead && (
                              <button
                                onClick={() => onNavigateToCrmLead(selectedCrmLead.id)}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded cursor-pointer"
                              >
                                CRM
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteParty(party.id || idx)}
                              title="Remover parte do processo"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm">{party.name}</h4>
                        {party.cpfCnpj && <p className="text-xs font-mono text-slate-500 mt-0.5">CPF/CNPJ: {party.cpfCnpj}</p>}
                        {party.lawyer && <p className="text-xs text-slate-600 mt-1">Advogado: {party.lawyer}</p>}
                        {party.contacts && <p className="text-xs text-slate-500 mt-1">Contato: {party.contacts}</p>}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {(process.parties || []).length > 4 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setIsPartiesExpanded(!isPartiesExpanded)}
                    className="text-xs font-bold text-[#0d2f43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isPartiesExpanded ? 'Recolher partes' : `Ver todas as partes (${(process.parties || []).length + 2})`}</span>
                    {isPartiesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 4. SITUAÇÃO E CONTROLE DO PROCESSO */}
          <div className="bg-[#0d2f43]/5 rounded-2xl border border-[#0d2f43]/15 p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#0d2f43]" />
              <h2 className="text-sm font-extrabold text-[#0d2f43] uppercase tracking-wider">
                Situação e Controle Interno do Processo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fase Processual Atual</span>
                <p className="font-black text-[#0d2f43] text-sm mt-1">{process.phase}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Situação Atual</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-extrabold uppercase ${
                  process.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' :
                  process.status === 'Suspenso' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {process.status || 'Ativo'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Último Andamento Registrado</span>
                <p className="font-bold text-slate-800 mt-1 line-clamp-2">
                  {process.lastMovement || (process.history?.[0]?.description) || 'Nenhum andamento recente cadastrado.'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Próximo Prazo Processual</span>
                <p className="font-extrabold text-amber-950 mt-1">
                  {process.nextDeadlineTitle ? `${process.nextDeadlineTitle} (${process.nextDeadlineDate})` : 'Nenhum prazo pendente'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Próximo Compromisso / Audiência</span>
                <p className="font-extrabold text-purple-950 mt-1">
                  {process.nextAudienceTitle ? `${process.nextAudienceTitle} (${process.nextAudienceDate})` : 'Nenhum compromisso agendado'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prazos e Tarefas Pendentes</span>
                <p className="font-black text-slate-900 mt-1">
                  <strong className="text-amber-800">{(process.deadlinesAndTasks || []).filter(d => d.type === 'prazo' && d.status !== 'Concluído').length} Prazos</strong> • <strong className="text-blue-800">{(process.deadlinesAndTasks || []).filter(d => d.type === 'tarefa' && d.status !== 'Concluído').length} Tarefas</strong>
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsável e Equipe</span>
                <p className="font-bold text-slate-800 mt-1">
                  {process.responsible} ({process.team || 'Contencioso'})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 1: HISTÓRICO E ANDAMENTOS */}
      {activeTab === 'andamentos' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80">
            <div>
              <h3 className="font-bold text-[#0d2f43] text-sm">Andamentos e Auditoria do Processo</h3>
              <p className="text-xs text-slate-500">Registra em ordem cronológica todas as movimentações, publicações e alterações internas.</p>
            </div>

            <button
              onClick={() => setIsAndamentoModalOpen(true)}
              className="px-3.5 py-2 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Novo Andamento</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="relative border-l-2 border-slate-200 pl-6 ml-3 flex flex-col gap-6">
              {(process.history || []).map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#0d2f43] group-hover:bg-[#0d2f43] transition-colors" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0d2f43]">{item.user || 'Sistema'}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded uppercase">
                        {item.actionType || 'Andamento'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        {item.date} às {item.time}
                      </span>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingHistoryIndex(idx);
                            setEditHistoryDesc(item.description);
                            setEditHistoryType(item.actionType || 'Andamento');
                          }}
                          title="Editar andamento"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id || idx)}
                          title="Excluir andamento (corrigir erro)"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                    {item.description}
                  </p>
                </div>
              ))}

              {(!process.history || process.history.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">Nenhum histórico registrado até o momento.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: RESUMO NARRATIVO DO CASO */}
      {activeTab === 'resumo' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80">
            <div>
              <h3 className="font-bold text-[#0d2f43] text-sm">Resumo Elaborado pelo Escritório</h3>
              <p className="text-xs text-slate-500">Síntese narrativa dos fatos, tese defensiva, objeto da ação e pontos estratégicos.</p>
            </div>

            <button
              onClick={() => {
                setEditFactsSummary(process.factsSummary || process.summary || '');
                setEditActionObject(process.actionObject || '');
                setEditClaims(process.claims || '');
                setEditStrategy(process.strategy || '');
                setEditAttentionPoints(process.attentionPoints || '');
                setEditInternalNotes(process.internalNotes || process.notes || '');
                setIsEditSummaryModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Resumo do Caso</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col gap-6 text-xs">
            {/* Resumo dos Fatos */}
            <div>
              <h4 className="font-extrabold text-[#0d2f43] text-sm mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Resumo dos Fatos</span>
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                {process.factsSummary || process.summary || 'Nenhum resumo dos fatos cadastrado até o momento.'}
              </p>
            </div>

            {/* Objeto da Ação */}
            {process.actionObject && (
              <div>
                <h4 className="font-extrabold text-[#0d2f43] text-sm mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Objeto da Ação</span>
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                  {process.actionObject}
                </p>
              </div>
            )}

            {/* Pedidos Principais */}
            {process.claims && (
              <div>
                <h4 className="font-extrabold text-[#0d2f43] text-sm mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                  <span>Pedidos Principais / Pedidos da Inicial</span>
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                  {process.claims}
                </p>
              </div>
            )}

            {/* Tese ou Estratégia */}
            {process.strategy && (
              <div>
                <h4 className="font-extrabold text-[#0d2f43] text-sm mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Tese de Defesa ou Estratégia Adotada</span>
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-amber-50/30 p-4 rounded-xl border border-amber-200/60">
                  {process.strategy}
                </p>
              </div>
            )}

            {/* Pontos de Atenção */}
            {process.attentionPoints && (
              <div>
                <h4 className="font-extrabold text-rose-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Pontos de Atenção e Riscos Riscos Relevantes</span>
                </h4>
                <p className="text-rose-950 leading-relaxed whitespace-pre-line bg-rose-50/50 p-4 rounded-xl border border-rose-200/70">
                  {process.attentionPoints}
                </p>
              </div>
            )}

            {/* Observações Internas */}
            {(process.internalNotes || process.notes) && (
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span>Observações Internas do Escritório</span>
                </h4>
                <p className="text-slate-600 italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {process.internalNotes || process.notes}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Última atualização do resumo: <strong>{process.summaryUpdatedAt || process.lastUpdateDate || 'Data recente'}</strong></span>
              <span>Responsável pela redação: <strong>{process.summaryUpdatedBy || process.responsible || 'Dr. Rodrigo Godoy'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: PRAZOS E TAREFAS */}
      {activeTab === 'prazos' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80">
            <div>
              <h3 className="font-bold text-[#0d2f43] text-sm">Prazos Processuais e Tarefas de Produção</h3>
              <p className="text-xs text-slate-500">Prazos e tarefas vinculados ao processo. A conclusão gera registro automático no histórico.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPrazoType('tarefa');
                  setIsPrazoModalOpen(true);
                }}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Tarefa</span>
              </button>

              <button
                onClick={() => {
                  setPrazoType('prazo');
                  setIsPrazoModalOpen(true);
                }}
                className="px-3.5 py-2 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Prazo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(process.deadlinesAndTasks || []).map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  item.status === 'Concluído'
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : item.priority === 'Crítica' || item.status === 'Vencido'
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleDeadlineStatus(item.id)}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      item.status === 'Concluído'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 text-transparent hover:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        item.type === 'prazo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                      <h4 className={`font-bold text-xs ${item.status === 'Concluído' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Vencimento: <strong className="text-slate-700">{item.dueDate} {item.dueTime ? `às ${item.dueTime}` : ''}</strong> • Responsável: <strong className="text-slate-700">{item.responsible}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    item.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'Vencido' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingDeadline(item);
                        setEditDeadlineTitle(item.title);
                        setEditDeadlineDueDate(item.dueDate);
                        setEditDeadlineDueTime(item.dueTime || '17:00');
                        setEditDeadlineResp(item.responsible || process.responsible);
                        setEditDeadlinePriority(item.priority || 'Normal');
                      }}
                      title="Editar prazo/tarefa"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteDeadlineItem(item.id)}
                      title="Excluir prazo/tarefa (corrigir erro)"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(!process.deadlinesAndTasks || process.deadlinesAndTasks.length === 0) && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                Nenhum prazo ou tarefa vinculada a este processo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: AGENDA */}
      {activeTab === 'agenda' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80">
            <div>
              <h3 className="font-bold text-[#0d2f43] text-sm">Compromissos e Audiências Vinculadas</h3>
              <p className="text-xs text-slate-500">Eventos agendados e sincronizados com a agenda geral do escritório.</p>
            </div>

            <button
              onClick={() => setIsCommitmentModalOpen(true)}
              className="px-3.5 py-2 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Compromisso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(process.commitments || []).map((comm) => (
              <div key={comm.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black uppercase rounded-md block w-max">
                      {comm.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCommitment(comm);
                          setEditCommTitle(comm.title);
                          setEditCommType(comm.type);
                          setEditCommDate(comm.date);
                          setEditCommTime(comm.time);
                          setEditCommLocation(comm.location || '');
                          setEditCommResp(comm.responsible);
                        }}
                        title="Editar compromisso"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommitment(comm.id)}
                        title="Excluir compromisso"
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{comm.title}</h4>
                  <p className="text-xs text-slate-600 font-semibold mt-2">
                    Data: <span className="text-slate-800">{comm.date} às {comm.time}</span>
                  </p>
                  {comm.location && (
                    <p className="text-xs text-slate-500 mt-1">Local: {comm.location}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Responsável: {comm.responsible}</p>
                </div>
              </div>
            ))}

            {(!process.commitments || process.commitments.length === 0) && (
              <div className="col-span-2 bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                Nenhum compromisso ou audiência agendada para este processo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 5: DECISÕES E JULGADOS */}
      {activeTab === 'decisoes' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200/80 gap-4">
            <div>
              <h3 className="font-bold text-[#0d2f43] text-sm">Decisões, Sentenças e Acórdãos</h3>
              <p className="text-xs text-slate-500">Registro estruturado das pronúncias judiciais, resultados e providências necessárias.</p>
            </div>

            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="px-3.5 py-2 bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <Gavel className="w-3.5 h-3.5 text-amber-300" />
              <span>Registrar Nova Decisão</span>
            </button>
          </div>

          {/* Decision Cards List */}
          <div className="flex flex-col gap-4">
            {(process.decisions || []).map((dec) => (
              <div key={dec.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col gap-4 text-xs">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 bg-slate-800 text-white font-bold text-[10px] rounded uppercase">
                        {dec.decisionType}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        dec.result === 'Deferido' || dec.result === 'Procedente' || dec.result === 'Mantido' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        dec.result === 'Parcialmente Deferido' || dec.result === 'Parcialmente Procedente' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        dec.result === 'Indeferido' || dec.result === 'Improcedente' || dec.result === 'Reformado' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        Resultado: {dec.result}
                      </span>
                      {dec.hasDeadline && (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Gerou Prazo Processual</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">{dec.title}</h4>
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                      Proferida em <strong>{dec.decisionDate}</strong> {dec.publicationDate ? `• Publicada em ${dec.publicationDate}` : ''} • {dec.courtBody || process.court} {dec.authority ? `(${dec.authority})` : ''}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 self-end md:self-start">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Registrado por {dec.createdBy} em {dec.createdAtDate}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingDecision(dec);
                          setEditDecTitle(dec.title);
                          setEditDecType(dec.decisionType);
                          setEditDecDate(dec.decisionDate);
                          setEditDecResult(dec.result);
                          setEditDecSummary(dec.summary);
                        }}
                        title="Editar decisão"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDecision(dec.id)}
                        title="Excluir decisão (corrigir erro)"
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resumo da Decisão */}
                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1">Resumo da Decisão / Inteiro Teor Sintetizado:</h5>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
                    {dec.summary}
                  </p>
                </div>

                {/* Dispositivo Principal */}
                {dec.mainDispositive && (
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs mb-1">Dispositivo Principal:</h5>
                    <p className="text-slate-800 font-semibold italic leading-relaxed bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
                      &quot;{dec.mainDispositive}&quot;
                    </p>
                  </div>
                )}

                {/* Impacto e Providências */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dec.practicalImpact && (
                    <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200/70">
                      <h5 className="font-extrabold text-blue-900 text-xs mb-1">Impacto Prático no Processo:</h5>
                      <p className="text-blue-950 font-medium">{dec.practicalImpact}</p>
                    </div>
                  )}

                  {dec.necessaryAction && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h5 className="font-extrabold text-slate-900 text-xs mb-1">Providência Necessária:</h5>
                      <p className="text-slate-800 font-medium">{dec.necessaryAction}</p>
                    </div>
                  )}
                </div>

                {dec.notes && (
                  <p className="text-slate-500 italic text-[11px] border-t border-slate-100 pt-2">
                    Obs: {dec.notes}
                  </p>
                )}
              </div>
            ))}

            {(!process.decisions || process.decisions.length === 0) && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-2">
                <Gavel className="w-8 h-8 text-slate-300" />
                <p className="text-slate-500 font-bold text-xs">Nenhuma decisão cadastrada neste processo.</p>
                <p className="text-slate-400 text-xs">Cadastre tutelas, despachos, sentenças ou acórdãos para manter o histórico de julgados organizado.</p>
                <button
                  onClick={() => setIsDecisionModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#0d2f43] text-white rounded-lg text-xs font-bold hover:bg-[#0b2839] cursor-pointer"
                >
                  Registrar Primeira Decisão
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 6: INFORMAÇÕES ADMINISTRATIVAS E CONTRATUAIS */}
      {activeTab === 'admin' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#0d2f43] text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-600" />
                <span>Dados de Gestão Administrativa do Caso</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded">
                Uso Interno do Escritório
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Contrato e Honorários Contratuais</span>
                <p className="font-bold text-slate-800 mt-1">{process.contractFeeInfo || 'Honorários contratuais pactuados conforme contrato de prestação de serviços jurídicos.'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Forma de Pagamento</span>
                <p className="font-bold text-slate-800 mt-1">{process.paymentTerms || 'Parcelamento mensal fixo via boleto bancário.'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Avaliação de Risco / Previsão de Êxito</span>
                <p className="font-bold text-slate-800 mt-1">{process.riskAssessment || 'Risco Médio / Probabilidade de Êxito Favorável'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Origem do Cliente / Indicação</span>
                <p className="font-bold text-slate-800 mt-1">{process.leadSource || 'Indicação de Cliente Antigo'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Pasta Digital em Nuvem</span>
                {process.cloudFolderUrl ? (
                  <a href={process.cloudFolderUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline mt-1 block truncate">
                    {process.cloudFolderUrl}
                  </a>
                ) : (
                  <p className="text-slate-400 mt-1 italic">Não informada</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Nível de Acesso e Sigilo</span>
                <p className="font-bold text-slate-800 mt-1">{process.segredoJustica ? 'Segredo de Justiça (Restrito)' : 'Acesso Padrão Equipe'}</p>
              </div>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>* Lançamentos financeiros, faturamento e prestação de contas operacionais são controlados centraladamente no módulo <strong>Financeiro</strong>.</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ANDAMENTO */}
      {isAndamentoModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Registrar Novo Andamento</h3>
              <button onClick={() => setIsAndamentoModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAndamentoSubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Evento</label>
                <select
                  value={newAndamentoType}
                  onChange={(e) => setNewAndamentoType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700 bg-white"
                >
                  <option value="Andamento do Processo">Andamento do Processo</option>
                  <option value="Publicação Judicial">Publicação Judicial</option>
                  <option value="Decisão / Despacho">Decisão / Despacho</option>
                  <option value="Petição Protocolada">Petição Protocolada</option>
                  <option value="Certidão Emitida">Certidão Emitida</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Andamento *</label>
                <textarea
                  rows={4}
                  required
                  value={newAndamentoDesc}
                  onChange={(e) => setNewAndamentoDesc(e.target.value)}
                  placeholder="Descreva detalhadamente a ocorrência..."
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAndamentoModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PRAZO / TAREFA */}
      {isPrazoModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Criar {prazoType === 'prazo' ? 'Novo Prazo Processual' : 'Nova Tarefa Interna'}</h3>
              <button onClick={() => setIsPrazoModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPrazoSubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título da Pendência *</label>
                <input
                  type="text"
                  required
                  value={prazoTitle}
                  onChange={(e) => setPrazoTitle(e.target.value)}
                  placeholder={prazoType === 'prazo' ? 'Ex: Contestação' : 'Ex: Minuta de acordo'}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={prazoDueDate}
                    onChange={(e) => setPrazoDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horário Fatal</label>
                  <input
                    type="time"
                    value={prazoDueTime}
                    onChange={(e) => setPrazoDueTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável *</label>
                <input
                  type="text"
                  required
                  value={prazoResp}
                  onChange={(e) => setPrazoResp(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPrazoModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO COMPROMISSO */}
      {isCommitmentModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Agendar Compromisso / Audiência</h3>
              <button onClick={() => setIsCommitmentModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCommitmentSubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Evento</label>
                <select
                  value={commitmentType}
                  onChange={(e) => setCommitmentType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                >
                  <option value="Audiência">Audiência</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Perícia">Perícia</option>
                  <option value="Diligência">Diligência</option>
                  <option value="Sustentação Oral">Sustentação Oral</option>
                  <option value="Sessão de Julgamento">Sessão de Julgamento</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título do Compromisso *</label>
                <input
                  type="text"
                  required
                  value={commitmentTitle}
                  onChange={(e) => setCommitmentTitle(e.target.value)}
                  placeholder="Ex: Audiência de Instrução e Julgamento"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={commitmentDate}
                    onChange={(e) => setCommitmentDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={commitmentTime}
                    onChange={(e) => setCommitmentTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Local / Link da Sala</label>
                <input
                  type="text"
                  value={commitmentLocation}
                  onChange={(e) => setCommitmentLocation(e.target.value)}
                  placeholder="Ex: 2ª Vara Cível / Sala Teams"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCommitmentModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR DOCUMENTO */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Adicionar Documento</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDocSubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Documento *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Ex: Procuração Ad Judicia Digitalizada"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                >
                  <option value="Petições">Petições</option>
                  <option value="Procurações">Procurações</option>
                  <option value="Contratos">Contratos</option>
                  <option value="Certidões">Certidões</option>
                  <option value="Decisões">Decisões</option>
                  <option value="Provas">Provas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Anexar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR PARTE */}
      {isPartyModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Adicionar Parte ao Processo</h3>
              <button onClick={() => setIsPartyModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPartySubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Ex: Banco S.A."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo da Parte</label>
                  <select
                    value={partyType}
                    onChange={(e) => setPartyType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                  >
                    <option value="Parte Contrária">Parte Contrária</option>
                    <option value="Terceiro Interessado">Terceiro Interessado</option>
                    <option value="Assistente">Assistente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Polo Processual</label>
                  <select
                    value={partyPolo}
                    onChange={(e) => setPartyPolo(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                  >
                    <option value="Passivo">Passivo</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={partyCpfCnpj}
                  onChange={(e) => setPartyCpfCnpj(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Advogado / Patrono</label>
                <input
                  type="text"
                  value={partyLawyer}
                  onChange={(e) => setPartyLawyer(e.target.value)}
                  placeholder="Ex: Dr. Carlos Mendes - OAB/SP 12345"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR FICHA DO PROCESSO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Editar Ficha do Processo ({process.cnj})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-3 bg-slate-100 p-1.5 rounded-xl">
                {['Judicial', 'Administrativo', 'Extrajudicial'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditCaseType(t as any)}
                    className={`py-2 rounded-lg font-bold text-xs transition-all ${
                      editCaseType === t ? 'bg-[#0d2f43] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Client Selection from CRM */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <label className="block text-xs font-bold text-[#0d2f43] mb-1">
                  Cliente Obrigatoriamente do CRM *
                </label>

                <input
                  type="text"
                  value={editClientSearch}
                  onChange={(e) => setEditClientSearch(e.target.value)}
                  placeholder="Pesquisar cliente por Nome, CPF, CNPJ..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0d2f43]/20 mb-2"
                />

                <select
                  required
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                >
                  {filteredCrmLeadsForEdit.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.cpfCnpj || 'Sem Doc'}) - {lead.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* EDIT ADDITIONAL CLIENTS SECTION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#0d2f43]" />
                    <span className="font-extrabold text-[#0d2f43] text-xs">
                      Outros Clientes do Processo (Múltiplos Clientes / Litisconsórcio Ativo)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded">
                    {editAdditionalClients.length} adicional(is)
                  </span>
                </div>

                {editAdditionalClients.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {editAdditionalClients.map((ac, idx) => (
                      <div key={ac.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                            #{idx + 2}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{ac.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {ac.cpfCnpj ? `CPF/CNPJ: ${ac.cpfCnpj} • ` : ''}Pólo: {ac.polo || 'Autor'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditAdditionalClients(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Remover cliente do processo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!showEditAddClientForm ? (
                  <button
                    type="button"
                    onClick={() => setShowEditAddClientForm(true)}
                    className="self-start px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-[#0d2f43] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ Adicionar Cliente Adicional (do CRM)</span>
                  </button>
                ) : (
                  <div className="bg-white p-3 rounded-lg border border-blue-200 flex flex-col gap-2">
                    <p className="font-bold text-slate-700 text-xs">Selecione o Cliente do CRM para adicionar:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <select
                          value={newAddClientCrmId}
                          onChange={(e) => setNewAddClientCrmId(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                        >
                          <option value="">-- Selecione o Cliente --</option>
                          {crmLeads
                            .filter(l => l.id !== editClientId && !editAdditionalClients.some(ac => ac.clientId === l.id))
                            .map(l => (
                              <option key={l.id} value={l.id}>
                                {l.name} ({l.cpfCnpj || 'Sem doc'})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <select
                          value={newAddClientPolo}
                          onChange={(e) => setNewAddClientPolo(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="Autor">Pólo: Autor</option>
                          <option value="Réu">Pólo: Réu</option>
                          <option value="Requerente">Pólo: Requerente</option>
                          <option value="Requerido">Pólo: Requerido</option>
                          <option value="Interessado">Pólo: Interessado</option>
                          <option value="Exequente">Pólo: Exequente</option>
                          <option value="Executado">Pólo: Executado</option>
                          <option value="Litisconsorte">Pólo: Litisconsorte</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditAddClientForm(false);
                          setNewAddClientCrmId('');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAddClientCrmId) {
                            alert('Selecione um cliente.');
                            return;
                          }
                          const lead = crmLeads.find(l => l.id === newAddClientCrmId);
                          if (!lead) return;
                          setEditAdditionalClients(prev => [...prev, {
                            id: 'addc-' + Date.now(),
                            clientId: lead.id,
                            name: lead.name,
                            cpfCnpj: lead.cpfCnpj,
                            polo: newAddClientPolo,
                            phone: lead.phone,
                            email: lead.email
                          }]);
                          setNewAddClientCrmId('');
                          setShowEditAddClientForm(false);
                        }}
                        className="px-3 py-1 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded text-xs font-bold cursor-pointer"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Polo do Cliente</label>
                  <select
                    value={editClientPolo}
                    onChange={(e) => setEditClientPolo(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                  >
                    <option value="Autor">Autor</option>
                    <option value="Réu">Réu</option>
                    <option value="Requerente">Requerente</option>
                    <option value="Exequente">Exequente</option>
                    <option value="Terceiro">Terceiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Parte Contrária</label>
                  <input
                    type="text"
                    value={editOpposingParty}
                    onChange={(e) => setEditOpposingParty(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Classe Processual</label>
                  <input
                    type="text"
                    value={editClasse}
                    onChange={(e) => setEditClasse(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Área do Direito</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              {/* Conditional Court Fields */}
              {editCaseType === 'Judicial' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tribunal</label>
                    <input
                      type="text"
                      value={editCourt}
                      onChange={(e) => setEditCourt(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vara</label>
                    <input
                      type="text"
                      value={editVara}
                      onChange={(e) => setEditVara(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Juiz(a)</label>
                    <input
                      type="text"
                      value={editJudge}
                      onChange={(e) => setEditJudge(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fase Processual</label>
                  <input
                    type="text"
                    value={editPhase}
                    onChange={(e) => setEditPhase(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Situação</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Encerrado">Encerrado</option>
                    <option value="Arquivado">Arquivado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Valor da Causa (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link da Pasta Digital (Nuvem)</label>
                <input
                  type="url"
                  value={editCloudFolderUrl}
                  onChange={(e) => setEditCloudFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observações Gerais do Processo</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCLUSÃO DE PROCESSO (RESTRITO RHENDERSON, LARISSA, PEDRO) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-red-200">
            <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Excluir processo?</span>
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-900 leading-relaxed font-medium">
                Esta ação retirará o processo das listagens e poderá afetar informações vinculadas. Informe o motivo e confirme a exclusão.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo da Exclusão (Obrigatório) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Informe a justificativa fundamentada para a exclusão deste processo..."
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-red-500 font-medium"
                />
              </div>

              {!deleteConfirmationStep ? (
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!deleteReason.trim()) {
                        alert('Informe obrigatoriamente o motivo da exclusão.');
                        return;
                      }
                      setDeleteConfirmationStep(true);
                    }}
                    className="px-5 py-2 font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg"
                  >
                    Prosseguir
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col gap-3 mt-2">
                  <p className="font-bold text-amber-300">
                    Confirmação Final: Você é autorizar a realizar a exclusão lógica do processo {process.cnj}?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmationStep(false)}
                      className="px-3 py-1.5 text-slate-300 hover:text-white font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg"
                    >
                      Confirmar Exclusão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NOVA DECISÃO */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-300" />
                <span>Registrar Nova Decisão / Julgado</span>
              </h3>
              <button onClick={() => setIsDecisionModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDecisionSubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título da Decisão *</label>
                <input
                  type="text"
                  required
                  value={decTitle}
                  onChange={(e) => setDecTitle(e.target.value)}
                  placeholder="Ex: Decisão de Concessão de Tutela de Urgência"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Pronunciamento *</label>
                  <select
                    value={decType}
                    onChange={(e) => setDecType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                  >
                    <option value="Liminar / Tutela">Liminar / Tutela de Urgência</option>
                    <option value="Decisão Interlocutória">Decisão Interlocutória</option>
                    <option value="Sentença">Sentença</option>
                    <option value="Acórdão">Acórdão</option>
                    <option value="Despacho">Despacho</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resultado do Julgamento *</label>
                  <select
                    value={decResult}
                    onChange={(e) => setDecResult(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white"
                  >
                    <option value="Deferido">Deferido / Concedido</option>
                    <option value="Indeferido">Indeferido / Negado</option>
                    <option value="Parcialmente Deferido">Parcialmente Deferido</option>
                    <option value="Procedente">Procedente</option>
                    <option value="Parcialmente Procedente">Parcialmente Procedente</option>
                    <option value="Improcedente">Improcedente</option>
                    <option value="Mantido">Mantido (Recurso)</option>
                    <option value="Reformado">Reformado (Recurso)</option>
                    <option value="Extinto sem Resolução">Extinto sem Resolução do Mérito</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data da Decisão *</label>
                  <input
                    type="date"
                    required
                    value={decDate}
                    onChange={(e) => setDecDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Publicação</label>
                  <input
                    type="date"
                    value={decPubDate}
                    onChange={(e) => setDecPubDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Órgão / Magistrado</label>
                  <input
                    type="text"
                    value={decAuthority}
                    onChange={(e) => setDecAuthority(e.target.value)}
                    placeholder="Ex: Juiz da 2ª Vara Cível"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resumo do Conteúdo da Decisão *</label>
                <textarea
                  rows={3}
                  required
                  value={decSummary}
                  onChange={(e) => setDecSummary(e.target.value)}
                  placeholder="Síntese dos fundamentos principais da decisão..."
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dispositivo Principal (Texto Exato)</label>
                <textarea
                  rows={2}
                  value={decDispositive}
                  onChange={(e) => setDecDispositive(e.target.value)}
                  placeholder="Ex: Ante o exposto, DEFIRO o pedido de tutela de urgência para determinar..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Impacto Prático no Caso</label>
                  <input
                    type="text"
                    value={decPracticalImpact}
                    onChange={(e) => setDecPracticalImpact(e.target.value)}
                    placeholder="Ex: Suspensão das cobranças e bloqueio de bens"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Providência Necessária</label>
                  <input
                    type="text"
                    value={decAction}
                    onChange={(e) => setDecAction(e.target.value)}
                    placeholder="Ex: Interpor Agravo de Instrumento"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              {/* Deadline Generation Checkbox */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950 text-xs">
                  <input
                    type="checkbox"
                    checked={decHasDeadline}
                    onChange={(e) => setDecHasDeadline(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0d2f43] focus:ring-0"
                  />
                  <span>Esta decisão gera um prazo processual para cumprimento ou recurso?</span>
                </label>

                {decHasDeadline && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-amber-200/80">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Título do Prazo *</label>
                      <input
                        type="text"
                        required={decHasDeadline}
                        value={decDeadlineTitle}
                        onChange={(e) => setDecDeadlineTitle(e.target.value)}
                        placeholder="Ex: Interposição de Agravo"
                        className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Data Fatal *</label>
                      <input
                        type="date"
                        required={decHasDeadline}
                        value={decDeadlineDate}
                        onChange={(e) => setDecDeadlineDate(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Responsável *</label>
                      <input
                        type="text"
                        required={decHasDeadline}
                        value={decDeadlineResp}
                        onChange={(e) => setDecDeadlineResp(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 outline-none font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Registrar Decisão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR RESUMO DO CASO */}
      {isEditSummaryModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-300" />
                <span>Editar Resumo Narrativo do Caso</span>
              </h3>
              <button onClick={() => setIsEditSummaryModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSummarySubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resumo dos Fatos *</label>
                <textarea
                  rows={4}
                  required
                  value={editFactsSummary}
                  onChange={(e) => setEditFactsSummary(e.target.value)}
                  placeholder="Descrição narrativa clara e objetiva dos fatos motivadores do processo..."
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Objeto da Ação</label>
                <textarea
                  rows={2}
                  value={editActionObject}
                  onChange={(e) => setEditActionObject(e.target.value)}
                  placeholder="Síntese do bem da vida tutelado (ex: indenização por danos morais e rescisão contratual)..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pedidos Principais</label>
                <textarea
                  rows={2}
                  value={editClaims}
                  onChange={(e) => setEditClaims(e.target.value)}
                  placeholder="Lista dos pedidos formulados na petição inicial ou contestação..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tese ou Estratégia Adotada (Opcional)</label>
                <textarea
                  rows={2}
                  value={editStrategy}
                  onChange={(e) => setEditStrategy(e.target.value)}
                  placeholder="Linha tese defensiva ou fundamentação jurídica principal utilizada..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pontos de Atenção e Riscos (Opcional)</label>
                <textarea
                  rows={2}
                  value={editAttentionPoints}
                  onChange={(e) => setEditAttentionPoints(e.target.value)}
                  placeholder="Alertas, prescrições iminentes, fragilidades probatórias..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observações Internas (Opcional)</label>
                <textarea
                  rows={2}
                  value={editInternalNotes}
                  onChange={(e) => setEditInternalNotes(e.target.value)}
                  placeholder="Anotações de uso exclusivo da equipe jurídica..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSummaryModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839]"
                >
                  Salvar Resumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ARQUIVOS E DOCUMENTOS DO PROCESSO */}
      {isFilesModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Folder className="w-4 h-4 text-slate-300" />
                <span>Arquivos e Documentos do Processo ({process.cnj})</span>
              </h3>
              <button onClick={() => setIsFilesModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs overflow-y-auto flex-1">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Documentos Anexados ao Prontuário</span>
                <button
                  onClick={() => {
                    setIsFilesModalOpen(false);
                    setIsDocModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#0d2f43] text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-[#0b2839]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Anexar Novo Arquivo</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Nome do Arquivo</th>
                      <th className="px-4 py-2.5">Categoria</th>
                      <th className="px-4 py-2.5">Adicionado por</th>
                      <th className="px-4 py-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(process.documents || []).map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{doc.author}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => alert(`Visualizando arquivo: ${doc.name}`)}
                              className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 rounded text-xs font-bold text-slate-600 cursor-pointer"
                            >
                              Abrir
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              title="Excluir documento"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {(!process.documents || process.documents.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          Nenhum documento anexado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {process.cloudFolderUrl && (
                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-blue-900 block">Pasta Digital Externa em Nuvem:</span>
                    <a href={process.cloudFolderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-mono">
                      {process.cloudFolderUrl}
                    </a>
                  </div>
                  <a
                    href={process.cloudFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
                  >
                    <span>Abrir Nuvem</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPRIMIR RELATÓRIO DO PROCESSO */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Imprimir Relatório do Processo</span>
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <p className="text-slate-600 font-medium">
                Selecione as seções que farão parte da versão impressa/PDF do processo:
              </p>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {Object.entries({
                  dadosGerais: 'Dados Gerais do Processo',
                  cliente: 'Cliente & Partes',
                  resumoCaso: 'Resumo do Caso & Objeto',
                  responsaveis: 'Equipe e Responsáveis',
                  andamentos: 'Histórico de Andamentos',
                  prazos: 'Prazos e Tarefas Pendentes',
                  audiencias: 'Audiências e Agenda',
                  documentos: 'Lista de Documentos',
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={(reportSections as any)[key]}
                      onChange={(e) => setReportSections({ ...reportSections, [key]: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0d2f43] focus:ring-0"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setTimeout(() => {
                      window.print();
                    }, 200);
                  }}
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white hover:bg-[#0b2839] rounded-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Gerar e Imprimir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ANDAMENTO/HISTÓRICO */}
      {editingHistoryIndex !== null && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-300" />
                <span>Editar Registro de Andamento</span>
              </h3>
              <button onClick={() => setEditingHistoryIndex(null)} className="hover:bg-white/10 p-1 rounded text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHistoryEdit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Evento</label>
                <select
                  value={editHistoryType}
                  onChange={(e) => setEditHistoryType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700 bg-white"
                >
                  <option value="Andamento do Processo">Andamento do Processo</option>
                  <option value="Publicação Judicial">Publicação Judicial</option>
                  <option value="Decisão / Despacho">Decisão / Despacho</option>
                  <option value="Petição Protocolada">Petição Protocolada</option>
                  <option value="Certidão Emitida">Certidão Emitida</option>
                  <option value="Atualização Interna">Atualização Interna</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Andamento *</label>
                <textarea
                  rows={4}
                  required
                  value={editHistoryDesc}
                  onChange={(e) => setEditHistoryDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingHistoryIndex(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839] cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PRAZO / TAREFA */}
      {editingDeadline !== null && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-300" />
                <span>Editar Prazo / Tarefa</span>
              </h3>
              <button onClick={() => setEditingDeadline(null)} className="hover:bg-white/10 p-1 rounded text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeadlineEdit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título do Prazo/Tarefa *</label>
                <input
                  type="text"
                  required
                  value={editDeadlineTitle}
                  onChange={(e) => setEditDeadlineTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={editDeadlineDueDate}
                    onChange={(e) => setEditDeadlineDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horário Limite</label>
                  <input
                    type="time"
                    value={editDeadlineDueTime}
                    onChange={(e) => setEditDeadlineDueTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prioridade</label>
                  <select
                    value={editDeadlinePriority}
                    onChange={(e) => setEditDeadlinePriority(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white text-slate-700"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                  <input
                    type="text"
                    value={editDeadlineResp}
                    onChange={(e) => setEditDeadlineResp(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDeadline(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839] cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR COMPROMISSO */}
      {editingCommitment !== null && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-300" />
                <span>Editar Compromisso / Audiência</span>
              </h3>
              <button onClick={() => setEditingCommitment(null)} className="hover:bg-white/10 p-1 rounded text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommitmentEdit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={editCommTitle}
                  onChange={(e) => setEditCommTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Evento</label>
                  <select
                    value={editCommType}
                    onChange={(e) => setEditCommType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white text-slate-700"
                  >
                    <option value="Audiência">Audiência</option>
                    <option value="Reunião com Cliente">Reunião com Cliente</option>
                    <option value="Sessão de Julgamento">Sessão de Julgamento</option>
                    <option value="Perícia Judicial">Perícia Judicial</option>
                    <option value="Diligência Externa">Diligência Externa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Responsável</label>
                  <input
                    type="text"
                    value={editCommResp}
                    onChange={(e) => setEditCommResp(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={editCommDate}
                    onChange={(e) => setEditCommDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={editCommTime}
                    onChange={(e) => setEditCommTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Local / Link Virtual</label>
                <input
                  type="text"
                  value={editCommLocation}
                  onChange={(e) => setEditCommLocation(e.target.value)}
                  placeholder="Ex: Sala VIRTUAL Teams ou Fórum Central 3º andar"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCommitment(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839] cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DECISÃO */}
      {editingDecision !== null && (
        <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-300" />
                <span>Editar Decisão / Julgado</span>
              </h3>
              <button onClick={() => setEditingDecision(null)} className="hover:bg-white/10 p-1 rounded text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDecisionEdit} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título da Decisão *</label>
                <input
                  type="text"
                  required
                  value={editDecTitle}
                  onChange={(e) => setEditDecTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo</label>
                  <select
                    value={editDecType}
                    onChange={(e) => setEditDecType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white text-slate-700"
                  >
                    <option value="Despacho">Despacho</option>
                    <option value="Decisão Interlocutória">Decisão Interlocutória</option>
                    <option value="Liminar / Tutela">Liminar / Tutela</option>
                    <option value="Sentença">Sentença</option>
                    <option value="Acórdão">Acórdão</option>
                    <option value="Decisão Monocrática">Decisão Monocrática</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resultado</label>
                  <select
                    value={editDecResult}
                    onChange={(e) => setEditDecResult(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-bold bg-white text-slate-700"
                  >
                    <option value="Deferido">Deferido</option>
                    <option value="Indeferido">Indeferido</option>
                    <option value="Parcialmente Deferido">Parcialmente Deferido</option>
                    <option value="Procedente">Procedente</option>
                    <option value="Improcedente">Improcedente</option>
                    <option value="Parcialmente Procedente">Parcialmente Procedente</option>
                    <option value="Mantido">Mantido</option>
                    <option value="Reformado">Reformado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data da Decisão</label>
                  <input
                    type="date"
                    value={editDecDate}
                    onChange={(e) => setEditDecDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resumo da Decisão *</label>
                <textarea
                  rows={4}
                  required
                  value={editDecSummary}
                  onChange={(e) => setEditDecSummary(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDecision(null)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#0d2f43] text-white rounded-lg hover:bg-[#0b2839] cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* ==========================================
          PRINT-ONLY OFFICIAL PROCESS REPORT
          ========================================== */}
      <div id="printable-process-report" className="hidden print:block bg-white text-slate-900 font-sans p-2">
        {/* Timbre Cabeçalho */}
        <div className="border-b-2 border-[#0d2f43] pb-3 mb-4 flex justify-between items-start">
          <div>
            <h1 className="font-extrabold text-lg text-[#0d2f43] uppercase tracking-wider">
              Paiva Camargo & Godoy Advogados
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">
              CNPJ 32.478.848/0001-90
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-mono">
            <p><strong className="text-slate-800">EMISSÃO:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong className="text-slate-800">EMISSOR:</strong> {currentUser?.name || 'Sistema PCG.OS'}</p>
          </div>
        </div>

        {/* Banner do Processo */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Relatório de Acompanhamento Processual</span>
            <h2 className="font-mono font-black text-base text-[#0d2f43] tracking-tight">
              PROCESSO Nº {process.cnj}
            </h2>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-slate-800 block">{process.classe || process.caseType || 'Ação Judicial'}</span>
            <span className="text-slate-500">{process.area || 'Área não informada'} • Status: <strong className="text-slate-700">{process.status}</strong></span>
          </div>
        </div>

        {/* SEÇÃO 1: DADOS GERAIS */}
        {reportSections.dadosGerais && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              1. Dados Gerais do Processo
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="w-1/4 bg-slate-50 font-bold p-1.5 text-slate-700">Número Único (CNJ):</td>
                  <td className="w-1/4 font-mono font-bold p-1.5">{process.cnj}</td>
                  <td className="w-1/4 bg-slate-50 font-bold p-1.5 text-slate-700">Tipo de Processo:</td>
                  <td className="w-1/4 p-1.5">{process.caseType || 'Judicial'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Classe Processual:</td>
                  <td className="p-1.5">{process.classe || '-'}</td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Área do Direito:</td>
                  <td className="p-1.5">{process.area || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Assunto Principal:</td>
                  <td className="p-1.5">{process.subject || '-'}</td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Assuntos Secundários:</td>
                  <td className="p-1.5">{process.secondarySubjects || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Tribunal / Órgão:</td>
                  <td className="p-1.5">{process.court || '-'}</td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Comarca / Foro:</td>
                  <td className="p-1.5">{process.comarca || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Vara / Câmara:</td>
                  <td className="p-1.5">{process.vara || '-'}</td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Juiz / Magistrado:</td>
                  <td className="p-1.5">{process.judge || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Grau de Jurisdição:</td>
                  <td className="p-1.5">{process.jurisdictionGrade || '1º Grau'}</td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Data de Distribuição:</td>
                  <td className="p-1.5">{process.distribution || '-'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Valor da Causa:</td>
                  <td className="p-1.5 font-bold text-slate-800">
                    {process.value ? process.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                  </td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Segredo de Justiça:</td>
                  <td className="p-1.5">{process.segredoJustica ? 'Sim (Sigiloso)' : 'Não (Público)'}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Status Atual:</td>
                  <td className="p-1.5 font-bold">{process.status}</td>
                  <td className="bg-slate-50 font-bold p-1.5 text-slate-700">Fase Processual:</td>
                  <td className="p-1.5">{process.phase || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SEÇÃO 2: CLIENTE E PARTES */}
        {reportSections.cliente && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              2. Cliente e Partes do Processo
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                <span className="text-[10px] font-bold text-[#0d2f43] uppercase block mb-1">CLIENTE / POLO ATIVO</span>
                <p className="font-bold text-xs text-slate-900">{process.client}</p>
                <p className="text-[11px] text-slate-600">Doc: {process.clientCpfCnpj || 'Não informado'} | Posição: {process.clientPolo || 'Autor'}</p>
                {linkedClientLead && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] text-slate-600">
                    {linkedClientLead.phone && <p>Tel: {linkedClientLead.phone}</p>}
                    {linkedClientLead.email && <p>E-mail: {linkedClientLead.email}</p>}
                  </div>
                )}
              </div>

              <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
                <span className="text-[10px] font-bold text-[#0d2f43] uppercase block mb-1">PARTE CONTRÁRIA / POLO PASSIVO</span>
                <p className="font-bold text-xs text-slate-900">{process.opposingParty || 'Não cadastrada'}</p>
                <p className="text-[11px] text-slate-600">Doc: {process.opposingPartyCpfCnpj || 'Não informado'} | Posição: {process.opposingPartyPolo || 'Réu'}</p>
                {process.opposingPartyLawyer && (
                  <p className="text-[10px] text-slate-600 mt-1">Patrono: {process.opposingPartyLawyer}</p>
                )}
              </div>
            </div>

            {process.parties && process.parties.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Outras Partes Envolvidas</span>
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <th className="p-1.5 text-left border border-slate-300">Nome</th>
                      <th className="p-1.5 text-left border border-slate-300">Tipo/Polo</th>
                      <th className="p-1.5 text-left border border-slate-300">Documento</th>
                      <th className="p-1.5 text-left border border-slate-300">Advogado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.parties.map((pt, i) => (
                      <tr key={pt.id || i} className="border-b border-slate-200">
                        <td className="p-1.5 font-bold">{pt.name}</td>
                        <td className="p-1.5">{pt.type} ({pt.polo})</td>
                        <td className="p-1.5">{pt.cpfCnpj || '-'}</td>
                        <td className="p-1.5">{pt.lawyer || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SEÇÃO 3: EQUIPE E RESPONSÁVEIS */}
        {reportSections.responsaveis && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              3. Equipe e Responsáveis
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr>
                  <td className="w-1/4 bg-slate-50 font-bold p-1.5 text-slate-700">Advogado Responsável:</td>
                  <td className="w-1/4 font-bold p-1.5 text-slate-800">{process.responsible || 'Dr. Rodrigo Godoy'}</td>
                  <td className="w-1/4 bg-slate-50 font-bold p-1.5 text-slate-700">Equipe / Setor:</td>
                  <td className="w-1/4 p-1.5">{process.team || 'Cível / Geral'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SEÇÃO 4: RESUMO DO CASO E OBJETO */}
        {reportSections.resumoCaso && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              4. Resumo do Caso, Objeto & Estratégia
            </h3>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                <span className="font-bold text-[#0d2f43] block mb-1 uppercase text-[10px]">Sinopse / Resumo dos Fatos</span>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                  {process.factsSummary || process.caseDescription || process.summary || 'Resumo dos fatos não cadastrado.'}
                </p>
              </div>

              {process.actionObject && (
                <div className="p-2.5 border border-slate-300 rounded">
                  <span className="font-bold text-[#0d2f43] block mb-1 uppercase text-[10px]">Objeto da Ação / Pedidos</span>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{process.actionObject}</p>
                </div>
              )}

              {process.strategy && (
                <div className="p-2.5 border border-slate-300 rounded">
                  <span className="font-bold text-[#0d2f43] block mb-1 uppercase text-[10px]">Estratégia Jurídica</span>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{process.strategy}</p>
                </div>
              )}

              {process.attentionPoints && (
                <div className="p-2.5 border border-amber-300 bg-amber-50/50 rounded">
                  <span className="font-bold text-amber-900 block mb-1 uppercase text-[10px]">Pontos de Atenção</span>
                  <p className="whitespace-pre-wrap leading-relaxed text-amber-950">{process.attentionPoints}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEÇÃO 5: HISTÓRICO DE ANDAMENTOS */}
        {reportSections.andamentos && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              5. Histórico de Andamentos ({process.history?.length || 0})
            </h3>
            {(!process.history || process.history.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200">Nenhum andamento registrado.</p>
            ) : (
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <th className="p-1.5 text-left border border-slate-300 w-28">Data/Hora</th>
                    <th className="p-1.5 text-left border border-slate-300 w-36">Tipo</th>
                    <th className="p-1.5 text-left border border-slate-300 w-32">Responsável</th>
                    <th className="p-1.5 text-left border border-slate-300">Descrição do Andamento</th>
                  </tr>
                </thead>
                <tbody>
                  {process.history.map((h, i) => (
                    <tr key={h.id || i} className="border-b border-slate-200">
                      <td className="p-1.5 font-mono text-[11px] whitespace-nowrap">{h.date} {h.time ? `às ${h.time}` : ''}</td>
                      <td className="p-1.5 font-bold text-[#0d2f43]">{h.actionType || 'Andamento'}</td>
                      <td className="p-1.5">{h.user || '-'}</td>
                      <td className="p-1.5 text-slate-800 leading-normal">{h.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SEÇÃO 6: PRAZOS E TAREFAS */}
        {reportSections.prazos && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              6. Prazos e Tarefas ({process.deadlinesAndTasks?.length || 0})
            </h3>
            {(!process.deadlinesAndTasks || process.deadlinesAndTasks.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200">Nenhum prazo ou tarefa cadastrada.</p>
            ) : (
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <th className="p-1.5 text-left border border-slate-300 w-24">Vencimento</th>
                    <th className="p-1.5 text-left border border-slate-300 w-20">Tipo</th>
                    <th className="p-1.5 text-left border border-slate-300">Título / Descrição</th>
                    <th className="p-1.5 text-left border border-slate-300 w-20">Prioridade</th>
                    <th className="p-1.5 text-left border border-slate-300 w-28">Responsável</th>
                    <th className="p-1.5 text-left border border-slate-300 w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {process.deadlinesAndTasks.map((d, i) => (
                    <tr key={d.id || i} className="border-b border-slate-200">
                      <td className="p-1.5 font-mono text-[11px] whitespace-nowrap">{d.dueDate} {d.dueTime ? `às ${d.dueTime}` : ''}</td>
                      <td className="p-1.5 uppercase text-[10px] font-bold">{d.type}</td>
                      <td className="p-1.5 font-bold text-slate-900">{d.title}</td>
                      <td className="p-1.5">{d.priority || 'Média'}</td>
                      <td className="p-1.5">{d.responsible || '-'}</td>
                      <td className="p-1.5 font-bold">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SEÇÃO 7: AUDIÊNCIAS E AGENDA */}
        {reportSections.audiencias && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              7. Audiências e Agenda ({process.commitments?.length || 0})
            </h3>
            {(!process.commitments || process.commitments.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200">Nenhuma audiência ou compromisso registrado.</p>
            ) : (
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <th className="p-1.5 text-left border border-slate-300 w-28">Data / Hora</th>
                    <th className="p-1.5 text-left border border-slate-300 w-24">Tipo</th>
                    <th className="p-1.5 text-left border border-slate-300">Título / Modalidade</th>
                    <th className="p-1.5 text-left border border-slate-300">Local / Endereço</th>
                    <th className="p-1.5 text-left border border-slate-300 w-28">Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {process.commitments.map((c, i) => (
                    <tr key={c.id || i} className="border-b border-slate-200">
                      <td className="p-1.5 font-mono text-[11px] whitespace-nowrap">{c.date} {c.time ? `às ${c.time}` : ''}</td>
                      <td className="p-1.5 font-bold">{c.type}</td>
                      <td className="p-1.5 font-bold text-slate-900">{c.title}</td>
                      <td className="p-1.5 text-slate-700">{c.location || 'Local a definir'}</td>
                      <td className="p-1.5">{c.responsible || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SEÇÃO 8: DECISÕES JUDICIAIS */}
        {(reportSections as any).decisoes && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              8. Decisões Judiciais ({process.decisions?.length || 0})
            </h3>
            {(!process.decisions || process.decisions.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200">Nenhuma decisão registrada.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {process.decisions.map((dec, i) => (
                  <div key={dec.id || i} className="p-2.5 border border-slate-300 rounded bg-slate-50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-[#0d2f43]">{dec.title} ({dec.decisionType || 'Decisão'})</span>
                      <span className="font-mono text-[11px] text-slate-600">Data: {dec.decisionDate}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-normal">{dec.summary}</p>
                    {dec.result && <p className="text-[11px] font-bold text-slate-700 mt-1">Resultado: {dec.result}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEÇÃO 9: LISTA DE DOCUMENTOS */}
        {reportSections.documentos && (
          <div className="mb-5 avoid-break">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0d2f43] bg-slate-100 p-2 border-l-4 border-[#0d2f43] mb-2">
              9. Documentos do Processo ({process.documents?.length || 0})
            </h3>
            {(!process.documents || process.documents.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200">Nenhum documento anexado.</p>
            ) : (
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <th className="p-1.5 text-left border border-slate-300">Nome do Arquivo</th>
                    <th className="p-1.5 text-left border border-slate-300 w-32">Categoria</th>
                    <th className="p-1.5 text-left border border-slate-300 w-28">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {process.documents.map((doc, i) => (
                    <tr key={doc.id || i} className="border-b border-slate-200">
                      <td className="p-1.5 font-bold text-slate-800">{doc.name}</td>
                      <td className="p-1.5">{doc.category || 'Geral'}</td>
                      <td className="p-1.5 font-mono text-[11px]">{doc.date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* RODAPÉ DO TIMBRE */}
        <div className="border-t border-slate-300 mt-8 pt-3 text-center text-[10px] text-slate-500 font-sans avoid-break">
          <p className="font-bold text-[#0d2f43]">PAIVA CAMARGO & GODOY ADVOGADOS</p>
          <p>Rua Euclides da Cunha, 1584, Campo Grande, MS • Central de Relatórios do Sistema PCG.OS</p>
        </div>
      </div>
    </>
  );
}
