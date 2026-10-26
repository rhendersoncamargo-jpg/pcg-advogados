'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Briefcase, Clock, Calendar, DollarSign, Filter,
  Printer, ArrowLeft, Search, Eye, ChevronRight, CheckCircle2,
  AlertCircle, Building2, UserCheck, FileText, Sparkles, RefreshCw,
  FolderOpen, Layers, BarChart2, ShieldAlert, ArrowUpDown, ChevronDown,
  ExternalLink, X
} from 'lucide-react';

interface RelatoriosViewProps {
  processes?: any[];
  crmLeads?: any[];
  deadlines?: any[];
  transactions?: any[];
  events?: any[];
  users?: any[];
  currentUser?: any;
  onNavigateTab?: (tab: string) => void;
}

type ModuleKey = 'crm' | 'processos' | 'prazos' | 'agenda' | 'financeiro';

interface ModuleConfig {
  key: ModuleKey;
  name: string;
  subtitle: string;
  icon: any;
  navTab: string;
  reportTypes: string[];
  filterOptions: string[];
}

const MODULE_CONFIGS: Record<ModuleKey, ModuleConfig> = {
  crm: {
    key: 'crm',
    name: 'CRM e Captação',
    subtitle: 'Relatórios de atendimento, prospecção e conversão de clientes',
    icon: Users,
    navTab: 'crm',
    reportTypes: [
      'Novos clientes',
      'Clientes cadastrados por período',
      'Clientes por origem',
      'Clientes por profissional responsável',
      'Clientes por responsável pela captação',
      'Clientes ativos',
      'Clientes inativos',
      'Clientes aguardando documentação',
      'Clientes pendentes de contratação',
      'Clientes encerrados',
      'Clientes arquivados',
      'Atendimentos realizados',
      'Atendimentos telefônicos',
      'Atendimentos por WhatsApp',
      'Atendimentos presenciais',
      'Visitas ao escritório',
      'Devolutivas pendentes',
      'Retornos realizados',
      'Atendimentos por usuário',
      'Clientes convertidos',
      'Clientes não contratados'
    ],
    filterOptions: [
      'Situação do relacionamento',
      'Origem do cliente',
      'Responsável',
      'Profissional que captou',
      'Tipo de atendimento',
      'Usuário que registrou',
      'Cliente',
      'Área de interesse',
      'Retorno pendente',
      'Atendimento concluído'
    ]
  },
  processos: {
    key: 'processos',
    name: 'Casos e Processos',
    subtitle: 'Relatórios de distribuição, fases, movimentações e prazos processuais',
    icon: Briefcase,
    navTab: 'processos',
    reportTypes: [
      'Processos ativos',
      'Processos suspensos',
      'Processos encerrados',
      'Processos arquivados',
      'Processos criados no período',
      'Processos encerrados no período',
      'Processos por área do Direito',
      'Processos por classe',
      'Processos por fase',
      'Processos por situação',
      'Processos por cliente',
      'Processos por responsável',
      'Processos por equipe',
      'Processos por tribunal',
      'Processos por comarca',
      'Processos sem responsável',
      'Processos sem movimentação',
      'Processos aguardando manifestação',
      'Processos com prazo aberto',
      'Processos com prazo vencido',
      'Processos com audiência'
    ],
    filterOptions: [
      'Cliente',
      'Número do processo',
      'Parte contrária',
      'Responsável',
      'Equipe',
      'Área do Direito',
      'Classe processual',
      'Fase',
      'Situação',
      'Tribunal',
      'Comarca',
      'Vara ou unidade',
      'Com ou sem movimentação',
      'Com ou sem prazo',
      'Com ou sem audiência'
    ]
  },
  prazos: {
    key: 'prazos',
    name: 'Prazos e Tarefas',
    subtitle: 'Relatórios de eficiência operacional, cumprimento de prazos e produtividade',
    icon: Clock,
    navTab: 'prazos',
    reportTypes: [
      'Prazos do dia',
      'Prazos da semana',
      'Prazos por período',
      'Prazos críticos',
      'Prazos vencidos',
      'Prazos em aberto',
      'Prazos em andamento',
      'Prazos em revisão',
      'Prazos cumpridos',
      'Prazos cancelados',
      'Tarefas pendentes',
      'Tarefas atrasadas',
      'Tarefas em andamento',
      'Tarefas aguardando',
      'Tarefas em revisão',
      'Tarefas concluídas',
      'Atividades por responsável',
      'Atividades por processo',
      'Atividades por cliente',
      'Atividades por área do Direito',
      'Atividades por prioridade',
      'Atividades por tipo',
      'Contestações',
      'Recursos',
      'Manifestações',
      'Protocolos',
      'Produtividade operacional por colaborador',
      'Tempo médio de conclusão'
    ],
    filterOptions: [
      'Prazo ou tarefa',
      'Responsável',
      'Criador',
      'Participante',
      'Cliente',
      'Processo',
      'Área do Direito',
      'Status',
      'Prioridade',
      'Origem',
      'Tipo de prazo',
      'Vencidos',
      'Cumpridos',
      'Pendentes',
      'Atrasados'
    ]
  },
  agenda: {
    key: 'agenda',
    name: 'Agenda',
    subtitle: 'Relatórios de audiências, compromissos, reuniões e diligências',
    icon: Calendar,
    navTab: 'agenda',
    reportTypes: [
      'Agenda diária',
      'Agenda semanal',
      'Agenda mensal',
      'Audiências',
      'Reuniões',
      'Atendimentos',
      'Perícias',
      'Diligências',
      'Conciliações',
      'Mediações',
      'Sustentações orais',
      'Sessões de julgamento',
      'Videoconferências',
      'Visitas ao escritório',
      'Visitas técnicas',
      'Eventos realizados',
      'Eventos cancelados',
      'Eventos remarcados',
      'Não comparecimentos',
      'Compromissos por responsável',
      'Compromissos por equipe',
      'Compromissos por cliente',
      'Compromissos por processo',
      'Compromissos presenciais',
      'Compromissos virtuais',
      'Compromissos híbridos'
    ],
    filterOptions: [
      'Tipo de evento',
      'Responsável',
      'Participante',
      'Equipe',
      'Cliente',
      'Processo',
      'Área do Direito',
      'Modalidade',
      'Status',
      'Prioridade',
      'Realizado',
      'Remarcado',
      'Cancelado'
    ]
  },
  financeiro: {
    key: 'financeiro',
    name: 'Financeiro',
    subtitle: 'Relatórios de receitas, despesas, fluxo de caixa, honorários e repasses',
    icon: DollarSign,
    navTab: 'financeiro',
    reportTypes: [
      'Receitas do período',
      'Despesas do período',
      'Fluxo de caixa',
      'Contas a receber',
      'Contas a pagar',
      'Receitas vencidas',
      'Despesas vencidas',
      'Valores recebidos',
      'Valores pendentes de recebimento',
      'Valores pagos',
      'Valores pendentes de pagamento',
      'Honorários contratuais',
      'Honorários de êxito',
      'Honorários sucumbenciais',
      'Receitas por cliente',
      'Receitas por processo',
      'Despesas por categoria',
      'Repasses realizados',
      'Repasses pendentes',
      'Repasses por profissional',
      'Valores distribuídos por profissional',
      'Saldo em caixa',
      'Resultado líquido',
      'Fechamento mensal',
      'Fechamento trimestral',
      'Fechamento semestral',
      'Fechamento anual'
    ],
    filterOptions: [
      'Entrada ou saída',
      'Categoria',
      'Status',
      'Cliente',
      'Processo',
      'Profissional beneficiário',
      'Responsável pelo lançamento',
      'Forma de pagamento',
      'Contas vencidas',
      'Contas futuras',
      'Recebido ou pendente',
      'Pago ou pendente',
      'Repasse realizado ou pendente'
    ]
  }
};

