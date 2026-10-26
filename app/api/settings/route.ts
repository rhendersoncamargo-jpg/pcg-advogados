import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb, logAudit, DEFAULT_SETTINGS, SystemSettings } from '@/lib/dbService';
import { db as dbFirestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await syncFromFirestore();
    return NextResponse.json(db.settings || DEFAULT_SETTINGS);
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Erro ao carregar configurações.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    const body = await req.json();
    const { actorId, officeData, securitySettings, appearanceSettings } = body;

    const actor = db.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'CEO/Proprietário') {
      return NextResponse.json(
        { error: 'Apenas sócios-diretores com o perfil "CEO/Proprietário" possuem permissão para alterar configurações corporativas.' },
        { status: 403 }
      );
    }

    if (!db.settings) {
      db.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    const currentSettings = db.settings!;
    let auditDetails = [];

    if (officeData) {
      currentSettings.officeData = {
        ...currentSettings.officeData,
        ...officeData,
      };
      auditDetails.push('Atualizou os Dados do Escritório (Razão Social/CNPJ/Sede)');
    }

    if (securitySettings) {
      currentSettings.securitySettings = {
        ...currentSettings.securitySettings,
        ...securitySettings,
      };
      auditDetails.push('Atualizou Políticas de Segurança e LGPD (MFA/SSO/Timeout)');
    }

    if (appearanceSettings) {
      currentSettings.appearanceSettings = {
        ...currentSettings.appearanceSettings,
        ...appearanceSettings,
      };
      auditDetails.push('Atualizou Parâmetros de Aparência do Sistema');
    }

    saveDb(db);

    if (dbFirestore) {
      try {
        const docRef = doc(dbFirestore, 'systemConfig', 'settings');
        await setDoc(docRef, currentSettings);
      } catch (fErr) {
        console.warn('Direct Firestore settings write error:', fErr);
      }
    }

    if (auditDetails.length > 0) {
      logAudit(
        actor.id,
        actor.name,
        'UPDATE',
        'system',
        'Configurações do Sistema',
        auditDetails.join('; ')
      );
    }

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar configurações.' }, { status: 500 });
  }
}
