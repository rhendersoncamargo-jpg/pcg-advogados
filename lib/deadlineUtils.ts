/**
 * Centralized utility helpers for Deadlines and Tasks (Controle de Prazos e Tarefas)
 */

export const isDeadlineDone = (status?: string, completed?: boolean): boolean => {
  if (completed) return true;
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return (
    s === 'cumprido' ||
    s === 'concluído' ||
    s === 'concluido' ||
    s === 'concluída' ||
    s === 'concluida' ||
    s === 'baixado' ||
    s === 'baixada'
  );
};

export const isDeadlineCanceled = (status?: string): boolean => {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return s === 'cancelado' || s === 'cancelada';
};

export const isDeadlinePending = (status?: string, completed?: boolean): boolean => {
  return !isDeadlineDone(status, completed) && !isDeadlineCanceled(status);
};

export const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim();
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  } else if (cleanStr.includes('-')) {
    const parts = cleanStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  return null;
};

export const calculateDaysDiff = (dateStr?: string): number => {
  if (!dateStr) return 0;
  if (dateStr.toLowerCase().includes('hoje')) return 0;

  const targetDate = parseLocalDate(dateStr);
  if (!targetDate || isNaN(targetDate.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 3600 * 24));
};

export const isDeadlineOverdue = (dueDate?: string, status?: string, completed?: boolean): boolean => {
  if (isDeadlineDone(status, completed) || isDeadlineCanceled(status)) return false;
  if (status === 'Vencido' || status === 'Atrasado' || status === 'Crítico') return true;
  if (!dueDate) return false;
  return calculateDaysDiff(dueDate) < 0;
};
