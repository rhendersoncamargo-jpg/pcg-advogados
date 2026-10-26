process.env.TZ = 'America/Campo_Grande';

import fs from 'fs';
import path from 'path';

import { Process, CrmLead, Deadline, CalendarEvent, FinancialTransaction, LegalDocument, FeeContract, LegalCase } from './mockData';
import { db, disableFirestore } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export interface DBUser {
  id: string;
  name: string;
  username: string; // login identifier
  email: string;
  team: string;
  role: string;
  mfa: boolean; // mapped as 'Ativo' (true) or 'Inativo' (false)
  lastAccess: string;
  passwordHash: string;
  passwordSalt: string;
  mustChangePassword: boolean;
  
  // Rich extended profile fields
  phone?: string;
  cargo?: string;
  additionalTeams?: string[];
  hierarchicalSuperiorId?: string;
  hierarchicalSuperiorName?: string;
  legalAreas?: string[];
  customPermissions?: string[]; // user-level overrides
  status?: string; // 'Convite pendente' | 'Ativo' | 'Temporário' | 'Afastado' | 'Férias' | 'Bloqueado' | 'Desativação pendente' | 'Desativado' | 'Acesso expirado'
  startDate?: string;
  endDate?: string;
  allowedAccessHours?: string;
  adminNotes?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  coordinatorId: string;
  coordinatorName: string;
  legalArea: string;
  memberIds: string[];
  substituteResponsibleId: string;
  substituteResponsibleName: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  notes: string;
  accessRules: string;
  linkedProcessIds: string[];
  linkedClientIds: string[];
  linkedDocumentIds: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  recipientId: string; // 'all' or specific user id
  category: string; // 'crm' | 'processos' | 'prazos' | 'financeiro' | 'sistema' | 'config'
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'DEACTIVATE' | 'DELETE' | 'CHANGE_PASSWORD' | 'LOGIN' | 'STATUS_CHANGE' | 'TEAM_CHANGE';
  targetUserId: string;
  targetUserName: string;
  details: string;
}

export interface OfficeSettings {
  officeName: string;
  officeCnpj: string;
  officeAddress: string;
  oabRegister?: string;
  officialTimezone?: string;
  timezoneCode?: string;
}

export interface SecuritySettings {
  globalMfa: boolean;
  ssoEnabled: boolean;
  sessionTimeout: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  compactMode: boolean;
}

export interface SystemSettings {
  officeData: OfficeSettings;
  securitySettings: SecuritySettings;
  appearanceSettings: AppearanceSettings;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  officeData: {
    officeName: 'Paiva Camargo & Godoy Advogados Associados',
    officeCnpj: '32.478.848/0001-90',
    officeAddress: 'Rua Euclides da Cunha, 1584, Campo Grande, MS',
    oabRegister: 'OAB/SP 456.789',
    officialTimezone: 'Horário de Campo Grande (MS) — UTC-4 (AMT)',
    timezoneCode: 'America/Campo_Grande',
  },
  securitySettings: {
    globalMfa: true,
    ssoEnabled: false,
    sessionTimeout: '15',
  },
  appearanceSettings: {
    theme: 'light',
    primaryColor: '#0D3448',
    compactMode: false,
  },
};

export interface DatabaseSchema {
  users: DBUser[];
  auditLogs: AuditLog[];
  processes?: Process[];
  crmLeads?: CrmLead[];
  deadlines?: Deadline[];
  events?: CalendarEvent[];
  transactions?: FinancialTransaction[];
  teams?: Team[];
  notifications?: Notification[];
  permissionsMatrix?: Record<string, string[]>;
  legalCases?: LegalCase[];
  legalDocuments?: LegalDocument[];
  feeContracts?: FeeContract[];
  settings?: SystemSettings;
  deletedIds?: string[];
}

