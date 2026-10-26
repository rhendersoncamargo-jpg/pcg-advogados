import { NextRequest, NextResponse } from 'next/server';
import { syncFromFirestore, saveDb } from '@/lib/dbService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    let notifs = db.notifications || [];
    if (userId) {
      notifs = notifs.filter(n => n.recipientId === 'all' || n.recipientId === userId);
    }
    
    return NextResponse.json(notifs);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Erro ao carregar notificações.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await syncFromFirestore();
    const { notificationId, markAll, userId } = await req.json();
    
    if (!db.notifications) db.notifications = [];
    
    if (markAll && userId) {
      db.notifications = db.notifications.map(n => {
        if (n.recipientId === 'all' || n.recipientId === userId) {
          return { ...n, read: true };
        }
        return n;
      });
    } else if (notificationId) {
      db.notifications = db.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
    }
    
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar notificações.' }, { status: 500 });
  }
}
