'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, Plus, Trash2, Download, Eye, CheckCircle, 
  AlertCircle, Layers, RefreshCw, Printer, Copy, Archive, RotateCcw, 
  Filter, User, Briefcase, ChevronRight, Edit, History, X, Check, Lock, 
  Building2, UserCheck, Scale, FileCheck, ArrowRight, ArrowLeft, SlidersHorizontal,
  FileCode, ShieldCheck, Tag, Calendar, UserPlus, Sparkles
} from 'lucide-react';

// Types and Data Structures
export interface OfficeModel {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  lawArea: string;
  description: string;
  templateText: string;
  createdAt: string;
  updatedAt: string;
  responsibleUser: string;
  version: string;
  status: 'Ativo' | 'Arquivado';
  personTypeVariant: 'Pessoa Física' | 'Pessoa Jurídica' | 'Uma Pessoa' | 'Múltiplos Outorgantes' | 'Ambos';
  variableFields: VariableFieldDefinition[];
  versionHistory: ModelVersionLog[];
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
}

export interface VariableFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  required?: boolean;
}

export interface ModelVersionLog {
  version: string;
  updatedAt: string;
  updatedBy: string;
  description: string;
}

export interface GeneratedDocument {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  category: string;
  subcategory?: string;
  lawArea?: string;
  clientId?: string;
  clientName?: string;
  clientCpfCnpj?: string;
  clientType?: 'PF' | 'PJ';
  clientDetails?: Record<string, string>;
  processId?: string;
  processCnj?: string;
  processDetails?: Record<string, string>;
  personTypeVariant?: string;
  variablesUsed: Record<string, any>;
  content: string;
  generatedBy: string;
  generatedAtDate: string;
  generatedAtTime: string;
  status: 'Rascunho' | 'Gerado' | 'Revisado' | 'Assinado' | 'Arquivado';
  modelVersion: string;
  archived: boolean;
  archivedBy?: string;
  archivedAt?: string;
  archiveReason?: string;
  versions?: DocumentVersionLog[];
}

export interface DocumentVersionLog {
  id: string;
  updatedAt: string;
  updatedBy: string;
  changesDescription: string;
  contentSnapshot: string;
}

interface DocumentosViewProps {
  processes?: any[];
  crmLeads?: any[];
  currentUser?: any;
  onUpdateProcess?: (updated: any) => void;
  onUpdateCrmLead?: (updated: any) => void;
}

// Default Categories
const MAIN_CATEGORIES = [
  'Todos',
  'Petições',
  'Procurações',
  'Contratos',
  'Declarações',
  'Substabelecimentos',
  'Notificações',
  'Requerimentos',
  'Acordos',
  'Recibos',
  'Outros'
];

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  'Petições': ['Cível', 'Trabalhista', 'Família', 'Consumidor', 'Administrativo', 'Imobiliário', 'Contratual'],
  'Contratos': ['Honorários cíveis', 'Honorários trabalhistas', 'Honorários de família', 'Honorários consumeristas', 'Prestação de serviços', 'Honorários de êxito'],
  'Procurações': ['Pessoa física', 'Pessoa jurídica', 'Uma pessoa', 'Múltiplos outorgantes'],
  'Declarações': ['Hipossuficiência', 'Residência', 'Isenção IPRB', 'Bens e Valores'],
  'Substabelecimentos': ['Com reserva de poderes', 'Sem reserva de poderes'],
  'Notificações': ['Extrajudicial de mora', 'Rescisão contratual', 'Cobrança amigável'],
  'Requerimentos': ['Certidão administrativa', 'Desentranhamento', 'Vista dos autos'],
  'Acordos': ['Cível extrajudicial', 'Trabalhista homologado', 'Família e alimentos'],
  'Recibos': ['Honorários contratuais', 'Honorários sucumbenciais', 'Despesas processuais']
};

// Default Initial Models
const INITIAL_MODELS: OfficeModel[] = [];

// Initial Generated Documents Sample
const INITIAL_GENERATED_DOCS: GeneratedDocument[] = [];

