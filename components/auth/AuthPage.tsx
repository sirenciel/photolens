import React, { useState } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

interface AuthPageProps {
    onAuthSuccess?: (session?: AuthSession | null) => void;
}

type AuthMode = 'login' | 'register';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.Owner);
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [registerAvatarUrl, setRegisterAvatarUrl] = useState('');

    const handleModeToggle = (nextMode: AuthMode) => {
        setMode(nextMode);
        setErrorMessage(null);
        setInfoMessage(null);
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setInfoMessage(null);

        try {
            const session = await authService.signIn({
                email: loginEmail,
                password: loginPassword
            });
            onAuthSuccess?.(session);
        } catch (error: any) {
            setErrorMessage(error.message ?? 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            setErrorMessage('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);
        setInfoMessage(null);

        try {
            const result = await authService.signUp({
                name: registerName,
                email: registerEmail,
                password: registerPassword,
                role: registerRole,
                avatarUrl: registerAvatarUrl || undefined
            });

            if (result.needsEmailConfirmation) {
                setInfoMessage('Pendaftaran berhasil. Silakan cek email Anda untuk konfirmasi sebelum masuk.');
                handleModeToggle('login');
            } else {
                onAuthSuccess?.(result.session);
            }
        } catch (error: any) {
            setErrorMessage(error.message ?? 'Pendaftaran gagal. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
                <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-950 p-10">
                    <div className="text-cyan-400 font-semibold uppercase tracking-widest mb-4 text-sm">PhotoLens</div>
                    <h2 className="text-3xl font-bold text-white mb-4">Kelola Studio Lebih Mudah</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Gunakan PhotoLens untuk mengatur jadwal pemotretan, kelola klien, dan monitor keuangan
                        bisnis fotografi Anda dalam satu dashboard terpadu.
                    </p>
                </div>
                <div className="p-8 sm:p-10 bg-slate-900">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {mode === 'login' ? 'Masuk ke PhotoLens' : 'Buat Akun PhotoLens'}
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {mode === 'login'
                                    ? 'Masuk untuk mengelola booking dan workflow Anda.'
                                    : 'Lengkapi detail berikut untuk mulai menggunakan PhotoLens.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleModeToggle(mode === 'login' ? 'register' : 'login')}
                            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                            {mode === 'login' ? 'Daftar akun baru' : 'Saya sudah punya akun' }
                        </button>
                    </div>

                    {infoMessage && (
                        <div className="mb-6 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 text-sm px-4 py-3">
                            {infoMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 text-sm px-4 py-3">
                            {errorMessage}
                        </div>
                    )}

                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={loginEmail}
                                    onChange={(event) => setLoginEmail(event.target.value)}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                    placeholder="nama@perusahaan.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Kata Sandi
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(event) => setLoginPassword(event.target.value)}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label htmlFor="register-name" className="block text-sm font-medium text-slate-300 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="register-name"
                                    type="text"
                                    required
                                    value={registerName}
                                    onChange={(event) => setRegisterName(event.target.value)}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                    placeholder="Contoh: Alex Wolfe"
                                />
                            </div>
                            <div>
                                <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    id="register-email"
                                    type="email"
                                    required
                                    value={registerEmail}
                                    onChange={(event) => setRegisterEmail(event.target.value)}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                    placeholder="nama@perusahaan.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="register-role" className="block text-sm font-medium text-slate-300 mb-2">
                                    Peran di Tim
                                </label>
                                <select
                                    id="register-role"
                                    value={registerRole}
                                    onChange={(event) => setRegisterRole(event.target.value as UserRole)}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3"
                                >
                                    {Object.values(UserRole).map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-2">
                                        Kata Sandi
                                    </label>
                                    <input
                                        id="register-password"
                                        type="password"
                                        required
                                        value={registerPassword}
                                        onChange={(event) => setRegisterPassword(event.target.value)}
                                        className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="register-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                                        Konfirmasi Kata Sandi
                                    </label>
                                    <input
                                        id="register-confirm-password"
                                        type="password"
                                        required
                                        value={registerConfirmPassword}
                                        onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                                        className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                        placeholder="Ulangi kata sandi"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="register-avatar-url" className="block text-sm font-medium text-slate-300 mb-2">
                                    URL Avatar (opsional)
                                </label>
                                <input
                                    id="register-avatar-url"
                                    type="url"
                                    value={registerAvatarUrl}
                                    onChange={(event) => setRegisterAvatarUrl(event.target.value)}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-white px-4 py-3 placeholder:text-slate-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
