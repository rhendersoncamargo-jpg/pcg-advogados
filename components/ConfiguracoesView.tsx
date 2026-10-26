/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Users, Key, Trash2, 
  CheckCircle, AlertTriangle, Mail,
  Lock, KeyRound, Building2, Calendar, Plug, Palette,
  Pencil, Plus, Search, ScrollText, Check, ShieldAlert,
  UserCheck, RefreshCw, Unlock
} from 'lucide-react';

interface DBUser {
  id: string;
  name: string;
  username: string;
  email: string;
  team: string;
  role: string;
  mfa: boolean; // representing status: true = Ativo, false = Inativo
  lastAccess: string;
  mustChangePassword: boolean;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  targetUserId: string;
  targetUserName: string;
  details: string;
}

interface ConfiguracoesViewProps {
  currentUser: any;
  systemUsers?: any[];
  initialFilters?: {
    activeTab?: string;
  };
  onUsersChange?: () => void;
}

// Custom Premium Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
        checked ? 'bg-[#0D3448]' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default function ConfiguracoesView({ currentUser, systemUsers, initialFilters, onUsersChange }: ConfiguracoesViewProps) {
  const isSuperadmin = currentUser.role === 'CEO/Proprietário';

  // Map active tabs strictly based on user role permission.
  // Superadmins can see "Usuários e Permissões" and "Histórico de Auditoria".
  // Non-superadmins see "Dados do Escritório" as their default and cannot see user management.
  const [activeTab, setActiveTab] = useState(initialFilters?.activeTab || (isSuperadmin ? 'Usuários e Permissões' : 'Dados do Escritório'));

  React.useEffect(() => {
    if (initialFilters?.activeTab) {
      setActiveTab(initialFilters.activeTab);
    }
  }, [initialFilters]);

  // Users & Logs State loaded from database API
  const [usersList, setUsersList] = useState<DBUser[]>(() => systemUsers && systemUsers.length > 0 ? systemUsers : []);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (systemUsers && systemUsers.length > 0) {
      setUsersList(systemUsers);
      setLoadingUsers(false);
    }
  }, [systemUsers]);
  
  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // Users & Logs State loaded from database API
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Teams State
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);

  // Team Form States
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamCoordinatorId, setTeamCoordinatorId] = useState('');
  const [teamSubstituteId, setTeamSubstituteId] = useState('');
  const [teamLegalArea, setTeamLegalArea] = useState('Geral');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [teamNotes, setTeamNotes] = useState('');
  const [teamAccessRules, setTeamAccessRules] = useState('Acesso padrão');
  const [teamStatus, setTeamStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // Permissions Matrix State
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, string[]>>({});
  const [loadingMatrix, setLoadingMatrix] = useState(true);
  const [savingMatrix, setSavingMatrix] = useState(false);

  // Deactivation Assistant State
  const [deactivateAssistant, setDeactivateAssistant] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    step: 1 | 2 | 3 | 4 | 5;
    loading: boolean;
    error: string;
    counts: { processes: number; deadlines: number; events: number; leads: number };
    responsibilities: {
      processes: any[];
      deadlines: any[];
      events: any[];
      leads: any[];
    };
    substituteId: string;
    justification: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    step: 1,
    loading: false,
    error: '',
    counts: { processes: 0, deadlines: 0, events: 0, leads: 0 },
    responsibilities: { processes: [], deadlines: [], events: [], leads: [] },
    substituteId: '',
    justification: ''
  });

  // Form states for creating a user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newTeam, setNewTeam] = useState('Contencioso Cível');
  const [newRole, setNewRole] = useState('Advogado Pleno');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Form states for editing a user
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Policies states
  const [globalMfa, setGlobalMfa] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('15');

  // Office data states
  const [officeName, setOfficeName] = useState('Paiva Camargo & Godoy Advogados Associados');
  const [officeCnpj, setOfficeCnpj] = useState('32.478.848/0001-90');
  const [officeAddress, setOfficeAddress] = useState('Rua Euclides da Cunha, 1584, Campo Grande, MS');

  // Gemini credentials simulator
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [auditQuery, setAuditQuery] = useState('');

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    type: 'info',
  });

  // Custom alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showCustomConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      type,
    });
  };

  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  // Fetch users from API on load
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      } else {
        setErrorMsg('Falha ao carregar a lista de usuários do banco de dados.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão ao buscar usuários.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch audit logs from API on load (CEO only)
  const loadAuditLogs = async () => {
    if (!isSuperadmin) return;
    try {
      setLoadingLogs(true);
      const response = await fetch(`/api/audit-logs?actorId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeamsList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadPermissionsMatrix = async () => {
    try {
      setLoadingMatrix(true);
      const response = await fetch('/api/permissions');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
          setPermissionsMatrix(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pcg_permissions_matrix', JSON.stringify(data));
          }
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching permissions matrix:', err);
    } finally {
      setLoadingMatrix(false);
    }

    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('pcg_permissions_matrix');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setPermissionsMatrix(parsed);
          }
        } catch (e) {
          console.error('Error parsing local permissions matrix:', e);
        }
      }
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.officeData) {
          if (data.officeData.officeName) setOfficeName(data.officeData.officeName);
          if (data.officeData.officeCnpj) setOfficeCnpj(data.officeData.officeCnpj);
          if (data.officeData.officeAddress) setOfficeAddress(data.officeData.officeAddress);
        }
        if (data.securitySettings) {
          if (data.securitySettings.globalMfa !== undefined) setGlobalMfa(data.securitySettings.globalMfa);
          if (data.securitySettings.ssoEnabled !== undefined) setSsoEnabled(data.securitySettings.ssoEnabled);
          if (data.securitySettings.sessionTimeout) setSessionTimeout(data.securitySettings.sessionTimeout);
        }
      }
    } catch (err) {
      console.error(err);
      const localOffice = localStorage.getItem('pcg_office_data');
      if (localOffice) {
        try {
          const parsed = JSON.parse(localOffice);
          if (parsed.officeName) setOfficeName(parsed.officeName);
          if (parsed.officeCnpj) setOfficeCnpj(parsed.officeCnpj);
          if (parsed.officeAddress) setOfficeAddress(parsed.officeAddress);
        } catch (e) { console.error(e); }
      }
      const localSec = localStorage.getItem('pcg_security_settings');
      if (localSec) {
        try {
          const parsed = JSON.parse(localSec);
          if (parsed.globalMfa !== undefined) setGlobalMfa(parsed.globalMfa);
          if (parsed.ssoEnabled !== undefined) setSsoEnabled(parsed.ssoEnabled);
          if (parsed.sessionTimeout) setSessionTimeout(parsed.sessionTimeout);
        } catch (e) { console.error(e); }
      }
    }
  };

  const handleSaveOfficeData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const officeData = { officeName, officeCnpj, officeAddress };
      localStorage.setItem('pcg_office_data', JSON.stringify(officeData));

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          officeData,
        }),
      });

      if (response.ok) {
        showCustomAlert('Dados do Escritório', 'Informações cadastrais do escritório atualizadas e memorizadas com sucesso no banco de dados!', 'success');
        loadAuditLogs();
      } else {
        const data = await response.json();
        showCustomAlert('Atualizado Localmente', data.error || 'Dados salvos no navegador.', 'success');
      }
    } catch (err) {
      console.error(err);
      showCustomAlert('Atualizado Localmente', 'Dados cadastrais salvos no dispositivo.', 'success');
    }
  };

  const handleSaveSecuritySettings = async (
    overrideMfa?: boolean,
    overrideSso?: boolean,
    overrideTimeout?: string
  ) => {
    const nextMfa = overrideMfa !== undefined ? overrideMfa : globalMfa;
    const nextSso = overrideSso !== undefined ? overrideSso : ssoEnabled;
    const nextTimeout = overrideTimeout !== undefined ? overrideTimeout : sessionTimeout;

    const securitySettings = { globalMfa: nextMfa, ssoEnabled: nextSso, sessionTimeout: nextTimeout };
    localStorage.setItem('pcg_security_settings', JSON.stringify(securitySettings));

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          securitySettings,
        }),
      });

      if (response.ok) {
        showCustomAlert('Segurança e LGPD', 'Diretrizes e políticas de segurança da informação salvas e memorizadas com sucesso!', 'success');
        loadAuditLogs();
      } else {
        const data = await response.json();
        showCustomAlert('Atualizado Localmente', data.error || 'Políticas salvas no navegador.', 'success');
      }
    } catch (err) {
      console.error(err);
      showCustomAlert('Atualizado Localmente', 'Políticas salvas no dispositivo.', 'success');
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const responseUsers = await fetch('/api/users');
        if (responseUsers.ok && active) {
          const data = await responseUsers.json();
          setUsersList(data);
        }

        if (currentUser.role === 'CEO/Proprietário') {
          const responseLogs = await fetch(`/api/audit-logs?actorId=${currentUser.id}`);
          if (responseLogs.ok && active) {
            const dataLogs = await responseLogs.json();
            setAuditLogs(dataLogs);
          }
        }

        // Always fetch teams and permissions matrix
        const responseTeams = await fetch('/api/teams');
        if (responseTeams.ok && active) {
          const dataTeams = await responseTeams.json();
          setTeamsList(dataTeams);
        }

        const responsePerms = await fetch('/api/permissions');
        if (responsePerms.ok && active) {
          const dataPerms = await responsePerms.json();
          setPermissionsMatrix(dataPerms);
        }

        // Load office & security settings
        loadSettings();
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoadingUsers(false);
          setLoadingTeams(false);
          setLoadingMatrix(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [currentUser]);

  // CREATE USER SUBMIT
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newUsername) {
      setCreateError('Todos os campos são obrigatórios.');
      return;
    }

    setCreateError('');
    setCreateLoading(true);

    try {
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          action: 'CREATE',
          name: newName,
          email: newEmail,
          username: newUsername,
          team: newTeam,
          role: newRole,
          status: 'Ativo',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.error || 'Erro ao adicionar usuário.');
        setCreateLoading(false);
        return;
      }

      // Success
      alert(`Membro "${newName}" criado e liberado com sucesso!\nLogin: ${newUsername}\nSenha temporária inicial: PCG123456 (Exigirá alteração no primeiro login)`);
      setIsAddUserModalOpen(false);
      
      // Reset fields
      setNewName('');
      setNewEmail('');
      setNewUsername('');
      setNewTeam('Contencioso Cível');
      setNewRole('Advogado Pleno');

      if (data.user) {
        setUsersList(prev => [...prev.filter(u => u.id !== data.user.id), data.user]);
      }

      // Reload
      loadUsers();
      loadAuditLogs();
      if (onUsersChange) onUsersChange();
    } catch (err) {
      console.error(err);
      setCreateError('Erro de conexão ao salvar no banco de dados.');
    } finally {
      setCreateLoading(false);
    }
  };

  // OPEN EDIT USER
  const openEditModal = (u: DBUser) => {
    setEditId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditUsername(u.username);
    setEditTeam(u.team);
    setEditRole(u.role);
    setEditError('');
    setIsEditUserModalOpen(true);
  };

  // EDIT USER SUBMIT
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editEmail || !editUsername) {
      setEditError('Todos os campos são obrigatórios.');
      return;
    }

    setEditError('');
    setEditLoading(true);

    try {
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          action: 'UPDATE',
          id: editId,
          name: editName,
          email: editEmail,
          username: editUsername,
          team: editTeam,
          role: editRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEditError(data.error || 'Erro ao atualizar dados do usuário.');
        setEditLoading(false);
        return;
      }

      // Success
      alert('Perfil do usuário atualizado permanentemente!');
      setIsEditUserModalOpen(false);
      loadUsers();
      loadAuditLogs();
      if (onUsersChange) onUsersChange();
    } catch (err) {
      console.error(err);
      setEditError('Erro de conexão ao salvar alterações no banco de dados.');
    } finally {
      setEditLoading(false);
    }
  };

  // TOGGLE STATUS
  const handleToggleUserStatus = async (id: string, currentStatus: boolean, name: string) => {
    const PROTECTED_IDS = ['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'];
    if (PROTECTED_IDS.includes(id)) {
      showCustomAlert(
        'Operação Proibida',
        'Este usuário é um sócio proprietário principal fundador e sua conta está sob regras de proteção permanente. Não é permitido desativá-lo.',
        'error'
      );
      return;
    }

    if (currentStatus === false) {
      // Activating user: simple toggle status
      showCustomConfirm(
        'Reativar Membro',
        `Deseja realmente reativar o acesso de "${name}"?`,
        async () => {
          try {
            const response = await fetch('/api/users/manage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                actorId: currentUser.id,
                action: 'TOGGLE_STATUS',
                id,
                status: 'Ativo'
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              showCustomAlert('Erro ao reativar', data.error || 'Erro ao reativar o usuário.', 'error');
              return;
            }

            showCustomAlert('Usuário Reativado', `O acesso de "${name}" foi reativado com sucesso!`, 'success');
            loadUsers();
            loadAuditLogs();
            if (onUsersChange) onUsersChange();
          } catch (err) {
            console.error(err);
            showCustomAlert('Erro de conexão', 'Falha de conexão com o servidor.', 'error');
          }
        },
        'info',
        'Reativar'
      );
    } else {
      // Deactivating user: Open the Step-by-Step Deactivation Assistant!
      try {
        setDeactivateAssistant({
          isOpen: true,
          userId: id,
          userName: name,
          step: 1,
          loading: true,
          error: '',
          counts: { processes: 0, deadlines: 0, events: 0, leads: 0 },
          responsibilities: { processes: [], deadlines: [], events: [], leads: [] },
          substituteId: '',
          justification: ''
        });

        const response = await fetch('/api/users/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actorId: currentUser.id,
            action: 'CHECK_RESPONSIBILITIES',
            userId: id
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setDeactivateAssistant(prev => ({
            ...prev,
            loading: false,
            error: data.error || 'Erro ao mapear vínculos do usuário.'
          }));
          return;
        }

        setDeactivateAssistant(prev => ({
          ...prev,
          step: 2, // Proceed to step 2: displaying active records
          loading: false,
          counts: data.counts,
          responsibilities: data.responsibilities
        }));
      } catch (err) {
        console.error(err);
        setDeactivateAssistant(prev => ({
          ...prev,
          loading: false,
          error: 'Falha de conexão ao carregar assistente.'
        }));
      }
    }
  };

  // PASSWORD RESET TO DEFAULT
  const handleResetUserPassword = async (id: string, name: string) => {
    const PROTECTED_IDS = ['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'];
    const isTargetProtected = PROTECTED_IDS.includes(id);

    let justification = '';
    if (isTargetProtected) {
      const promptVal = prompt(
        `ATENÇÃO: Você está redefinindo a senha de um SÓCIO PROPRIETÁRIO PRINCIPAL (${name}).\n\nPor razões de conformidade e segurança da informação, digite uma justificativa fundamentada por escrito:`
      );
      if (promptVal === null) return; // User cancelled
      if (promptVal.trim().length < 5) {
        showCustomAlert('Operação Abortada', 'Uma justificativa por escrito com pelo menos 5 caracteres é estritamente obrigatória para redefinir senhas de proprietários.', 'error');
        return;
      }
      justification = promptVal.trim();
    }

    showCustomConfirm(
      'Redefinir Senha do Membro',
      `Deseja resetar a senha do membro "${name}" para a senha padrão "PCG123456"?\nO usuário deverá obrigatoriamente definir uma nova senha pessoal em seu próximo acesso.`,
      async () => {
        try {
          const response = await fetch('/api/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actorId: currentUser.id,
              action: 'RESET_PASSWORD',
              id,
              justification
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            showCustomAlert('Erro ao resetar senha', data.error || 'Erro ao resetar senha.', 'error');
            return;
          }

          showCustomAlert(
            'Senha Redefinida',
            `Senha de "${name}" redefinida para o padrão "PCG123456" com sucesso!`,
            'success'
          );
          loadUsers();
          loadAuditLogs();
          if (onUsersChange) onUsersChange();
        } catch (err) {
          console.error(err);
          showCustomAlert('Erro de conexão', 'Erro de conexão ao realizar reset de senha.', 'error');
        }
      },
      'warning',
      'Resetar Senha'
    );
  };

  // DELETE USER
  const handleDeleteUser = async (id: string, name: string) => {
    const PROTECTED_IDS = ['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'];
    if (PROTECTED_IDS.includes(id)) {
      showCustomAlert(
        'Exclusão Bloqueada',
        'Este usuário é sócio proprietário principal e é estritamente protegido pelo sistema contra exclusão permanente.',
        'error'
      );
      return;
    }

    // Request justification
    const promptVal = prompt(
      `ATENÇÃO: Você está prestes a EXCLUIR DEFINITIVAMENTE o registro do membro "${name}".\n\nDigite o motivo/justificativa para esta exclusão administrativa:`
    );
    if (promptVal === null) return;
    if (promptVal.trim().length < 4) {
      showCustomAlert('Operação Abortada', 'É necessário preencher uma justificativa por escrito para fins de auditoria de segurança.', 'error');
      return;
    }
    const justification = promptVal.trim();

    showCustomConfirm(
      'Excluir Usuário Definitivamente',
      `ATENÇÃO: Deseja realmente EXCLUIR DEFINITIVAMENTE o acesso e registro do membro "${name}"?\nEsta ação é irreversível e será registrada em histórico de auditoria.`,
      async () => {
        try {
          const response = await fetch('/api/users/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actorId: currentUser.id,
              action: 'DELETE',
              id,
              justification
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            showCustomAlert('Erro ao excluir usuário', data.error || 'Erro ao excluir usuário.', 'error');
            return;
          }

          showCustomAlert('Membro Excluído', 'Membro excluído definitivamente do sistema com sucesso!', 'success');
          loadUsers();
          loadAuditLogs();
          if (onUsersChange) onUsersChange();
        } catch (err) {
          console.error(err);
          showCustomAlert('Erro de conexão', 'Erro de conexão ao realizar exclusão.', 'error');
        }
      },
      'danger',
      'Excluir Definitivamente'
    );
  };

  // GEMINI KEY CONNECTIVITY TESTER
  const handleTestGeminiKey = async () => {
    setIsTestingKey(true);
    setTestStatus('idle');
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Olá, responda apenas a palavra: OK' }),
      });
      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (err) {
      setTestStatus('error');
    } finally {
      setIsTestingKey(false);
    }
  };

  // TEAM ACTIONS
  const openNewTeamModal = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamDescription('');
    setTeamCoordinatorId('');
    setTeamSubstituteId('');
    setTeamLegalArea('Geral');
    setTeamAccessRules('Acesso padrão');
    setTeamStatus('Ativo');
    setTeamNotes('');
    setTeamMemberIds([]);
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (team: any) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setTeamCoordinatorId(team.coordinatorId || '');
    setTeamSubstituteId(team.substituteId || '');
    setTeamLegalArea(team.legalArea || 'Geral');
    setTeamAccessRules(team.accessRules || 'Acesso padrão');
    setTeamStatus(team.status || 'Ativo');
    setTeamNotes(team.notes || '');
    setTeamMemberIds(team.members || []);
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) {
      alert('O nome da equipe é obrigatório.');
      return;
    }
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingTeam ? 'UPDATE' : 'CREATE',
          id: editingTeam?.id,
          name: teamName,
          description: teamDescription,
          coordinatorId: teamCoordinatorId,
          substituteId: teamSubstituteId,
          legalArea: teamLegalArea,
          accessRules: teamAccessRules,
          status: teamStatus,
          notes: teamNotes,
          members: teamMemberIds
        })
      });
      if (response.ok) {
        showCustomAlert('Sucesso', editingTeam ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!', 'success');
        setIsTeamModalOpen(false);
        setEditingTeam(null);
        loadTeams();
        loadAuditLogs();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao salvar equipe.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar equipe.');
    }
  };

  const handleDeleteTeam = (teamId: string, name: string) => {
    showCustomConfirm(
      'Excluir Equipe',
      `Deseja realmente excluir a equipe "${name}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          const response = await fetch('/api/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'DELETE',
              id: teamId
            })
          });
          if (response.ok) {
            showCustomAlert('Sucesso', 'Equipe excluída com sucesso!', 'success');
            loadTeams();
            loadAuditLogs();
          } else {
            const data = await response.json();
            showCustomAlert('Erro', data.error || 'Erro ao excluir equipe.', 'error');
          }
        } catch (err) {
          console.error(err);
          showCustomAlert('Erro', 'Falha de conexão.', 'error');
        }
      },
      'danger'
    );
  };

  // PERMISSION MATRIX ACTIONS
  const handleTogglePermission = (role: string, permission: string) => {
    if (!isSuperadmin) return;
    setPermissionsMatrix(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      const nextMatrix = { ...prev, [role]: updated };

      if (typeof window !== 'undefined') {
        localStorage.setItem('pcg_permissions_matrix', JSON.stringify(nextMatrix));
      }

      // Auto-save mutation directly to server
      fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          matrix: nextMatrix
        })
      }).catch(err => console.error('Auto-save perms error:', err));

      return nextMatrix;
    });
  };

  const handleSavePermissions = async () => {
    try {
      setSavingMatrix(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pcg_permissions_matrix', JSON.stringify(permissionsMatrix));
      }
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser.id,
          matrix: permissionsMatrix
        })
      });
      if (response.ok) {
        showCustomAlert('Matriz Atualizada', 'A matriz global de permissões de segurança foi persistida com sucesso e memorizada no sistema!', 'success');
        loadAuditLogs();
      } else {
        const data = await response.json();
        showCustomAlert('Erro ao salvar', data.error || 'Erro ao atualizar a matriz.', 'error');
      }
    } catch (err) {
      console.error(err);
      showCustomAlert('Atualizado Localmente', 'Matriz de permissões salva no dispositivo.', 'success');
    } finally {
      setSavingMatrix(false);
    }
  };

  // Users Filter
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Audit Logs Filter
  const filteredLogs = auditLogs.filter((log) => {
    const q = auditQuery.toLowerCase();
    return (
      log.actorName.toLowerCase().includes(q) ||
      log.targetUserName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q)
    );
  });

  return (
    <div id="settings-view" className="flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-full pb-12">
      
      {/* COL-LEFT: Menu Sidebar Tab Selection (25% to 30% width) */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-[#DCE3EC] p-5 shadow-xs flex flex-col gap-2 self-start h-auto">
        <div className="pb-3 border-b border-[#DCE3EC] mb-2 px-1">
          <h3 className="font-display font-extrabold text-sm text-[#102F44] tracking-tight">Configurações Gerais</h3>
          <p className="text-[10px] text-[#66758A] mt-0.5 font-medium">Selecione uma categoria técnica</p>
        </div>

        {[
          { key: 'Usuários e Permissões', label: 'Usuários e Controle', icon: <Users className="w-4 h-4" />, show: isSuperadmin },
          { key: 'Gestão de Equipes', label: 'Gestão de Equipes', icon: <Building2 className="w-4 h-4" />, show: isSuperadmin },
          { key: 'Matriz de Permissões', label: 'Matriz de Permissões', icon: <Shield className="w-4 h-4" />, show: isSuperadmin },
          { key: 'Histórico de Auditoria', label: 'Histórico de Auditoria', icon: <ScrollText className="w-4 h-4" />, show: isSuperadmin },
          { key: 'Dados do Escritório', label: 'Dados do Escritório', icon: <Building2 className="w-4 h-4" />, show: true },
          { key: 'Segurança e LGPD', label: 'Segurança e LGPD', icon: <Shield className="w-4 h-4" />, show: true },
          { key: 'Aparência do Sistema', label: 'Aparência do Sistema', icon: <Palette className="w-4 h-4" />, show: true },
        ].map((item) => {
          if (!item.show) return null;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full py-2.5 px-3.5 rounded-lg text-left transition-all duration-150 flex items-center gap-3 text-xs md:text-sm font-semibold ${
                isActive
                  ? 'bg-[#0D3448] text-white shadow-sm'
                  : 'text-[#66758A] hover:text-[#102F44] hover:bg-[#DCE3EC]/30'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-[#66758A]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* COL-RIGHT: Card Component matching reference details (70% to 75% width) */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-xs"
          >
            
            {/* TAB 1: USUÁRIOS E PERMISSÕES */}
            {activeTab === 'Usuários e Permissões' && isSuperadmin && (
              <div className="flex flex-col gap-6">
                
                {/* Card Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE3EC] pb-4.5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F5F7FB] border border-[#DCE3EC] rounded-xl text-[#0D3448] mt-1 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#102F44] tracking-tight">
                        Usuários e Controle de Acesso
                      </h2>
                      <p className="text-xs text-[#66758A] mt-0.5 font-medium">
                        Controle de quem acessa o PCG.OS, níveis de privilégios e auditoria em tempo real.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2 bg-[#0D3448] text-white hover:bg-[#164D68] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Usuário</span>
                  </button>
                </div>

                {/* Inline Search Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, login, cargo ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#F5F7FB] border border-[#DCE3EC] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0D3448]/15 font-semibold placeholder-[#66758A]/50 text-[#102F44]"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-[#DCE3EC] rounded-xl">
                  {loadingUsers ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0D3448]" />
                      <p className="text-xs text-[#66758A]">Carregando banco de dados...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#66758A]">
                      Nenhum usuário encontrado correspondente à pesquisa.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-[#EEF2F6] border-b border-[#DCE3EC] text-[10px] font-bold text-[#66758A] uppercase tracking-wider">
                          <th className="px-5 py-3.5">Nome / Login</th>
                          <th className="px-5 py-3.5">Cargo / Perfil</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Último Acesso</th>
                          <th className="px-5 py-3.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCE3EC] text-[#102F44]">
                        {filteredUsers.map((u) => {
                          const formattedRoleCode = u.role.toUpperCase().replace(/\s+/g, '_');
                          const isProtected = ['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'].includes(u.id);

                          return (
                            <tr key={u.id} className="hover:bg-[#F5F7FB]/40 transition-all duration-150">
                              
                              {/* Nome / Login & Email */}
                              <td className="px-5 py-4">
                                <div className="flex flex-col min-w-[150px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-[#102F44]">{u.name}</span>
                                    {isProtected && (
                                      <span className="px-1.5 py-0.5 bg-[#0D3448] text-white text-[7px] font-black rounded uppercase tracking-wider">
                                        SÓCIO
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#66758A] font-mono mt-0.5">{u.email}</span>
                                  <span className="text-[9px] text-[#0D3448]/80 font-mono font-bold">@{u.username}</span>
                                </div>
                              </td>

                              {/* Cargo / Perfil */}
                              <td className="px-5 py-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[#102F44]">{u.role}</span>
                                  <span className="inline-block self-start mt-1 px-2 py-0.5 bg-blue-50 text-[#0D3448] font-bold rounded text-[8px] tracking-wide">
                                    {formattedRoleCode}
                                  </span>
                                </div>
                              </td>

                              {/* Status badge */}
                              <td className="px-5 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleUserStatus(u.id, u.mfa, u.name)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                    u.mfa 
                                      ? 'bg-emerald-50 text-[#0F9F6E]' 
                                      : 'bg-rose-50 text-[#D92D20]'
                                  }`}
                                  title={isProtected ? 'Usuário proprietário principal é protegido e não pode ser inativado' : 'Clique para alterar status de acesso'}
                                  disabled={isProtected}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span>{u.mfa ? 'Ativo' : 'Inativo'}</span>
                                </button>
                              </td>

                              {/* Último Acesso */}
                              <td className="px-5 py-4 font-mono text-[10px] text-[#66758A] whitespace-nowrap">
                                {u.lastAccess}
                              </td>

                              {/* Ações */}
                              <td className="px-5 py-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2.5">
                                  {/* Edit */}
                                  <button
                                    onClick={() => openEditModal(u)}
                                    className="p-1 text-slate-400 hover:text-[#0D3448] transition-all"
                                    title="Editar Dados"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>

                                  {/* Lock Status (Inline Toggle Shortcut) */}
                                  <button
                                    onClick={() => handleToggleUserStatus(u.id, u.mfa, u.name)}
                                    className={`p-1 transition-all ${
                                      u.mfa 
                                        ? 'text-[#66758A] hover:text-[#D92D20]' 
                                        : 'text-[#0F9F6E] hover:text-[#0F9F6E]/80'
                                    }`}
                                    disabled={isProtected}
                                    title={u.mfa ? 'Desativar Usuário' : 'Ativar Usuário'}
                                  >
                                    {u.mfa ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </button>

                                  {/* Reset Password Key Button */}
                                  <button
                                    onClick={() => handleResetUserPassword(u.id, u.name)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100/75 border border-amber-200 rounded text-[9px] font-bold text-amber-700 transition-all"
                                    title="Redefinir senha para padrão inicial"
                                  >
                                    <KeyRound className="w-3 h-3" />
                                    <span>RESETAR</span>
                                  </button>

                                  {/* Delete */}
                                  <button
                                    disabled={isProtected}
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="p-1 text-[#D92D20] hover:text-red-700 transition-all disabled:opacity-20 disabled:pointer-events-none"
                                    title={isProtected ? 'Proprietários são protegidos contra exclusão' : 'Excluir Usuário'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* TAB 1.1: GESTÃO DE EQUIPES */}
            {activeTab === 'Gestão de Equipes' && isSuperadmin && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE3EC] pb-4.5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F5F7FB] border border-[#DCE3EC] rounded-xl text-[#0D3448]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#102F44] tracking-tight">
                        Gestão de Equipes e Departamentos
                      </h2>
                      <p className="text-xs text-[#66758A] mt-0.5 font-medium">
                        Administre as divisões jurídicas, coordenadores técnicos, suplentes e o controle de dados das equipes operacionais.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openNewTeamModal}
                    className="self-start sm:self-center bg-[#0D3448] hover:bg-[#164D68] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Equipe</span>
                  </button>
                </div>

                {loadingTeams ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#66758A]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#0D3448]" />
                    <span className="text-xs font-bold">Carregando equipes do escritório...</span>
                  </div>
                ) : teamsList.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-[#DCE3EC] rounded-2xl flex flex-col items-center justify-center text-center p-6">
                    <p className="text-xs font-bold text-[#102F44] mb-1">Nenhuma equipe cadastrada</p>
                    <p className="text-[11px] text-[#66758A] mb-4">Crie equipes para organizar os processos e centralizar as visibilidades técnicas.</p>
                    <button onClick={openNewTeamModal} className="px-3 py-1.5 bg-slate-100 border border-[#DCE3EC] hover:bg-slate-200 text-[#102F44] rounded-lg text-xs font-bold">
                      Cadastrar Primeira Equipe
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamsList.map((team) => {
                      const coordUser = usersList.find(u => u.id === team.coordinatorId);
                      const subUser = usersList.find(u => u.id === team.substituteId);
                      const memberCount = team.members?.length || 0;
                      const isInactive = team.status === 'Inativo';

                      return (
                        <div
                          key={team.id}
                          className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm ${
                            isInactive ? 'border-dashed border-slate-300 opacity-70 bg-slate-50/50' : 'border-[#DCE3EC]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h4 className="font-display font-extrabold text-sm text-[#102F44]">{team.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                isInactive 
                                  ? 'bg-slate-100 text-slate-500' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {team.status || 'Ativo'}
                              </span>
                            </div>

                            <p className="text-xs text-[#66758A] mb-4 line-clamp-2 font-medium">
                              {team.description || 'Sem descrição cadastrada.'}
                            </p>

                            <div className="flex flex-col gap-2 border-t border-[#DCE3EC] pt-3 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-[#66758A] font-medium">Área Jurídica:</span>
                                <span className="font-bold text-[#102F44]">{team.legalArea || 'Geral'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#66758A] font-medium">Coordenador:</span>
                                <span className="font-bold text-[#102F44]">{coordUser ? coordUser.name : 'Não atribuído'}</span>
                              </div>
                              {team.substituteId && (
                                <div className="flex justify-between">
                                  <span className="text-[#66758A] font-medium">Suplente/Backup:</span>
                                  <span className="font-bold text-[#102F44]">{subUser ? subUser.name : 'Não atribuído'}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-[#66758A] font-medium">Membros Ativos:</span>
                                <span className="font-bold text-[#102F44]">{memberCount} {memberCount === 1 ? 'membro' : 'membros'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#66758A] font-medium">Regra de Visibilidade:</span>
                                <span className="font-bold text-amber-700">{team.accessRules || 'Acesso padrão'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                            <button
                              onClick={() => openEditTeamModal(team)}
                              className="px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 transition-all flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              className="px-2.5 py-1.5 hover:bg-rose-50 rounded-lg text-[11px] font-bold text-rose-600 transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 1.2: MATRIZ DE PERMISSÕES */}
            {activeTab === 'Matriz de Permissões' && isSuperadmin && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE3EC] pb-4.5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F5F7FB] border border-[#DCE3EC] rounded-xl text-[#0D3448]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-[#102F44] tracking-tight">
                        Matriz Global de Permissões (RBAC)
                      </h2>
                      <p className="text-xs text-[#66758A] mt-0.5 font-medium">
                        Controle e atribua perfis de segurança aos cargos técnicos. Alterações impactam os acessos às rotas e APIs em tempo real.
                      </p>
                    </div>
                  </div>
                  {isSuperadmin && (
                    <button
                      onClick={handleSavePermissions}
                      disabled={savingMatrix}
                      className="self-start sm:self-center bg-[#0D3448] hover:bg-[#164D68] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {savingMatrix ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{savingMatrix ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                  )}
                </div>

                {loadingMatrix ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#66758A]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#0D3448]" />
                    <span className="text-xs font-bold">Mapeando matriz de controle de acessos...</span>
                  </div>
                ) : (
                  <div className="bg-white border border-[#DCE3EC] rounded-2xl shadow-xs overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F5F7FB] border-b border-[#DCE3EC]">
                          <th className="p-3 text-[10px] font-extrabold text-[#66758A] uppercase tracking-wider min-w-[200px]">Permissão / Recurso</th>
                          {Object.keys(permissionsMatrix).map((role) => (
                            <th key={role} className="p-3 text-[10px] font-extrabold text-[#102F44] uppercase tracking-wider text-center min-w-[120px] border-l border-slate-100">
                              {role}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCE3EC] text-[11px] font-medium text-[#102F44]">
                        {[
                          { key: 'dashboard.visualizar', label: 'Visualizar Dashboard', category: 'Dashboard' },
                          { key: 'crm.visualizar', label: 'Visualizar Clientes & Leads', category: 'CRM' },
                          { key: 'crm.criar', label: 'Criar Clientes & Leads', category: 'CRM' },
                          { key: 'crm.excluir', label: 'Excluir Clientes & Leads', category: 'CRM' },
                          { key: 'processos.visualizar', label: 'Visualizar Casos & Processos', category: 'Processos' },
                          { key: 'processos.criar', label: 'Criar Casos & Processos', category: 'Processos' },
                          { key: 'processos.excluir', label: 'Excluir Casos/Responsabilidades', category: 'Processos' },
                          { key: 'processos.acessar_sigiloso', label: 'Acessar Processos Sigilosos', category: 'Processos' },
                          { key: 'prazos.visualizar', label: 'Visualizar Prazos & Tarefas', category: 'Prazos' },
                          { key: 'prazos.criar', label: 'Criar Prazos & Tarefas', category: 'Prazos' },
                          { key: 'prazos.excluir', label: 'Excluir Prazos & Tarefas', category: 'Prazos' },
                          { key: 'prazos.atribuir', label: 'Atribuir Atividades Críticas', category: 'Prazos' },
                          { key: 'financeiro.visualizar', label: 'Visualizar Financeiro', category: 'Financeiro' },
                          { key: 'financeiro.visualizar_dados', label: 'Visualizar Fluxo Sensível', category: 'Financeiro' },
                          { key: 'financeiro.aprovar', label: 'Aprovar / Cancelar Lançamentos', category: 'Financeiro' },
                          { key: 'configuracoes.administrar_usuarios', label: 'Gerenciar Usuários e Permissões', category: 'Configurações' },
                        ].map((perm) => (
                          <tr key={perm.key} className="hover:bg-slate-50/70 transition-all">
                            <td className="p-3">
                              <span className="block font-bold text-[#102F44]">{perm.label}</span>
                              <span className="text-[9px] text-[#66758A] uppercase font-mono tracking-wider">{perm.category} / {perm.key}</span>
                            </td>
                            {Object.keys(permissionsMatrix).map((role) => {
                              const hasPerm = permissionsMatrix[role]?.includes(perm.key) || false;
                              const isCeo = role === 'CEO/Proprietário';
                              return (
                                <td key={role} className="p-3 text-center border-l border-slate-100">
                                  <input
                                    type="checkbox"
                                    checked={hasPerm}
                                    disabled={!isSuperadmin || isCeo} // CEO permissions are absolute and immutable
                                    onChange={() => handleTogglePermission(role, perm.key)}
                                    className="w-4 h-4 text-[#0D3448] bg-white border-[#DCE3EC] rounded-sm focus:ring-[#0D3448]/20 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1.5: HISTÓRICO DE AUDITORIA */}
            {activeTab === 'Histórico de Auditoria' && isSuperadmin && (
              <div className="flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="flex items-start gap-3 border-b border-[#DCE3EC] pb-4.5">
                  <div className="p-2 bg-[#F5F7FB] border border-[#DCE3EC] rounded-xl text-[#0D3448] shrink-0">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-[#102F44] tracking-tight">
                      Registro de Auditoria de Segurança
                    </h2>
                    <p className="text-xs text-[#66758A] mt-0.5 font-medium">
                      Logs persistentes das ações administrativas executadas pelos proprietários no sistema PCG.OS.
                    </p>
                  </div>
                </div>

                {/* Filter and Refresh */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por administrador, ação, usuário ou termos do log..."
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#F5F7FB] border border-[#DCE3EC] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#0D3448]/15 font-semibold placeholder-[#66758A]/50 text-[#102F44]"
                    />
                  </div>
                  <button
                    onClick={loadAuditLogs}
                    disabled={loadingLogs}
                    className="px-3 py-2 bg-slate-50 border border-[#DCE3EC] rounded-lg hover:bg-slate-100 transition-all text-xs font-bold flex items-center gap-1.5 text-[#102F44]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto border border-[#DCE3EC] rounded-xl">
                  {loadingLogs ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0D3448]" />
                      <p className="text-xs text-[#66758A]">Buscando registros históricos...</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#66758A]">
                      Nenhum registro de auditoria disponível no momento.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#EEF2F6] border-b border-[#DCE3EC] text-[10px] font-bold text-[#66758A] uppercase tracking-wider">
                          <th className="px-5 py-3">Timestamp / Data</th>
                          <th className="px-5 py-3">Administrador (Autor)</th>
                          <th className="px-5 py-3">Ação</th>
                          <th className="px-5 py-3">Destinatário (Usuário)</th>
                          <th className="px-5 py-3">Detalhes do Evento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCE3EC] text-[#102F44] font-mono text-[10px]">
                        {filteredLogs.map((log) => {
                          let actionColor = 'bg-slate-100 text-slate-700';
                          if (log.action === 'CREATE') actionColor = 'bg-emerald-50 text-emerald-700 font-bold';
                          if (log.action === 'UPDATE') actionColor = 'bg-blue-50 text-blue-700 font-bold';
                          if (log.action === 'DELETE') actionColor = 'bg-rose-50 text-rose-700 font-black';
                          if (log.action === 'DEACTIVATE') actionColor = 'bg-amber-50 text-amber-700 font-bold';
                          if (log.action === 'CHANGE_PASSWORD') actionColor = 'bg-purple-50 text-purple-700 font-bold';
                          if (log.action === 'LOGIN') actionColor = 'bg-[#0D3448]/5 text-[#0D3448] font-bold';

                          return (
                            <tr key={log.id} className="hover:bg-[#F5F7FB]/40 transition-all">
                              <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Campo_Grande' })}
                              </td>
                              <td className="px-5 py-3 text-slate-700 font-semibold font-sans">
                                {log.actorName}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${actionColor}`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-700 font-sans">
                                {log.targetUserName}
                              </td>
                              <td className="px-5 py-3 text-slate-600 font-sans leading-relaxed min-w-[200px]">
                                {log.details}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: DADOS DO ESCRITÓRIO */}
            {activeTab === 'Dados do Escritório' && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[#DCE3EC] pb-4">
                  <h2 className="font-display font-extrabold text-lg text-[#102F44] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#0D3448]" />
                    <span>Dados do Escritório e Perfil Ativo</span>
                  </h2>
                  <p className="text-xs text-[#66758A] mt-0.5">Definições cadastrais institucionais do escritório de advocacia e perfil do profissional logado.</p>
                </div>

                {/* Two Sub-sections: Profile & Corporate Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Professional Profile */}
                  <form onSubmit={(e) => { e.preventDefault(); showCustomAlert('Perfil Salvo', 'Seu perfil profissional foi salvo com sucesso no PCG.OS.', 'success'); }} className="bg-slate-50 p-5 rounded-xl border border-[#DCE3EC] flex flex-col gap-4 text-xs">
                    <h4 className="font-bold text-sm text-[#0D3448] flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Minha Ficha Profissional</span>
                    </h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Nome Profissional</label>
                      <input
                        type="text"
                        value={currentUser.name}
                        disabled
                        className="w-full border border-[#DCE3EC] bg-slate-100 rounded-lg px-3 py-2 text-[#66758A] font-semibold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Registro OAB Principal</label>
                      <input
                        type="text"
                        defaultValue="OAB/SP 456.789"
                        disabled
                        className="w-full border border-[#DCE3EC] bg-slate-100 rounded-lg px-3 py-2 text-[#66758A] font-mono cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Login do Usuário</label>
                      <input
                        type="text"
                        value={`@${currentUser.username}`}
                        disabled
                        className="w-full border border-[#DCE3EC] bg-slate-100 rounded-lg px-3 py-2 text-[#66758A] font-mono font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">E-mail Corporativo</label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full border border-[#DCE3EC] bg-slate-100 rounded-lg px-3 py-2 text-[#66758A] font-mono cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Cargo / Nível de Acesso</label>
                      <input
                        type="text"
                        value={currentUser.role}
                        disabled
                        className="w-full border border-[#DCE3EC] bg-slate-100 rounded-lg px-3 py-2 text-[#66758A] font-semibold cursor-not-allowed"
                      />
                    </div>
                  </form>

                  {/* Corporate Office Data */}
                  <form onSubmit={handleSaveOfficeData} className="bg-slate-50 p-5 rounded-xl border border-[#DCE3EC] flex flex-col gap-4 text-xs">
                    <h4 className="font-bold text-sm text-[#0D3448] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>Dados de Cadastro do CNPJ</span>
                    </h4>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Razão Social do Escritório</label>
                      <input
                        type="text"
                        value={officeName}
                        onChange={(e) => setOfficeName(e.target.value)}
                        className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 outline-none font-semibold text-[#102F44]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">CNPJ Registrado</label>
                      <input
                        type="text"
                        value={officeCnpj}
                        onChange={(e) => setOfficeCnpj(e.target.value)}
                        className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 outline-none font-mono text-[#102F44]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Sede do Escritório</label>
                      <input
                        type="text"
                        value={officeAddress}
                        onChange={(e) => setOfficeAddress(e.target.value)}
                        className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 outline-none text-[#102F44]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#66758A] uppercase mb-1">Fuso Horário Oficial do Sistema</label>
                      <div className="w-full border border-[#DCE3EC] bg-emerald-50/60 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <div>
                            <p className="font-bold text-[#102F44] text-xs">Campo Grande (MS) — UTC-4</p>
                            <p className="text-[10px] text-[#66758A]">Horário do Amazonas (AMT) / America/Campo_Grande</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                          Ativo
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-1">
                      <button type="submit" className="px-4 py-2 bg-[#0D3448] hover:bg-[#164D68] text-white rounded-lg font-bold text-xs cursor-pointer">
                        Salvar Dados Institucionais
                      </button>
                    </div>
                  </form>

                </div>

              </div>
            )}

            {/* TAB 3: SEGURANÇA E LGPD */}
            {activeTab === 'Segurança e LGPD' && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[#DCE3EC] pb-4">
                  <h2 className="font-display font-extrabold text-lg text-[#102F44] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0D3448]" />
                    <span>Segurança de Dados &amp; Conformidade LGPD</span>
                  </h2>
                  <p className="text-xs text-[#66758A] mt-0.5">Administração de protocolos globais de segurança jurídica do escritório de advocacia.</p>
                </div>

                <div className="flex flex-col divide-y divide-[#DCE3EC] text-xs md:text-sm">
                  {/* Policy 1 */}
                  <div className="flex items-center justify-between py-4.5 first:pt-0">
                    <div className="pr-4">
                      <p className="font-bold text-[#102F44]">Forçar autenticação multifator (MFA)</p>
                      <p className="text-xs text-[#66758A] mt-1 leading-relaxed">
                        Todos os advogados e sócios deverão configurar obrigatoriamente a autenticação multifator no próximo login.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <ToggleSwitch
                        checked={globalMfa}
                        onChange={(val) => {
                          setGlobalMfa(val);
                          handleSaveSecuritySettings(val, ssoEnabled, sessionTimeout);
                        }}
                      />
                    </div>
                  </div>

                  {/* Policy 2 */}
                  <div className="flex items-center justify-between py-4.5">
                    <div className="pr-4">
                      <p className="font-bold text-[#102F44]">Habilitar Single Sign-On (SSO)</p>
                      <p className="text-xs text-[#66758A] mt-1 leading-relaxed">
                        Permite login direto e seguro usando contas integradas do provedor de e-mail Google Workspace do escritório.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <ToggleSwitch
                        checked={ssoEnabled}
                        onChange={(val) => {
                          setSsoEnabled(val);
                          handleSaveSecuritySettings(globalMfa, val, sessionTimeout);
                        }}
                      />
                    </div>
                  </div>

                  {/* Policy 3 */}
                  <div className="flex items-center justify-between py-4.5 last:pb-0">
                    <div className="pr-4">
                      <p className="font-bold text-[#102F44]">Tempo limite de ociosidade da sessão</p>
                      <p className="text-xs text-[#66758A] mt-1 leading-relaxed">
                        Desconecta automaticamente a conta do usuário por inatividade após o tempo selecionado.
                      </p>
                    </div>
                    <div className="shrink-0 pl-2">
                      <select
                        value={sessionTimeout}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSessionTimeout(val);
                          handleSaveSecuritySettings(globalMfa, ssoEnabled, val);
                        }}
                        className="border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs font-semibold text-[#102F44] outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                      >
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="60">1 hora</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#DCE3EC]">
                  <button
                    onClick={() => handleSaveSecuritySettings()}
                    className="px-4 py-2 bg-[#0D3448] hover:bg-[#164D68] text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
                  >
                    Salvar Configurações de Segurança
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: APARÊNCIA DO SISTEMA */}
            {activeTab === 'Aparência do Sistema' && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-[#DCE3EC] pb-4">
                  <h2 className="font-display font-extrabold text-lg text-[#102F44] flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#0D3448]" />
                    <span>Aparência e Personalização da Marca</span>
                  </h2>
                  <p className="text-xs text-[#66758A] mt-0.5">Customize o visual do PCG.OS para incorporar a identidade visual do escritório.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-[#DCE3EC] flex flex-col gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[#102F44]">Paleta de Cores Ativa</p>
                    <p className="text-xs text-[#66758A] mt-0.5">Definida automaticamente pelo tema corporativo oficial do Pinto, Camargo &amp; Godoy.</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['#0D3448', '#164D68', '#102F44', '#F5F7FB'].map((color) => (
                        <span key={color} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#DCE3EC] rounded text-[10px] font-bold font-mono">
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: color }} />
                          <span>{color}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODAL 1: ADICIONAR NOVO USUÁRIO */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102F44]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-xl max-w-md w-full flex flex-col gap-5 text-xs text-[#102F44]"
            >
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <h3 className="font-display font-extrabold text-base text-[#102F44]">Adicionar Membro</h3>
                <button
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    setCreateError('');
                  }}
                  className="p-1 text-slate-400 hover:text-[#102F44] transition-all text-sm font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {createError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleAddUserSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewName(val);
                      const formatted = val
                        .trim()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '.');
                      setNewUsername(formatted);
                    }}
                    placeholder="Ex.: Dra. Juliana Camargo"
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold placeholder-[#66758A]/50 outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Login do Usuário (Criado automaticamente)
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Ex.: Juliana.Camargo"
                    className="w-full border border-[#DCE3EC] bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-[#0D3448] font-mono font-bold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                  <p className="text-[9px] text-[#66758A] mt-1 leading-normal">
                    Este login será utilizado para acessar o sistema. O padrão recomendado é <strong>Nome.Sobrenome</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="juliana@pcg.adv.br"
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-mono placeholder-[#66758A]/50 outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Equipe Principal
                  </label>
                  <select
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  >
                    <option value="Contencioso Cível">Contencioso Cível</option>
                    <option value="Trabalhista">Trabalhista</option>
                    <option value="Tributário &amp; Fiscal">Tributário &amp; Fiscal</option>
                    <option value="Corporativo M&amp;A">Corporativo M&amp;A</option>
                    <option value="Diretoria Executiva">Diretoria Executiva</option>
                    <option value="Controladoria">Controladoria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Cargo / Permissão
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  >
                    <option value="Advogado Pleno">Advogado Pleno</option>
                    <option value="Advogado Sênior">Advogado Sênior</option>
                    <option value="Sócio Consultor">Sócio Consultor</option>
                    <option value="Controladoria Jurídica">Controladoria Jurídica</option>
                    <option value="Administrador">Administrador</option>
                    <option value="CEO/Proprietário">CEO/Proprietário (Superadm)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#DCE3EC] mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddUserModalOpen(false);
                      setCreateError('');
                    }}
                    disabled={createLoading}
                    className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 bg-[#0D3448] hover:bg-[#164D68] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {createLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{createLoading ? 'Salvando...' : 'Convidar'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDITAR USUÁRIO */}
      <AnimatePresence>
        {isEditUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102F44]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-xl max-w-md w-full flex flex-col gap-5 text-xs text-[#102F44]"
            >
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <h3 className="font-display font-extrabold text-base text-[#102F44]">Editar Membro</h3>
                <button
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    setEditError('');
                  }}
                  className="p-1 text-slate-400 hover:text-[#102F44] transition-all text-sm font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditUserSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold placeholder-[#66758A]/50 outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Login do Usuário (username)
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-mono font-bold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-mono outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Equipe Principal
                  </label>
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  >
                    <option value="Contencioso Cível">Contencioso Cível</option>
                    <option value="Trabalhista">Trabalhista</option>
                    <option value="Tributário &amp; Fiscal">Tributário &amp; Fiscal</option>
                    <option value="Corporativo M&amp;A">Corporativo M&amp;A</option>
                    <option value="Diretoria Executiva">Diretoria Executiva</option>
                    <option value="Controladoria">Controladoria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Cargo / Permissão
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    disabled={['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'].includes(editId)}
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="Advogado Pleno">Advogado Pleno</option>
                    <option value="Advogado Sênior">Advogado Sênior</option>
                    <option value="Sócio Consultor">Sócio Consultor</option>
                    <option value="Controladoria Jurídica">Controladoria Jurídica</option>
                    <option value="Administrador">Administrador</option>
                    <option value="CEO/Proprietário">CEO/Proprietário (Superadm)</option>
                  </select>
                  {['usr-ceo-1', 'usr-ceo-2', 'usr-ceo-3'].includes(editId) && (
                    <p className="text-[9px] text-[#66758A] mt-1 italic">
                      Este usuário é um sócio proprietário principal e não pode ter seu cargo alterado.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#DCE3EC] mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditUserModalOpen(false);
                      setEditError('');
                    }}
                    disabled={editLoading}
                    className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-[#0D3448] hover:bg-[#164D68] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {editLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{editLoading ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CADASTRAR/EDITAR EQUIPE */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102F44]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-xl max-w-lg w-full flex flex-col gap-4 text-xs text-[#102F44] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <h3 className="font-display font-extrabold text-base text-[#102F44]">
                  {editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
                </h3>
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-[#102F44] text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTeamSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Nome da Equipe
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ex: Trabalhista & Previdenciário"
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Área Técnica Jurídica
                    </label>
                    <select
                      value={teamLegalArea}
                      onChange={(e) => setTeamLegalArea(e.target.value)}
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    >
                      <option value="Geral">Geral</option>
                      <option value="Cível">Cível / Contencioso</option>
                      <option value="Trabalhista">Trabalhista</option>
                      <option value="Tributário">Tributário & Fiscal</option>
                      <option value="Corporativo">Corporativo / Societário</option>
                      <option value="Administrativo">Administrativo / Diretoria</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Descrição da Equipe
                  </label>
                  <textarea
                    rows={2}
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Breve resumo da responsabilidade de dados e escopo de atuação do time..."
                    className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Coordenador Responsável
                    </label>
                    <select
                      value={teamCoordinatorId}
                      onChange={(e) => setTeamCoordinatorId(e.target.value)}
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    >
                      <option value="">Selecione um advogado...</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Suplente / Backup
                    </label>
                    <select
                      value={teamSubstituteId}
                      onChange={(e) => setTeamSubstituteId(e.target.value)}
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    >
                      <option value="">Nenhum substituto...</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Regra de Visibilidade de Dados
                    </label>
                    <select
                      value={teamAccessRules}
                      onChange={(e) => setTeamAccessRules(e.target.value)}
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    >
                      <option value="Acesso padrão">Acesso padrão (Somente própria equipe)</option>
                      <option value="Restrito">Restrito (Necessita autorização explícita)</option>
                      <option value="Acesso irrestrito">Acesso irrestrito (Visibilidade ampla)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Status da Equipe
                    </label>
                    <select
                      value={teamStatus}
                      onChange={(e) => setTeamStatus(e.target.value as any)}
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                    Selecione os Membros da Equipe
                  </label>
                  <div className="border border-[#DCE3EC] rounded-lg p-3 max-h-32 overflow-y-auto flex flex-col gap-1.5">
                    {usersList.map((u) => {
                      const isChecked = teamMemberIds.includes(u.id);
                      return (
                        <label key={u.id} className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1 text-[11px] font-medium text-[#102F44]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setTeamMemberIds(prev => prev.filter(mid => mid !== u.id));
                              } else {
                                setTeamMemberIds(prev => [...prev, u.id]);
                              }
                            }}
                            className="w-3.5 h-3.5 text-[#0D3448] bg-white border-[#DCE3EC] rounded focus:ring-0 cursor-pointer"
                          />
                          <span>{u.name} <span className="text-[9px] text-[#66758A] font-normal">({u.role})</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#DCE3EC] mt-2">
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0D3448] hover:bg-[#164D68] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Equipe</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: ASSISTENTE DE DESATIVAÇÃO E TRANSFERÊNCIA */}
      <AnimatePresence>
        {deactivateAssistant.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102F44]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-2xl max-w-lg w-full flex flex-col gap-4 text-xs text-[#102F44] max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <h3 className="font-display font-extrabold text-sm text-[#102F44]">
                    Assistente de Desativação e Redistribuição
                  </h3>
                </div>
                <button
                  onClick={() => setDeactivateAssistant(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 text-slate-400 hover:text-[#102F44] text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Error Alert */}
              {deactivateAssistant.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deactivateAssistant.error}</span>
                </div>
              )}

              {/* Steps Progress */}
              <div className="flex items-center justify-between gap-2 px-1 mb-2">
                {[1, 2, 3, 4, 5].map((stepNum) => {
                  const isActive = deactivateAssistant.step === stepNum;
                  const isCompleted = deactivateAssistant.step > stepNum;
                  return (
                    <div key={stepNum} className="flex-1 flex items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive 
                          ? 'bg-[#0D3448] text-white' 
                          : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isCompleted ? '✓' : stepNum}
                      </div>
                      {stepNum < 5 && <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: LOADING */}
              {deactivateAssistant.step === 1 && deactivateAssistant.loading && (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0D3448]" />
                  <p className="font-bold text-[#102F44]">Varrendo dependências críticas...</p>
                  <p className="text-[10px] text-[#66758A] text-center max-w-xs leading-normal">
                    Mapeando processos judiciais, prazos fatais, leads do CRM e eventos de agenda sob responsabilidade de <strong>{deactivateAssistant.userName}</strong>.
                  </p>
                </div>
              )}

              {/* STEP 2: DEPENDENCIES REPORT */}
              {deactivateAssistant.step === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                    <p className="font-bold text-xs mb-1">Diagnóstico de Responsabilidades Ativas</p>
                    <p className="text-[10.5px] leading-relaxed">
                      O membro <strong>{deactivateAssistant.userName}</strong> possui registros ativos no sistema. Para desativar este acesso com segurança jurídica, as seguintes responsabilidades devem ser redistribuídas:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Processos e Casos</span>
                      <span className="text-lg font-mono font-bold text-[#102F44]">{deactivateAssistant.counts.processes}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Prazos e Tarefas</span>
                      <span className="text-lg font-mono font-bold text-[#102F44]">{deactivateAssistant.counts.deadlines}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Eventos na Agenda</span>
                      <span className="text-lg font-mono font-bold text-[#102F44]">{deactivateAssistant.counts.events}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Leads do CRM</span>
                      <span className="text-lg font-mono font-bold text-[#102F44]">{deactivateAssistant.counts.leads}</span>
                    </div>
                  </div>

                  {deactivateAssistant.counts.processes === 0 &&
                   deactivateAssistant.counts.deadlines === 0 &&
                   deactivateAssistant.counts.events === 0 &&
                   deactivateAssistant.counts.leads === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-center font-bold">
                      Nenhuma pendência técnica encontrada! A conta pode ser desativada diretamente.
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic leading-normal">
                      * Todos os processos de redistribuição de responsabilidade geram notificações instantâneas aos novos advogados designados e são auditados de forma permanente.
                    </p>
                  )}

                  <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setDeactivateAssistant(prev => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeactivateAssistant(prev => ({ ...prev, step: 3 }))}
                      className="flex-1 bg-[#0D3448] hover:bg-[#164D68] text-white py-2 rounded-lg font-bold shadow-sm"
                    >
                      Prosseguir para Redistribuição
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT RECIPIENT */}
              {deactivateAssistant.step === 3 && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Definir Advogado Substituto (Destinatário da Carga)
                    </label>
                    <select
                      value={deactivateAssistant.substituteId}
                      onChange={(e) => setDeactivateAssistant(prev => ({ ...prev, substituteId: e.target.value }))}
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2.5 text-xs text-[#102F44] font-semibold outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    >
                      <option value="">Selecione o profissional substituto...</option>
                      {usersList
                        .filter(u => u.id !== deactivateAssistant.userId && u.mfa) // active and not the deactivated user
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-[#66758A] mt-1.5 leading-normal">
                      Este profissional passará a constar como advogado principal em todos os processos ativos e assumirá os prazos em aberto de <strong>{deactivateAssistant.userName}</strong>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => setDeactivateAssistant(prev => ({ ...prev, step: 2 }))}
                      className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      disabled={!deactivateAssistant.substituteId}
                      onClick={() => setDeactivateAssistant(prev => ({ ...prev, step: 4 }))}
                      className="flex-1 bg-[#0D3448] hover:bg-[#164D68] text-white py-2 rounded-lg font-bold shadow-sm disabled:opacity-50"
                    >
                      Revisar e Justificar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: JUSTIFICATION & SIGNATURE */}
              {deactivateAssistant.step === 4 && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#66758A] uppercase tracking-wider mb-1.5">
                      Justificativa Administrativa para Desativação
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={deactivateAssistant.justification}
                      onChange={(e) => setDeactivateAssistant(prev => ({ ...prev, justification: e.target.value }))}
                      placeholder="Ex: Desligamento formal do profissional do escritório Pinto, Camargo & Godoy. Redistribuição de carga jurídica autorizada pela controladoria..."
                      className="w-full border border-[#DCE3EC] bg-white rounded-lg px-3 py-2 text-xs text-[#102F44] outline-none focus:ring-2 focus:ring-[#0D3448]/15"
                    />
                    <p className="text-[10px] text-[#66758A] mt-1 leading-normal font-medium">
                      Esta justificativa é obrigatória por motivos de conformidade de segurança e será anexada ao log de auditoria permanente.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold text-[10.5px]">Aviso de Ação Crítica e Irreversível</p>
                      <p className="text-[10px] leading-relaxed mt-0.5">
                        {"Ao clicar em 'Executar Desativação', as responsabilidades de "}{deactivateAssistant.userName}{" serão reatribuídas integralmente. A conta do profissional será marcada como inativa impedindo novos logins imediatamente."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setDeactivateAssistant(prev => ({ ...prev, step: 3 }))}
                      className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      disabled={deactivateAssistant.justification.trim().length < 5}
                      onClick={async () => {
                        try {
                          setDeactivateAssistant(prev => ({ ...prev, step: 5, loading: true, error: '' }));
                          const response = await fetch('/api/users/manage', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              actorId: currentUser.id,
                              action: 'DEACTIVATE_WITH_TRANSFER',
                              userId: deactivateAssistant.userId,
                              substituteId: deactivateAssistant.substituteId,
                              justification: deactivateAssistant.justification
                            })
                          });
                          const data = await response.json();
                          if (response.ok) {
                            setDeactivateAssistant(prev => ({ ...prev, loading: false }));
                            loadUsers();
                            loadAuditLogs();
                          } else {
                            setDeactivateAssistant(prev => ({ ...prev, step: 4, loading: false, error: data.error || 'Erro ao reatribuir pendências.' }));
                          }
                        } catch (err) {
                          setDeactivateAssistant(prev => ({ ...prev, step: 4, loading: false, error: 'Erro de conexão ao realizar redistribuição.' }));
                        }
                      }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-bold shadow-sm disabled:opacity-50"
                    >
                      Executar Desativação
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: SUCCESS / CONFIRMATION */}
              {deactivateAssistant.step === 5 && (
                <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-xl shadow-xs">
                    ✓
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-[#102F44] text-base">Redistribuição Executada com Sucesso!</p>
                    <p className="text-[11px] text-[#66758A] mt-1 max-w-sm leading-normal">
                      Todas as pendências e responsabilidades foram transferidas. O acesso do usuário <strong>{deactivateAssistant.userName}</strong> foi inativado. Relatório de conformidade arquivado nos logs de auditoria.
                    </p>
                  </div>
                  <button
                    onClick={() => setDeactivateAssistant(prev => ({ ...prev, isOpen: false }))}
                    className="mt-3 px-6 py-2 bg-[#0D3448] hover:bg-[#164D68] text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    OK, Fechar Assistente
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CONFIRMATION DIALOG */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102F44]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-2xl max-w-sm w-full flex flex-col gap-4 text-xs text-[#102F44]"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-blue-50 text-[#0D3448] border border-blue-100'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#102F44]">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-[#66758A] mt-1 whitespace-pre-line leading-relaxed font-semibold">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-[#DCE3EC]">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2 border border-[#DCE3EC] text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                >
                  {confirmModal.cancelText || 'Cancelar'}
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                    confirmModal.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmModal.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#0D3448] hover:bg-[#164D68]'
                  }`}
                >
                  {confirmModal.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM ALERT DIALOG */}
      <AnimatePresence>
        {alertModal.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#102F44]/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-2xl max-w-sm w-full flex flex-col gap-4 text-xs text-[#102F44]"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  alertModal.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {alertModal.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#102F44]">
                    {alertModal.title}
                  </h3>
                  <p className="text-xs text-[#66758A] mt-1 leading-relaxed font-semibold">
                    {alertModal.message}
                  </p>
                </div>
              </div>

              <div className="flex pt-2 border-t border-[#DCE3EC]">
                <button
                  type="button"
                  onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-full bg-[#0D3448] hover:bg-[#164D68] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] text-center"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
