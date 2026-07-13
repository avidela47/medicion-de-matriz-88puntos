import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl: '/',
    });
    setLoading(false);
    if (!res || res.error) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }
    window.location.href = res.url || '/';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-8">
        <img src="/logo.png" alt="ITELSA" className="h-16 mb-6 mx-auto block" />
        <h1 className="font-disp font-semibold text-lg text-ink mb-1">Ingresar</h1>
        <p className="text-sm text-muted mb-6">Relevamiento Lumínico · ITELSA</p>

        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
          Usuario
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-lineStrong rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          autoFocus
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
          Contraseña
        </label>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-lineStrong rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {error && <p className="text-bad text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-md text-sm transition"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>

        
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
}