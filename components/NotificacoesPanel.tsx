'use client';

import React, { useState } from 'react';
import { Bell, Check, Clock, ShieldCheck, X, Volume2, Plus } from 'lucide-react';
import { SystemNotification } from '@/lib/mockData';

interface NotificacoesPanelProps {
  notifications: SystemNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onAddNotification: (title: string, message: string, type: 'prazo' | 'financeiro' | 'crm' | 'sistema') => void;
}

export default function NotificacoesPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onAddNotification
}: NotificacoesPanelProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'prazo' | 'financeiro' | 'crm' | 'sistema'>('sistema');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read && !n.deleted).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;
    onAddNotification(newTitle, newMessage, newType);
    setNewTitle('');
    setNewMessage('');
    setIsAdding(false);
    alert('Notificação de sistema disparada com sucesso!');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col justify-between text-slate-800 animate-slide-in">
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-200 bg-[#0d2f43] text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h2 className="font-display font-extrabold text-xs uppercase tracking-wider">Central de Notificações</h2>
            <span className="text-[10px] text-slate-300 font-semibold">{unreadCount} pendências não lidas</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white text-xs">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body List of Notifications */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
            <h3 className="font-display font-bold text-xs text-[#0d2f43]">Simular Alerta de Sistema</h3>
            
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Título</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Prazo vencendo amanhã"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Mensagem</label>
              <textarea
                required
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ex: A réplica do processo do João Delgado expira amanhã às 18:00h."
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Categoria</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#0d2f43]/15 font-semibold"
                >
                  <option value="sistema">Sistema</option>
                  <option value="prazo">Prazo / Alerta</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="crm">CRM</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-white rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-[10px] font-bold bg-[#0d2f43] text-white rounded-md hover:bg-[#0b2839]"
              >
                Disparar Alerta
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 bg-slate-50 border border-dashed border-slate-300 hover:border-[#0d2f43] rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Simular Nova Notificação</span>
          </button>
        )}

        <div className="flex flex-col gap-3">
          {notifications.filter(n => !n.deleted).length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold">Nenhuma notificação registrada.</p>
            </div>
          ) : (
            notifications.filter(n => !n.deleted).map(n => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex flex-col gap-2 relative ${
                  n.read 
                    ? 'bg-slate-50/50 border-slate-100 opacity-75' 
                    : 'bg-blue-50/20 border-blue-100 ring-1 ring-blue-500/5'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
                )}

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    n.type === 'prazo' ? 'bg-red-500' :
                    n.type === 'financeiro' ? 'bg-emerald-500' :
                    n.type === 'crm' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-[10px] font-black uppercase text-slate-400">{n.type}</span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">{n.message}</p>
                </div>

                <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!n.read && (
                    <button
                      onClick={() => onMarkAsRead(n.id)}
                      className="text-blue-600 hover:text-blue-800 font-black flex items-center gap-0.5 border border-blue-100 bg-white px-2 py-0.5 rounded-md transition-colors"
                    >
                      <Check className="w-3 h-3" /> Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer support text */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold">
        PCG.OS Realtime Notification Engine
      </div>
    </div>
  );
}
