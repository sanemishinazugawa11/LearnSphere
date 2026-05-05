import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, GraduationCap, Presentation } from 'lucide-react';
import api from '../api/client';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await api.post('/auth/register', { name, email, password, role });
      navigate('/login'); 
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-1">Create an account</h2>
          <p className="text-zinc-500 text-sm font-medium">Start your journey on LearnSphere.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                role === 'student' 
                  ? 'border-zinc-900 bg-zinc-900 text-white' 
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <GraduationCap size={20} strokeWidth={2} />
              <span className="text-sm font-semibold">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('instructor')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                role === 'instructor' 
                  ? 'border-zinc-900 bg-zinc-900 text-white' 
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <Presentation size={20} strokeWidth={2} />
              <span className="text-sm font-semibold">Instructor</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-900">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-white border border-zinc-300 px-3 py-2.5 rounded-lg text-zinc-900 placeholder-zinc-400 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all shadow-sm"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-900">Email Address</label>
            <input 
              type="email" 
              required
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
            className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 font-medium">
          Already have an account? <Link to="/login" className="text-zinc-900 font-bold hover:underline">Sign in</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;