export default function DocumentosView({
  processes = [],
  crmLeads = [],
  currentUser,
  onUpdateProcess,
  onUpdateCrmLead
}: DocumentosViewProps = {}) {
  // Permission & Role state
  const [isAuthorizedUser, setIsAuthorizedUser] = useState<boolean>(true);

  // Storage States
  const [models, setModels] = useState<OfficeModel[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pcgos_office_models');
      return saved ? JSON.parse(saved) : INITIAL_MODELS;
    }
    return INITIAL_MODELS;
  });

  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pcgos_generated_docs');
      return saved ? JSON.parse(saved) : INITIAL_GENERATED_DOCS;
    }
    return INITIAL_GENERATED_DOCS;
  });

  useEffect(() => {
    localStorage.setItem('pcgos_office_models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem('pcgos_generated_docs', JSON.stringify(generatedDocs));
  }, [generatedDocs]);

  // View Mode: 'models' | 'generated' | 'archived'
  const [activeTab, setActiveTab] = useState<'models' | 'generated' | 'archived'>('models');

  // Top Category Filter
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todas');
  const [selectedLawArea, setSelectedLawArea] = useState<string>('Todas');
  const [selectedPersonType, setSelectedPersonType] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCreateModelModalOpen, setIsCreateModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<OfficeModel | null>(null);
  const [viewingModel, setViewingModel] = useState<OfficeModel | null>(null);
  const [viewingGeneratedDoc, setViewingGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [editingDocContent, setEditingDocContent] = useState<GeneratedDocument | null>(null);
  const [printableDoc, setPrintableDoc] = useState<{ title: string; content: string } | null>(null);
  
  // Archiving Modal State
  const [archiveTarget, setArchiveTarget] = useState<{ type: 'model' | 'generated'; id: string; name: string } | null>(null);
  const [archiveReasonInput, setArchiveReasonInput] = useState('');

  // Versions Modal State
  const [versionHistoryTarget, setVersionHistoryTarget] = useState<OfficeModel | GeneratedDocument | null>(null);

  // Wizard Generation Form State (7 Steps Flow)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardSelectedModelId, setWizardSelectedModelId] = useState<string>('');
  const [wizardVariant, setWizardVariant] = useState<string>('Pessoa Física');
  const [wizardSelectedClientId, setWizardSelectedClientId] = useState<string>('');
  const [wizardClientSearch, setWizardClientSearch] = useState<string>('');
  const [wizardSelectedProcessId, setWizardSelectedProcessId] = useState<string>('');
  const [wizardProcessSearch, setWizardProcessSearch] = useState<string>('');
  const [wizardVariableValues, setWizardVariableValues] = useState<Record<string, string>>({});
  const [wizardGeneratedPreviewText, setWizardGeneratedPreviewText] = useState<string>('');

  // Create / Edit Model Form state
  const [modelFormName, setModelFormName] = useState('');
  const [modelFormCategory, setModelFormCategory] = useState('Petições');
  const [modelFormSubcategory, setModelFormSubcategory] = useState('Cível');
  const [modelFormLawArea, setModelFormLawArea] = useState('Cível');
  const [modelFormDescription, setModelFormDescription] = useState('');
  const [modelFormText, setModelFormText] = useState('');
  const [modelFormVariant, setModelFormVariant] = useState<'Pessoa Física' | 'Pessoa Jurídica' | 'Uma Pessoa' | 'Múltiplos Outorgantes' | 'Ambos'>('Ambos');

  // Open Generation Wizard with optional preselected model
  const startGenerationWizard = (modelId?: string) => {
    setWizardStep(1);
    setWizardSelectedModelId(modelId || (models[0]?.id || ''));
    setWizardVariant('Pessoa Física');
    setWizardSelectedClientId('');
    setWizardClientSearch('');
    setWizardSelectedProcessId('');
    setWizardProcessSearch('');
    setWizardVariableValues({});
    setWizardGeneratedPreviewText('');
    setIsWizardOpen(true);
  };

  // Helper: Get selected Model object in Wizard
  const wizardSelectedModel = models.find(m => m.id === wizardSelectedModelId);

  // Helper: Get selected CRM Client
  const selectedCrmLead = crmLeads.find(c => c.id === wizardSelectedClientId);

  // Helper: Get selected Process
  const selectedProcess = processes.find(p => p.id === wizardSelectedProcessId);

  // Auto interpolate document text based on selections
  const generateInterpolatedText = () => {
    if (!wizardSelectedModel) return '';

    let text = wizardSelectedModel.templateText;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Client Interpolations
    if (selectedCrmLead) {
      const isPj = selectedCrmLead.type === 'PJ';
      text = text.replace(/{{CLIENTE_NOME}}/g, selectedCrmLead.name || 'CLIENTE');
      text = text.replace(/{{CLIENTE_CPF}}/g, selectedCrmLead.cpfCnpj || '');
      text = text.replace(/{{CLIENTE_CPF_CNPJ}}/g, selectedCrmLead.cpfCnpj || '');
      text = text.replace(/{{CLIENTE_EMAIL}}/g, selectedCrmLead.email || 'Não informado');
      text = text.replace(/{{CLIENTE_TELEFONE}}/g, selectedCrmLead.phone || '');
      text = text.replace(/{{CLIENTE_ENDERECO}}/g, selectedCrmLead.address ? `${selectedCrmLead.address}, ${selectedCrmLead.number || ''} ${selectedCrmLead.city || ''}-${selectedCrmLead.state || ''}` : 'Endereço não cadastrado');

      if (!isPj) {
        text = text.replace(/{{CLIENTE_NACIONALIDADE}}/g, selectedCrmLead.nacionalidade || 'brasileiro(a)');
        text = text.replace(/{{CLIENTE_ESTADO_CIVIL}}/g, selectedCrmLead.estadoCivil || 'solteiro(a)');
        text = text.replace(/{{CLIENTE_PROFISSAO}}/g, selectedCrmLead.profissao || 'autônomo(a)');
        text = text.replace(/{{CLIENTE_RG}}/g, selectedCrmLead.rg || 'RG/SSP');
        text = text.replace(/{{CLIENTE_RG_ORGAO}}/g, selectedCrmLead.rgOrgao ? `/${selectedCrmLead.rgOrgao}` : '');
        text = text.replace(/{{CLIENTE_QUALIFICACAO_COMPLETA}}/g, `${selectedCrmLead.nacionalidade || 'brasileiro(a)'}, ${selectedCrmLead.estadoCivil || 'solteiro(a)'}, ${selectedCrmLead.profissao || 'autônomo(a)'}`);
      } else {
        text = text.replace(/{{CLIENTE_QUALIFICACAO_COMPLETA}}/g, `pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${selectedCrmLead.cpfCnpj}, representada por ${selectedCrmLead.repName || 'seu representante legal'}`);
      }
    } else {
      text = text.replace(/{{CLIENTE_NOME}}/g, '[NOME DO CLIENTE]');
      text = text.replace(/{{CLIENTE_CPF}}/g, '[CPF/CNPJ]');
      text = text.replace(/{{CLIENTE_CPF_CNPJ}}/g, '[CPF/CNPJ]');
      text = text.replace(/{{CLIENTE_EMAIL}}/g, '[E-MAIL]');
      text = text.replace(/{{CLIENTE_TELEFONE}}/g, '[TELEFONE]');
      text = text.replace(/{{CLIENTE_ENDERECO}}/g, '[ENDEREÇO COMPLETO]');
      text = text.replace(/{{CLIENTE_QUALIFICACAO_COMPLETA}}/g, '[QUALIFICAÇÃO COMPLETA]');
      text = text.replace(/{{CLIENTE_NACIONALIDADE}}/g, '[NACIONALIDADE]');
      text = text.replace(/{{CLIENTE_ESTADO_CIVIL}}/g, '[ESTADO CIVIL]');
      text = text.replace(/{{CLIENTE_PROFISSAO}}/g, '[PROFISSÃO]');
      text = text.replace(/{{CLIENTE_RG}}/g, '[RG]');
      text = text.replace(/{{CLIENTE_RG_ORGAO}}/g, '');
    }

    // Process Interpolations
    if (selectedProcess) {
      text = text.replace(/{{PROCESSO_NUMERO}}/g, selectedProcess.cnj || selectedProcess.id);
      text = text.replace(/{{PROCESSO_VARA}}/g, selectedProcess.vara || 'Vara Cível');
      text = text.replace(/{{PROCESSO_COMARCA}}/g, selectedProcess.comarca || 'São Paulo');
      text = text.replace(/{{PROCESSO_TRIBUNAL}}/g, selectedProcess.court || 'TJSP');
      text = text.replace(/{{PROCESSO_ASSUNTO}}/g, selectedProcess.subject || '');
    } else {
      text = text.replace(/{{PROCESSO_NUMERO}}/g, '[NENHUM PROCESSO VINCULADO]');
      text = text.replace(/{{PROCESSO_VARA}}/g, '[VARA]');
      text = text.replace(/{{PROCESSO_COMARCA}}/g, '[COMARCA]');
      text = text.replace(/{{PROCESSO_TRIBUNAL}}/g, '[TRIBUNAL]');
      text = text.replace(/{{PROCESSO_ASSUNTO}}/g, '[ASSUNTO]');
    }

    text = text.replace(/{{DATA_ATUAL}}/g, formattedDate);

    // Variable Fields Replacements
    wizardSelectedModel.variableFields.forEach(vf => {
      const val = wizardVariableValues[vf.key] || `[${vf.label.toUpperCase()}]`;
      const placeholderRegex = new RegExp(`{{VAR_${vf.key.toUpperCase()}}}`, 'g');
      text = text.replace(placeholderRegex, val);
    });

    return text;
  };

  // Step 5 -> Step 6: Trigger compilation
  const handleProceedToPreview = () => {
    const interpolated = generateInterpolatedText();
    setWizardGeneratedPreviewText(interpolated);
    setWizardStep(6);
  };

  // Finalize Document Generation
  const handleConfirmDocumentGeneration = () => {
    if (!wizardSelectedModel) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userName = currentUser?.name || 'Advogado do Escritório';

    const newDocName = selectedCrmLead 
      ? `${wizardSelectedModel.name.split(' - ')[0]} - ${selectedCrmLead.name}`
      : `${wizardSelectedModel.name} - Gerado em ${dateStr}`;

    const newDoc: GeneratedDocument = {
      // eslint-disable-next-line react-hooks/purity
      id: `gen-${Date.now()}`,
      name: newDocName,
      modelId: wizardSelectedModel.id,
      modelName: wizardSelectedModel.name,
      category: wizardSelectedModel.category,
      subcategory: wizardSelectedModel.subcategory,
      lawArea: wizardSelectedModel.lawArea,
      clientId: selectedCrmLead?.id,
      clientName: selectedCrmLead?.name,
      clientCpfCnpj: selectedCrmLead?.cpfCnpj,
      clientType: selectedCrmLead?.type,
      processId: selectedProcess?.id,
      processCnj: selectedProcess?.cnj,
      personTypeVariant: wizardVariant,
      variablesUsed: wizardVariableValues,
      content: wizardGeneratedPreviewText,
      generatedBy: userName,
      generatedAtDate: dateStr,
      generatedAtTime: timeStr,
      status: 'Gerado',
      modelVersion: wizardSelectedModel.version,
      archived: false,
      versions: [
        {
          id: `v-1`,
          updatedAt: `${dateStr} ${timeStr}`,
          updatedBy: userName,
          changesDescription: 'Documento gerado a partir do modelo institucional.',
          contentSnapshot: wizardGeneratedPreviewText
        }
      ]
    };

    setGeneratedDocs(prev => [newDoc, ...prev]);

    // Record in Process History if linked
    if (selectedProcess && onUpdateProcess) {
      const historyEntry = {
        // eslint-disable-next-line react-hooks/purity
        id: `hist-${Date.now()}`,
        date: dateStr,
        time: timeStr,
        user: userName,
        actionType: 'Documento Gerado',
        description: `Documento "${newDoc.name}" gerado a partir do modelo "${wizardSelectedModel.name}" (${wizardSelectedModel.version}).`
      };
      const updatedProc = {
        ...selectedProcess,
        history: [historyEntry, ...(selectedProcess.history || [])],
        documents: [
          {
            id: newDoc.id,
            name: newDoc.name,
            type: newDoc.category,
            uploadedAt: dateStr,
            uploadedBy: userName,
            status: 'Revisado'
          },
          ...(selectedProcess.documents || [])
        ]
      };
      onUpdateProcess(updatedProc);
    }

    // Record in CRM Lead History if linked
    if (selectedCrmLead && onUpdateCrmLead) {
      const crmHistoryEntry = {
        // eslint-disable-next-line react-hooks/purity
        id: `crm-hist-${Date.now()}`,
        date: dateStr,
        time: timeStr,
        user: userName,
        channel: 'Sistema',
        notes: `Documento de produção "${newDoc.name}" gerado e vinculado ao prontuário do cliente.`
      };
      const updatedLead = {
        ...selectedCrmLead,
        history: [crmHistoryEntry, ...(selectedCrmLead.history || [])]
      };
      onUpdateCrmLead(updatedLead);
    }

    setIsWizardOpen(false);
    setActiveTab('generated');
    alert(`Documento "${newDocName}" gerado com sucesso e arquivado na Central!`);
  };

  // Open Create/Edit Model Modal
  const handleOpenCreateModelModal = (modelToEdit?: OfficeModel) => {
    if (modelToEdit) {
      setEditingModel(modelToEdit);
      setModelFormName(modelToEdit.name);
      setModelFormCategory(modelToEdit.category);
      setModelFormSubcategory(modelToEdit.subcategory);
      setModelFormLawArea(modelToEdit.lawArea);
      setModelFormDescription(modelToEdit.description);
      setModelFormText(modelToEdit.templateText);
      setModelFormVariant(modelToEdit.personTypeVariant);
    } else {
      setEditingModel(null);
      setModelFormName('');
      setModelFormCategory('Petições');
      setModelFormSubcategory('Cível');
      setModelFormLawArea('Cível');
      setModelFormDescription('');
      setModelFormText('');
      setModelFormVariant('Ambos');
    }
    setIsCreateModelModalOpen(true);
  };

  // Save Model (Create or Update)
  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelFormName.trim() || !modelFormText.trim()) return;

    const userName = currentUser?.name || 'Administrador do Escritório';
    const dateStr = new Date().toISOString().split('T')[0];

    if (editingModel) {
      // Increment version (e.g. v1.0 -> v1.1)
      const currentVerNum = parseFloat(editingModel.version.replace('v', '')) || 1.0;
      const newVersionStr = `v${(currentVerNum + 0.1).toFixed(1)}`;

      const versionLog: ModelVersionLog = {
        version: newVersionStr,
        updatedAt: dateStr,
        updatedBy: userName,
        description: `Modelo atualizado e nova versão ${newVersionStr} publicada.`
      };

      const updated: OfficeModel = {
        ...editingModel,
        name: modelFormName,
        category: modelFormCategory,
        subcategory: modelFormSubcategory,
        lawArea: modelFormLawArea,
        description: modelFormDescription,
        templateText: modelFormText,
        personTypeVariant: modelFormVariant,
        updatedAt: dateStr,
        responsibleUser: userName,
        version: newVersionStr,
        versionHistory: [versionLog, ...(editingModel.versionHistory || [])]
      };

      setModels(prev => prev.map(m => m.id === editingModel.id ? updated : m));
      alert(`Modelo "${modelFormName}" atualizado para a versão ${newVersionStr}!`);
    } else {
      const newModel: OfficeModel = {
        id: `mod-${Date.now()}`,
        name: modelFormName,
        category: modelFormCategory,
        subcategory: modelFormSubcategory,
        lawArea: modelFormLawArea,
        description: modelFormDescription,
        templateText: modelFormText,
        status: 'Ativo',
        version: 'v1.0',
        responsibleUser: userName,
        createdAt: dateStr,
        updatedAt: dateStr,
        personTypeVariant: modelFormVariant,
        variableFields: [
          { key: 'observacoesGerais', label: 'Observações do Documento', type: 'textarea', placeholder: 'Instruções específicas...' }
        ],
        versionHistory: [
          { version: 'v1.0', updatedAt: dateStr, updatedBy: userName, description: 'Criação do novo modelo.' }
        ]
      };

      setModels(prev => [newModel, ...prev]);
      alert(`Novo modelo "${modelFormName}" criado com sucesso!`);
    }

    setIsCreateModelModalOpen(false);
  };

  // Duplicate Model
  const handleDuplicateModel = (model: OfficeModel) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const duplicated: OfficeModel = {
      ...model,
      id: `mod-${Date.now()}`,
      name: `${model.name} (Cópia)`,
      version: 'v1.0',
      createdAt: dateStr,
      updatedAt: dateStr,
      responsibleUser: currentUser?.name || 'Advogado',
      versionHistory: [
        { version: 'v1.0', updatedAt: dateStr, updatedBy: currentUser?.name || 'Advogado', description: `Duplicado a partir do modelo ${model.name}.` }
      ]
    };
    setModels(prev => [duplicated, ...prev]);
    alert(`Modelo duplicado: "${duplicated.name}"`);
  };

  // Archive Target Handler
  const handleExecuteArchiving = () => {
    if (!archiveTarget || !archiveReasonInput.trim()) {
      alert('Por favor, informe o motivo do arquivamento.');
      return;
    }

    const userName = currentUser?.name || 'Usuário Responsável';
    const dateStr = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    if (archiveTarget.type === 'model') {
      setModels(prev => prev.map(m => {
        if (m.id === archiveTarget.id) {
          return {
            ...m,
            status: 'Arquivado',
            archivedAt: dateStr,
            archivedBy: userName,
            archiveReason: archiveReasonInput
          };
        }
        return m;
      }));
    } else {
      setGeneratedDocs(prev => prev.map(d => {
        if (d.id === archiveTarget.id) {
          return {
            ...d,
            archived: true,
            status: 'Arquivado',
            archivedAt: dateStr,
            archivedBy: userName,
            archiveReason: archiveReasonInput
          };
        }
        return d;
      }));
    }

    setArchiveTarget(null);
    setArchiveReasonInput('');
    alert(`Item arquivado com sucesso. O registro histórico foi mantido.`);
  };

  // Restore Target Handler
  const handleRestoreTarget = (type: 'model' | 'generated', id: string) => {
    if (type === 'model') {
      setModels(prev => prev.map(m => m.id === id ? { ...m, status: 'Ativo', archivedAt: undefined, archiveReason: undefined } : m));
    } else {
      setGeneratedDocs(prev => prev.map(d => d.id === id ? { ...d, archived: false, status: 'Gerado', archivedAt: undefined, archiveReason: undefined } : d));
    }
    alert('Item restaurado para o acervo ativo com sucesso!');
  };

  // Save edits on generated doc content
  const handleSaveDocContentEdit = () => {
    if (!editingDocContent) return;
    const userName = currentUser?.name || 'Advogado';
    const dateStr = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newVersionLog: DocumentVersionLog = {
      id: `ver-${Date.now()}`,
      updatedAt: dateStr,
      updatedBy: userName,
      changesDescription: 'Edição manual do conteúdo do documento.',
      contentSnapshot: editingDocContent.content
    };

    setGeneratedDocs(prev => prev.map(d => {
      if (d.id === editingDocContent.id) {
        return {
          ...editingDocContent,
          status: 'Revisado',
          versions: [newVersionLog, ...(d.versions || [])]
        };
      }
      return d;
    }));

    setEditingDocContent(null);
    alert('Documento revisado e salvo com sucesso!');
  };

  // Filter Logic
  const filteredModels = models.filter(m => {
    if (activeTab === 'models' && m.status === 'Arquivado') return false;
    if (activeTab === 'archived' && m.status !== 'Arquivado') return false;

    const matchesCategory = selectedMainCategory === 'Todos' || m.category === selectedMainCategory;
    const matchesSubcat = selectedSubcategory === 'Todas' || m.subcategory === selectedSubcategory;
    const matchesLawArea = selectedLawArea === 'Todas' || m.lawArea === selectedLawArea;
    const matchesPersonType = selectedPersonType === 'Todos' || m.personTypeVariant === selectedPersonType || m.personTypeVariant === 'Ambos';

    const query = searchQuery.toLowerCase();
    const matchesQuery = !query || 
      m.name.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      m.lawArea.toLowerCase().includes(query) ||
      m.responsibleUser.toLowerCase().includes(query);

    return matchesCategory && matchesSubcat && matchesLawArea && matchesPersonType && matchesQuery;
  });

  const filteredGeneratedDocs = generatedDocs.filter(d => {
    if (activeTab === 'generated' && d.archived) return false;
    if (activeTab === 'archived' && !d.archived) return false;

    const matchesCategory = selectedMainCategory === 'Todos' || d.category === selectedMainCategory;
    const matchesSubcat = selectedSubcategory === 'Todas' || d.subcategory === selectedSubcategory;
    const matchesLawArea = selectedLawArea === 'Todas' || d.lawArea === selectedLawArea;
    const matchesPersonType = selectedPersonType === 'Todos' || d.clientType === (selectedPersonType === 'Pessoa Física' ? 'PF' : selectedPersonType === 'Pessoa Jurídica' ? 'PJ' : undefined);

    const query = searchQuery.toLowerCase();
    const matchesQuery = !query || 
      d.name.toLowerCase().includes(query) ||
      d.modelName.toLowerCase().includes(query) ||
      (d.clientName && d.clientName.toLowerCase().includes(query)) ||
      (d.clientCpfCnpj && d.clientCpfCnpj.includes(query)) ||
      (d.processCnj && d.processCnj.includes(query)) ||
      d.generatedBy.toLowerCase().includes(query);

    return matchesCategory && matchesSubcat && matchesLawArea && matchesPersonType && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* 2. CABEÇALHO DA PÁGINA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#0d2f43] tracking-tight">
              Documentos
            </h1>
            <button
              onClick={() => setIsAuthorizedUser(!isAuthorizedUser)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                isAuthorizedUser 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Alternar perfil de permissões do usuário"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAuthorizedUser ? 'Perfil Autorizado / Admin' : 'Usuário Comum'}</span>
            </button>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Modelos jurídicos e produção documental do escritório.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Novo Modelo Button (Visible only to authorized users) */}
          {isAuthorizedUser && (
            <button
              onClick={() => handleOpenCreateModelModal()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0d2f43] rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Modelo</span>
            </button>
          )}

          {/* Gerar Documento Button */}
          <button
            onClick={() => startGenerationWizard()}
            className="px-5 py-2.5 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Gerar Documento</span>
          </button>
        </div>
      </div>

      {/* 3. CATEGORIAS PRINCIPAIS */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Categorias Principais
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MAIN_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedMainCategory(cat);
                setSelectedSubcategory('Todas');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedMainCategory === cat
                  ? 'bg-[#0d2f43] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. SUBCATEGORIAS */}
        {selectedMainCategory !== 'Todos' && SUBCATEGORIES_MAP[selectedMainCategory] && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Subcategorias:
            </span>
            <button
              onClick={() => setSelectedSubcategory('Todas')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                selectedSubcategory === 'Todas' ? 'bg-[#123e59] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {SUBCATEGORIES_MAP[selectedMainCategory].map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  selectedSubcategory === sub ? 'bg-[#123e59] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Section Tabs Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'models' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Modelos do Escritório</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {models.filter(m => m.status === 'Ativo').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('generated')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'generated' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Documentos Gerados</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {generatedDocs.filter(d => !d.archived).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'archived' ? 'bg-white text-[#0d2f43] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arquivados</span>
          </button>
        </div>

        {/* Filters & Search Inputs */}
        <div className="flex items-center gap-3 flex-wrap flex-1 justify-end">
          {/* Law Area Filter */}
          <select
            value={selectedLawArea}
            onChange={(e) => setSelectedLawArea(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-700 font-bold outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
          >
            <option value="Todas">Área do Direito: Todas</option>
            <option value="Cível">Cível</option>
            <option value="Trabalhista">Trabalhista</option>
            <option value="Família">Família</option>
            <option value="Consumidor">Consumidor</option>
            <option value="Administrativo">Administrativo</option>
            <option value="Imobiliário">Imobiliário</option>
            <option value="Tributário">Tributário</option>
            <option value="Geral">Geral</option>
          </select>

          {/* Person Type Filter */}
          <select
            value={selectedPersonType}
            onChange={(e) => setSelectedPersonType(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-700 font-bold outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
          >
            <option value="Todos">Tipo de Pessoa: Todos</option>
            <option value="Pessoa Física">Pessoa Física</option>
            <option value="Pessoa Jurídica">Pessoa Jurídica</option>
          </select>

          {/* Search Box */}
          <div className="relative min-w-48 flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por modelo, cliente, CNJ, palavra..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      
      {/* 5. TAB 1: MODELOS DO ESCRITÓRIO */}
      {activeTab === 'models' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Modelos do Escritório ({filteredModels.length})
            </h3>
          </div>

          {filteredModels.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <FileCode className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Nenhum modelo encontrado</p>
              <p className="text-xs text-slate-400">Tente alterar os filtros de busca ou categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModels.map(model => (
                <div 
                  key={model.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div>
                    {/* Category & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {model.category} • {model.subcategory}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {model.version}
                      </span>
                    </div>

                    {/* Model Name */}
                    <h4 className="font-bold text-sm text-[#0d2f43] group-hover:text-[#123e59] transition-colors line-clamp-2">
                      {model.name}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap text-[10px] text-slate-400 font-medium">
                      <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-slate-600">
                        Área: {model.lawArea}
                      </span>
                      <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-slate-600">
                        {model.personTypeVariant}
                      </span>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Resp: {model.responsibleUser}</span>
                      <span>Atualizado: {model.updatedAt}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => startGenerationWizard(model.id)}
                        className="flex-1 bg-[#0d2f43] hover:bg-[#0b2839] text-white py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Usar Modelo</span>
                      </button>

                      <button
                        onClick={() => setViewingModel(model)}
                        className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Visualizar modelo e timbre"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isAuthorizedUser && (
                        <button
                          onClick={() => handleOpenCreateModelModal(model)}
                          className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar modelo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDuplicateModel(model)}
                        className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Duplicar modelo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setVersionHistoryTarget(model)}
                        className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Consultar versões"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {isAuthorizedUser && (
                        <button
                          onClick={() => setArchiveTarget({ type: 'model', id: model.id, name: model.name })}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Arquivar modelo"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: DOCUMENTOS GERADOS */}
      {activeTab === 'generated' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Documentos Gerados ({filteredGeneratedDocs.length})
            </h3>
          </div>

          {filteredGeneratedDocs.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <FileCheck className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Nenhum documento gerado encontrado</p>
              <p className="text-xs text-slate-400">Utilize o botão &quot;Gerar Documento&quot; para produzir peças a partir do acervo do escritório.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredGeneratedDocs.map(doc => (
                  <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => setViewingGeneratedDoc(doc)}
                            className="text-xs font-bold text-slate-800 hover:text-[#0d2f43] cursor-pointer"
                          >
                            {doc.name}
                          </h4>
                          <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                            {doc.modelVersion}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">Modelo: {doc.modelName}</span>
                          <span>•</span>
                          {doc.clientName ? (
                            <span className="font-bold text-[#123e59] bg-[#123e59]/5 px-2 py-0.5 rounded">
                              Cliente: {doc.clientName} ({doc.clientCpfCnpj || 'S/N'})
                            </span>
                          ) : (
                            <span className="text-slate-400">Sem cliente vinculado</span>
                          )}

                          {doc.processCnj && (
                            <>
                              <span>•</span>
                              <span className="font-mono font-bold text-slate-700">
                                CNJ: {doc.processCnj}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>Gerado por {doc.generatedBy}</span>
                          <span>•</span>
                          <span>{doc.generatedAtDate} às {doc.generatedAtTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                        doc.status === 'Assinado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        doc.status === 'Revisado' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {doc.status}
                      </span>

                      <button
                        onClick={() => setViewingGeneratedDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Visualizar documento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingDocContent(doc)}
                        className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Revisar / Editar texto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPrintableDoc({ title: doc.name, content: doc.content })}
                        className="p-1.5 text-slate-500 hover:text-[#0d2f43] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Imprimir documento"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          const element = document.createElement("a");
                          const file = new Blob([doc.content], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                          document.body.appendChild(element);
                          element.click();
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Baixar arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setArchiveTarget({ type: 'generated', id: doc.id, name: doc.name })}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Arquivar documento"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARQUIVADOS */}
      {activeTab === 'archived' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Itens Arquivados (Modelos: {models.filter(m => m.status === 'Arquivado').length} | Documentos: {generatedDocs.filter(d => d.archived).length})
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
            {models.filter(m => m.status === 'Arquivado').map(archivedModel => (
              <div key={archivedModel.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">Modelo Arquivado</span>
                    <h4 className="text-xs font-bold text-slate-800">{archivedModel.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Motivo: {archivedModel.archiveReason || 'Não informado'} • Por {archivedModel.archivedBy} em {archivedModel.archivedAt}
                  </p>
                </div>
                <button
                  onClick={() => handleRestoreTarget('model', archivedModel.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0d2f43] rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}

            {generatedDocs.filter(d => d.archived).map(archivedDoc => (
              <div key={archivedDoc.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">Documento Gerado Arquivado</span>
                    <h4 className="text-xs font-bold text-slate-800">{archivedDoc.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Motivo: {archivedDoc.archiveReason || 'Não informado'} • Por {archivedDoc.archivedBy} em {archivedDoc.archivedAt}
                  </p>
                </div>
                <button
                  onClick={() => handleRestoreTarget('generated', archivedDoc.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0d2f43] rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}

            {models.filter(m => m.status === 'Arquivado').length === 0 && generatedDocs.filter(d => d.archived).length === 0 && (
              <div className="p-8 text-center text-xs font-bold text-slate-400">
                Nenhum modelo ou documento arquivado no histórico.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. MODAL: WIZARD DE GERAÇÃO DE DOCUMENTO (FLUXO COMPLETO) */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Central de Produção Documental - Gerador de Peças</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Etapa {wizardStep} de 6: {
                    wizardStep === 1 ? 'Seleção do Modelo' :
                    wizardStep === 2 ? 'Variação do Modelo' :
                    wizardStep === 3 ? 'Integração CRM (Cliente)' :
                    wizardStep === 4 ? 'Integração Processo' :
                    wizardStep === 5 ? 'Dados Variáveis' :
                    'Visualização Prévia e Revisão'
                  }
                </p>
              </div>
              <button 
                onClick={() => setIsWizardOpen(false)}
                className="hover:bg-white/10 p-1.5 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 shrink-0 flex items-center justify-between overflow-x-auto">
              {[
                { step: 1, title: '1. Modelo' },
                { step: 2, title: '2. Variação' },
                { step: 3, title: '3. Cliente (CRM)' },
                { step: 4, title: '4. Processo' },
                { step: 5, title: '5. Variáveis' },
                { step: 6, title: '6. Prévia' }
              ].map(s => (
                <div 
                  key={s.step} 
                  className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md transition-all ${
                    wizardStep === s.step ? 'bg-[#0d2f43] text-white' : 
                    wizardStep > s.step ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
                  }`}
                >
                  <span>{s.title}</span>
                  {wizardStep > s.step && <Check className="w-3 h-3" />}
                </div>
              ))}
            </div>

            {/* Wizard Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              
              {/* STEP 1: SELECT MODEL */}
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-600 font-bold">
                    Selecione o modelo jurídico do acervo do escritório para iniciar a produção:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {models.filter(m => m.status === 'Ativo').map(mod => (
                      <div
                        key={mod.id}
                        onClick={() => setWizardSelectedModelId(mod.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          wizardSelectedModelId === mod.id
                            ? 'border-[#0d2f43] bg-blue-50/50 shadow-sm ring-2 ring-[#0d2f43]/10'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                            <span>{mod.category}</span>
                            <span>{mod.version}</span>
                          </div>
                          <h4 className="font-bold text-xs text-[#0d2f43]">{mod.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{mod.description}</p>
                        </div>
                        <div className="mt-3 text-[10px] text-slate-400 font-medium">
                          Área: {mod.lawArea}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT VARIANT */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-600 font-bold">
                    Selecione a versão / variação adequada para este documento:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'Pessoa Física', title: 'Pessoa Física (PF)', desc: 'Outorgante ou Contratante Pessoa Física (RG, CPF, Estado Civil, Profissão).' },
                      { id: 'Pessoa Jurídica', title: 'Pessoa Jurídica (PJ)', desc: 'Outorgante ou Contratante Pessoa Jurídica (CNPJ, Razão Social, Representante Legal).' },
                      { id: 'Uma Pessoa', title: 'Outorgante / Contratante Único', desc: 'Apenas uma pessoa no polo da contratação ou outorga.' },
                      { id: 'Múltiplos Outorgantes', title: 'Múltiplos Outorgantes / Partes', desc: 'Duas ou mais pessoas outorgantes ou contratantes simultâneos.' }
                    ].map(v => (
                      <div
                        key={v.id}
                        onClick={() => setWizardVariant(v.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          wizardVariant === v.id
                            ? 'border-[#0d2f43] bg-blue-50/50 ring-2 ring-[#0d2f43]/10'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <h4 className="font-bold text-xs text-[#0d2f43]">{v.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: CRM INTEGRATION */}
              {wizardStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#0d2f43]">Integrar Dados do Cliente (CRM)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Selecione um cliente já cadastrado no CRM. Os dados de qualificação serão preenchidos automaticamente.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={wizardClientSearch}
                      onChange={e => setWizardClientSearch(e.target.value)}
                      placeholder="Buscar por Nome, CPF, CNPJ, Telefone ou E-mail..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium"
                    />
                  </div>

                  {/* CRM Leads List */}
                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {crmLeads
                      .filter(c => {
                        const q = wizardClientSearch.toLowerCase();
                        return !q || c.name?.toLowerCase().includes(q) || c.cpfCnpj?.includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q);
                      })
                      .map(c => (
                        <div
                          key={c.id}
                          onClick={() => setWizardSelectedClientId(c.id)}
                          className={`p-3 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            wizardSelectedClientId === c.id ? 'bg-blue-50 font-bold text-[#0d2f43]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <span className="font-bold">{c.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {c.type} • CPF/CNPJ: {c.cpfCnpj} • {c.email || 'Sem email'}
                            </span>
                          </div>
                          {wizardSelectedClientId === c.id && <CheckCircle className="w-4 h-4 text-[#0d2f43]" />}
                        </div>
                      ))}
                  </div>

                  {/* Selected Client Preview Summary */}
                  {selectedCrmLead && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle className="w-4 h-4" />
                        <span>Dados Importados Automaticamente do CRM:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                        <div><strong>Nome/Razão:</strong> {selectedCrmLead.name}</div>
                        <div><strong>Doc:</strong> {selectedCrmLead.cpfCnpj}</div>
                        <div><strong>E-mail:</strong> {selectedCrmLead.email || 'N/I'}</div>
                        <div><strong>Tel:</strong> {selectedCrmLead.phone || 'N/I'}</div>
                        {selectedCrmLead.type === 'PF' ? (
                          <>
                            <div><strong>Nacionalidade:</strong> {selectedCrmLead.nacionalidade || 'brasileiro(a)'}</div>
                            <div><strong>Estado Civil:</strong> {selectedCrmLead.estadoCivil || 'solteiro(a)'}</div>
                            <div><strong>Profissão:</strong> {selectedCrmLead.profissao || 'autônomo(a)'}</div>
                            <div><strong>RG:</strong> {selectedCrmLead.rg || 'SSP'}</div>
                          </>
                        ) : (
                          <>
                            <div><strong>Rep. Legal:</strong> {selectedCrmLead.repName || 'Não informado'}</div>
                            <div><strong>Qualificação Rep:</strong> {selectedCrmLead.repQualificacao || 'Sócio Administrador'}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: PROCESS INTEGRATION */}
              {wizardStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#0d2f43]">Vincular a um Processo / Caso (Opcional)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Selecione o processo judicial para preenchimento de CNJ, Vara, Comarca e registro no histórico.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={wizardProcessSearch}
                      onChange={e => setWizardProcessSearch(e.target.value)}
                      placeholder="Buscar por CNJ, Parte Contrária, Cliente ou Assunto..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    <div
                      onClick={() => setWizardSelectedProcessId('')}
                      className={`p-3 cursor-pointer text-xs font-bold ${
                        !wizardSelectedProcessId ? 'bg-[#0d2f43] text-white' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Nenhum Processo (Documento Extrajudicial / Avulso)
                    </div>

                    {processes
                      .filter(p => {
                        const q = wizardProcessSearch.toLowerCase();
                        return !q || p.cnj?.includes(q) || p.client?.toLowerCase().includes(q) || p.opposingParty?.toLowerCase().includes(q) || p.subject?.toLowerCase().includes(q);
                      })
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => setWizardSelectedProcessId(p.id)}
                          className={`p-3 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            wizardSelectedProcessId === p.id ? 'bg-blue-50 font-bold text-[#0d2f43]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <span className="font-bold">CNJ: {p.cnj}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Cliente: {p.client} vs. {p.opposingParty} • {p.vara} - {p.comarca}
                            </span>
                          </div>
                          {wizardSelectedProcessId === p.id && <CheckCircle className="w-4 h-4 text-[#0d2f43]" />}
                        </div>
                      ))}
                  </div>

                  {selectedProcess && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
                      <div className="font-bold flex items-center gap-1.5 text-blue-800">
                        <Scale className="w-4 h-4" />
                        <span>Dados Processuais Vinculados:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                        <div><strong>CNJ:</strong> {selectedProcess.cnj}</div>
                        <div><strong>Vara/Comarca:</strong> {selectedProcess.vara} - {selectedProcess.comarca}</div>
                        <div><strong>Tribunal:</strong> {selectedProcess.court}</div>
                        <div><strong>Parte Contrária:</strong> {selectedProcess.opposingParty}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: VARIABLE FIELDS */}
              {wizardStep === 5 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#0d2f43]">Preenchimento de Dados Variáveis Específicos</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Informe apenas as variáveis operacionais que não constam no CRM ou no processo:
                    </p>
                  </div>

                  {wizardSelectedModel?.variableFields && wizardSelectedModel.variableFields.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {wizardSelectedModel.variableFields.map(vf => (
                        <div key={vf.key}>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {vf.label}
                          </label>
                          {vf.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={wizardVariableValues[vf.key] || ''}
                              onChange={e => setWizardVariableValues({ ...wizardVariableValues, [vf.key]: e.target.value })}
                              placeholder={vf.placeholder}
                              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                            />
                          ) : vf.type === 'select' ? (
                            <select
                              value={wizardVariableValues[vf.key] || ''}
                              onChange={e => setWizardVariableValues({ ...wizardVariableValues, [vf.key]: e.target.value })}
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white font-semibold outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                            >
                              <option value="">Selecione uma opção...</option>
                              {vf.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input
                              type={vf.type || 'text'}
                              value={wizardVariableValues[vf.key] || ''}
                              onChange={e => setWizardVariableValues({ ...wizardVariableValues, [vf.key]: e.target.value })}
                              placeholder={vf.placeholder}
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Este modelo não possui variáveis adicionais obrigatórias.</p>
                  )}
                </div>
              )}

              {/* STEP 6: PREVIEW & REVIEW */}
              {wizardStep === 6 && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-[#0d2f43]">Visualização Prévia no Timbre Institucional</h4>
                      <p className="text-[11px] text-slate-500">
                        Revise a peça gerada antes da confirmação e arquivamento definitivo.
                      </p>
                    </div>
                  </div>

                  {/* Official Timbre Letterhead Display */}
                  <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-md font-serif text-slate-800 text-xs leading-relaxed max-h-96 overflow-y-auto">
                    
                    {/* Header Timbre */}
                    <div className="border-b-2 border-[#0d2f43] pb-3 mb-6 text-center font-sans">
                      <h2 className="font-extrabold text-sm text-[#0d2f43] uppercase tracking-wider">
                        Paiva Camargo & Godoy Advogados
                      </h2>
                    </div>

                    {/* Content */}
                    <div className="whitespace-pre-wrap font-mono text-[11px] text-slate-700">
                      {wizardGeneratedPreviewText}
                    </div>

                    {/* Footer Timbre */}
                    <div className="border-t border-slate-200 mt-8 pt-4 text-center font-sans text-[9px] text-slate-400">
                      Rua Euclides da Cunha, 1584, Campo Grande, MS
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Wizard Footer Controls */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {wizardStep < 5 ? (
                <button
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-5 py-2 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Próximo Passo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : wizardStep === 5 ? (
                <button
                  onClick={handleProceedToPreview}
                  className="px-6 py-2 bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Gerar Prévia do Documento</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmDocumentGeneration}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Geração e Arquivar</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT MODEL MODAL */}
      {isCreateModelModalOpen && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-300" />
                <span>{editingModel ? 'Editar Modelo Institucional' : 'Cadastrar Novo Modelo Jurídico'}</span>
              </h3>
              <button onClick={() => setIsCreateModelModalOpen(false)} className="hover:bg-white/10 p-1 rounded text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome do Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={modelFormName}
                  onChange={e => setModelFormName(e.target.value)}
                  placeholder="Ex: Procuração Ad Judicia - Pessoa Jurídica"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={modelFormCategory}
                    onChange={e => setModelFormCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                  >
                    {MAIN_CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Área do Direito
                  </label>
                  <select
                    value={modelFormLawArea}
                    onChange={e => setModelFormLawArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                  >
                    <option value="Cível">Cível</option>
                    <option value="Trabalhista">Trabalhista</option>
                    <option value="Família">Família</option>
                    <option value="Consumidor">Consumidor</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Imobiliário">Imobiliário</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={modelFormDescription}
                  onChange={e => setModelFormDescription(e.target.value)}
                  placeholder="Resumo sobre a finalidade e utilização deste modelo..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Texto-Base do Modelo (com Tags de Interpolação) *
                </label>
                <p className="text-[10px] text-slate-400 mb-1">
                  Tags disponíveis: &#123;&#123;CLIENTE_NOME&#125;&#125;, &#123;&#123;CLIENTE_CPF_CNPJ&#125;&#125;, &#123;&#123;PROCESSO_NUMERO&#125;&#125;, &#123;&#123;PROCESSO_VARA&#125;&#125;, &#123;&#123;DATA_ATUAL&#125;&#125;
                </p>
                <textarea
                  rows={8}
                  required
                  value={modelFormText}
                  onChange={e => setModelFormText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModelModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold bg-[#0d2f43] hover:bg-[#0b2839] text-white rounded-xl shadow-xs"
                >
                  Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODEL MODAL */}
      {viewingModel && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase bg-[#123e59] px-2 py-0.5 rounded text-blue-200">
                  {viewingModel.category} • {viewingModel.version}
                </span>
                <h3 className="font-display font-bold text-sm text-white mt-1">{viewingModel.name}</h3>
              </div>
              <button onClick={() => setViewingModel(null)} className="hover:bg-white/10 p-1.5 rounded text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-700 bg-slate-50 whitespace-pre-wrap">
              {viewingModel.templateText}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold">Versão: {viewingModel.version}</span>
              <button
                onClick={() => {
                  setViewingModel(null);
                  startGenerationWizard(viewingModel.id);
                }}
                className="px-5 py-2 bg-[#0d2f43] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Usar Este Modelo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW GENERATED DOC MODAL */}
      {viewingGeneratedDoc && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase bg-emerald-700 px-2 py-0.5 rounded text-white">
                  {viewingGeneratedDoc.category} • {viewingGeneratedDoc.status}
                </span>
                <h3 className="font-display font-bold text-sm text-white mt-1">{viewingGeneratedDoc.name}</h3>
              </div>
              <button onClick={() => setViewingGeneratedDoc(null)} className="hover:bg-white/10 p-1.5 rounded text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-800 bg-white whitespace-pre-wrap">
              {viewingGeneratedDoc.content}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">
                Cliente: {viewingGeneratedDoc.clientName || 'S/V'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewingGeneratedDoc(null);
                    setPrintableDoc({ title: viewingGeneratedDoc.name, content: viewingGeneratedDoc.content });
                  }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setViewingGeneratedDoc(null)}
                  className="px-4 py-1.5 bg-[#0d2f43] text-white rounded-xl text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GENERATED DOC CONTENT MODAL */}
      {editingDocContent && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#0d2f43] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm">Revisar Texto do Documento: {editingDocContent.name}</h3>
              <button onClick={() => setEditingDocContent(null)} className="hover:bg-white/10 p-1.5 rounded text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <textarea
                rows={14}
                value={editingDocContent.content}
                onChange={e => setEditingDocContent({ ...editingDocContent, content: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-4 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-[#0d2f43]/15"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingDocContent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDocContentEdit}
                className="px-5 py-2 bg-[#0d2f43] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Salvar Revisão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 20. PRINTABLE LAYOUT MODAL */}
      {printableDoc && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-8 font-serif text-slate-900 animate-fade-in">
          
          {/* Action Bar (Hidden during window.print()) */}
          <div className="max-w-4xl mx-auto flex justify-between items-center pb-6 mb-6 border-b border-slate-200 print:hidden">
            <h3 className="font-sans text-sm font-bold text-[#0d2f43]">Visualização para Impressão</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#0d2f43] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
              <button
                onClick={() => setPrintableDoc(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Printable Page Body */}
          <div className="max-w-3xl mx-auto bg-white p-10 border border-slate-200 shadow-lg print:shadow-none print:border-none">
            
            {/* Timbre Header */}
            <div className="border-b-2 border-[#0d2f43] pb-3 mb-8 text-center font-sans">
              <h1 className="font-extrabold text-base text-[#0d2f43] uppercase tracking-wider">
                Paiva Camargo & Godoy Advogados
              </h1>
            </div>

            {/* Document Text */}
            <div className="whitespace-pre-wrap text-xs leading-relaxed font-mono text-slate-800">
              {printableDoc.content}
            </div>

            {/* Timbre Footer */}
            <div className="border-t border-slate-200 mt-12 pt-4 text-center font-sans text-[10px] text-slate-400">
              Rua Euclides da Cunha, 1584, Campo Grande, MS
            </div>
          </div>

        </div>
      )}

      {/* 19. ARCHIVE MOTIVO MODAL */}
      {archiveTarget && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-200">
            <h3 className="font-display font-bold text-sm text-[#0d2f43] flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              <span>Arquivar Item: {archiveTarget.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Conforme as diretrizes institucionais do PCG.OS, os itens não são apagados definitivamente. Informe o motivo do arquivamento para registro histórico:
            </p>

            <textarea
              rows={3}
              required
              value={archiveReasonInput}
              onChange={e => setArchiveReasonInput(e.target.value)}
              placeholder="Ex: Substituído por nova versão aprovada pelo escritório..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 mt-3"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setArchiveTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteArchiving}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirmar Arquivamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 17. VERSIONS LOG MODAL */}
      {versionHistoryTarget && (
        <div className="fixed inset-0 bg-[#0d2f43]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-sm text-[#0d2f43] flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>Histórico de Versões: {versionHistoryTarget.name}</span>
              </h3>
              <button onClick={() => setVersionHistoryTarget(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {'versionHistory' in versionHistoryTarget && versionHistoryTarget.versionHistory?.map((ver, idx) => (
                <div key={idx} className="py-2.5 text-xs">
                  <div className="flex justify-between font-bold text-[#0d2f43]">
                    <span>Versão {ver.version}</span>
                    <span className="text-[10px] text-slate-400">{ver.updatedAt}</span>
                  </div>
                  <p className="text-slate-500 mt-1 text-[11px]">{ver.description}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Por: {ver.updatedBy}</span>
                </div>
              ))}

              {'versions' in versionHistoryTarget && versionHistoryTarget.versions?.map((ver, idx) => (
                <div key={idx} className="py-2.5 text-xs">
                  <div className="flex justify-between font-bold text-[#0d2f43]">
                    <span>Revisão</span>
                    <span className="text-[10px] text-slate-400">{ver.updatedAt}</span>
                  </div>
                  <p className="text-slate-500 mt-1 text-[11px]">{ver.changesDescription}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Por: {ver.updatedBy}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setVersionHistoryTarget(null)}
                className="px-4 py-1.5 bg-[#0d2f43] text-white text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
