import React, { useState, useEffect } from 'react';
import { Search, Clock, BookText } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { Course } from '../types';
import api from '../api/client';

const CATEGORIES = [
  "All", "Personal Finance", "Ancient Indian History", "Logic & Critical Thinking",
  "Psychology & Human Behavior", "Business & Entrepreneurship", "Data Science & Technology",
  "Creative Arts & Design", "Health & Wellness", "Digital Marketing", "Language & Communication"
];

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (activeCategory !== "All") params.category = activeCategory;
        if (searchQuery.trim() !== '') params.search = searchQuery;

        const { data } = await api.get('/courses', { params });
        setCourses(data || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Course Catalog</h1>
          <p className="text-zinc-500 font-medium">Explore paths and master new skills.</p>
        </div>
        
        <div className="w-full md:w-80 space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={16} strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all shadow-sm text-zinc-900 placeholder-zinc-400"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              activeCategory === category 
                ? 'bg-zinc-900 text-white' 
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => navigate(`/dashboard/course/${course.id}`)}
              className="group bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
            >
              <div className="h-40 bg-zinc-100 border-b border-zinc-200 relative overflow-hidden">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookText className="text-zinc-300 w-12 h-12" />
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 border border-zinc-200 bg-zinc-50 px-2 py-1 rounded">
                    {course.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2 leading-tight">
                  {course.title}
                </h3>
                
                <p className="text-zinc-500 text-sm leading-relaxed font-medium mb-6 flex-1 line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 pt-4 border-t border-zinc-100">
                  <span className="flex items-center gap-1.5"><BookText size={14} strokeWidth={2} /> {course.lesson_count || 0} Lessons</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} strokeWidth={2} /> Self-paced</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border border-dashed border-zinc-300 rounded-xl bg-white">
          <p className="text-sm font-semibold text-zinc-500">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;