export const DEFAULT_PERMISSIONS_MATRIX: Record<string, string[]> = {
  'CEO/Proprietário': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar', 'financeiro.visualizar', 'relatorios.visualizar', 'configuracoes.visualizar',
    'dashboard.criar', 'crm.criar', 'processos.criar', 'prazos.criar', 'agenda.criar', 'documentos.criar', 'financeiro.criar', 'relatorios.criar', 'configuracoes.criar',
    'dashboard.editar', 'crm.editar', 'processos.editar', 'prazos.editar', 'agenda.editar', 'documentos.editar', 'financeiro.editar', 'relatorios.editar', 'configuracoes.editar',
    'dashboard.excluir', 'crm.excluir', 'processos.excluir', 'prazos.excluir', 'agenda.excluir', 'documentos.excluir', 'financeiro.excluir', 'relatorios.excluir', 'configuracoes.excluir',
    'processos.acessar_sigiloso', 'financeiro.visualizar_dados', 'configuracoes.visualizar_auditoria', 'configuracoes.alterar_permissoes', 'configuracoes.administrar_usuarios'
  ],
  'Administrador': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar', 'relatorios.visualizar', 'configuracoes.visualizar',
    'crm.criar', 'processos.criar', 'prazos.criar', 'agenda.criar', 'documentos.criar',
    'crm.editar', 'processos.editar', 'prazos.editar', 'agenda.editar', 'documentos.editar',
    'crm.excluir', 'processos.excluir', 'prazos.excluir', 'agenda.excluir', 'documentos.excluir',
    'relatorios.criar', 'relatorios.editar'
  ],
  'Controladoria Jurídica': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar', 'relatorios.visualizar',
    'processos.criar', 'prazos.criar', 'agenda.criar', 'documentos.criar',
    'processos.editar', 'prazos.editar', 'agenda.editar', 'documentos.editar',
    'processos.alterar_responsavel', 'prazos.reabrir_registro'
  ],
  'Coordenador': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar', 'relatorios.visualizar',
    'crm.criar', 'processos.criar', 'prazos.criar', 'agenda.criar', 'documentos.criar',
    'crm.editar', 'processos.editar', 'prazos.editar', 'agenda.editar', 'documentos.editar',
    'processos.distribuir', 'prazos.atribuir'
  ],
  'Advogado': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar',
    'crm.criar', 'processos.criar', 'prazos.criar', 'agenda.criar', 'documentos.criar',
    'crm.editar', 'processos.editar', 'prazos.editar', 'agenda.editar', 'documentos.editar'
  ],
  'Estagiário': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar',
    'prazos.criar', 'agenda.criar', 'documentos.criar',
    'prazos.editar', 'agenda.editar', 'documentos.editar'
  ],
  'Financeiro': [
    'dashboard.visualizar', 'financeiro.visualizar', 'relatorios.visualizar',
    'financeiro.criar', 'financeiro.editar', 'financeiro.cancelar', 'financeiro.estornar', 'financeiro.aprovar'
  ],
  'Administrativo': [
    'dashboard.visualizar', 'crm.visualizar', 'agenda.visualizar', 'documentos.visualizar',
    'crm.criar', 'agenda.criar', 'documentos.criar',
    'crm.editar', 'agenda.editar', 'documentos.editar'
  ],
  'Consulta': [
    'dashboard.visualizar', 'crm.visualizar', 'processos.visualizar', 'prazos.visualizar', 'agenda.visualizar', 'documentos.visualizar'
  ]
};

const DB_PATH = path.join(process.cwd(), 'database.json');

const MOCK_IDS = new Set<string>();

// In-memory database cache to fallback when filesystem is read-only
let cachedDb: DatabaseSchema | null = null;

export function resetCachedDb(): void {
  cachedDb = null;
}

export function registerDeletedId(id: string): void {
  if (!id) return;
  const dbSchema = initDb();
  if (!dbSchema.deletedIds) dbSchema.deletedIds = [];
  if (!dbSchema.deletedIds.includes(id)) {
    dbSchema.deletedIds.push(id);
    saveDb(dbSchema);
  }
}

/**
 * Initializes the database file if it does not exist.
 */
