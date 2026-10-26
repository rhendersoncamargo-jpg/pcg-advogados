import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb, logAudit, DEFAULT_PERMISSIONS_MATRIX } from '@/lib/dbService';
import { db as dbFirestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    if (!db.permissionsMatrix || typeof db.permissionsMatrix !== 'object' || Array.isArray(db.permissionsMatrix) || Object.keys(db.permissionsMatrix).length === 0) {
      db.permissionsMatrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_MATRIX));
      saveDb(db);
    }
    return NextResponse.json(db.permissionsMatrix);
  } catch (error: any) {
    console.error('Fetch permissions matrix error:', error);
    return NextResponse.json(DEFAULT_PERMISSIONS_MATRIX);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    const body = await req.json();
    const actorId = body.actorId;
    const permissionsMatrix = body.permissionsMatrix || body.matrix;

    const actor = db.users.find(u => u.id === actorId);
    if (!actor || actor.role !== 'CEO/Proprietário') {
      return NextResponse.json(
        { error: 'Apenas sócios-diretores com o perfil "CEO/Proprietário" possuem permissão para gerenciar a matriz de acessos.' },
        { status: 403 }
      );
    }

    if (!permissionsMatrix) {
      return NextResponse.json({ error: 'Dados de matriz inválidos.' }, { status: 400 });
    }

    db.permissionsMatrix = permissionsMatrix;
    saveDb(db);

    if (dbFirestore) {
      try {
        const docRef = doc(dbFirestore, 'systemConfig', 'permissionsMatrix');
        await setDoc(docRef, { matrix: permissionsMatrix });
      } catch (fErr) {
        console.warn('Direct Firestore permissions write error:', fErr);
      }
    }

    logAudit(
      actor.id,
      actor.name,
      'UPDATE',
      'system',
      'Matriz de Permissões',
      'Atualizou permanentemente a matriz global de permissões e perfis de acesso.'
    );

    return NextResponse.json({ success: true, permissionsMatrix: db.permissionsMatrix });
  } catch (error: any) {
    console.error('Update permissions matrix error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar matriz.' }, { status: 500 });
  }
}
