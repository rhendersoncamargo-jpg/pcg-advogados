'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, User, ArrowRight, Eye, EyeOff, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: { 
    id: string; 
    name: string; 
    username: string; 
    email: string; 
    role: string; 
    mfa: boolean; 
    lastAccess: string; 
    mustChangePassword: boolean; 
  }) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password change states
  const [mustChangeScreen, setMustChangeScreen] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Por favor, preencha o login do usuário.');
      return;
    }
    if (!password) {
      setError('Por favor, informe a senha.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        setError(data.error || 'Erro ao realizar login.');
        setLoading(false);
        return;
      }

      if (data.user?.mustChangePassword) {
        // Direct the user to change password screen
        setTempUserId(data.user.id);
        setMustChangeScreen(true);
        setLoading(false);
      } else if (data.user) {
        // Success
        onLogin(data.user);
      } else {
        setError('Resposta inválida do servidor.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    if (newPassword === 'PCG123456') {
      setError('Sua nova senha deve ser diferente da senha padrão inicial.');
      return;
    }

    setError('');
    setChangeLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId, newPassword }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        setError(data.error || 'Erro ao alterar a senha.');
        setChangeLoading(false);
        return;
      }

      // Success
      alert('Senha atualizada com sucesso! Bem-vindo ao PCG.OS.');
      if (data.user) {
        onLogin(data.user);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar nova senha para o servidor.');
      setChangeLoading(false);
    }
  };

  return (
    <div id="login-screen" className="min-h-screen flex flex-col md:flex-row bg-[#f8f9ff]">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 bg-[#0d2f43] text-white flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2f43] via-[#0b2839] to-[#061823] opacity-90 z-0" />
        
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#3b82f6] mb-8">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7h20L12 2zm0 18l10-5H2l10 5zM2 9v5h20V9H2zm3 1h2v3H5v-3zm5 0h2v3h-2v-3zm5 0h2v3h-2v-3zm5 0h2v3h-2v-3z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">PCG.OS</h1>
          <p className="font-display text-lg md:text-xl font-medium text-blue-200">PCG - Operating System</p>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mt-4">
            Gestão jurídica, operacional e estratégica do PCG – Paiva Camargo &amp; Godoy. Uma plataforma centralizada para excelência em advocacia corporativa.
          </p>
          
          <div className="w-16 h-0.5 bg-slate-500/50 my-8" />
          <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Legal Intelligence System</span>
        </div>


      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-6"
        >
          {!mustChangeScreen ? (
            <>
              <div>
                <h2 className="font-display text-2xl font-bold text-[#0d2f43] mb-1">Acesso ao PCG.OS</h2>
                <p className="text-sm text-slate-500">Informe suas credenciais para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#0d2f43] uppercase tracking-wider">Login de Usuário</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-[#121c2a] focus:ring-2 focus:ring-[#0d2f43]/20 focus:border-[#0d2f43] transition-all outline-none"
                      placeholder="Informe seu login de usuário"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#0d2f43] uppercase tracking-wider">Senha</label>
                    <a 
                      href="#" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        alert('Por favor, solicite a redefinição de senha ao Superadministrador do escritório.'); 
                      }} 
                      className="text-xs font-semibold text-slate-500 hover:text-[#0d2f43] transition-colors"
                    >
                      Esqueci minha senha
                    </a>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-[#121c2a] focus:ring-2 focus:ring-[#0d2f43]/20 focus:border-[#0d2f43] transition-all outline-none"
                      placeholder="Informe sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0d2f43]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-slate-300 text-[#0d2f43] focus:ring-[#0d2f43]"
                  />
                  <label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                    Manter conectado neste dispositivo
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0d2f43] hover:bg-[#0b2839] text-white py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // Change Password First Login Screen
            <>
              <div>
                <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 font-extrabold rounded text-[9px] uppercase tracking-wider mb-2">
                  Primeiro Acesso Obrigatório
                </span>
                <h2 className="font-display text-2xl font-bold text-[#0d2f43] mb-1">Atualizar Senha Inicial</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para garantir a segurança das informações do escritório, você deve substituir a senha padrão inicial <strong>PCG123456</strong> por uma senha pessoal segura.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#0d2f43] uppercase tracking-wider">Nova Senha Pessoal</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={changeLoading}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-[#121c2a] focus:ring-2 focus:ring-[#0d2f43]/20 focus:border-[#0d2f43] transition-all outline-none"
                      placeholder="Mínimo de 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0d2f43]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#0d2f43] uppercase tracking-wider">Confirmar Nova Senha</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={changeLoading}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-[#121c2a] focus:ring-2 focus:ring-[#0d2f43]/20 focus:border-[#0d2f43] transition-all outline-none"
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMustChangeScreen(false);
                      setError('');
                    }}
                    disabled={changeLoading}
                    className="w-1/3 border border-slate-200 text-[#0d2f43] py-3 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={changeLoading}
                    className="w-2/3 bg-[#0d2f43] hover:bg-[#0b2839] text-white py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                  >
                    {changeLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Atualizando...</span>
                      </>
                    ) : (
                      <>
                        <span>Definir e Entrar</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="h-px bg-slate-200 my-2" />

          <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-150">
            <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">Acesso Restrito:</span> Este é um sistema privado de gestão integrado da Paiva Camargo &amp; Godoy.
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-2">
            PCG.OS v3.0.0 • Paiva Camargo &amp; Godoy Advogados
          </p>
        </motion.div>
      </div>
    </div>
  );
}