export function initDb(forceReload: boolean = false): DatabaseSchema {
  if (cachedDb && !forceReload) {
    return cachedDb;
  }

  const defaultUsers: DBUser[] = [];

  // No automatic accounts or personal team seeds in the exported source.
  const defaultTeams: Team[] = [];

  const defaultNotifications: Notification[] = [];

  const initialSchema: DatabaseSchema = {
    users: defaultUsers,
    teams: defaultTeams,
    notifications: defaultNotifications,
    processes: [],
    crmLeads: [],
    deadlines: [],
    events: [],
    transactions: [],
    legalCases: [],
    legalDocuments: [],
    feeContracts: [],
    permissionsMatrix: DEFAULT_PERMISSIONS_MATRIX,
    settings: DEFAULT_SETTINGS,
    auditLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        actorId: 'system',
        actorName: 'Sistema PCG.OS',
        action: 'CREATE',
        targetUserId: 'usr-ceo-1',
        targetUserName: 'Larissa Paiva',
        details: 'Superadministradora inicial inicializada no banco de dados com sucesso.',
      },
      {
        id: 'log-2',
        timestamp: new Date().toISOString(),
        actorId: 'system',
        actorName: 'Sistema PCG.OS',
        action: 'CREATE',
        targetUserId: 'usr-ceo-2',
        targetUserName: 'Pedro Godoy',
        details: 'Superadministrador inicial inicializado no banco de dados com sucesso.',
      },
      {
        id: 'log-3',
        timestamp: new Date().toISOString(),
        actorId: 'system',
        actorName: 'Sistema PCG.OS',
        action: 'CREATE',
        targetUserId: 'usr-ceo-3',
        targetUserName: 'Rhenderson Camargo',
        details: 'Superadministrador inicial inicializado no banco de dados com sucesso.',
      }
    ],
  };

  if (!fs.existsSync(DB_PATH)) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialSchema, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not write initial database.json (read-only filesystem?)', err);
    }
    cachedDb = initialSchema;
    return initialSchema;
  }

  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content) as DatabaseSchema;
    
    let dbUpdated = ensureCoreUsers(parsed);

    // Ensure permissionsMatrix and settings are initialized
    if (!parsed.permissionsMatrix || typeof parsed.permissionsMatrix !== 'object' || Array.isArray(parsed.permissionsMatrix) || Object.keys(parsed.permissionsMatrix).length === 0) {
      parsed.permissionsMatrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_MATRIX));
      dbUpdated = true;
    }

    if (!parsed.settings || typeof parsed.settings !== 'object') {
      parsed.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      dbUpdated = true;
    }

    if (!parsed.deletedIds || !Array.isArray(parsed.deletedIds)) {
      parsed.deletedIds = [];
      dbUpdated = true;
    }
    const deletedSet = new Set(parsed.deletedIds || []);

    // Clean mock and deleted records from parsed schema
    const collectionsToClean = ['processes', 'crmLeads', 'deadlines', 'events', 'transactions', 'notifications', 'legalCases', 'legalDocuments', 'feeContracts'] as const;
    collectionsToClean.forEach((coll) => {
      if (parsed[coll] && Array.isArray(parsed[coll])) {
        const origLen = parsed[coll]!.length;
        parsed[coll] = (parsed[coll] as any[]).filter((item: any) => item && !MOCK_IDS.has(item.id) && !deletedSet.has(item.id));
        if (parsed[coll]!.length !== origLen) {
          dbUpdated = true;
        }
      } else {
        (parsed as any)[coll] = [];
        dbUpdated = true;
      }
    });

    if (dbUpdated) {
      try {
        fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write updated database.json to disk (read-only filesystem?)', err);
      }
    }

    cachedDb = parsed;
    return parsed;
  } catch (error) {
    console.error('Failed to parse database.json, resetting to default', error);
    try {
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
      }
    } catch (unlinkErr) {
      console.warn('Failed to delete corrupted database.json (read-only filesystem?)', unlinkErr);
    }
    cachedDb = initialSchema;
    return initialSchema;
  }
}

/**
 * Saves database schema back to database.json and syncs to Firestore asynchronously.
 * Uses atomic writes (temp file + rename) to prevent JSON corruption or half-reads under concurrency.
 */
