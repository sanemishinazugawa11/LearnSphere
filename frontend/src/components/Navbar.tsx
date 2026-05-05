import React from 'react';
import { LogOut, BookOpen, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="cursor-pointer text-xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-1" 
          onClick={() => navigate('/')}
        >
          <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center">
             <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
          </div>
          Learn<span className="text-zinc-500">Sphere.</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold cursor-pointer border border-zinc-200 hover:border-zinc-300 transition-colors">
                {user.email?.charAt(0).toUpperCase()}
              </div>

              <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                <div className="bg-white rounded-xl shadow-xl border border-zinc-200 py-1 flex flex-col overflow-hidden">
                  
                  <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 mb-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{user.email}</p>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">{user.role}</p>
                  </div>

                  {user?.role === 'instructor' && (
                    <Link to="/dashboard/instructor" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors font-medium">
                      <Layers size={16} strokeWidth={2} />
                      Instructor Studio
                    </Link>
                  )}

                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors font-medium">
                    <BookOpen size={16} strokeWidth={2} />
                    Student Dashboard
                  </Link>
                  
                  <div className="h-px bg-zinc-100 my-1 mx-2"></div>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left font-medium"
                  >
                    <LogOut size={16} strokeWidth={2} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;