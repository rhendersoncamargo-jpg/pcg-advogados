import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb, logAudit } from '@/lib/dbService';
import { generateSalt, hashPassword } from '@/lib/cryptoHelper';
import { db as dbFirestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const db = await syncFromFirestore();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Generate new salt and hash the new password
    const newSalt = generateSalt();
    user.passwordSalt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);
    user.mustChangePassword = false;

    // Update lastAccess with 100% bulletproof fail-safe date/time parsing
    let timePart = '';
    try {
      const nowStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Campo_Grande' });
      const parts = nowStr.split(',');
      if (parts.length > 1) {
        timePart = parts[1].trim().substring(0, 5);
      } else {
        const timeMatch = nowStr.match(/\d{2}:\d{2}/);
        if (timeMatch) {
          timePart = timeMatch[0];
        }
      }
    } catch (e) {
      const d = new Date();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      timePart = `${hours}:${minutes}`;
    }
    user.lastAccess = `Hoje, ${timePart}`;
    
    // Add Audit Logs directly to db.auditLogs in memory to perform a single save operation
    const changeLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      action: 'CHANGE_PASSWORD' as const,
      targetUserId: user.id,
      targetUserName: user.name,
      details: 'Usuário atualizou a senha inicial com sucesso no primeiro acesso.',
    };

    const loginLog = {
      id: `log-${Date.now() + 1}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      action: 'LOGIN' as const,
      targetUserId: user.id,
      targetUserName: user.name,
      details: 'Usuário realizou login com sucesso após troca de senha.',
    };

    if (!db.auditLogs) {
      db.auditLogs = [];
    }
    db.auditLogs.unshift(loginLog);
    db.auditLogs.unshift(changeLog);

    saveDb(db);

    if (dbFirestore) {
      try {
        const cleanUser = JSON.parse(JSON.stringify(user));
        delete cleanUser.id;
        await setDoc(doc(dbFirestore, 'users', user.id), cleanUser);
      } catch (fErr) {
        console.warn('Direct Firestore user update error in change-password:', fErr);
      }
    }

    // Return safe user representation
    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      team: user.team,
      role: user.role,
      mfa: user.mfa,
      lastAccess: user.lastAccess,
      mustChangePassword: false,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: `Erro ao alterar senha do usuário: ${error?.message || error}` },
      { status: 500 }
    );
  }
}