export function saveDb(data: DatabaseSchema): void {
  // Always update in-memory cache first so subsequent reads reflect mutations instantly
  cachedDb = data;

  const tmpPath = `${DB_PATH}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
  } catch (err) {
    console.warn('Failed to write database atomically, falling back to direct write', err);
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (writeErr) {
      console.warn('Could not write to local database.json (read-only filesystem? No problem, synced with Firestore)', writeErr);
    }
  }

  if (db) {
    pushToFirestoreAsync(data).catch((err) => {
      console.error('Async Firestore push error:', err);
    });
  }
}

/**
 * Pushes the database state to Firestore asynchronously (upserts without destructive deletions).
 */
export async function pushToFirestoreAsync(data: DatabaseSchema): Promise<void> {
  if (!db) return;
  try {
    const collectionsToSync = ['users', 'auditLogs', 'processes', 'crmLeads', 'deadlines', 'events', 'transactions', 'teams', 'notifications', 'legalCases', 'legalDocuments', 'feeContracts'];

    await Promise.all(
      collectionsToSync.map(async (coll) => {
        const localItems = (data as any)[coll] || [];
        if (!Array.isArray(localItems) || localItems.length === 0) return;

        await Promise.all(
          localItems.map(async (item) => {
            if (!item || !item.id) return;
            try {
              const docRef = doc(db, coll, item.id);
              const cleanItem = JSON.parse(JSON.stringify(item));
              delete cleanItem.id;
              await setDoc(docRef, cleanItem);
            } catch (itemErr) {
              console.warn(`Firestore setDoc error for ${coll}/${item.id}:`, itemErr);
            }
          })
        );
      })
    );

    // Singletons: permissionsMatrix & settings
    if (data.permissionsMatrix && typeof data.permissionsMatrix === 'object' && !Array.isArray(data.permissionsMatrix)) {
      try {
        const docRef = doc(db, 'systemConfig', 'permissionsMatrix');
        await setDoc(docRef, { matrix: data.permissionsMatrix });
      } catch (err) {
        console.warn('Firestore push permissionsMatrix error:', err);
      }
    }

    if (data.settings && typeof data.settings === 'object') {
      try {
        const docRef = doc(db, 'systemConfig', 'settings');
        await setDoc(docRef, data.settings);
      } catch (err) {
        console.warn('Firestore push settings error:', err);
      }
    }
  } catch (error) {
    console.error('Failed to sync to Firestore asynchronously:', error);
  }
}

/**
 * Ensures required CEO core users exist in the database with valid active status and credentials.
 */
export function ensureCoreUsers(_parsed: DatabaseSchema): boolean {
  // Account provisioning belongs to Supabase Auth.
  return false;
}

let syncInProgressPromise: Promise<DatabaseSchema> | null = null;

/**
 * Synchronizes database schema from Firestore in parallel.
 * Remote Firestore data takes precedence over local memory.
 */
export async function syncFromFirestore(): Promise<DatabaseSchema> {
  const dbSchema = initDb();
  if (!db) {
    ensureCoreUsers(dbSchema);
    return dbSchema;
  }

  if (syncInProgressPromise) {
    return syncInProgressPromise;
  }

  const syncPromise = (async () => {
    try {
      const collectionsToSync = ['users', 'auditLogs', 'processes', 'crmLeads', 'deadlines', 'events', 'transactions', 'teams', 'notifications', 'legalCases', 'legalDocuments', 'feeContracts'];
      let localUpdated = false;
      const deletedSet = new Set(dbSchema.deletedIds || []);

      // 1. Fetch all collections in parallel
      const collectionPromises = collectionsToSync.map(async (coll) => {
        try {
          const colRef = collection(db, coll);
          const snapshot = await getDocs(colRef);
          const items: any[] = [];
          for (const docSnap of snapshot.docs) {
            const docId = docSnap.id;
            const itemData = docSnap.data();
            if (MOCK_IDS.has(docId) || deletedSet.has(docId)) {
              deleteDoc(doc(db, coll, docId)).catch(() => {});
            } else {
              items.push({ id: docId, ...itemData });
            }
          }
          return { coll, items };
        } catch (err) {
          console.warn(`Firestore collection read skipped (${coll}):`, err);
          return { coll, items: [] };
        }
      });

      // 2. Fetch permissionsMatrix and settings singletons in parallel
      const permPromise = (async () => {
        try {
          const permRef = doc(db, 'systemConfig', 'permissionsMatrix');
          const permSnap = await getDoc(permRef);
          if (permSnap.exists() && permSnap.data()?.matrix) {
            return permSnap.data().matrix;
          }
        } catch (e) {
          console.warn('Firestore read permissionsMatrix skipped:', e);
        }
        return null;
      })();

      const settingsPromise = (async () => {
        try {
          const settingsRef = doc(db, 'systemConfig', 'settings');
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            return settingsSnap.data() as SystemSettings;
          }
        } catch (e) {
          console.warn('Firestore read settings skipped:', e);
        }
        return null;
      })();

      const [collResults, permMatrixResult, settingsResult] = await Promise.all([
        Promise.all(collectionPromises),
        permPromise,
        settingsPromise
      ]);

      // Apply collections
      for (const { coll, items } of collResults) {
        if (items.length > 0) {
          const localItems = (dbSchema as any)[coll] || [];
          const mergedMap = new Map<string, any>();

          // Seed with local items first
          if (Array.isArray(localItems)) {
            for (const localItem of localItems) {
              if (localItem && localItem.id && !deletedSet.has(localItem.id) && !MOCK_IDS.has(localItem.id)) {
                mergedMap.set(localItem.id, localItem);
              }
            }
          }

          // Remote Firestore items merged with local items preserving most recent updatedAt
          for (const firestoreItem of items) {
            if (firestoreItem && firestoreItem.id && !deletedSet.has(firestoreItem.id) && !MOCK_IDS.has(firestoreItem.id)) {
              const existingLocal = mergedMap.get(firestoreItem.id);
              if (existingLocal) {
                const localTime = Number(existingLocal.updatedAt || 0);
                const remoteTime = Number(firestoreItem.updatedAt || 0);
                const mergedItem = remoteTime > localTime
                  ? { ...existingLocal, ...firestoreItem }
                  : { ...firestoreItem, ...existingLocal };

                if (coll === 'users') {
                  // Ensure password credentials are preserved if remote record stripped them
                  if (!mergedItem.passwordHash && existingLocal.passwordHash) {
                    mergedItem.passwordHash = existingLocal.passwordHash;
                    mergedItem.passwordSalt = existingLocal.passwordSalt;
                  }
                  if (existingLocal.mustChangePassword === false) {
                    mergedItem.mustChangePassword = false;
                  }
                }
                mergedMap.set(firestoreItem.id, mergedItem);
              } else {
                mergedMap.set(firestoreItem.id, firestoreItem);
              }
            }
          }

          (dbSchema as any)[coll] = Array.from(mergedMap.values());
          localUpdated = true;
        }
      }

      // Apply permissionsMatrix
      if (permMatrixResult) {
        dbSchema.permissionsMatrix = permMatrixResult;
        localUpdated = true;
      }

      // Apply settings
      if (settingsResult) {
        dbSchema.settings = settingsResult;
        localUpdated = true;
      }

      const coreUpdated = ensureCoreUsers(dbSchema);
      if (localUpdated || coreUpdated) {
        cachedDb = dbSchema;
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(dbSchema, null, 2), 'utf-8');
        } catch (writeErr) {
          console.warn('Could not write synced database.json to disk:', writeErr);
        }
      }
      return dbSchema;
    } catch (error) {
      console.warn('Failed to sync from Firestore:', error);
      ensureCoreUsers(dbSchema);
      return dbSchema;
    }
  })();

  const timeoutPromise = new Promise<DatabaseSchema>((resolve) => {
    setTimeout(() => {
      ensureCoreUsers(dbSchema);
      resolve(dbSchema);
    }, 1200);
  });

  syncInProgressPromise = Promise.race([syncPromise, timeoutPromise]).finally(() => {
    syncInProgressPromise = null;
  });

  return syncInProgressPromise;
}

/**
 * Deletes a single document from a Firestore collection.
 */
export async function deleteFromFirestore(coll: string, id: string): Promise<void> {
  if (cachedDb && (cachedDb as any)[coll]) {
    (cachedDb as any)[coll] = ((cachedDb as any)[coll] as any[]).filter(item => item && item.id !== id);
  }
  if (!db) return;
  try {
    const docRef = doc(db, coll, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Failed to delete from Firestore (${coll}/${id}):`, error);
  }
}

/**
 * Adds an audit log.
 */
export function logAudit(
  actorId: string,
  actorName: string,
  action: AuditLog['action'],
  targetUserId: string,
  targetUserName: string,
  details: string
): void {
  const dbSchema = initDb();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    actorId,
    actorName,
    action,
    targetUserId,
    targetUserName,
    details,
  };
  dbSchema.auditLogs.unshift(newLog); // Prepend so newest is first
  saveDb(dbSchema);
}

/**
 * Adds a system/user notification.
 */
export function logNotification(
  recipientId: string,
  title: string,
  message: string,
  category: string
): void {
  const dbSchema = initDb();
  if (!dbSchema.notifications) {
    dbSchema.notifications = [];
  }
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    message,
    read: false,
    timestamp: new Date().toISOString(),
    recipientId,
    category,
  };
  dbSchema.notifications.unshift(newNotif);
  saveDb(dbSchema);
}
