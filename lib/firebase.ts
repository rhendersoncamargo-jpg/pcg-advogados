import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let app: any = null;
let db: any = null;
let firebaseConfig: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };
    
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Always initialize Firestore if firebase-applet-config is present
    if (config.firestoreDatabaseId) {
      db = initializeFirestore(app, {}, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export function disableFirestore() {
  db = null;
}

export { app, db, firebaseConfig };
