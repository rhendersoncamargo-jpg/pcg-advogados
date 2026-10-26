'use client';

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
}

function parseCleanTime(timeStr?: string): { startHHMM: string; endHHMM: string } {
  if (!timeStr) return { startHHMM: '09:00', endHHMM: '10:00' };
  
  const matches = timeStr.match(/\d{1,2}:\d{2}/g);
  if (matches && matches.length >= 2) {
    const s = matches[0].padStart(5, '0');
    const e = matches[1].padStart(5, '0');
    return { startHHMM: s, endHHMM: e };
  } else if (matches && matches.length === 1) {
    const s = matches[0].padStart(5, '0');
    const [h, m] = s.split(':').map(Number);
    const endH = String((h + 1) % 24).padStart(2, '0');
    const e = `${endH}:${String(m).padStart(2, '0')}`;
    return { startHHMM: s, endHHMM: e };
  }
  
  return { startHHMM: '09:00', endHHMM: '10:00' };
}

/**
 * Fetch list of events from primary Google Calendar
 */
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEventItem[]> {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });

  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Sessão do Google expirada. Por favor, clique em "Conectar Google Agenda" novamente.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Erro ${res.status} ao buscar eventos do Google Calendar`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Create a new event on primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    startISO: string; // e.g. "2026-07-25T14:00:00-03:00"
    endISO: string;   // e.g. "2026-07-25T15:00:00-03:00"
    isAllDay?: boolean;
    dateString?: string; // YYYY-MM-DD
  }
): Promise<GoogleCalendarEventItem> {
  let body: any = {
    summary: event.summary,
    description: event.description,
    location: event.location,
  };

  if (event.isAllDay && event.dateString) {
    body.start = { date: event.dateString };
    body.end = { date: event.dateString };
  } else {
    body.start = { dateTime: event.startISO, timeZone: 'America/Sao_Paulo' };
    body.end = { dateTime: event.endISO, timeZone: 'America/Sao_Paulo' };
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Sessão do Google expirada. Por favor, re-conecte sua conta Google.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Erro ao criar evento no Google Calendar`);
  }

  return await res.json();
}

/**
 * Delete event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 410) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Erro ao remover evento do Google Calendar`);
  }

  return true;
}

/**
 * Export a list of system events/commitments to Google Calendar
 */
export async function exportEventsToGoogleCalendar(
  accessToken: string,
  eventsToExport: Array<{
    title: string;
    type?: string;
    date: string; // YYYY-MM-DD
    time?: string; // HH:MM
    location?: string;
    description?: string;
    processNumber?: string;
  }>
): Promise<{ successCount: number; errors: string[] }> {
  let successCount = 0;
  const errors: string[] = [];

  for (const item of eventsToExport) {
    try {
      const { startHHMM, endHHMM } = parseCleanTime(item.time);
      const startISO = `${item.date}T${startHHMM}:00-03:00`;
      const endISO = `${item.date}T${endHHMM}:00-03:00`;

      const summary = `[PCG.OS] ${item.title}${item.processNumber ? ` - Proc. ${item.processNumber}` : ''}`;
      const description = `${item.description || ''}\n\nSincronizado via PCG Advogados OS.`;

      await createGoogleCalendarEvent(accessToken, {
        summary,
        description,
        location: item.location,
        startISO,
        endISO,
      });

      successCount++;
    } catch (err: any) {
      errors.push(`${item.title}: ${err.message || 'Falha ao sincronizar'}`);
    }
  }

  return { successCount, errors };
}

/**
 * Export a single event to Google Calendar
 */
export async function exportSingleEventToGoogleCalendar(
  accessToken: string,
  event: {
    title: string;
    type?: string;
    date: string;
    start?: string;
    end?: string;
    location?: string;
    address?: string;
    description?: string;
    process?: string;
    responsible?: string;
  }
): Promise<GoogleCalendarEventItem> {
  const { startHHMM, endHHMM } = parseCleanTime(event.start ? `${event.start} - ${event.end || ''}` : '');
  const startISO = `${event.date}T${startHHMM}:00-03:00`;
  const endISO = `${event.date}T${endHHMM}:00-03:00`;

  const summary = `[PCG.OS] ${event.title}${event.process ? ` - Proc. ${event.process}` : ''}`;
  const description = `${event.description || ''}${event.responsible ? `\n\nResponsável: ${event.responsible}` : ''}\n\nSincronizado via PCG Advogados OS.`;

  return await createGoogleCalendarEvent(accessToken, {
    summary,
    description,
    location: event.location || event.address || '',
    startISO,
    endISO,
  });
}
