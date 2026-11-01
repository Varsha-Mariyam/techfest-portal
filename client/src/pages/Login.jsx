import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') { await register(form.name, form.email, form.password); setMode('login'); setError('Registered. Now log in.'); return; }
      await login(form.email, form.password);
      nav('/feedback');
    } catch (err) { setError(err.message); }
  };

  return (
    <>
      <h1>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      <form onSubmit={submit}>
        {mode === 'register' && (<><label htmlFor="n">Name</label><input id="n" value={form.name} onChange={set('name')} required /></>)}
        <label htmlFor="e">Email</label>
        <input id="e" type="email" value={form.email} onChange={set('email')} required />
        <label htmlFor="p">Password</label>
        <input id="p" type="password" minLength={6} value={form.password} onChange={set('password')} required />
        <button>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
      </button>
    </>
  );
}