// General Period Options
const PERIOD_OPTIONS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'semestre', label: 'Semestre' },
  { id: 'ano', label: 'Ano' },
  { id: 'personalizado', label: 'Personalizado' }
];

export default function RelatoriosView({
  processes = [],
  crmLeads = [],
  deadlines = [],
  transactions = [],
  events = [],
  users,
  currentUser,
  onNavigateTab
}: RelatoriosViewProps) {

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

  // Permissions check for financial report category
  const canAccessFinanceiro = useMemo(() => {
    if (!currentUser) return true;
    const role = (currentUser.role || '').toLowerCase();
    if (role === 'recepcao' || role === 'recepcionista' || role === 'estagiario') return false;
    if (currentUser.permissions && currentUser.permissions.financeiro === false) return false;
    return true;
  }, [currentUser]);

  // Step 1: Selected Module
  const [selectedModule, setSelectedModule] = useState<ModuleKey>('crm');

  // Step 2: Selected Report Type
  const [selectedReportType, setSelectedReportType] = useState<string>(
    MODULE_CONFIGS.crm.reportTypes[0]
  );

  // Step 3: Period Filter State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('mes');
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-07-31');

  // Specific Filters State
  const [filterResponsavel, setFilterResponsavel] = useState<string>('todos');
  const [filterCliente, setFilterCliente] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterArea, setFilterArea] = useState<string>('todos');

  // Grouping & Sorting
  const [groupBy, setGroupBy] = useState<string>('nenhum');
  const [sortBy, setSortBy] = useState<string>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // View Mode: 'resumido' | 'detalhado'
  const [viewMode, setViewMode] = useState<'resumido' | 'detalhado'>('detalhado');

  // Generated Report Result State
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchInResult, setSearchInResult] = useState<string>('');

  // Selected Record Detail Modal
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<any | null>(null);

  // Switch Module handler
  const handleSelectModule = (modKey: ModuleKey) => {
    if (modKey === 'financeiro' && !canAccessFinanceiro) {
      alert('Acesso Restrito: Seu perfil de usuário não possui permissão para visualizar relatórios financeiros.');
      return;
    }
    setSelectedModule(modKey);
    const firstType = MODULE_CONFIGS[modKey].reportTypes[0];
    setSelectedReportType(firstType);
    setGeneratedReport(null);
  };

  // Human-readable Period string
  const periodText = useMemo(() => {
    if (selectedPeriod === 'hoje') return 'Hoje (23/07/2026)';
    if (selectedPeriod === 'semana') return 'Esta Semana (20/07/2026 a 26/07/2026)';
    if (selectedPeriod === 'mes') return 'Mês Atual (Julho / 2026)';
    if (selectedPeriod === 'trimestre') return '3º Trimestre de 2026';
    if (selectedPeriod === 'semestre') return '2º Semestre de 2026';
    if (selectedPeriod === 'ano') return 'Ano de 2026';
    if (selectedPeriod === 'personalizado') {
      const formatDt = (dStr: string) => {
        if (!dStr) return '';
        const [y, m, d] = dStr.split('-');
        return `${d}/${m}/${y}`;
      };
      return `De ${formatDt(startDate)} até ${formatDt(endDate)}`;
    }
    return 'Julho / 2026';
  }, [selectedPeriod, startDate, endDate]);

  // Sample fallback data enriched if state arrays are empty
  const rawDataForModule = useMemo(() => {
    if (selectedModule === 'crm') {
      const base = crmLeads.length > 0 ? crmLeads : [
        { id: 'lead-1', name: 'Marta Ribeiro da Silva', email: 'marta@email.com', phone: '(11) 98823-1102', status: 'Ativo', source: 'Indicação', responsible: 'Dr. Roberto Alves', captador: 'Dra. Patricia Lima', attendanceType: 'Presencial', area: 'Direito de Família', createdAt: '2026-07-10', documentationPending: false, value: 12000 },
        { id: 'lead-2', name: 'Empresa Alfa Logística LTDA', email: 'contato@alfalog.com', phone: '(11) 3455-9000', status: 'Convertido', source: 'Google Ads', responsible: 'Dr. Roberto Alves', captador: 'Dr. Roberto Alves', attendanceType: 'WhatsApp', area: 'Empresarial / Trabalhista', createdAt: '2026-07-14', documentationPending: false, value: 45000 },
        { id: 'lead-3', name: 'Carlos Eduardo Mendes', email: 'carlos.mendes@email.com', phone: '(11) 97122-3344', status: 'Aguardando Documentação', source: 'Redes Sociais', responsible: 'Dra. Patricia Lima', captador: 'Recepção', attendanceType: 'Telefônico', area: 'Direito Previdenciário', createdAt: '2026-07-18', documentationPending: true, value: 8500 },
        { id: 'lead-4', name: 'Juliana Castro Veiga', email: 'juliana.veiga@email.com', phone: '(11) 99188-7711', status: 'Pendente Contratação', source: 'Indicação', responsible: 'Dr. Fernando Costa', captador: 'Dr. Fernando Costa', attendanceType: 'Visita ao Escritório', area: 'Direito Cível', createdAt: '2026-07-02', documentationPending: false, value: 18000 },
        { id: 'lead-5', name: 'Construtora Horizonte S/A', email: 'juridico@horizonte.com.br', phone: '(11) 3211-4455', status: 'Inativo', source: 'Site Institucional', responsible: 'Dr. Roberto Alves', captador: 'Dr. Roberto Alves', attendanceType: 'WhatsApp', area: 'Direito Tributário', createdAt: '2026-06-25', documentationPending: false, value: 95000 },
        { id: 'lead-6', name: 'Beatriz Santoro Leite', email: 'beatriz.leite@email.com', phone: '(11) 98112-9988', status: 'Não Contratado', source: 'Google Ads', responsible: 'Dra. Patricia Lima', captador: 'Recepção', attendanceType: 'Telefônico', area: 'Direito do Consumidor', createdAt: '2026-07-05', documentationPending: false, value: 5000 }
      ];
      return base;
    }

    if (selectedModule === 'processos') {
      const base = processes.length > 0 ? processes : [
        { id: 'proc-101', cnj: '1004523-88.2026.8.26.0100', client: 'Empresa Alfa Logística LTDA', type: 'Ação Trabalhista', court: 'TRT-2 / SP', status: 'Ativo', fase: 'Instrutória', area: 'Trabalhista', responsible: 'Dr. Roberto Alves', team: 'Equipe Trabalhista', comarca: 'São Paulo - Capital', vara: '14ª Vara do Trabalho', opposingParty: 'João Pedro da Silva', createdAt: '2026-01-15', updatedAt: '2026-07-20', movingStatus: 'Movimentação Recente', value: 185000 },
        { id: 'proc-102', cnj: '5001290-11.2025.4.03.6100', client: 'Marta Ribeiro da Silva', type: 'Divórcio Litigioso c/c Partilha', court: 'TJSP', status: 'Ativo', fase: 'Recurso', area: 'Família', responsible: 'Dra. Patricia Lima', team: 'Equipe Cível', comarca: 'São Paulo - Central', vara: '3ª Vara de Família', opposingParty: 'Marcos Vinicius da Silva', createdAt: '2025-11-10', updatedAt: '2026-07-19', movingStatus: 'Aguardando Acórdão', value: 450000 },
        { id: 'proc-103', cnj: '1012988-44.2026.8.26.0001', client: 'Construtora Horizonte S/A', type: 'Execução de Título Extrajudicial', court: 'TJSP', status: 'Suspenso', fase: 'Execução', area: 'Cível', responsible: 'Dr. Fernando Costa', team: 'Equipe Cível', comarca: 'Santana - SP', vara: '2ª Vara Cível', opposingParty: 'Empreendimentos Beta LTDA', createdAt: '2026-03-01', updatedAt: '2026-07-05', movingStatus: 'Suspenso por Acordo', value: 1250000 },
        { id: 'proc-104', cnj: '0003412-90.2024.8.26.0224', client: 'Carlos Eduardo Mendes', type: 'Ação Concessória de Aposentadoria', court: 'TRF-3', status: 'Encerrado', fase: 'Trânsito em Julgado', area: 'Previdenciário', responsible: 'Dra. Patricia Lima', team: 'Equipe Previdenciária', comarca: 'Guarulhos - SP', vara: '1ª Vara Federal', opposingParty: 'INSS - Instituto Nacional do Seguro Social', createdAt: '2024-05-12', updatedAt: '2026-06-30', movingStatus: 'Alvará Expedido', value: 68000 }
      ];
      return base;
    }

    if (selectedModule === 'prazos') {
      const base = deadlines.length > 0 ? deadlines : [
        { id: 'prz-1', title: 'Apresentar Contestação Trabalhista', dueDate: '2026-07-24', status: 'Em Aberto', itemType: 'Prazo', process: '1004523-88.2026.8.26.0100', client: 'Empresa Alfa Logística LTDA', responsible: 'Dr. Roberto Alves', creator: 'Dra. Patricia Lima', priority: 'Crítica', type: 'Contestação', area: 'Trabalhista' },
        { id: 'prz-2', title: 'Protocolar Recurso Apelação Cível', dueDate: '2026-07-28', status: 'Em Andamento', itemType: 'Prazo', process: '5001290-11.2025.4.03.6100', client: 'Marta Ribeiro da Silva', responsible: 'Dra. Patricia Lima', creator: 'Dr. Roberto Alves', priority: 'Alta', type: 'Recurso', area: 'Família' },
        { id: 'prz-3', title: 'Elaborar Minuta de Contrarrazões', dueDate: '2026-07-21', status: 'Cumprido', itemType: 'Tarefa', process: '1012988-44.2026.8.26.0001', client: 'Construtora Horizonte S/A', responsible: 'Dr. Fernando Costa', creator: 'Dr. Fernando Costa', priority: 'Média', type: 'Manifestação', area: 'Cível', completedDate: '2026-07-20' },
        { id: 'prz-4', title: 'Enviar Guia de Custas Iniciais', dueDate: '2026-07-15', status: 'Vencido', itemType: 'Prazo', process: '0003412-90.2024.8.26.0224', client: 'Carlos Eduardo Mendes', responsible: 'Dra. Patricia Lima', creator: 'Recepção', priority: 'Alta', type: 'Protocolo', area: 'Previdenciário' }
      ];
      return base;
    }

    if (selectedModule === 'agenda') {
      const base = events.length > 0 ? events : [
        { id: 'evt-1', title: 'Audiência de Conciliação Virtual', date: '2026-07-24', time: '14:30', type: 'Audiência', status: 'Agendado', modality: 'Virtual', responsible: 'Dr. Roberto Alves', participant: 'João Pedro da Silva', team: 'Equipe Trabalhista', client: 'Empresa Alfa Logística LTDA', process: '1004523-88.2026.8.26.0100', area: 'Trabalhista', priority: 'Alta' },
        { id: 'evt-2', title: 'Reunião Presencial para Assinatura de Procuração', date: '2026-07-25', time: '10:00', type: 'Reunião', status: 'Agendado', modality: 'Presencial', responsible: 'Dra. Patricia Lima', participant: 'Marta Ribeiro da Silva', team: 'Equipe Cível', client: 'Marta Ribeiro da Silva', process: '5001290-11.2025.4.03.6100', area: 'Família', priority: 'Média' },
        { id: 'evt-3', title: 'Atendimento de Novo Cliente - Alinhamento Estratégico', date: '2026-07-22', time: '16:00', type: 'Atendimento', status: 'Realizado', modality: 'Presencial', responsible: 'Dr. Fernando Costa', participant: 'Juliana Castro Veiga', team: 'Equipe Cível', client: 'Juliana Castro Veiga', process: '-', area: 'Cível', priority: 'Média' },
        { id: 'evt-4', title: 'Perícia Técnica no Imóvel Comercial', date: '2026-07-20', time: '09:00', type: 'Perícia', status: 'Realizado', modality: 'Presencial', responsible: 'Dr. Roberto Alves', participant: 'Eng. Perito Judicial', team: 'Equipe Imobiliária', client: 'Construtora Horizonte S/A', process: '1012988-44.2026.8.26.0001', area: 'Cível', priority: 'Alta' }
      ];
      return base;
    }

    if (selectedModule === 'financeiro') {
      return transactions || [];
    }

    return [];
  }, [selectedModule, processes, crmLeads, deadlines, transactions, events]);

  // Unique options for dynamic filter dropdowns
  const availableResponsables = useMemo(() => {
    const set = new Set<string>();
    activeUsersList.forEach(u => set.add(u.name));
    rawDataForModule.forEach((item: any) => {
      if (item.responsible) set.add(item.responsible);
      if (item.responsibleUser) set.add(item.responsibleUser);
    });
    return Array.from(set);
  }, [activeUsersList, rawDataForModule]);

  const availableClients = useMemo(() => {
    const set = new Set<string>();
    rawDataForModule.forEach((item: any) => {
      if (item.client) set.add(item.client);
      if (item.name) set.add(item.name);
    });
    return Array.from(set);
  }, [rawDataForModule]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    rawDataForModule.forEach((item: any) => {
      if (item.status) set.add(item.status);
    });
    return Array.from(set);
  }, [rawDataForModule]);

  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    rawDataForModule.forEach((item: any) => {
      if (item.area) set.add(item.area);
    });
    return Array.from(set);
  }, [rawDataForModule]);

  // Execute Generate Report Logic
  const handleGenerateReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Filter dataset based on selected filters
      let filtered = [...rawDataForModule];

      if (filterResponsavel !== 'todos') {
        filtered = filtered.filter(item => 
          item.responsible === filterResponsavel || item.responsibleUser === filterResponsavel
        );
      }

      if (filterCliente !== 'todos') {
        filtered = filtered.filter(item => 
          item.client === filterCliente || item.name === filterCliente
        );
      }

      if (filterStatus !== 'todos') {
        filtered = filtered.filter(item => item.status === filterStatus);
      }

      if (filterArea !== 'todos') {
        filtered = filtered.filter(item => item.area === filterArea);
      }

      // Sorting
      filtered.sort((a: any, b: any) => {
        let valA = a.createdAt || a.dueDate || a.date || a.name || a.title || a.description || '';
        let valB = b.createdAt || b.dueDate || b.date || b.name || b.title || b.description || '';

        if (sortBy === 'nome') {
          valA = a.name || a.client || a.title || a.description || '';
          valB = b.name || b.client || b.title || b.description || '';
        } else if (sortBy === 'valor') {
          valA = Number(a.value || 0);
          valB = Number(b.value || 0);
        } else if (sortBy === 'status') {
          valA = a.status || '';
          valB = b.status || '';
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      // Calculate Metrics & Subtotals
      const totalCount = filtered.length;
      let totalValue = 0;
      let countSuccess = 0;
      let countPending = 0;

      filtered.forEach((item: any) => {
        if (item.value) totalValue += Number(item.value);
        if (['Ativo', 'Convertido', 'Cumprido', 'Realizado', 'Recebido'].includes(item.status)) {
          countSuccess++;
        }
        if (['Pendente', 'Em Aberto', 'Aguardando', 'Aguardando Documentação'].includes(item.status)) {
          countPending++;
        }
      });

      // Grouping dictionary
      const groupedData: Record<string, any[]> = {};
      if (groupBy !== 'nenhum') {
        filtered.forEach((item: any) => {
          let keyVal = 'Outros';
          if (groupBy === 'responsavel') keyVal = item.responsible || item.responsibleUser || 'Sem Responsável';
          else if (groupBy === 'cliente') keyVal = item.client || item.name || 'Geral';
          else if (groupBy === 'status') keyVal = item.status || 'Sem Status';
          else if (groupBy === 'area') keyVal = item.area || 'Geral';
          
          if (!groupedData[keyVal]) groupedData[keyVal] = [];
          groupedData[keyVal].push(item);
        });
      }

      const reportPayload = {
        title: selectedReportType,
        moduleKey: selectedModule,
        moduleName: MODULE_CONFIGS[selectedModule].name,
        periodString: periodText,
        appliedFilters: [
          filterResponsavel !== 'todos' ? `Responsável: ${filterResponsavel}` : null,
          filterCliente !== 'todos' ? `Cliente: ${filterCliente}` : null,
          filterStatus !== 'todos' ? `Status: ${filterStatus}` : null,
          filterArea !== 'todos' ? `Área: ${filterArea}` : null,
          groupBy !== 'nenhum' ? `Agrupado por: ${groupBy}` : null,
        ].filter(Boolean),
        generatedAt: new Date().toLocaleString('pt-BR', { timeZone: 'America/Campo_Grande', dateStyle: 'short', timeStyle: 'short' }),
        generatedBy: currentUser?.name || 'Administrador do Sistema',
        totalCount,
        totalValue,
        countSuccess,
        countPending,
        items: filtered,
        groupedData
      };

      setGeneratedReport(reportPayload);
      setIsGenerating(false);
    }, 600);
  };

  // Filtered rows in result search bar
  const displayedItems = useMemo(() => {
    if (!generatedReport) return [];
    if (!searchInResult.trim()) return generatedReport.items;
    const q = searchInResult.toLowerCase();
    return generatedReport.items.filter((item: any) => {
      const matchName = (item.name || item.client || item.title || item.description || item.cnj || '').toLowerCase();
      const matchResp = (item.responsible || item.responsibleUser || '').toLowerCase();
      const matchStatus = (item.status || '').toLowerCase();
      return matchName.includes(q) || matchResp.includes(q) || matchStatus.includes(q);
    });
  }, [generatedReport, searchInResult]);

  // Window Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Open Original Record Handler
  const handleOpenOriginalRecord = (item: any) => {
    setSelectedRecordDetail(item);
  };

  // Navigate to Target Module Tab
  const handleJumpToModule = (navTab: string) => {
    setSelectedRecordDetail(null);
    if (onNavigateTab) {
      onNavigateTab(navTab);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      
      {/* PRINT-ONLY OFFICIAL REPORT HEADER */}
      <div className="hidden print:block p-6 mb-4 border-b-2 border-[#0d2f43] bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-extrabold text-[#0d2f43] uppercase tracking-wider">Paiva Camargo & Godoy Advogados</h1>
            <p className="text-xs text-slate-500 mt-0.5">CNPJ 32.478.848/0001-90</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p><strong className="text-slate-800">Emissão:</strong> {generatedReport?.generatedAt || new Date().toLocaleString('pt-BR')}</p>
            <p><strong className="text-slate-800">Usuário:</strong> {generatedReport?.generatedBy || currentUser?.name || 'Administrador'}</p>
          </div>
        </div>

        {generatedReport && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p><strong className="text-slate-800">Módulo:</strong> {generatedReport.moduleName}</p>
              <p><strong className="text-slate-800">Relatório:</strong> {generatedReport.title}</p>
              <p><strong className="text-slate-800">Período:</strong> {generatedReport.periodString}</p>
            </div>
            <div>
              <p><strong className="text-slate-800">Total de Registros:</strong> {generatedReport.totalCount}</p>
              {generatedReport.totalValue > 0 && (
                <p><strong className="text-slate-800">Valor Acumulado:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(generatedReport.totalValue)}</p>
              )}
              {generatedReport.appliedFilters.length > 0 && (
                <p><strong className="text-slate-800">Filtros:</strong> {generatedReport.appliedFilters.join(' | ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WEB HEADER (Hidden on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-black text-[#0d2f43] tracking-tight">
              Relatórios e Consultas
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Central de Análise
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Consulta consolidada, filtros analíticos e emissão de dados dos módulos do PCG.OS.
          </p>
        </div>

        {generatedReport && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGeneratedReport(null)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Novo Relatório</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0d2f43] hover:bg-[#123e59] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        )}
      </div>

      {/* ETAPA 1: SELEÇÃO DE MÓDULO (MODULE CATEGORIES) (Hidden on print) */}
      {!generatedReport && (
        <div className="flex flex-col gap-6 print:hidden">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#0d2f43] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-display font-extrabold text-sm text-[#0d2f43] uppercase tracking-wide">
                Selecione o Módulo do Relatório
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(MODULE_CONFIGS) as ModuleKey[]).map(modKey => {
                const conf = MODULE_CONFIGS[modKey];
                const IconComponent = conf.icon;
                const isSelected = selectedModule === modKey;
                const isDisabled = modKey === 'financeiro' && !canAccessFinanceiro;

                return (
                  <button
                    key={modKey}
                    onClick={() => handleSelectModule(modKey)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 relative ${
                      isDisabled
                        ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#0d2f43] border-[#0d2f43] text-white shadow-md ring-2 ring-[#0d2f43]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-[#0d2f43]'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {isDisabled && (
                        <ShieldAlert className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <h3 className={`font-bold text-sm leading-snug ${isSelected ? 'text-white' : 'text-[#0d2f43]'}`}>
                        {conf.name}
                      </h3>
                      <p className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {conf.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ETAPA 2 & 3: TIPO DE RELATÓRIO E FILTROS COMPATÍVEIS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
            
            {/* ETAPA 2: Escolher o Tipo de Relatório */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0d2f43] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-display font-extrabold text-sm text-[#0d2f43] uppercase tracking-wide">
                    Escolha o Tipo de Relatório ({MODULE_CONFIGS[selectedModule].name})
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {MODULE_CONFIGS[selectedModule].reportTypes.length} relatórios disponíveis
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-[#0d2f43] font-bold text-sm rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0d2f43] transition-all cursor-pointer appearance-none pr-10"
                >
                  {MODULE_CONFIGS[selectedModule].reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* ETAPA 3: Filtros Compatíveis com o Relatório */}
            <div className="pt-4 border-t border-slate-150">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#0d2f43] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-display font-extrabold text-sm text-[#0d2f43] uppercase tracking-wide flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-500" />
                  Filtros e Parâmetros
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                {/* FILTRO GERAL DE PERÍODO */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Período de Análise</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                  >
                    {PERIOD_OPTIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Dates if Personalizado */}
                {selectedPeriod === 'personalizado' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Data Inicial</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Data Final</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Filter Responsável */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Responsável</label>
                  <select
                    value={filterResponsavel}
                    onChange={(e) => setFilterResponsavel(e.target.value)}
                    className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                  >
                    <option value="todos">Todos os Responsáveis</option>
                    {availableResponsables.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Cliente */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Cliente</label>
                  <select
                    value={filterCliente}
                    onChange={(e) => setFilterCliente(e.target.value)}
                    className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                  >
                    <option value="todos">Todos os Clientes</option>
                    {availableClients.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Status / Situação</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                  >
                    <option value="todos">Todos os Status</option>
                    {availableStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Area */}
                {availableAreas.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Área do Direito</label>
                    <select
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                    >
                      <option value="todos">Todas as Áreas</option>
                      {availableAreas.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Group By */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Agrupar por</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none"
                  >
                    <option value="nenhum">Nenhum (Lista Contínua)</option>
                    <option value="responsavel">Responsável</option>
                    <option value="cliente">Cliente</option>
                    <option value="status">Status</option>
                    <option value="area">Área do Direito</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Ordenar por</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-[#0d2f43] outline-none flex-1"
                    >
                      <option value="data">Data de Cadastro / Vencimento</option>
                      <option value="nome">Nome / Título</option>
                      <option value="status">Status</option>
                      <option value="valor">Valor (R$)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold text-xs"
                      title={sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* View Mode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Modo de Exibição</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setViewMode('resumido')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        viewMode === 'resumido'
                          ? 'bg-white text-[#0d2f43] shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Resumido
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('detalhado')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        viewMode === 'detalhado'
                          ? 'bg-white text-[#0d2f43] shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Detalhado
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* ETAPA 4: Botão Gerar Relatório */}
            <div className="pt-4 border-t border-slate-150 flex justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-8 py-3.5 bg-[#0d2f43] hover:bg-[#123e59] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Processando e Gerando Relatório...</span>
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" />
                    <span>Gerar Relatório</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ETAPA 5: RESULTADO DO RELATÓRIO */}
      {generatedReport && (
        <div className="flex flex-col gap-6">

          {/* REPORT HEADER SUMMARY CARD */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded bg-slate-100 text-[#0d2f43] border border-slate-200">
                    Módulo {generatedReport.moduleName}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Gerado em {generatedReport.generatedAt}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-[#0d2f43] mt-1">
                  {generatedReport.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  <strong>Período analisado:</strong> {generatedReport.periodString}
                </p>
              </div>

              {/* View Mode Toggle inside Results (Web only) */}
              <div className="flex items-center gap-3 print:hidden">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode('resumido')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      viewMode === 'resumido'
                        ? 'bg-[#0d2f43] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Modo Resumido
                  </button>
                  <button
                    onClick={() => setViewMode('detalhado')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      viewMode === 'detalhado'
                        ? 'bg-[#0d2f43] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Modo Detalhado
                  </button>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Applied filters tags */}
            {generatedReport.appliedFilters.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Filtros Ativos:
                </span>
                {generatedReport.appliedFilters.map((f: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[11px] font-bold rounded border border-blue-150">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* INDICADORES RESUMIDOS (SUMMARY METRIC CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total de Registros
              </span>
              <p className="text-3xl font-black text-[#0d2f43] mt-1">
                {generatedReport.totalCount}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Registros localizados no período</p>
            </div>

            {generatedReport.totalValue > 0 && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Valor Consolidado (R$)
                </span>
                <p className="text-2xl font-black text-emerald-700 mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(generatedReport.totalValue)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Soma monetária vinculada</p>
              </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Finalizados / Ativos
              </span>
              <p className="text-3xl font-black text-blue-700 mt-1">
                {generatedReport.countSuccess}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Com status de resolutividade positivo</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pendentes / Em Andamento
              </span>
              <p className="text-3xl font-black text-amber-600 mt-1">
                {generatedReport.countPending}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Demandando ação ou acompanhamento</p>
            </div>

          </div>

          {/* MODO RESUMIDO vs DETALHADO VIEWS */}
          {viewMode === 'resumido' ? (
            /* RESUMIDO VIEW: Grouped summaries & aggregated numbers */
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
              <h3 className="font-display font-black text-base text-[#0d2f43] uppercase tracking-wide">
                Visão Resumida e Agrupamentos Principais
              </h3>

              {Object.keys(generatedReport.groupedData).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(generatedReport.groupedData).map(([groupName, groupItems]: [string, any]) => {
                    const groupVal = groupItems.reduce((acc: number, curr: any) => acc + Number(curr.value || 0), 0);
                    return (
                      <div key={groupName} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-[#0d2f43]">{groupName}</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-full">
                              {groupItems.length} registros
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Contempla os registros vinculados a esta categoria no módulo {generatedReport.moduleName}.
                          </p>
                        </div>
                        {groupVal > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600">Subtotal Monetário:</span>
                            <span className="text-emerald-700 font-mono">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(groupVal)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium">
                  Nenhum agrupamento secundário selecionado. Para visualizar a consolidação por categoria ou responsável, altere o campo &quot;Agrupar por&quot; nos filtros.
                </div>
              )}
            </div>
          ) : (
            /* DETALHADO VIEW: Full Data Table with Clickable Rows */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Web Filter Search inside results */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar na tabela gerada..."
                    value={searchInResult}
                    onChange={(e) => setSearchInResult(e.target.value)}
                    className="w-full bg-white text-xs text-slate-800 pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d2f43]"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Exibindo {displayedItems.length} de {generatedReport.totalCount} registros
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d2f43] text-white text-[11px] font-bold uppercase tracking-wider">
                      <th className="p-3.5 pl-5">Identificação / Título</th>
                      <th className="p-3.5">Cliente / Vínculo</th>
                      <th className="p-3.5">Responsável</th>
                      <th className="p-3.5">Data / Vencimento</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Valor (R$) / Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs font-medium text-slate-700">
                    {displayedItems.length > 0 ? (
                      displayedItems.map((item: any, index: number) => {
                        const titleStr = item.name || item.title || item.description || item.cnj || `Registro #${index + 1}`;
                        const clientStr = item.client || item.opposingParty || item.participant || 'Geral';
                        const respStr = item.responsible || item.responsibleUser || 'Não atribuído';
                        const dateStr = item.createdAt || item.dueDate || item.date || '-';
                        const statusStr = item.status || 'Ativo';
                        const valNum = Number(item.value || 0);

                        return (
                          <tr
                            key={item.id || index}
                            onClick={() => handleOpenOriginalRecord(item)}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            title="Clique para abrir detalhes do registro original"
                          >
                            <td className="p-3.5 pl-5 font-bold text-[#0d2f43] group-hover:text-blue-700 flex items-center gap-2">
                              <span>{titleStr}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                            </td>
                            <td className="p-3.5 text-slate-600">{clientStr}</td>
                            <td className="p-3.5 text-slate-600">{respStr}</td>
                            <td className="p-3.5 text-slate-600 font-mono text-[11px]">{dateStr}</td>
                            <td className="p-3.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                ['Ativo', 'Convertido', 'Cumprido', 'Realizado', 'Recebido'].includes(statusStr)
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ['Vencido', 'Não Contratado', 'Atrasado', 'Cancelado'].includes(statusStr)
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {statusStr}
                              </span>
                            </td>
                            <td className="p-3.5 text-right pr-5 font-mono font-bold text-slate-800">
                              {valNum > 0 ? (
                                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valNum)
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                          Nenhum registro encontrado para os filtros aplicados nesta consulta.
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {/* Table Footer Totals */}
                  {displayedItems.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-xs text-[#0d2f43] border-t-2 border-slate-300">
                        <td colSpan={4} className="p-3.5 pl-5 uppercase">
                          Totais do Relatório ({displayedItems.length} itens)
                        </td>
                        <td className="p-3.5 text-slate-600">
                          Resumo Consolidado
                        </td>
                        <td className="p-3.5 text-right pr-5 font-mono text-emerald-800 font-black">
                          {generatedReport.totalValue > 0 ? (
                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(generatedReport.totalValue)
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* RECORD DETAIL MODAL (Consulte os dados / Abrir o registro original) */}
      <AnimatePresence>
        {selectedRecordDetail && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden"
            >
              <div className="bg-[#0d2f43] text-white p-5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-200">
                    Registro Original do Sistema
                  </span>
                  <h3 className="font-display text-lg font-black leading-tight mt-0.5">
                    {selectedRecordDetail.name || selectedRecordDetail.title || selectedRecordDetail.description || selectedRecordDetail.cnj || 'Detalhes do Registro'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRecordDetail(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 text-xs">
                
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Cliente / Parte</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedRecordDetail.client || selectedRecordDetail.name || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Responsável</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedRecordDetail.responsible || selectedRecordDetail.responsibleUser || 'Não atribuído'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Status do Registro</span>
                    <p className="font-bold text-[#0d2f43] mt-0.5">
                      {selectedRecordDetail.status || 'Ativo'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Área / Tipo</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedRecordDetail.area || selectedRecordDetail.type || selectedRecordDetail.category || 'Geral'}
                    </p>
                  </div>
                </div>

                {selectedRecordDetail.value && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center">
                    <span className="font-bold text-emerald-900">Valor Vinculado:</span>
                    <span className="font-mono font-black text-emerald-800 text-base">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedRecordDetail.value)}
                    </span>
                  </div>
                )}

                <div className="text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                  <p className="font-bold text-slate-700 mb-1">Informações de Rastreabilidade:</p>
                  <p>Código ID: <span className="font-mono text-slate-800">{selectedRecordDetail.id}</span></p>
                  <p>Data do Cadastro / Ocorrência: <span className="font-mono text-slate-800">{selectedRecordDetail.createdAt || selectedRecordDetail.dueDate || selectedRecordDetail.date || 'Recente'}</span></p>
                  {selectedRecordDetail.cnj && <p>CNJ Processual: <span className="font-mono text-slate-800">{selectedRecordDetail.cnj}</span></p>}
                </div>

              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => setSelectedRecordDetail(null)}
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold text-xs"
                >
                  Fechar Visualização
                </button>
                <button
                  onClick={() => handleJumpToModule(MODULE_CONFIGS[selectedModule].navTab)}
                  className="px-5 py-2 bg-[#0d2f43] hover:bg-[#123e59] text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no Módulo {MODULE_CONFIGS[selectedModule].name}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
