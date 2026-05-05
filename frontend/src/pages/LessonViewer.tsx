import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, HelpCircle, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../api/client";
import { Lesson } from "../types";

interface Quiz { id: string; question: string; options: string; }
interface CourseProgress { total_lessons: number; completed_lessons: number; percentage: number; completed_lesson_ids?: string[]; }

const getEmbedUrl = (url?: string) => {
  if (!url) return null;
  const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
};

const LessonViewer: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [parsedOptions, setParsedOptions] = useState<string[]>([]);
  const [progress, setProgress] = useState<CourseProgress>({ total_lessons: 0, completed_lessons: 0, percentage: 0 });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; message: string; } | null>(null);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCheckingQuiz, setIsCheckingQuiz] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);

  const getApiErrorMessage = (error: any, fallback: string) => error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;

  const loadLessonData = useCallback(async () => {
    if (!courseId || !lessonId) { setPageError("Invalid lesson route."); setIsLoading(false); return; }
    setIsLoading(true); setPageError(null); setAccessNotice(null); setQuizResult(null); setSelectedAnswer(null);

    try {
      const { data: lessons } = await api.get(`/courses/${courseId}/lessons`);
      const currentLesson = (lessons || []).find((l: Lesson) => l.id === lessonId) || null;
      setLesson(currentLesson);
      if (!currentLesson) setPageError("Lesson not found.");

      try {
        const { data: quizData } = await api.get(`/lessons/${lessonId}/quiz`);
        setQuiz(quizData);
        if (quizData?.options) {
          try {
            const options = Array.isArray(quizData.options) ? quizData.options : JSON.parse(quizData.options);
            setParsedOptions(Array.isArray(options) ? options : []);
          } catch { setParsedOptions([]); }
        } else { setParsedOptions([]); }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) { setQuiz(null); setParsedOptions([]); } 
        else if (status === 401 || status === 403) { setQuiz(null); setParsedOptions([]); setAccessNotice("Sign in to view the quiz and complete this lesson."); } 
        else { setQuiz(null); setParsedOptions([]); setPageError(getApiErrorMessage(err, "Failed to load quiz.")); }
      }

      try {
        const { data: progressData } = await api.get(`/courses/${courseId}/progress`);
        setProgress(progressData || { total_lessons: 0, completed_lessons: 0, percentage: 0 });
        setIsEnrolled(true);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setIsEnrolled(false); setProgress({ total_lessons: 0, completed_lessons: 0, percentage: 0 });
          setAccessNotice("Enroll in this course to track progress and mark lessons complete.");
        } else {
          setIsEnrolled(false); setPageError(getApiErrorMessage(err, "Failed to load course progress."));
        }
      }
    } catch (error: any) { setPageError(getApiErrorMessage(error, "Failed to load lesson data.")); } 
    finally { setIsLoading(false); }
  }, [courseId, lessonId]);

  useEffect(() => { loadLessonData(); }, [loadLessonData]);

  const isLessonCompleted = useMemo(() => progress.completed_lesson_ids && lessonId ? progress.completed_lesson_ids.includes(lessonId) : false, [progress.completed_lesson_ids, lessonId]);
  const canComplete = useMemo(() => isEnrolled && !isLessonCompleted && (!quiz || quizResult?.correct === true), [isEnrolled, isLessonCompleted, quiz, quizResult?.correct]);

  const handleMarkComplete = async () => {
    if (!lessonId || !courseId) return;
    if (!isEnrolled) { setPageError("You must enroll in this course before completing lessons."); return; }
    if (isLessonCompleted) return;
    if (quiz && quizResult?.correct !== true) { setPageError("Please pass the quiz before marking this lesson complete."); return; }

    setIsCompleting(true); setPageError(null);
    try {
      await api.post(`/lessons/${lessonId}/complete`);
      navigate(`/dashboard/course/${courseId}`);
    } catch (error: any) { setPageError(error?.response?.data?.error || "Failed to mark lesson complete."); } 
    finally { setIsCompleting(false); }
  };

  const handleQuizSubmit = async () => {
    if (!selectedAnswer || !lessonId) return;
    setIsCheckingQuiz(true); setPageError(null);
    try {
      const { data } = await api.post(`/lessons/${lessonId}/quiz/attempt`, { answer: selectedAnswer });
      setQuizResult(data);
    } catch (error: any) { setPageError(getApiErrorMessage(error, "Failed to submit quiz.")); } 
    finally { setIsCheckingQuiz(false); }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-zinc-900 animate-spin" /></div>;

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto py-24">
        <div className="border border-zinc-200 rounded-xl p-8 text-center bg-white shadow-sm">
          <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-zinc-400" />
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 mb-2">Lesson not found.</h2>
          <p className="text-zinc-500 font-medium mb-6 text-sm">The lesson may have been removed or the link is invalid.</p>
          <button onClick={() => navigate(`/dashboard/course/${courseId}`)} className="bg-zinc-900 text-white hover:bg-zinc-800 px-6 py-2.5 rounded-lg font-semibold transition-all">Back to Syllabus</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <button onClick={() => navigate(`/dashboard/course/${courseId}`)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-semibold transition-colors mb-10 text-sm">
        <ArrowLeft size={16} strokeWidth={2.5} /> Back to Syllabus
      </button>

      {pageError && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{pageError}</p>
            <button onClick={loadLessonData} className="mt-2 text-xs font-bold underline underline-offset-4">Retry</button>
          </div>
        </div>
      )}

      {isEnrolled && (
        <div className="mb-8 bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Progress</p>
            <p className="text-xl font-extrabold tracking-tight text-zinc-900">{(progress.percentage || 0).toFixed(0)}% Completed</p>
          </div>
          <div className="w-1/2 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
            <div className="h-full bg-teal-500 transition-all duration-1000 ease-out" style={{ width: `${progress.percentage || 0}%` }} />
          </div>
        </div>
      )}

      {/* TAILWIND PROSE TYPOGRAPHY UPDATE */}
      <article className="prose prose-zinc prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-teal-600 prose-a:font-semibold max-w-none mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-zinc-900 leading-[1.1] mb-8">{lesson.title}</h1>

        {lesson.video_url && getEmbedUrl(lesson.video_url) && (
          <div className="mb-10 rounded-xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-900 shadow-sm">
            <iframe className="w-full h-full" src={getEmbedUrl(lesson.video_url)!} title="Lesson Video" allowFullScreen></iframe>
          </div>
        )}

        <div className="text-base font-medium text-zinc-700 leading-relaxed"><ReactMarkdown>{lesson.content}</ReactMarkdown></div>
      </article>

      {quiz && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 mb-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center">
              <HelpCircle size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900">Knowledge Check</h3>
          </div>

          <p className="text-base font-bold text-zinc-800 mb-5">{quiz.question}</p>

          <div className="space-y-3 mb-6">
            {parsedOptions.map((option, idx) => (
              <label key={idx} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${selectedAnswer === option ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"}`}>
                <input type="radio" name="quiz-option" value={option} checked={selectedAnswer === option} onChange={() => setSelectedAnswer(option)} className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300 rounded-full" />
                <span className={`ml-3 text-sm ${selectedAnswer === option ? "text-zinc-900 font-bold" : "text-zinc-600 font-semibold"}`}>{option}</span>
              </label>
            ))}
          </div>

          <button onClick={handleQuizSubmit} disabled={!selectedAnswer || isCheckingQuiz} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 active:scale-[0.98]">
            {isCheckingQuiz ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Submit Answer"}
          </button>

          {quizResult && (
            <div className={`mt-5 p-4 rounded-lg text-center font-bold text-sm ${quizResult.correct ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {quizResult.message}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-8 border-t border-zinc-200">
        {isLessonCompleted ? (
          <div className="flex items-center gap-2 text-teal-700 font-bold bg-teal-50 px-5 py-2.5 rounded-lg border border-teal-200 text-sm">
            <CheckCircle2 size={18} /> Lesson Completed
          </div>
        ) : (
          <button onClick={handleMarkComplete} disabled={isCompleting || !canComplete} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm">
            {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Mark Lesson Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;