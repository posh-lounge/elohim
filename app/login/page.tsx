'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useLogin } from '@/hooks/useSession';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const router = useRouter();
  const params = useSearchParams();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      router.push(params.get('next') || '/');
      router.refresh();
    } catch {
      // error state is already surfaced via login.isError below
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-surface border border-border rounded-xl p-7">
      <div className="font-display text-2xl font-bold mb-1">ELOHIM GROUP</div>
      <div className="font-mono text-[11px] text-faint tracking-widest mb-6">OPERATIONS CONSOLE</div>

      <label className="block text-xs font-mono uppercase tracking-wide text-faint mb-1.5">Email</label>
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@elohimgroup.rw"
        className="w-full mb-4 bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-sm text-primary outline-none"
      />

      <label className="block text-xs font-mono uppercase tracking-wide text-faint mb-1.5">Password</label>
      <input
        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-5 bg-surface-alt border border-border rounded-lg px-3 py-2.5 text-sm text-primary outline-none"
      />

      {login.isError && (
        <div className="mb-4 text-xs text-danger">{(login.error as Error).message}</div>
      )}

      <button
        type="submit" disabled={login.isPending}
        className="w-full flex items-center justify-center gap-2 bg-gold text-[#1A1408] font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
      >
        <LogIn size={15} /> {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>

      
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
