'use client';

import React, { useState, useEffect } from 'react';
import { Gavel, X, AlertTriangle, Building2, FileText, Check, ShieldAlert, Folder, UserSearch, FileCode, Users, Plus, Trash2 } from 'lucide-react';
import { Process, CrmLead, SystemUser, ProcessParty, AdditionalClient, AdditionalOpposingParty } from '@/lib/mockData';

interface NewProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  crmLeads: CrmLead[];
  activeSystemUsers: SystemUser[];
  processes: Process[];
  onAddProcess: (newProc: Process) => void;
  currentUser?: SystemUser;
}

export function NewProcessModal({
  isOpen,
  onClose,
  crmLeads,
  activeSystemUsers,
  processes,
  onAddProcess,
  currentUser
}: NewProcessModalProps) {
  // 1. Modality State
  const [caseType, setCaseType] = useState<'Judicial' | 'Administrativo' | 'Extrajudicial'>('Judicial');

  // 2. Common Fields State
  const [selectedCrmLeadId, setSelectedCrmLeadId] = useState('');
  const [crmLeadSearchQuery, setCrmLeadSearchQuery] = useState('');
  const [additionalClients, setAdditionalClients] = useState<AdditionalClient[]>([]);
  const [addClientCrmId, setAddClientCrmId] = useState('');
  const [addClientPolo, setAddClientPolo] = useState('Autor');
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [controlNumber, setControlNumber] = useState('');
  const [area, setArea] = useState('Cível');
  const [subject, setSubject] = useState('');
  const [secondarySubjects, setSecondarySubjects] = useState('');
  const [openDate, setOpenDate] = useState(new Date().toISOString().split('T')[0]);
  const [responsible, setResponsible] = useState('Larissa Paiva');
  const [team, setTeam] = useState('Contencioso Cível');
  const [secrecyLevel, setSecrecyLevel] = useState<'Normal' | 'Restrito' | 'Sigiloso'>('Normal');
  const [segredoJustica, setSegredoJustica] = useState(false);
  const [cloudFolderUrl, setCloudFolderUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [caseDescription, setCaseDescription] = useState('');

  // 3. Judicial Specific Fields State
  const [cnj, setCnj] = useState('');
  const [clientPoloJudicial, setClientPoloJudicial] = useState('Autor');
  const [opposingPartyJudicial, setOpposingPartyJudicial] = useState('');
  const [opposingPartyCpfCnpjJudicial, setOpposingPartyCpfCnpjJudicial] = useState('');
  const [opposingPartyLawyerJudicial, setOpposingPartyLawyerJudicial] = useState('');
  const [opposingPartyPoloJudicial, setOpposingPartyPoloJudicial] = useState('Réu');
  const [additionalOpposingParties, setAdditionalOpposingParties] = useState<AdditionalOpposingParty[]>([]);
  const [showAddOppPartyForm, setShowAddOppPartyForm] = useState(false);
  const [newOppPartyName, setNewOppPartyName] = useState('');
  const [newOppPartyCpfCnpj, setNewOppPartyCpfCnpj] = useState('');
  const [newOppPartyPolo, setNewOppPartyPolo] = useState('Réu');
  const [newOppPartyLawyer, setNewOppPartyLawyer] = useState('');
  const [classe, setClasse] = useState('');
  const [valueFormatted, setValueFormatted] = useState('');
  const [valueNumber, setValueNumber] = useState<number>(0);
  const [court, setCourt] = useState('');
  const [comarca, setComarca] = useState('');
  const [vara, setVara] = useState('');
  const [judge, setJudge] = useState('');
  const [distributionDate, setDistributionDate] = useState(new Date().toISOString().split('T')[0]);
  const [distributionForm, setDistributionForm] = useState('Sorteio');
  const [jurisdictionGrade, setJurisdictionGrade] = useState('1º Grau');
  const [phaseJudicial, setPhaseJudicial] = useState('Fase inicial');
  const [statusJudicial, setStatusJudicial] = useState('Ativo');

  // 4. Administrative Specific Fields State
  const [adminNumber, setAdminNumber] = useState('');
  const [protocolNumberAdmin, setProtocolNumberAdmin] = useState('');
  const [instaurationDateAdmin, setInstaurationDateAdmin] = useState(new Date().toISOString().split('T')[0]);
  const [protocolDateAdmin, setProtocolDateAdmin] = useState('');
  const [procedureOriginAdmin, setProcedureOriginAdmin] = useState('');
  const [adminProcedureType, setAdminProcedureType] = useState('Requerimento administrativo');
  const [adminProcedureTypeOther, setAdminProcedureTypeOther] = useState('');
  const [procedureObjectAdmin, setProcedureObjectAdmin] = useState('');
  const [relatedLegislationAdmin, setRelatedLegislationAdmin] = useState('');
  const [valueAdminFormatted, setValueAdminFormatted] = useState('');
  const [valueAdminNumber, setValueAdminNumber] = useState<number>(0);
  const [adminSphere, setAdminSphere] = useState('Estadual');
  const [adminOrgan, setAdminOrgan] = useState('');
  const [adminUnit, setAdminUnit] = useState('');
  const [adminAuthority, setAdminAuthority] = useState('');
  const [adminMunicipality, setAdminMunicipality] = useState('Campo Grande');
  const [adminState, setAdminState] = useState('MS');
  const [adminInstance, setAdminInstance] = useState('1ª Instância');
  const [externalConsultUrl, setExternalConsultUrl] = useState('');
  const [clientPoloAdmin, setClientPoloAdmin] = useState('Interessado');
  const [opposingPartyAdmin, setOpposingPartyAdmin] = useState('');
  const [phaseAdmin, setPhaseAdmin] = useState('Em análise');
  const [statusAdmin, setStatusAdmin] = useState('Em andamento');

  // 5. Extrajudicial Specific Fields State
  const [externalRefNumberExtra, setExternalRefNumberExtra] = useState('');
  const [extrajudicialType, setExtrajudicialType] = useState('Notificação extrajudicial');
  const [extrajudicialTypeOther, setExtrajudicialTypeOther] = useState('');
  const [startDateExtra, setStartDateExtra] = useState(new Date().toISOString().split('T')[0]);
  const [procedureObjectExtra, setProcedureObjectExtra] = useState('');
  const [intendedResultExtra, setIntendedResultExtra] = useState('Recebimento do débito');
  const [valueExtraFormatted, setValueExtraFormatted] = useState('');
  const [valueExtraNumber, setValueExtraNumber] = useState<number>(0);
  const [urgencyGradeExtra, setUrgencyGradeExtra] = useState('Médio');
  const [estimatedDeadlineExtra, setEstimatedDeadlineExtra] = useState('30 dias');
  const [expectedCompletionDateExtra, setExpectedCompletionDateExtra] = useState('');
  const [clientPoloExtra, setClientPoloExtra] = useState('Solicitante');
  const [opposingPartyExtra, setOpposingPartyExtra] = useState('');
  const [opposingPartyPoloExtra, setOpposingPartyPoloExtra] = useState('Destinatário');
  
  // Extrajudicial Entity (Cartório / Câmara / etc)
  const [hasRelatedEntity, setHasRelatedEntity] = useState(false);
  const [entityType, setEntityType] = useState('Cartório');
  const [entityName, setEntityName] = useState('');
  const [entityUnit, setEntityUnit] = useState('');
  const [entityAddress, setEntityAddress] = useState('');
  const [entityResponsible, setEntityResponsible] = useState('');
  const [entityProtocol, setEntityProtocol] = useState('');
  const [entityTrackingUrl, setEntityTrackingUrl] = useState('');

  const [phaseExtra, setPhaseExtra] = useState('Análise inicial');
  const [statusExtra, setStatusExtra] = useState('Em andamento');

  // Auto-generate Control Number on Open
  useEffect(() => {
    if (isOpen && !controlNumber) {
      const year = new Date().getFullYear();
      const nextNum = String(processes.length + 1).padStart(4, '0');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setControlNumber(`PROC-${year}-${nextNum}`);
    }
    if (activeSystemUsers.length > 0 && !responsible) {
      setResponsible(activeSystemUsers[0].name);
    }
  }, [isOpen, processes.length, activeSystemUsers, controlNumber, responsible]);

  if (!isOpen) return null;

  // Mask formatting for CNJ
  const formatCnjMask = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 20);
    let res = '';
    if (digits.length > 0) res += digits.slice(0, 7);
    if (digits.length >= 8) res += '-' + digits.slice(7, 9);
    if (digits.length >= 10) res += '.' + digits.slice(9, 13);
    if (digits.length >= 14) res += '.' + digits.slice(13, 14);
    if (digits.length >= 15) res += '.' + digits.slice(14, 16);
    if (digits.length >= 17) res += '.' + digits.slice(16, 20);
    return res;
  };

  // Helper for currency formatting
  const handleCurrencyChange = (valStr: string, setFormatted: (s: string) => void, setNum: (n: number) => void) => {
    const digits = valStr.replace(/\D/g, '');
    if (!digits) {
      setFormatted('');
      setNum(0);
      return;
    }
    const num = parseFloat(digits) / 100;
    setNum(num);
    setFormatted(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  // Filter CRM leads
  const filteredLeads = crmLeads.filter(l => {
    const q = crmLeadSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      (l.cpfCnpj && l.cpfCnpj.includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q))
    );
  });

  // Mode Switching Protection
  const handleSwitchCaseType = (newType: 'Judicial' | 'Administrativo' | 'Extrajudicial') => {
    if (newType === caseType) return;

    let hasSpecificData = false;
    if (caseType === 'Judicial' && (cnj || classe || court || comarca || vara || judge)) {
      hasSpecificData = true;
    } else if (caseType === 'Administrativo' && (adminOrgan || adminNumber || protocolNumberAdmin || procedureObjectAdmin)) {
      hasSpecificData = true;
    } else if (caseType === 'Extrajudicial' && (externalRefNumberExtra || procedureObjectExtra || entityName)) {
      hasSpecificData = true;
    }

    if (hasSpecificData) {
      const confirmSwitch = window.confirm(
        'Existem informações preenchidas que não pertencem ao novo tipo de procedimento. Ao continuar, os campos específicos do tipo anterior serão removidos. Deseja alterar o tipo?'
      );
      if (!confirmSwitch) return;
    }

    // Reset specific fields of previous mode
    if (newType !== 'Judicial') {
      setCnj('');
      setClasse('');
      setCourt('');
      setComarca('');
      setVara('');
      setJudge('');
    }
    if (newType !== 'Administrativo') {
      setAdminNumber('');
      setProtocolNumberAdmin('');
      setAdminOrgan('');
      setAdminUnit('');
      setAdminAuthority('');
      setProcedureObjectAdmin('');
    }
    if (newType !== 'Extrajudicial') {
      setExternalRefNumberExtra('');
      setProcedureObjectExtra('');
      setEntityName('');
      setEntityProtocol('');
    }

    setCaseType(newType);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory CRM Client
    if (!selectedCrmLeadId) {
      alert('Selecione obrigatoriamente um cliente cadastrado no CRM.');
      return;
    }
    const leadMatch = crmLeads.find(l => l.id === selectedCrmLeadId);
    if (!leadMatch) {
      alert('Cliente do CRM não encontrado.');
      return;
    }

    // 2. Control Number Unique Check
    const cleanControlNum = controlNumber.trim();
    if (!cleanControlNum) {
      alert('Preencha o Número de Controle Interno.');
      return;
    }
    const dupControl = processes.some(p => !p.deleted && p.controlNumber?.trim() === cleanControlNum);
    if (dupControl) {
      alert(`Atenção: Já existe um processo/prontuário com o Número de Controle Interno "${cleanControlNum}". Escolha outro número.`);
      return;
    }

    // 3. Subject validation (must be concise)
    if (!subject.trim()) {
      alert('Preencha o Assunto Principal (sintético).');
      return;
    }

    // 4. Case Description narrative validation
    if (!caseDescription.trim()) {
      alert('Preencha o Resumo do Caso / Fatos do Escritório.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let finalCNJ = 'N/A';
    let finalClasse = 'Procedimento Geral';
    let finalPhase = 'Em andamento';
    let finalStatus = 'Ativo';
    let finalClientPolo = 'Cliente';
    let finalOpposingParty = '';
    let finalOpposingPartyPolo = 'Parte Contrária';
    let finalValue = 0;

    // --- MODE SPECIFIC VALIDATIONS ---
    if (caseType === 'Judicial') {
      const cleanCnj = cnj.trim();
      if (!cleanCnj) {
        alert('Para Processos Judiciais, o Número Único CNJ é obrigatório.');
        return;
      }
      // Regex check: 0000000-00.0000.0.00.0000
      const cnjRegex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
      if (!cnjRegex.test(cleanCnj)) {
        alert('O Número Único CNJ informado é inválido. Utilize o formato correto: 0000000-00.0000.0.00.0000');
        return;
      }
      // Duplicate CNJ check
      const dupCnj = processes.some(p => !p.deleted && p.cnj.trim() === cleanCnj);
      if (dupCnj) {
        alert(`Atenção: Já existe um processo cadastrado e ativo com o CNJ "${cleanCnj}". Não é permitido duplicar o registro.`);
        return;
      }

      finalCNJ = cleanCnj;
      finalClasse = classe.trim() || 'Ação de Procedimento Comum';
      finalPhase = phaseJudicial;
      finalStatus = statusJudicial;
      finalClientPolo = clientPoloJudicial;
      finalOpposingParty = opposingPartyJudicial.trim();
      finalOpposingPartyPolo = opposingPartyPoloJudicial;
      finalValue = valueNumber;
    } else if (caseType === 'Administrativo') {
      if (!adminOrgan.trim()) {
        alert('Para Processos Administrativos, preencha obrigatoriamente o Órgão ou Entidade (ex: INSS, PROCON, OAB).');
        return;
      }
      finalCNJ = adminNumber.trim() ? `ADM-${adminNumber.trim()}` : `ADM-${cleanControlNum}`;
      finalClasse = adminProcedureType === 'Outro' ? (adminProcedureTypeOther.trim() || 'Procedimento Administrativo') : adminProcedureType;
      finalPhase = phaseAdmin;
      finalStatus = statusAdmin;
      finalClientPolo = clientPoloAdmin;
      finalOpposingParty = opposingPartyAdmin.trim() || adminOrgan.trim();
      finalOpposingPartyPolo = 'Órgão / Entidade';
      finalValue = valueAdminNumber;
    } else if (caseType === 'Extrajudicial') {
      finalCNJ = externalRefNumberExtra.trim() ? `EXTRA-${externalRefNumberExtra.trim()}` : `EXTRA-${cleanControlNum}`;
      finalClasse = extrajudicialType === 'Outro' ? (extrajudicialTypeOther.trim() || 'Atuação Extrajudicial') : extrajudicialType;
      finalPhase = phaseExtra;
      finalStatus = statusExtra;
      finalClientPolo = clientPoloExtra;
      finalOpposingParty = opposingPartyExtra.trim();
      finalOpposingPartyPolo = opposingPartyPoloExtra;
      finalValue = valueExtraNumber;
    }

    const partiesList: ProcessParty[] = [
      { name: leadMatch.name, type: 'Cliente', polo: finalClientPolo, cpfCnpj: leadMatch.cpfCnpj, isClient: true, crmLeadId: leadMatch.id }
    ];

    additionalClients.forEach(ac => {
      partiesList.push({
        name: ac.name,
        type: 'Cliente',
        polo: ac.polo || finalClientPolo,
        cpfCnpj: ac.cpfCnpj,
        isClient: true,
        crmLeadId: ac.clientId
      });
    });

    if (finalOpposingParty) {
      partiesList.push({
        name: finalOpposingParty,
        type: 'Parte Contrária',
        polo: finalOpposingPartyPolo,
        cpfCnpj: caseType === 'Judicial' ? (opposingPartyCpfCnpjJudicial.trim() || undefined) : undefined,
        lawyer: caseType === 'Judicial' ? (opposingPartyLawyerJudicial.trim() || undefined) : undefined,
        isOpposing: true
      });
    }

    additionalOpposingParties.forEach(aop => {
      partiesList.push({
        id: aop.id,
        name: aop.name,
        type: 'Parte Contrária',
        polo: aop.polo || finalOpposingPartyPolo,
        cpfCnpj: aop.cpfCnpj,
        lawyer: aop.lawyer,
        contacts: aop.contacts,
        isOpposing: true
      });
    });

    const newProc: Process = {
      id: `proc-${Date.now()}`,
      cnj: finalCNJ,
      controlNumber: cleanControlNum,
      caseType,
      clientId: leadMatch.id,
      client: leadMatch.name,
      clientCpfCnpj: leadMatch.cpfCnpj,
      clientPolo: finalClientPolo,
      additionalClients: additionalClients.length > 0 ? additionalClients : undefined,
      opposingParty: finalOpposingParty,
      opposingPartyCpfCnpj: caseType === 'Judicial' ? (opposingPartyCpfCnpjJudicial.trim() || undefined) : undefined,
      opposingPartyLawyer: caseType === 'Judicial' ? (opposingPartyLawyerJudicial.trim() || undefined) : undefined,
      opposingPartyPolo: finalOpposingPartyPolo,
      additionalOpposingParties: additionalOpposingParties.length > 0 ? additionalOpposingParties : undefined,
      classe: finalClasse,
      subject: subject.trim(),
      secondarySubjects: secondarySubjects.trim() || undefined,
      area,
      
      // Judicial fields (starts empty unless typed)
      court: court.trim() || undefined,
      comarca: comarca.trim() || undefined,
      vara: vara.trim() || undefined,
      judge: judge.trim() || undefined,
      jurisdictionGrade: caseType === 'Judicial' ? jurisdictionGrade : undefined,
      distribution: caseType === 'Judicial' ? `${distributionDate} - ${distributionForm}` : undefined,
      distributionForm: caseType === 'Judicial' ? distributionForm : undefined,

      // Administrative fields
      adminNumber: adminNumber.trim() || undefined,
      protocolNumber: protocolNumberAdmin.trim() || undefined,
      instaurationDate: instaurationDateAdmin || undefined,
      protocolDate: protocolDateAdmin || undefined,
      procedureOrigin: procedureOriginAdmin.trim() || undefined,
      adminProcedureType: adminProcedureType === 'Outro' ? adminProcedureTypeOther.trim() : adminProcedureType,
      procedureObject: procedureObjectAdmin.trim() || undefined,
      relatedLegislation: relatedLegislationAdmin.trim() || undefined,
      adminSphere: caseType === 'Administrativo' ? adminSphere : undefined,
      adminOrgan: adminOrgan.trim() || undefined,
      adminUnit: adminUnit.trim() || undefined,
      adminAuthority: adminAuthority.trim() || undefined,
      adminMunicipality: adminMunicipality.trim() || undefined,
      adminState: adminState.trim() || undefined,
      adminInstance: adminInstance.trim() || undefined,
      externalConsultUrl: externalConsultUrl.trim() || undefined,

      // Extrajudicial fields
      externalRefNumber: externalRefNumberExtra.trim() || undefined,
      extrajudicialType: extrajudicialType === 'Outro' ? extrajudicialTypeOther.trim() : extrajudicialType,
      intendedResult: intendedResultExtra || undefined,
      urgencyGrade: urgencyGradeExtra || undefined,
      estimatedDeadline: estimatedDeadlineExtra.trim() || undefined,
      expectedCompletionDate: expectedCompletionDateExtra || undefined,
      relatedEntity: hasRelatedEntity ? {
        type: entityType,
        name: entityName.trim(),
        unit: entityUnit.trim(),
        address: entityAddress.trim(),
        responsiblePerson: entityResponsible.trim(),
        protocolNumber: entityProtocol.trim(),
        trackingUrl: entityTrackingUrl.trim(),
      } : undefined,
      extrajudicialStep: phaseExtra,

      value: finalValue,
      phase: finalPhase,
      status: finalStatus,
      statusType: finalStatus === 'Suspenso' ? 'alerta' : 'normal',
      segredoJustica,
      secrecyLevel,

      responsible,
      team,
      caseDescription: caseDescription.trim(),
      summary: caseDescription.trim(),
      factsSummary: caseDescription.trim(),
      notes: adminNotes.trim(),
      cloudFolderUrl: cloudFolderUrl.trim(),
      lastUpdateDate: formattedDate,
      pendingTasksCount: 0,
      deleted: false,

      createdBy: currentUser?.name || 'Membro do Sistema',
      createdAt: formattedDate,
      createdTime: formattedTime,

      documents: [],
      deadlinesAndTasks: [],
      commitments: [],
      parties: partiesList,
      history: [
        {
          id: `hist-${Date.now()}`,
          date: formattedDate,
          time: formattedTime,
          user: currentUser?.name || 'Membro do Sistema',
          actionType: `Processo ${caseType} Autuado`,
          description: `Prontuário Jurídico [Modalidade ${caseType}] autuado com sucesso. Assunto Principal: ${subject.trim()}. Cliente CRM: ${leadMatch.name}.`
        }
      ]
    };

    onAddProcess(newProc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0d2f43]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Gavel className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                <span>Autuar Novo Prontuário Jurídico</span>
                <span className="text-[11px] bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full font-mono border border-blue-400/30">
                  PCG.OS
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Selecione a modalidade jurídica e preencha os dados da ficha cadastral
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/10 p-2 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 text-xs overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* 1. SELEÇÃO DO TIPO DE PROCEDIMENTO (TOP BAR SWITCH) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
            <label className="block text-[11px] font-extrabold text-[#0d2f43] uppercase tracking-wider">
              1. Modalidade / Natureza do Prontuário *
            </label>
            <div className="grid grid-cols-3 gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {[
                { type: 'Judicial', label: 'Processo Judicial', desc: 'CNJ, Órgão Julgador, Varas' },
                { type: 'Administrativo', label: 'Processo Administrativo', desc: 'INSS, PROCON, Órgãos Públicos' },
                { type: 'Extrajudicial', label: 'Atuação Extrajudicial', desc: 'Notificação, Contrato, Cartório' }
              ].map((item) => {
                const isActive = caseType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSwitchCaseType(item.type as any)}
                    className={`py-3 px-3 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0d2f43] text-white shadow-md font-bold ring-2 ring-blue-500/40'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 font-medium'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{item.label}</span>
                    <span className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. DADOS COMUNS AOS TRÊS TIPOS */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#0d2f43] font-extrabold text-xs border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-[#0d2f43] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Dados Comuns & Cliente Vinculado ao CRM</span>
            </div>

            {/* CRM CLIENT SELECTION */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="block font-extrabold text-[#0d2f43] text-xs flex items-center gap-1.5">
                  <UserSearch className="w-4 h-4 text-blue-600" />
                  <span>Cliente Cadastrado no CRM (Obrigatório) *</span>
                </label>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-100/80 px-2 py-0.5 rounded">
                  Seleção estrita do CRM (Sem texto livre)
                </span>
              </div>

              <input
                type="text"
                value={crmLeadSearchQuery}
                onChange={(e) => setCrmLeadSearchQuery(e.target.value)}
                placeholder="Digitar para buscar cliente por Nome, CPF, CNPJ, Telefone ou E-mail..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0d2f43]/20 shadow-xs"
              />

              <select
                required
                value={selectedCrmLeadId}
                onChange={(e) => setSelectedCrmLeadId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 outline-none cursor-pointer shadow-xs"
              >
                <option value="">-- Selecione o Cliente Principal Cadastrado no CRM --</option>
                {filteredLeads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.cpfCnpj || 'Sem Doc'}) - {lead.type} - Status: {lead.status}
                  </option>
                ))}
              </select>
            </div>

            {/* MULTI CLIENT SECTION */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <UserSearch className="w-4 h-4 text-[#0d2f43]" />
                  <span className="font-extrabold text-[#0d2f43] text-xs">
                    Outros Clientes no Mesmo Processo (Múltiplos Clientes / Litisconsórcio Ativo)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-200/80 px-2 py-0.5 rounded">
                  {additionalClients.length} cliente(s) adicional(is)
                </span>
              </div>

              {additionalClients.length > 0 && (
                <div className="flex flex-col gap-2">
                  {additionalClients.map((ac, idx) => (
                    <div key={ac.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
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
                        onClick={() => setAdditionalClients(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Remover cliente"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!showAddClientForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddClientForm(true)}
                  className="self-start px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-[#0d2f43] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <UserSearch className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Adicionar Mais Um Cliente a Este Processo</span>
                </button>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-blue-200 flex flex-col gap-2">
                  <p className="font-bold text-slate-700 text-xs">Selecione o Cliente Adicional no CRM:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <select
                        value={addClientCrmId}
                        onChange={(e) => setAddClientCrmId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                      >
                        <option value="">-- Selecione o Cliente do CRM --</option>
                        {crmLeads
                          .filter(l => l.id !== selectedCrmLeadId && !additionalClients.some(ac => ac.clientId === l.id))
                          .map(l => (
                            <option key={l.id} value={l.id}>
                              {l.name} ({l.cpfCnpj || 'Sem doc'})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={addClientPolo}
                        onChange={(e) => setAddClientPolo(e.target.value)}
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
                        setShowAddClientForm(false);
                        setAddClientCrmId('');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!addClientCrmId) {
                          alert('Selecione um cliente.');
                          return;
                        }
                        const lead = crmLeads.find(l => l.id === addClientCrmId);
                        if (!lead) return;
                        setAdditionalClients(prev => [...prev, {
                          id: 'addc-' + Date.now(),
                          clientId: lead.id,
                          name: lead.name,
                          cpfCnpj: lead.cpfCnpj,
                          polo: addClientPolo,
                          phone: lead.phone,
                          email: lead.email
                        }]);
                        setAddClientCrmId('');
                        setShowAddClientForm(false);
                      }}
                      className="px-3 py-1 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Confirmar Adição
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Controle Interno */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nº Controle Interno *
                </label>
                <input
                  type="text"
                  required
                  value={controlNumber}
                  onChange={(e) => setControlNumber(e.target.value)}
                  placeholder="PROC-2026-0001"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              {/* Área do Direito */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Área do Direito *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Cível">Cível</option>
                  <option value="Trabalhista">Trabalhista</option>
                  <option value="Tributário">Tributário</option>
                  <option value="Família e Sucessões">Família e Sucessões</option>
                  <option value="Empresarial">Empresarial</option>
                  <option value="Consumidor">Consumidor</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Previdenciário">Previdenciário</option>
                  <option value="Penal">Penal</option>
                  <option value="Outra">Outra</option>
                </select>
              </div>

              {/* Data de Abertura */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Data de Abertura *
                </label>
                <input
                  type="date"
                  required
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Assunto Principal (Sintético) & Assuntos Complementares */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">
                    Assunto Principal * (Sintético / Tema Curto)
                  </label>
                  <span className="text-[10px] text-blue-600 font-bold">Não colar narrativa</span>
                </div>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Falha na prestação de serviço / Indenização"
                  className="w-full bg-white border border-blue-300 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Assuntos Complementares (Opcional)
                </label>
                <input
                  type="text"
                  value={secondarySubjects}
                  onChange={(e) => setSecondarySubjects(e.target.value)}
                  placeholder="Ex: Danos Morais, Tutela de Urgência"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. DADOS ESPECÍFICOS: PROCESSO JUDICIAL */}
          {caseType === 'Judicial' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between text-[#0d2f43] font-extrabold text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0d2f43] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Dados Específicos: Processo Judicial</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">Poder Judiciário</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CNJ */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Número Único CNJ *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">0000000-00.0000.0.00.0000</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={cnj}
                    onChange={(e) => setCnj(formatCnjMask(e.target.value))}
                    placeholder="0000000-00.0000.0.00.0000"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 font-mono font-bold text-slate-900 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/20"
                  />
                </div>

                {/* Classe Processual */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Classe Processual *
                  </label>
                  <input
                    type="text"
                    required
                    value={classe}
                    onChange={(e) => setClasse(e.target.value)}
                    placeholder="Ex: Ação Indenizatória, Mandado de Segurança..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Polos / Posição Processual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Polo do Cliente</label>
                  <select
                    value={clientPoloJudicial}
                    onChange={(e) => setClientPoloJudicial(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {['Autor', 'Réu', 'Requerente', 'Requerido', 'Exequente', 'Executado', 'Recorrente', 'Recorrido', 'Impetrante', 'Impetrado', 'Interessado', 'Terceiro', 'Outro'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Parte Contrária (Principal)</label>
                  <input
                    type="text"
                    value={opposingPartyJudicial}
                    onChange={(e) => setOpposingPartyJudicial(e.target.value)}
                    placeholder="Ex: Energisa Mato Grosso do Sul S.A."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Polo Parte Contrária</label>
                  <select
                    value={opposingPartyPoloJudicial}
                    onChange={(e) => setOpposingPartyPoloJudicial(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {['Réu', 'Autor', 'Requerido', 'Requerente', 'Executado', 'Exequente', 'Recorrido', 'Recorrente', 'Impetrado', 'Impetrante', 'Terceiro', 'Outro'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MULTI OPPOSING PARTIES SECTION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-rose-700" />
                    <span className="font-extrabold text-[#0d2f43] text-xs">
                      Outras Partes Contrárias (Múltiplas Partes / Co-Réus / Litisconsórcio Passivo)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-200/80 px-2 py-0.5 rounded">
                    {additionalOpposingParties.length} parte(s) contrária(s) adicional(is)
                  </span>
                </div>

                {additionalOpposingParties.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {additionalOpposingParties.map((aop, idx) => (
                      <div key={aop.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center">
                            #{idx + 2}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{aop.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {aop.cpfCnpj ? `CPF/CNPJ: ${aop.cpfCnpj} • ` : ''}Polo: {aop.polo || 'Réu'}
                              {aop.lawyer ? ` • Advogado: ${aop.lawyer}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdditionalOpposingParties(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Remover parte contrária"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!showAddOppPartyForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddOppPartyForm(true)}
                    className="self-start px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-[#0d2f43] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-600" />
                    <span>+ Adicionar Mais Uma Parte Contrária</span>
                  </button>
                ) : (
                  <div className="bg-white p-3 rounded-lg border border-rose-200 flex flex-col gap-2.5">
                    <p className="font-bold text-slate-700 text-xs">Dados da Nova Parte Contrária:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nome / Razão Social *
                        </label>
                        <input
                          type="text"
                          value={newOppPartyName}
                          onChange={(e) => setNewOppPartyName(e.target.value)}
                          placeholder="Ex: Nome da empresa ou pessoa"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Polo Processual
                        </label>
                        <select
                          value={newOppPartyPolo}
                          onChange={(e) => setNewOppPartyPolo(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                        >
                          {['Réu', 'Requerido', 'Executado', 'Recorrido', 'Impetrado', 'Destinatário', 'Notificado', 'Co-Réu', 'Litisconsorte Passivo', 'Terceiro', 'Outro'].map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          CPF / CNPJ (Opcional)
                        </label>
                        <input
                          type="text"
                          value={newOppPartyCpfCnpj}
                          onChange={(e) => setNewOppPartyCpfCnpj(e.target.value)}
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Advogado da Parte Contrária (Opcional)
                        </label>
                        <input
                          type="text"
                          value={newOppPartyLawyer}
                          onChange={(e) => setNewOppPartyLawyer(e.target.value)}
                          placeholder="Ex: Dr. Advogado Adverso"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddOppPartyForm(false);
                          setNewOppPartyName('');
                          setNewOppPartyCpfCnpj('');
                          setNewOppPartyLawyer('');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newOppPartyName.trim()) {
                            alert('Informe o nome da parte contrária.');
                            return;
                          }
                          setAdditionalOpposingParties(prev => [...prev, {
                            id: 'addop-' + Date.now(),
                            name: newOppPartyName.trim(),
                            cpfCnpj: newOppPartyCpfCnpj.trim() || undefined,
                            polo: newOppPartyPolo,
                            lawyer: newOppPartyLawyer.trim() || undefined
                          }]);
                          setNewOppPartyName('');
                          setNewOppPartyCpfCnpj('');
                          setNewOppPartyLawyer('');
                          setShowAddOppPartyForm(false);
                        }}
                        className="px-3 py-1 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded text-xs font-bold cursor-pointer"
                      >
                        Confirmar Adição
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Órgão Julgador (STARTS EMPTY - PLACEHOLDERS ONLY) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <p className="text-[11px] font-bold text-slate-700">Órgão Julgador Judicial (Iniciar Vazio)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tribunal</label>
                    <input
                      type="text"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      placeholder="Informe ou selecione o tribunal"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Comarca ou Foro</label>
                    <input
                      type="text"
                      value={comarca}
                      onChange={(e) => setComarca(e.target.value)}
                      placeholder="Informe a comarca ou o foro"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vara ou Unidade Judicial</label>
                    <input
                      type="text"
                      value={vara}
                      onChange={(e) => setVara(e.target.value)}
                      placeholder="Informe a vara ou unidade judicial"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Juiz ou Relator</label>
                    <input
                      type="text"
                      value={judge}
                      onChange={(e) => setJudge(e.target.value)}
                      placeholder="Ex: Dr. Maria Clara Silva"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Distribuição</label>
                    <input
                      type="date"
                      value={distributionDate}
                      onChange={(e) => setDistributionDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Forma de Distribuição</label>
                    <select
                      value={distributionForm}
                      onChange={(e) => setDistributionForm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="Sorteio">Sorteio / Eletrônica</option>
                      <option value="Dependência">Dependência</option>
                      <option value="Direta">Direta</option>
                      <option value="Redistribuição">Redistribuição</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grau de Jurisdição</label>
                    <select
                      value={jurisdictionGrade}
                      onChange={(e) => setJurisdictionGrade(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="1º Grau">1º Grau</option>
                      <option value="2º Grau">2º Grau (Tribunal)</option>
                      <option value="Tribunais Superiores">Tribunais Superiores (STJ/STF)</option>
                      <option value="Juizado Especial">Juizado Especial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Valor da Causa, Fase e Situação Judicial */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Valor da Causa (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">R$</span>
                    <input
                      type="text"
                      value={valueFormatted}
                      onChange={(e) => handleCurrencyChange(e.target.value, setValueFormatted, setValueNumber)}
                      placeholder="0,00"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs outline-none font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Fase Processual Judicial</label>
                  <select
                    value={phaseJudicial}
                    onChange={(e) => setPhaseJudicial(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {[
                      'Distribuição', 'Fase inicial', 'Contestação ou defesa', 'Instrução', 'Alegações finais', 
                      'Sentença', 'Fase recursal', 'Cumprimento de sentença', 'Execução', 'Suspenso', 'Encerrado', 'Outra'
                    ].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Situação Judicial</label>
                  <select
                    value={statusJudicial}
                    onChange={(e) => setStatusJudicial(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {['Ativo', 'Suspenso', 'Encerrado', 'Arquivado', 'Cancelado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. DADOS ESPECÍFICOS: PROCESSO ADMINISTRATIVO */}
          {caseType === 'Administrativo' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between text-[#0d2f43] font-extrabold text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0d2f43] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Dados Específicos: Processo / Procedimento Administrativo</span>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-mono">Administrativo / Regulatório</span>
              </div>

              {/* Tipo de Procedimento & Órgão Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Tipo de Procedimento Administrativo *
                  </label>
                  <select
                    value={adminProcedureType}
                    onChange={(e) => setAdminProcedureType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {[
                      'Requerimento administrativo', 'Defesa administrativa', 'Recurso administrativo', 
                      'Processo administrativo sancionador', 'Processo administrativo disciplinar', 
                      'Processo tributário administrativo', 'Processo previdenciário administrativo', 
                      'Licitação ou contratação pública', 'Procedimento ambiental', 'Procedimento perante agência reguladora', 
                      'Procedimento perante conselho profissional', 'Pedido de licença', 'Pedido de autorização', 'Outro'
                    ].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {adminProcedureType === 'Outro' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Especifique o Tipo de Procedimento *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminProcedureTypeOther}
                      onChange={(e) => setAdminProcedureTypeOther(e.target.value)}
                      placeholder="Descreva o procedimento..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold text-blue-900 uppercase tracking-wider mb-1">
                    Órgão ou Entidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminOrgan}
                    onChange={(e) => setAdminOrgan(e.target.value)}
                    placeholder="Ex: INSS, PROCON, OAB, IBAMA, Receita Federal, Prefeitura"
                    className="w-full bg-white border border-blue-300 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Identificação Administrativa (Nº Processo, Protocolo, Origem) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nº do Processo Administrativo
                  </label>
                  <input
                    type="text"
                    value={adminNumber}
                    onChange={(e) => setAdminNumber(e.target.value)}
                    placeholder="Ex: 10880.720123/2026 (Opcional)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nº do Protocolo
                  </label>
                  <input
                    type="text"
                    value={protocolNumberAdmin}
                    onChange={(e) => setProtocolNumberAdmin(e.target.value)}
                    placeholder="Ex: PROT-2026-981 (Opcional)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Data de Instauração
                  </label>
                  <input
                    type="date"
                    value={instaurationDateAdmin}
                    onChange={(e) => setInstaurationDateAdmin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Origem do Procedimento
                  </label>
                  <input
                    type="text"
                    value={procedureOriginAdmin}
                    onChange={(e) => setProcedureOriginAdmin(e.target.value)}
                    placeholder="Ex: Notificação de Fiscalização"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Esfera, Unidade, Autoridade, Instância */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Esfera Administrativa</label>
                  <select
                    value={adminSphere}
                    onChange={(e) => setAdminSphere(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {[
                      'Municipal', 'Estadual', 'Federal', 'Distrital', 'Autarquia', 'Fundação pública', 
                      'Agência reguladora', 'Conselho profissional', 'Empresa pública', 'Sociedade de economia mista', 'Outra'
                    ].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unidade / Secretaria</label>
                  <input
                    type="text"
                    value={adminUnit}
                    onChange={(e) => setAdminUnit(e.target.value)}
                    placeholder="Ex: Gerência de Fiscalização"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Autoridade / Fiscal</label>
                  <input
                    type="text"
                    value={adminAuthority}
                    onChange={(e) => setAdminAuthority(e.target.value)}
                    placeholder="Ex: Auditor Fiscal da Receita"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Instância Administrativa</label>
                  <input
                    type="text"
                    value={adminInstance}
                    onChange={(e) => setAdminInstance(e.target.value)}
                    placeholder="Ex: 1ª Instância / Junta"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Objeto, Norma Relacionada, Valor Envolvido */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Objeto do Procedimento</label>
                  <input
                    type="text"
                    value={procedureObjectAdmin}
                    onChange={(e) => setProcedureObjectAdmin(e.target.value)}
                    placeholder="Ex: Apuração de auto de infração..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Norma ou Legislação</label>
                  <input
                    type="text"
                    value={relatedLegislationAdmin}
                    onChange={(e) => setRelatedLegislationAdmin(e.target.value)}
                    placeholder="Ex: Lei 14.133/2021, Lei 9.784/99"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor Envolvido (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">R$</span>
                    <input
                      type="text"
                      value={valueAdminFormatted}
                      onChange={(e) => handleCurrencyChange(e.target.value, setValueAdminFormatted, setValueAdminNumber)}
                      placeholder="0,00 (Opcional)"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs outline-none font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Fase e Situação Administrativa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Fase Administrativa</label>
                  <select
                    value={phaseAdmin}
                    onChange={(e) => setPhaseAdmin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {[
                      'Preparação', 'Aguardando documentos', 'Aguardando protocolo', 'Protocolado', 'Em análise', 
                      'Em instrução', 'Aguardando manifestação', 'Aguardando decisão', 'Em recurso', 'Em cumprimento', 'Suspenso', 'Encerrado', 'Outra'
                    ].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Situação Administrativa *</label>
                  <select
                    value={statusAdmin}
                    onChange={(e) => setStatusAdmin(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {[
                      'Em andamento', 'Suspenso', 'Deferido', 'Parcialmente deferido', 'Indeferido', 'Em recurso', 'Arquivado', 'Cancelado', 'Encerrado'
                    ].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. DADOS ESPECÍFICOS: ATUAÇÃO EXTRAJUDICIAL */}
          {caseType === 'Extrajudicial' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between text-[#0d2f43] font-extrabold text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0d2f43] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Dados Específicos: Atuação Extrajudicial</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono">Consensual / Negocial / Cartorário</span>
              </div>

              {/* Tipo de Atuação Extrajudicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Tipo de Atuação Extrajudicial *
                  </label>
                  <select
                    value={extrajudicialType}
                    onChange={(e) => setExtrajudicialType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {[
                      'Notificação extrajudicial', 'Resposta à notificação', 'Negociação', 'Cobrança extrajudicial', 
                      'Acordo extrajudicial', 'Mediação', 'Conciliação', 'Consultoria jurídica', 'Elaboração de contrato', 
                      'Revisão contratual', 'Parecer jurídico', 'Due diligence', 'Inventário extrajudicial', 
                      'Divórcio extrajudicial', 'Usucapião extrajudicial', 'Procedimento cartorário', 'Procedimento arbitral', 'Regularização documental', 'Outro'
                    ].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {extrajudicialType === 'Outro' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Especifique a Atuação Extrajudicial *
                    </label>
                    <input
                      type="text"
                      required
                      value={extrajudicialTypeOther}
                      onChange={(e) => setExtrajudicialTypeOther(e.target.value)}
                      placeholder="Descreva a atuação..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Resultado Pretendido / Objetivo
                  </label>
                  <select
                    value={intendedResultExtra}
                    onChange={(e) => setIntendedResultExtra(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="Recebimento do débito">Recebimento do débito</option>
                    <option value="Formalização de acordo">Formalização de acordo</option>
                    <option value="Elaboração de contrato">Elaboração de contrato</option>
                    <option value="Regularização do imóvel">Regularização do imóvel</option>
                    <option value="Partilha consensual">Partilha consensual</option>
                    <option value="Encerramento da controvérsia">Encerramento da controvérsia</option>
                    <option value="Parecer emitido">Parecer emitido</option>
                  </select>
                </div>
              </div>

              {/* Referência Externa, Objeto, Valor Envolvido */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nº de Referência Externa
                  </label>
                  <input
                    type="text"
                    value={externalRefNumberExtra}
                    onChange={(e) => setExternalRefNumberExtra(e.target.value)}
                    placeholder="Ex: NOTIF-2026-004 (Opcional)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Objeto da Atuação
                  </label>
                  <input
                    type="text"
                    value={procedureObjectExtra}
                    onChange={(e) => setProcedureObjectExtra(e.target.value)}
                    placeholder="Ex: Contrato de locação comercial"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Valor Envolvido (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">R$</span>
                    <input
                      type="text"
                      value={valueExtraFormatted}
                      onChange={(e) => handleCurrencyChange(e.target.value, setValueExtraFormatted, setValueExtraNumber)}
                      placeholder="0,00 (Opcional)"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs outline-none font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Grau de Urgência, Prazo Estimado, Parte Contrária */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grau de Urgência</label>
                  <select
                    value={urgencyGradeExtra}
                    onChange={(e) => setUrgencyGradeExtra(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Parte Contrária / Destinatário</label>
                  <input
                    type="text"
                    value={opposingPartyExtra}
                    onChange={(e) => setOpposingPartyExtra(e.target.value)}
                    placeholder="Ex: Notificado / Devedor / Contraparte (Opcional)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prazo Estimado</label>
                  <input
                    type="text"
                    value={estimatedDeadlineExtra}
                    onChange={(e) => setEstimatedDeadlineExtra(e.target.value)}
                    placeholder="Ex: 15 dias, 1 mês"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* SEÇÃO OPCIONAL: CARTÓRIO OU ENTIDADE RELACIONADA */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#0d2f43] text-xs">
                  <input
                    type="checkbox"
                    checked={hasRelatedEntity}
                    onChange={(e) => setHasRelatedEntity(e.target.checked)}
                    className="w-4 h-4 text-[#0d2f43] rounded border-slate-300 focus:ring-[#0d2f43] cursor-pointer"
                  />
                  <span>Vincular Cartório, Tabelionato, Câmara de Mediação ou Entidade Externa</span>
                </label>

                {hasRelatedEntity && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Entidade</label>
                      <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        {[
                          'Cartório', 'Tabelionato', 'Registro de imóveis', 'Registro civil', 'Câmara de mediação', 
                          'Câmara arbitral', 'Instituição financeira', 'Empresa', 'Órgão público', 'Outra entidade'
                        ].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nome da Entidade / Cartório</label>
                      <input
                        type="text"
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                        placeholder="Ex: 1º Cartório de Notas e Registro"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nº do Protocolo / Selo</label>
                      <input
                        type="text"
                        value={entityProtocol}
                        onChange={(e) => setEntityProtocol(e.target.value)}
                        placeholder="Ex: PROT-CART-987"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Etapa e Situação Extrajudicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Etapa Extrajudicial</label>
                  <select
                    value={phaseExtra}
                    onChange={(e) => setPhaseExtra(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {[
                      'Análise inicial', 'Coleta de documentos', 'Preparação', 'Documento elaborado', 'Enviado à contraparte', 
                      'Aguardando resposta', 'Em negociação', 'Em mediação', 'Em formalização', 'Aguardando assinatura', 
                      'Aguardando registro', 'Em cumprimento', 'Concluído', 'Outra'
                    ].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Situação Extrajudicial *</label>
                  <select
                    value={statusExtra}
                    onChange={(e) => setStatusExtra(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {[
                      'Em preparação', 'Em andamento', 'Aguardando cliente', 'Aguardando contraparte', 
                      'Aguardando órgão ou cartório', 'Suspenso', 'Concluído com acordo', 'Concluído sem acordo', 'Cancelado', 'Arquivado'
                    ].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 6. RESPONSÁVEIS, SIGILO & OBSERVAÇÕES */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#0d2f43] font-extrabold text-xs border-b border-slate-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-[#0d2f43] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Responsáveis, Sigilo & Informações Administrativas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Advogado Responsável Principal *</label>
                <select
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {activeSystemUsers.map(u => (
                    <option key={u.id || u.name} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Equipe Responsável</label>
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Contencioso Cível">Contencioso Cível</option>
                  <option value="Trabalhista">Trabalhista</option>
                  <option value="Societário e Contratos">Societário e Contratos</option>
                  <option value="Tributário">Tributário</option>
                  <option value="Família e Sucessões">Família e Sucessões</option>
                  <option value="Consultivo">Consultivo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nível de Sigilo</label>
                <select
                  value={secrecyLevel}
                  onChange={(e) => setSecrecyLevel(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Normal">Normal (Permissão padrão)</option>
                  <option value="Restrito">Restrito (Equipe vinculada e gestores)</option>
                  <option value="Sigiloso">Sigiloso (Acesso restritíssimo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Link da Pasta Digital (Google Drive / Cloud Drive)
                </label>
                <input
                  type="url"
                  value={cloudFolderUrl}
                  onChange={(e) => setCloudFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs outline-none font-mono text-blue-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Anotações / Observações Administrativas
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Anotações internas para a equipe do escritório..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* 7. RESUMO DO CASO / FATOS DO ESCRITÓRIO (NARRATIVA COMPLETA) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-[#0d2f43] font-extrabold text-xs">
                <span className="w-5 h-5 rounded-full bg-[#0d2f43] text-white flex items-center justify-center text-[10px]">5</span>
                <span>Resumo do Caso & Fatos do Escritório *</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                Narrativa dos fatos, relação entre partes e teses
              </span>
            </div>

            <textarea
              rows={3}
              required
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder="Descreva com detalhes os fatos do caso, pedidos principais, contexto da controvérsia e histórico relacional..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 leading-relaxed"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-xs font-extrabold bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Autuar Prontuário Jurídico</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
