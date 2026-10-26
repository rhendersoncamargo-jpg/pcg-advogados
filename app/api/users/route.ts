import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore } from '@/lib/dbService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    
    // Return all users safely without sensitive credential information
    const safeUsers = db.users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      team: u.team,
      role: u.role,
      mfa: u.mfa,
      lastAccess: u.lastAccess,
      mustChangePassword: u.mustChangePassword,
      status: u.status || (u.mfa ? 'Ativo' : 'Desativado'),
      phone: u.phone || '',
      cargo: u.cargo || u.role,
      additionalTeams: u.additionalTeams || [],
      legalAreas: u.legalAreas || [],
      customPermissions: u.customPermissions || [],
      startDate: u.startDate || '',
      endDate: u.endDate || '',
      allowedAccessHours: u.allowedAccessHours || '',
      adminNotes: u.adminNotes || ''
    }));

    return NextResponse.json(safeUsers);
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar usuários.' },
      { status: 500 }
    );
  }
}
