import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, Layers, Loader2, CheckCircle2, HelpCircle, Trash2, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { useStore } from '../store/useStore';
import { Course, Lesson } from '../types';

const CATEGORIES = [
  "Personal Finance", "Ancient Indian History", "Logic & Critical Thinking", "Psychology & Human Behavior",
  "Business & Entrepreneurship", "Data Science & Technology", "Creative Arts & Design",
  "Health & Wellness", "Digital Marketing", "Language & Communication"
];

const InstructorStudio: React.FC = () => {
  const { user } = useStore();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessons, setActiveLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState(CATEGORIES[0]);
  const [courseDesc, setCourseDesc] = useState('');
  const [courseImage, setCourseImage] = useState(''); 
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState(''); 
  const [lessonOrder, setLessonOrder] = useState('1');
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState('');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/courses');
      const filtered = (data || []).filter((c: Course) => c.instructor_id === user?.id);
      setMyCourses(filtered);
    } catch (error) { console.error("Failed to fetch courses", error); } finally { setIsLoading(false); }
  }, [user]);

  const fetchLessonsForCourse = useCallback(async (courseId: string) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/lessons`);
      setActiveLessons(data || []);
      setLessonOrder(((data?.length || 0) + 1).toString()); 
    } catch (error) { setActiveLessons([]); }
  }, []);

  useEffect(() => { if (user?.role === 'instructor') fetchMyCourses(); }, [user, fetchMyCourses]);
  useEffect(() => { if (activeCourseId) fetchLessonsForCourse(activeCourseId); }, [activeCourseId, fetchLessonsForCourse]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault(); setIsCreatingCourse(true); setSuccessMsg('');
    try {
      const { data } = await api.post('/courses', { title: courseTitle, category: courseCategory, description: courseDesc, image_url: courseImage });
      const newCourseId = data.id || data.ID; 
      setCourseTitle(''); setCourseDesc(''); setCourseImage(''); 
      await fetchMyCourses(); setActiveCourseId(newCourseId); setSuccessMsg('Course published successfully.');
    } catch (error: any) { alert(error.response?.data?.error || "Failed to create course"); } finally { setIsCreatingCourse(false); }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault(); if (!activeCourseId) return; setIsCreatingLesson(true); setSuccessMsg('');
    try {
      await api.post(`/courses/${activeCourseId}/lessons`, { title: lessonTitle, content: lessonContent, order_index: parseInt(lessonOrder), video_url: lessonVideo });
      setLessonTitle(''); setLessonContent(''); setLessonVideo(''); 
      await fetchLessonsForCourse(activeCourseId); setSuccessMsg('Lesson appended successfully.');
    } catch (error: any) { alert(error.response?.data?.error || "Failed to add lesson"); } finally { setIsCreatingLesson(false); }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault(); if (!quizLessonId) return; setIsCreatingQuiz(true); setSuccessMsg('');
    try {
      await api.post(`/lessons/${quizLessonId}/quiz`, { question: quizQuestion, options: quizOptions.split(',').map(s => s.trim()), correct_answer: quizAnswer.trim() });
      setQuizLessonId(null); setQuizQuestion(''); setQuizOptions(''); setQuizAnswer(''); setSuccessMsg('Knowledge check attached.');
    } catch (error: any) { alert(error.response?.data?.error || "Failed to add quiz. Maybe one already exists?"); } finally { setIsCreatingQuiz(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Delete entire course? This cannot be undone.")) return;
    try { await api.delete(`/courses/${id}`); setMyCourses(myCourses.filter(c => c.id !== id)); setActiveCourseId(null); setSuccessMsg('Course deleted.'); } catch (error: any) { alert("Failed to delete course."); }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    try { await api.delete(`/lessons/${id}`); setActiveLessons(activeLessons.filter(l => l.id !== id)); setSuccessMsg('Lesson deleted.'); } catch (error: any) { alert("Failed to delete lesson."); }
  };

  const handleDeleteQuiz = async (lessonId: string) => {
    if (!window.confirm("Remove quiz?")) return;
    try { await api.delete(`/lessons/${lessonId}/quiz`); setSuccessMsg('Quiz removed.'); } catch (error: any) { alert("Failed to delete quiz."); }
  };

  if (user?.role !== 'instructor') {
    return (
      <div className="text-center py-32 bg-white rounded-2xl border border-zinc-200 max-w-md mx-auto shadow-sm mt-12">
        <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Access Denied</h2>
        <p className="text-zinc-500 mt-2 font-medium text-sm">Instructor privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="md:col-span-4 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Studio</h2>
          <p className="text-zinc-500 font-medium text-sm">Manage curriculum</p>
        </div>

        <button 
          onClick={() => { setActiveCourseId(null); setSuccessMsg(''); }}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-all text-sm font-bold ${!activeCourseId ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900'}`}
        >
          <Plus size={16} strokeWidth={2.5} /> New Course
        </button>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Your Courses</p>
          {isLoading ? (
            <Loader2 className="animate-spin text-zinc-400 mx-auto mt-4" />
          ) : myCourses.length === 0 ? (
            <p className="text-xs text-zinc-500 font-medium bg-zinc-50 border border-zinc-100 p-3 rounded-lg">No courses found.</p>
          ) : (
            myCourses.map(course => (
              <button
                key={course.id}
                onClick={() => { setActiveCourseId(course.id); setSuccessMsg(''); setQuizLessonId(null); }}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all min-w-0 ${activeCourseId === course.id ? 'border-zinc-900 bg-zinc-50 text-zinc-900 shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'}`}
              >
                <BookOpen size={16} className="mt-0.5 shrink-0" strokeWidth={2} />
                <div className="overflow-hidden flex-1">
                  <p className="font-bold text-sm truncate leading-tight w-full">{course.title}</p>
                  <p className="text-[11px] font-semibold text-zinc-500 mt-0.5 truncate">{course.category}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="md:col-span-8 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {!activeCourseId ? (
          <form onSubmit={handleCreateCourse} className="space-y-5 max-w-2xl">
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-4">
               Draft New Course
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Course Title</label>
              <input required type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 text-sm font-medium placeholder-zinc-400" placeholder="e.g. Advanced System Design" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
              <select value={courseCategory} onChange={e => setCourseCategory(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 text-sm font-medium">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Banner URL (Optional)</label>
              <input type="url" value={courseImage} onChange={e => setCourseImage(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 text-sm font-medium placeholder-zinc-400" placeholder="https://..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
              <textarea required rows={4} value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-900 text-sm font-medium placeholder-zinc-400" placeholder="Course syllabus and outcomes..." />
            </div>

            <button type="submit" disabled={isCreatingCourse} className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-70 active:scale-95">
              {isCreatingCourse ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Publish Course'}
            </button>
          </form>

        ) : (
          <div className="space-y-8">
            <div className="border-b border-zinc-200 pb-5 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1">Editing</p>
                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 break-words">{myCourses.find(c => c.id === activeCourseId)?.title}</h3>
              </div>
              <button onClick={() => handleDeleteCourse(activeCourseId)} className="flex items-center justify-center gap-1.5 text-red-600 bg-white hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-md font-bold text-xs transition-all shrink-0" title="Delete Course">
                <Trash2 size={14} /> <span>Delete</span>
              </button>
            </div>

            {activeLessons.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                  <Layers size={16} /> Lessons
                </h4>
                {activeLessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="font-bold text-zinc-900 text-sm truncate">
                        <span className="text-zinc-400 mr-2 shrink-0">{idx + 1}.</span>{lesson.title}
                      </p>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button onClick={() => setQuizLessonId(lesson.id)} className="text-xs font-bold bg-white border border-zinc-300 px-2.5 py-1.5 rounded text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-all flex items-center gap-1">
                          <Plus size={12} /> Quiz
                        </button>
                        <button onClick={() => handleDeleteQuiz(lesson.id)} className="text-xs font-bold bg-white border border-zinc-300 px-2.5 py-1.5 rounded text-zinc-500 hover:bg-zinc-100 transition-all">
                          - Quiz
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson.id)} className="text-xs font-bold bg-white border border-red-200 px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 transition-all flex items-center">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {quizLessonId === lesson.id && (
                      <form onSubmit={handleCreateQuiz} className="mt-2 p-4 bg-white border border-zinc-200 rounded-lg space-y-3 shadow-sm">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <HelpCircle size={14} /> Knowledge Check
                        </h5>
                        <input required type="text" value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)} className="w-full bg-white border border-zinc-300 p-2 rounded text-sm font-medium outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 placeholder-zinc-400" placeholder="Question text..." />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input required type="text" value={quizOptions} onChange={e => setQuizOptions(e.target.value)} className="w-full bg-white border border-zinc-300 p-2 rounded text-sm font-medium outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 placeholder-zinc-400" placeholder="Options (e.g. Yes, No)" />
                          <input required type="text" value={quizAnswer} onChange={e => setQuizAnswer(e.target.value)} className="w-full bg-white border border-zinc-300 p-2 rounded text-sm font-medium outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 placeholder-zinc-400" placeholder="Exact Answer" />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="submit" disabled={isCreatingQuiz} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-70">
                            {isCreatingQuiz ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" onClick={() => setQuizLessonId(null)} className="text-zinc-500 hover:text-zinc-900 text-xs font-bold transition-colors px-2">Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateLesson} className="pt-6 border-t border-zinc-200 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <Plus size={16} /> Draft Lesson
              </h4>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Title</label>
                  <input required type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 text-sm font-medium placeholder-zinc-400" placeholder="Lesson Name" />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Order</label>
                  <input required type="number" min="1" value={lessonOrder} onChange={e => setLessonOrder(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 text-sm font-medium" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Video URL (Optional)</label>
                <input type="url" value={lessonVideo} onChange={e => setLessonVideo(e.target.value)} className="w-full bg-white border border-zinc-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 text-sm font-medium placeholder-zinc-400" placeholder="https://youtube.com/..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">
                  <span>Markdown Content</span>
                </label>
                <textarea required rows={8} value={lessonContent} onChange={e => setLessonContent(e.target.value)} className="w-full font-mono text-xs bg-zinc-50 border border-zinc-300 p-3 rounded-lg outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 leading-relaxed placeholder-zinc-400" placeholder="## Welcome&#10;&#10;Content here..." />
              </div>

              <button type="submit" disabled={isCreatingLesson} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-70 active:scale-95">
                {isCreatingLesson ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Save Lesson'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorStudio;