import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../api/client';

const Login: React.FC = () => {
  const [email, setEmail] = useState('alice@learnsphere.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setAuth = useStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { data: userData } = await api.get('/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      setAuth({ email, role: userData.role, id: userData.user_id }, data.token); 
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-1">Sign in</h2>
          <p className="text-zinc-500 text-sm font-medium">to continue to LearnSphere</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-900">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              className="w-full bg-white border border-zinc-300 px-3 py-2.5 rounded-lg text-zinc-900 placeholder-zinc-400 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all shadow-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-900">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                placeholder="••••••••"
                className="w-full bg-white border border-zinc-300 px-3 py-2.5 pr-10 rounded-lg text-zinc-900 placeholder-zinc-400 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 font-medium">
          No account? <Link to="/register" className="text-zinc-900 font-bold hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;