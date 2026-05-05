import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookText, CheckCircle2, Lock, ArrowLeft, Loader2, PlayCircle } from 'lucide-react';
import api from '../api/client';
import { Course, Lesson } from '../types';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState({ total_lessons: 0, completed_lessons: 0, percentage: 0 });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data: allCourses } = await api.get('/courses');
        const foundCourse = allCourses.find((c: Course) => c.id === courseId);
        if (foundCourse) setCourse(foundCourse);

        const { data: lessonData } = await api.get(`/courses/${courseId}/lessons`);
        setLessons(lessonData || []);

        try {
          const { data: progressData } = await api.get(`/courses/${courseId}/progress`);
          setProgress(progressData);
          setIsEnrolled(true); 
        } catch (err) {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Error fetching course data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
      try {
        const { data: progressData } = await api.get(`/courses/${courseId}/progress`);
        setProgress(progressData);
      } catch (progressErr) {}
    } catch (error: any) {
      alert(`Enrollment Error: ${error.response?.data?.error || "Failed to enroll"}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-zinc-900 animate-spin" /></div>;
  }

  if (!course) {
    return <div className="text-center py-32 text-zinc-500 font-bold text-xl tracking-tight">Course not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-semibold transition-colors mb-8 text-sm">
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Catalog
      </button>

      {course.image_url && (
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-10 border border-zinc-200">
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-12 border-b border-zinc-200 pb-10">
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-zinc-500 border border-zinc-200 bg-white px-2.5 py-1 rounded-md mb-4 inline-block">
          {course.category}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-zinc-900 mb-6 leading-tight">
          {course.title}
        </h1>
        <p className="text-lg text-zinc-600 font-medium leading-relaxed mb-8">
          {course.description}
        </p>

        {!isEnrolled ? (
          <button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="bg-zinc-900 text-white hover:bg-zinc-800 px-6 py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center gap-2 shadow-sm"
          >
            {isEnrolling ? <Loader2 size={18} className="animate-spin" /> : 'Enroll Now to Unlock'}
          </button>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Progress</p>
              <p className="text-2xl font-extrabold tracking-tight text-zinc-900">
                {progress.percentage ? progress.percentage.toFixed(0) : 0}% Completed
              </p>
            </div>
            <div className="w-1/2 h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
              <div 
                className="h-full bg-teal-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress.percentage || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 mb-6">Course Syllabus</h2>
        
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <p className="text-zinc-500 font-medium text-sm">No lessons published yet.</p>
          ) : (
            lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                onClick={() => isEnrolled && navigate(`/dashboard/course/${course.id}/lesson/${lesson.id}`)}
                className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                  isEnrolled 
                    ? 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm cursor-pointer' 
                    : 'border-zinc-100 bg-zinc-50 opacity-75'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm shrink-0 border ${isEnrolled ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-transparent border-zinc-200 text-zinc-400'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold tracking-tight ${isEnrolled ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 mt-1">
                      {lesson.video_url ? <PlayCircle size={14} /> : <BookText size={14} />} 
                      {lesson.video_url ? "Video Lesson" : "Text Lesson"}
                    </p>
                  </div>
                </div>

                <div>
                  {!isEnrolled ? (
                    <Lock size={18} className="text-zinc-400" />
                  ) : (
                    <CheckCircle2 size={20} className="text-zinc-300 hover:text-teal-500 transition-colors" /> 
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;