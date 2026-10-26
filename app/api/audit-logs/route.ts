import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/dbService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actorId = searchParams.get('actorId');

    if (!actorId) {
      return NextResponse.json(
        { error: 'Não autorizado. Identificação do ator ausente.' },
        { status: 401 }
      );
    }

    const db = initDb();

    // Verify actor exists and has CEO/Proprietário role
    const actor = db.users.find((u) => u.id === actorId);
    if (!actor || actor.role !== 'CEO/Proprietário') {
      return NextResponse.json(
        { error: 'Apenas sócios-diretores (CEO/Proprietário) possuem acesso ao histórico de auditoria.' },
        { status: 403 }
      );
    }

    return NextResponse.json(db.auditLogs);
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar registros de auditoria.' },
      { status: 500 }
    );
  }
}
