'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar'
];

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach(scope => provider.addScope(scope));

const TOKEN_STORAGE_KEY = 'pcgos_gcal_token';
const USER_STORAGE_KEY = 'pcgos_gcal_user';

let cachedAccessToken: string | null = null;
if (typeof window !== 'undefined') {
  cachedAccessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
}

let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (typeof window !== 'undefined' && cachedAccessToken) {
    const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    let savedUser = null;
    if (savedUserStr) {
      try { savedUser = JSON.parse(savedUserStr); } catch (e) { /* ignore */ }
    }
    if (onAuthSuccess) {
      onAuthSuccess(savedUser || auth.currentUser, cachedAccessToken);
    }
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      const activeToken = cachedAccessToken || storedToken;
      if (activeToken) {
        cachedAccessToken = activeToken;
        if (onAuthSuccess) onAuthSuccess(user, activeToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      if (typeof window !== 'undefined' && !localStorage.getItem(TOKEN_STORAGE_KEY)) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Request OAuth token using Google Identity Services (GIS)
 */
export const requestGSIAuth = (clientId: string): Promise<{ accessToken: string; user: any }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Execução somente no navegador.'));
    }

    const initAndRequest = () => {
      if (!(window as any).google?.accounts?.oauth2) {
        return reject(new Error('Google Identity Services não está disponível.'));
      }

      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: CALENDAR_SCOPES.join(' '),
          callback: async (response: any) => {
            if (response.error) {
              return reject(new Error(response.error_description || response.error));
            }
            if (response.access_token) {
              let userInfo: any = {
                uid: 'gcal-' + Date.now(),
                displayName: 'Usuário Google Agenda',
                email: 'usuario.google@pcgos.app',
              };

              try {
                const uRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` }
                });
                if (uRes.ok) {
                  const uData = await uRes.json();
                  userInfo = {
                    uid: uData.sub || userInfo.uid,
                    displayName: uData.name || userInfo.displayName,
                    email: uData.email || userInfo.email,
                    photoURL: uData.picture || '',
                  };
                }
              } catch (e) {
                console.warn('Não foi possível buscar detalhes do usuário Google:', e);
              }

              resolve({ accessToken: response.access_token, user: userInfo });
            } else {
              reject(new Error('Nenhum token retornado pelo Google Identity Services.'));
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err?.message || 'Erro no popup de autorização do Google.'));
          }
        });

        client.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        reject(err);
      }
    };

    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initAndRequest, 100);
      };
      script.onerror = () => {
        reject(new Error('Falha ao carregar o script do Google Identity Services.'));
      };
      document.head.appendChild(script);
    } else if ((window as any).google?.accounts?.oauth2) {
      initAndRequest();
    } else {
      script.addEventListener('load', () => setTimeout(initAndRequest, 100));
    }
  });
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    
    // Step 1: Try Firebase Auth signInWithPopup
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        const userObj = {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
        }
        return { user: result.user, accessToken: cachedAccessToken };
      }
    } catch (firebaseErr: any) {
      console.warn('Tentativa padrão do Firebase Auth retornou erro:', firebaseErr?.code || firebaseErr?.message);
      
      const isDomainErr =
        firebaseErr?.code === 'auth/unauthorized-domain' ||
        firebaseErr?.message?.includes('unauthorized-domain') ||
        firebaseErr?.message?.includes('unauthorized domain');

      const clientId = firebaseConfigJson.oAuthClientId || '32595710650-osk304ea5i1t3q51pajs67i0m7n5vff4.apps.googleusercontent.com';

      // Step 2: Fallback to Google Identity Services (GIS)
      try {
        console.log('Iniciando autenticação fallback via Google Identity Services (GIS)...');
        const gisRes = await requestGSIAuth(clientId);
        cachedAccessToken = gisRes.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(gisRes.user));
        }
        return { user: gisRes.user, accessToken: cachedAccessToken };
      } catch (gisErr: any) {
        console.error('Fallback GIS também falhou:', gisErr);

        if (isDomainErr) {
          const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'pcg-os.vercel.app';
          throw new Error(`UNAUTHORIZED_DOMAIN:${currentHost}:${gisErr?.message || firebaseErr?.message}`);
        }

        throw new Error(gisErr?.message || firebaseErr?.message || 'Falha ao conectar com o Google Agenda.');
      }
    }

    throw new Error('Não foi possível obter o token de acesso da conta Google.');
  } finally {
    isSigningIn = false;
  }
};

export const saveManualToken = (accessToken: string, email?: string) => {
  cachedAccessToken = accessToken.trim();
  const user = {
    uid: 'manual-' + Date.now(),
    displayName: email ? `Google (${email})` : 'Conta Google Vinculada',
    email: email || 'usuario.google@pcgos.app',
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  return { user, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken && typeof window !== 'undefined') {
    cachedAccessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Erro ao sair do Firebase Auth:', e);
  }
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

