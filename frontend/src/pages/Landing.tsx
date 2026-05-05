import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Activity, Layers, ArrowRight, CheckCircle2, Code2, BarChart3, Shield, Zap, Globe2 } from 'lucide-react'; 
import { useStore } from '../store/useStore';

const GithubIcon = ({ size = 20 }) => ( <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg> );
const TwitterIcon = ({ size = 20 }) => ( <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg> );

const Landing: React.FC = () => {
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col">
      <main className="flex-1 relative">
        
        {/* Modern Dot Grid Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <section className="max-w-5xl mx-auto px-6 pt-24 pb-24 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-sm font-semibold mb-8 border border-zinc-200">
             LearnSphere 2.0 is live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-[1.1] text-zinc-900">
            Rapid learning, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">engineered for scale.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-10 leading-relaxed font-medium">
            A high-performance platform connecting experts with lifelong learners. Master complex subjects through curated paths, Markdown lessons, and interactive active-recall quizzes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              to={user ? "/dashboard" : "/login"}
              className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 px-8 py-4 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Start Learning'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {!user && (
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-lg font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
              >
                Become an Instructor
              </Link>
            )}
          </div>
        </section>

        <section className="bg-zinc-50 border-y border-zinc-200">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900">The Frictionless Framework.</h2>
              <p className="text-zinc-500 text-lg font-medium">We stripped away the noise so you can focus entirely on retention.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center mb-6 border border-zinc-200">
                  <BookOpen size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-zinc-900">1. Curated Paths</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">Browse our diverse catalog of expert-crafted courses. Each course is broken down into easily digestible, sequential markdown lessons.</p>
              </div>
              
              <div className="flex flex-col p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-6 border border-teal-100">
                  <Activity size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-zinc-900">2. Active Recall</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">Lessons feature built-in interactive quizzes. Prove your understanding before marking a lesson as complete to ensure true retention.</p>
              </div>

              <div className="flex flex-col p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-6 border border-zinc-800">
                  <Layers size={24} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-zinc-900">3. Visual Progress</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">Watch your progress bar fill up in real-time on your dashboard. Pick up exactly where you left off, across any device.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900">Built for speed and scale.</h2>
              <p className="text-zinc-500 text-lg font-medium">A technical foundation engineered for absolute performance.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[
                { icon: Code2, title: "Markdown Native", desc: "Write and read lessons in clean, beautiful Markdown. Code blocks and formatting render perfectly." },
                { icon: BarChart3, title: "Dynamic Progress", desc: "Our Go backend calculates your exact completion percentage in real-time, keeping you motivated." },
                { icon: Shield, title: "Role-Based Security", desc: "Strict JWT authentication ensures instructors and students only see what they are authorized to see." },
                { icon: Zap, title: "Lightning Fast", desc: "Built on a Go/PostgreSQL backend and a React/Vite frontend, navigating the platform is buttery smooth." },
                { icon: Activity, title: "Auto-Grading Engine", desc: "Instructors create quizzes with predefined answers; the backend automatically validates and grades attempts." },
                { icon: Globe2, title: "Learn Anywhere", desc: "Fully responsive design means you can read lessons and take quizzes on your phone, tablet, or desktop." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-700">
                    <feature.icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold tracking-tight text-zinc-900 mb-1">{feature.title}</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zinc-200 pt-8">
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 bg-zinc-900 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
               </div>
               <span className="font-extrabold tracking-tight text-zinc-900">LearnSphere.</span>
            </div>
            
            <div className="flex items-center gap-6 text-zinc-400">
              <a href="#" className="hover:text-zinc-900 transition-colors"><TwitterIcon size={20} /></a>
              <a href="#" className="hover:text-zinc-900 transition-colors"><GithubIcon size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;