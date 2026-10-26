export interface ProcessHistoryItem {
  id?: string;
  date: string;
  time: string;
  user: string;
  actionType: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface ProcessDecision {
  id: string;
  title: string;
  decisionType: 'Tutela provisória' | 'Liminar' | 'Decisão interlocutória' | 'Despacho com conteúdo decisório' | 'Sentença' | 'Decisão monocrática' | 'Acórdão' | 'Decisão de admissibilidade' | 'Decisão administrativa' | 'Decisão final' | 'Trânsito em julgado' | 'Outra' | string;
  decisionDate: string;
  publicationDate?: string;
  courtBody?: string;
  authority?: string;
  relatedMovement?: string;
  summary: string;
  mainDispositive?: string;
  practicalImpact?: string;
  result: 'Favorável' | 'Parcialmente favorável' | 'Desfavorável' | 'Sem impacto imediato' | 'Pendente de análise' | string;
  necessaryAction?: string;
  hasDeadline?: boolean;
  relatedDeadlineId?: string;
  relatedDocumentUrl?: string;
  relatedDocumentName?: string;
  notes?: string;
  createdBy: string;
  createdAtDate: string;
  createdAtTime: string;
  updatedBy?: string;
  updatedAtDate?: string;
  isArchived?: boolean;
}

export interface ProcessParty {
  id?: string;
  name: string;
  cpfCnpj?: string;
  type: 'Cliente' | 'Parte Contrária' | 'Terceiro' | 'Assistente' | 'Autor' | 'Réu' | 'Requerente' | 'Requerido' | 'Exequente' | 'Executado' | 'Recorrente' | 'Recorrido' | 'Terceiro interessado' | 'Litisconsorte' | 'Perito' | 'Ministério Público' | 'Representante legal' | 'Advogado da parte' | string;
  polo: 'Ativo' | 'Passivo' | 'Outro' | string;
  lawyer?: string;
  contacts?: string;
  address?: string;
  notes?: string;
  isClient?: boolean;
  isOpposing?: boolean;
  crmLeadId?: string;
}

export interface ProcessDocument {
  id: string;
  name: string;
  category: 'Petições' | 'Procurações' | 'Contratos' | 'Certidões' | 'Decisões' | 'Provas' | 'Outros' | string;
  author: string;
  date: string;
  time: string;
  url?: string;
  linkedTo?: string;
  linkedType?: 'Andamento' | 'Decisão' | 'Prazo' | 'Tarefa' | 'Geral' | string;
}

export interface ProcessDeadlineOrTask {
  id: string;
  type: 'prazo' | 'tarefa';
  title: string;
  dueDate: string;
  dueTime?: string;
  responsible: string;
  status: 'Pendente' | 'Concluído' | 'Crítico' | 'Vencido' | string;
  priority?: 'Normal' | 'Alta' | 'Crítica' | string;
  linkedDecisionId?: string;
}

export interface ProcessCommitment {
  id: string;
  title: string;
  type: 'Audiência' | 'Reunião' | 'Perícia' | 'Diligência' | 'Sustentação Oral' | 'Sessão de Julgamento' | 'Conciliação' | 'Mediação' | 'Videoconferência' | 'Outro' | string;
  date: string;
  time: string;
  location?: string;
  responsible: string;
  notes?: string;
  linkedDecisionId?: string;
}

export interface AdditionalClient {
  id?: string;
  clientId?: string;
  name: string;
  cpfCnpj?: string;
  polo?: string;
  phone?: string;
  email?: string;
}

export interface AdditionalOpposingParty {
  id?: string;
  name: string;
  cpfCnpj?: string;
  polo?: string;
  lawyer?: string;
  contacts?: string;
  address?: string;
  notes?: string;
}

export interface Process {
  id: string;
  cnj: string;
  controlNumber?: string;
  caseType: 'Judicial' | 'Administrativo' | 'Extrajudicial' | string;
  
  // CRM Link
  clientId: string;
  client: string;
  clientCpfCnpj?: string;
  clientPolo: string;
  additionalClients?: AdditionalClient[];

  // Opposing Party
  opposingParty: string;
  opposingPartyCpfCnpj?: string;
  opposingPartyPolo: string;
  opposingPartyLawyer?: string;
  additionalOpposingParties?: AdditionalOpposingParty[];

  // Process Classification
  classe: string;
  subject: string;
  secondarySubjects?: string;
  area: string;

  // Jurisdiction & Location
  court?: string;
  comarca?: string;
  vara?: string;
  judge?: string;
  jurisdictionGrade?: string;

  // Distribution & Financial
  distribution?: string;
  distributionForm?: string;
  value: number;
  probability?: string;

  // Phase & Situation
  phase: string;
  status: 'Ativo' | 'Suspenso' | 'Encerrado' | 'Arquivado' | 'Cancelado' | string;
  statusType?: 'prazo' | 'atrasado' | 'normal' | 'alerta';
  segredoJustica: boolean;
  secrecyLevel?: 'Normal' | 'Restrito' | 'Sigiloso' | string;

  // Administrative specific fields
  adminNumber?: string;
  protocolNumber?: string;
  protocolDate?: string;
  instaurationDate?: string;
  procedureOrigin?: string;
  adminProcedureType?: string;
  adminProcedureTypeOther?: string;
  procedureObject?: string;
  relatedLegislation?: string;
  adminSphere?: string;
  adminOrgan?: string;
  adminUnit?: string;
  adminAuthority?: string;
  adminMunicipality?: string;
  adminState?: string;
  adminInstance?: string;
  externalConsultUrl?: string;

  // Extrajudicial specific fields
  externalRefNumber?: string;
  extrajudicialType?: string;
  extrajudicialTypeOther?: string;
  intendedResult?: string;
  urgencyGrade?: string;
  estimatedDeadline?: string;
  expectedCompletionDate?: string;
  relatedEntity?: {
    type?: string;
    name?: string;
    unit?: string;
    address?: string;
    responsiblePerson?: string;
    protocolNumber?: string;
    trackingUrl?: string;
  };
  extrajudicialStep?: string;

  // Audit metadata
  createdBy?: string;
  createdAt?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedAt?: string;
  updatedTime?: string;

  // Responsibles
  responsible: string;
  team: string;

  // Descriptions & Internal Narrative (Resumo Elaborado pelo Escritório)
  caseDescription: string;
  summary: string;
  factsSummary?: string;
  actionObject?: string;
  claims?: string;
  strategy?: string;
  attentionPoints?: string;
  internalNotes?: string;
  summaryCreatedBy?: string;
  summaryUpdatedBy?: string;
  summaryUpdatedAt?: string;

  // Administrative info
  hireDate?: string;
  hireType?: string;
  clientOrigin?: string;
  contractFeeInfo?: string;
  paymentTerms?: string;
  riskAssessment?: string;
  leadSource?: string;
  closingData?: string;
  archivingReason?: string;
  notes?: string;
  cloudFolderUrl?: string;

  // Dates & Indicators
  lastUpdateDate: string;
  lastMovement?: string;
  nextDeadlineDate?: string;
  nextDeadlineTitle?: string;
  nextAudienceDate?: string;
  nextAudienceTitle?: string;
  pendingTasksCount?: number;

  // Tab Arrays
  parties: ProcessParty[];
  history: ProcessHistoryItem[];
  documents: ProcessDocument[];
  deadlinesAndTasks: ProcessDeadlineOrTask[];
  commitments: ProcessCommitment[];
  decisions?: ProcessDecision[];

  // Soft Delete
  deleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  deletionReason?: string;

  caseId?: string;
}

export interface CrmAtendimento {
  id: string;
  date: string;
  time?: string;
  responsible: string;
  type?: string;
  description: string;
  result?: string;
  situation: string;
  needsReturn?: boolean;
  returnResponsible?: string;
  returnDate?: string;
  returnTime?: string;
  processCnj?: string;
}

export interface BankAccount {
  id: string;
  bank: string;
  agency: string;
  accountNumber: string;
  accountType: 'Corrente' | 'Poupança' | 'Pagamento';
  holder: string;
  holderCpfCnpj: string;
  pixKey?: string;
  pixKeyType?: 'CPF/CNPJ' | 'E-mail' | 'Telefone' | 'Chave Aleatória';
  notes?: string;
  isMain?: boolean;
}

export interface CrmLead {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  cpfCnpj: string;
  phone: string;
  origin?: string;
  indicatedBy?: string;
  responsible?: string;
  captador?: string;
  team?: string;
  status: 'ATIVO' | 'AGUARDANDO DOC' | 'INATIVO' | string;
  situation?: string;

  email?: string;
  address?: string;
  number?: string;
  complement?: string;
  bairro?: string;
  city?: string;
  state?: string;
  cep?: string;
  notes?: string;
  lastContact?: string;

  // Specific PF fields
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
  rg?: string;
  rgOrgao?: string;
  rgUf?: string;
  birthDate?: string;
  filiacao?: string;

  // Specific PJ fields
  fantasia?: string;
  repName?: string;
  repCpf?: string;
  repRg?: string;
  repRole?: string;
  repQualificacao?: string;

  history?: CrmAtendimento[];
  bankAccounts?: BankAccount[];
  createdAt?: string;
  nextAction?: string;
  nextActionDate?: string;
  deleted?: boolean;
}

export interface DeadlineChecklistItem {
  id: string;
  title: string;
  responsible?: string;
  dueDate?: string;
  status: 'Pendente' | 'Concluído';
  completedAt?: string;
}

export interface DeadlineHistoryLog {
  id: string;
  date: string;
  time: string;
  user: string;
  actionType: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface LinkedTaskItem {
  id: string;
  title: string;
  description?: string;
  responsible: string;
  dueDate: string;
  dueTime?: string;
  status: 'A fazer' | 'Em andamento' | 'Aguardando' | 'Em revisão' | 'Concluída' | 'Cancelada' | string;
  priority?: 'Baixa' | 'Normal' | 'Alta' | 'Crítica' | string;
}

export interface Deadline {
  id: string;
  itemKind?: 'prazo' | 'tarefa';
  completed?: boolean;
  title?: string;
  description: string;
  
  // Process Link
  processId?: string;
  processCnj: string;
  client?: string;
  processClient?: string;
  clientCpfCnpj?: string;
  clientPolo?: string;
  opposingParty?: string;
  area?: string;
  courtVaraComarca?: string;
  phase?: string;
  
  // Linked Deadline (for tasks linked to a deadline)
  parentDeadlineId?: string;
  parentDeadlineTitle?: string;

  // Dates & Times
  startDate?: string;
  dueDate: string;
  dueTime?: string;
  
  // Responsibles & Team
  createdBy?: string;
  createdAtDate?: string;
  createdAtTime?: string;
  responsible: string;
  participants?: string[];
  updatedBy?: string;
  updatedAtDate?: string;
  updatedAtTime?: string;
  completedBy?: string;
  completedAtDate?: string;
  completedAtTime?: string;
  
  // Classification
  priority?: 'Baixa' | 'Normal' | 'Alta' | 'Crítica' | string;
  status: 'Aberto' | 'Em andamento' | 'Aguardando' | 'Em revisão' | 'Cumprido' | 'Concluída' | 'Vencido' | 'Cancelado' | 'Em Produção' | 'Crítico' | 'A fazer' | string;
  waitingReason?: 'Aguardando cliente' | 'Aguardando documento' | 'Aguardando terceiro' | 'Aguardando revisão' | 'Aguardando decisão' | 'Outro' | string;
  waitingNote?: string;
  
  type?: 'processual' | 'interno' | 'administrativo' | 'extrajudicial' | string;
  origin?: 'Publicação/Intimação' | 'Notificação' | 'Contrato' | 'Determinação Judicial' | 'Solicitação de Cliente' | 'Rotina Interna' | 'Outro' | string;
  advanceAlert?: 'Horas antes' | '1 dia antes' | '2 dias antes' | '5 dias antes' | 'Período personalizado' | string;
  
  // Content & Execution
  notes?: string;
  checklist?: DeadlineChecklistItem[];
  attachments?: { name: string; url: string; uploadedAt: string }[];
  linkedTasks?: LinkedTaskItem[];
  
  // Completion details
  protocolNumber?: string;
  protocolDate?: string;
  receiptUrl?: string;
  finalNotes?: string;

  // Cancellation / Rescheduling / Reopening
  cancellationReason?: string;
  rescheduleReason?: string;
  reopenReason?: string;
  history?: DeadlineHistoryLog[];
  
  // Is Private (Always false for institutional items created on Prazos e Tarefas)
  isPrivate?: boolean;
}

export interface CalendarEventHistoryLog {
  id: string;
  date: string;
  time: string;
  user: string;
  actionType: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 
    | 'audiencia' 
    | 'reuniao' 
    | 'atendimento' 
    | 'pericia' 
    | 'diligencia' 
    | 'conciliacao' 
    | 'mediacao' 
    | 'sustentacao_oral' 
    | 'sessao_julgamento' 
    | 'videoconferencia' 
    | 'visita_escritorio' 
    | 'visita_tecnica' 
    | 'protocolo_presencial' 
    | 'compromisso_administrativo' 
    | 'treinamento' 
    | 'deslocamento' 
    | 'ferias' 
    | 'bloqueio_agenda' 
    | 'outro' 
    | string;
  description?: string;
  
  // Dates and times
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  isAllDay?: boolean;

  // Responsibles and participants
  responsible: string;
  participants?: string[];
  team?: string;

  // Integrations
  clientId?: string;
  clientName?: string;
  clientCpfCnpj?: string;
  
  processId?: string;
  process: string; // CNJ or general
  opposingParty?: string;
  area?: string;

  // Location and modality
  location?: string;
  address?: string;
  modality?: 'presencial' | 'virtual' | 'hibrida' | string;
  virtualLink?: string;

  // Priority and Status
  priority?: 'Baixa' | 'Normal' | 'Alta' | 'Crítica' | string;
  status?: 'Agendado' | 'Aguardando confirmação' | 'Confirmado' | 'Em andamento' | 'Realizado' | 'Remarcado' | 'Cancelado' | 'Não compareceu' | string;

  // Alerts & Recurrence
  advanceAlert?: string | string[];
  recurrence?: 'Nenhuma' | 'Diária' | 'Semanal' | 'Mensal' | 'Anual' | 'Personalizada' | string;

  // Notes and Attachments
  notes?: string;
  attachments?: { name: string; url: string; uploadedAt: string }[];

  // Meta records
  createdBy?: string;
  createdAtDate?: string;
  createdAtTime?: string;
  updatedBy?: string;
  updatedAtDate?: string;
  updatedAtTime?: string;
  
  // Reschedule & Cancellation
  rescheduleReason?: string;
  cancelReason?: string;
  
  // History log
  history?: CalendarEventHistoryLog[];

  // Privacy
  isPrivate?: boolean;
}

export interface FinancialHistoryLog {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  previousStatus?: string;
  newStatus?: string;
  justification?: string;
}

export interface RepasseItem {
  id: string;
  incomeOriginId?: string;
  incomeDescription?: string;
  clientId?: string;
  client?: string;
  processId?: string;
  process?: string;
  professionalBeneficiary: string;
  value: number;
  percentage?: number;
  expectedDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  status: 'Previsto' | 'Pendente' | 'Parcialmente realizado' | 'Realizado' | 'Cancelado' | string;
  attachmentUrl?: string;
  attachmentName?: string;
  registeredBy: string;
  observations?: string;
  history?: FinancialHistoryLog[];
}

export interface FinancialTransaction {
  id: string;
  description?: string;
  type: 'revenue' | 'expense';
  category?: string;
  value: number;
  client?: string;
  clientId?: string;
  process?: string;
  processId?: string;
  supplierOrBeneficiary?: string;
  expectedDate?: string;
  dueDate: string;
  receivedDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  receivingAccount?: string;
  
  installmentsCount?: number;
  installmentNumber?: number;
  parentId?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual' | 'Personalizado' | string;

  receivedValue?: number;
  pendingBalance?: number;

  status: 'Prevista' | 'A receber' | 'Parcialmente recebida' | 'Recebida' | 'A pagar' | 'Parcialmente paga' | 'Paga' | 'Vencida' | 'Cancelada' | 'Estornada' | 'pago' | 'pendente' | 'atrasado' | string;

  responsibleUser: string;
  collectionResponsible?: string;
  lastContactDate?: string;
  nextCollectionStep?: string;

  observations?: string;
  attachmentUrl?: string;
  attachmentName?: string;

  repasses?: RepasseItem[];
  history?: FinancialHistoryLog[];

  cancelReason?: string;
  cancelUser?: string;
  cancelDate?: string;

  createdAt?: string;
  date?: string;
  updatedAt?: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  team?: string;
  role: string;
  mfa: boolean;
  lastAccess: string;
  username?: string;
}

export const initialProcesses: Process[] = [];

export const initialCrmLeads: CrmLead[] = [];

export const initialDeadlines: Deadline[] = [];

export const initialEvents: CalendarEvent[] = [];

export const initialTransactions: FinancialTransaction[] = [];

export const initialUsers: SystemUser[] = [];

export interface LegalCase {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  description: string;
  status: 'Ativo' | 'Arquivado' | 'Pendente';
  responsible: string;
  team: string;
  isConfidential: boolean;
  deleted?: boolean;
}

export interface LegalDocument {
  id: string;
  name: string;
  category: 'Petições' | 'Procurações' | 'Contratos' | 'Certidões' | 'Outros';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  processCnj?: string;
  status: 'Revisado' | 'Em Elaboração' | 'Aguardando Assinatura';
}

export interface FeeContract {
  id: string;
  contractNumber: string;
  caseId: string;
  caseTitle: string;
  clientId: string;
  clientName: string;
  value: number;
  paymentMethod: 'À Vista' | 'Parcelado' | 'Êxito';
  installments?: number;
  status: 'Assinado' | 'Pendente' | 'Cancelado';
  signedAt?: string;
  deleted?: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  recipientId: string;
  category: string;
  deleted?: boolean;
  type: 'prazo' | 'financeiro' | 'crm' | 'sistema';
  createdAt: string;
}

export type Notification = SystemNotification;

export const initialLegalCases: LegalCase[] = [];

export const initialLegalDocuments: LegalDocument[] = [];

export const initialFeeContracts: FeeContract[] = [];

export const initialNotifications: Notification[] = [];
