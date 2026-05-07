import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
      
      const payload = JSON.parse(atob(res.data.token.split('.')[1]));
      navigate(payload.role === 'admin' ? '/admin/dashboard' : '/crew/dashboard');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-marine-dark">
      <div className="glass-panel w-full max-w-md p-10">
        <div className="text-center mb-8">
          <Anchor className="text-marine-cyan mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-semibold text-white">Fathom Login</h1>
        </div>
        {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          <button type="submit" className="btn-primary mt-2">Access System</button>
        </form>

        <p className="text-center text-marine-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-marine-cyan hover:text-marine-cyan-hover">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
