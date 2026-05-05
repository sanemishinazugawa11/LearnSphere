import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import YoutubeIframe from 'react-native-youtube-iframe';
import api from '../../src/api/client';
import { Theme } from '../../src/theme/color';

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
};

export default function LessonViewer() {
  const { id: lessonId, courseId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [parsedOptions, setParsedOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingQuiz, setIsCheckingQuiz] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      const { data: lessons } = await api.get(`/courses/${courseId}/lessons`);
      const currentLesson = lessons.find((l: any) => l.id === lessonId);
      setLesson(currentLesson);

      const { data: progressData } = await api.get(`/courses/${courseId}/progress`);
      if (progressData?.completed_lesson_ids?.includes(lessonId)) {
        setIsCompleted(true);
      }

      try {
        const { data: quizData } = await api.get(`/lessons/${lessonId}/quiz`);
        setQuiz(quizData);
        if (quizData?.options) {
          const opts = Array.isArray(quizData.options) ? quizData.options : JSON.parse(quizData.options);
          setParsedOptions(opts);
        }
      } catch (err) {
        setQuiz(null); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedAnswer) return;
    setIsCheckingQuiz(true);
    try {
      const { data } = await api.post(`/lessons/${lessonId}/quiz/attempt`, { answer: selectedAnswer });
      setQuizResult(data);
    } catch (error) {
      alert("Failed to submit quiz.");
    } finally {
      setIsCheckingQuiz(false);
    }
  };

  const handleMarkComplete = async () => {
    if (quiz && quizResult?.correct !== true) {
      alert("Please pass the quiz to complete this lesson!");
      return;
    }

    setIsCompleting(true);
    try {
      await api.post(`/lessons/${lessonId}/complete`);
      setIsCompleted(true);
      router.back(); 
    } catch (error) {
      alert("Failed to mark complete.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={Theme.colors.text} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Lesson Viewer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.lessonTitle}>{lesson?.title}</Text>

        {lesson?.video_url && getYoutubeId(lesson.video_url) && (
          <View style={styles.videoContainer}>
            <YoutubeIframe
              height={(width - 40) * (9 / 16)} 
              videoId={getYoutubeId(lesson.video_url)!}
              webViewStyle={{ backgroundColor: '#000' }}
            />
          </View>
        )}

        <View style={styles.markdownContainer}>
          <Markdown style={markdownStyles}>
            {lesson?.content || 'No content provided.'}
          </Markdown>
        </View>

        {quiz && (
          <View style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <View style={styles.quizIconBg}>
                <HelpCircle size={18} color={Theme.colors.text} strokeWidth={2.5} />
              </View>
              <Text style={styles.quizTitle}>Knowledge Check</Text>
            </View>
            
            <Text style={styles.quizQuestion}>{quiz.question}</Text>

            <View style={styles.optionsContainer}>
              {parsedOptions.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => setSelectedAnswer(opt)}
                    style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.submitQuizBtn, (!selectedAnswer || isCheckingQuiz) && styles.disabledBtn]} 
              onPress={handleQuizSubmit}
              disabled={!selectedAnswer || isCheckingQuiz}
            >
              {isCheckingQuiz ? <ActivityIndicator color={Theme.colors.card} /> : <Text style={styles.submitQuizText}>Submit Answer</Text>}
            </TouchableOpacity>

            {quizResult && (
              <View style={[styles.resultBox, quizResult.correct ? styles.resultCorrect : styles.resultWrong]}>
                <Text style={[styles.resultText, quizResult.correct ? styles.resultTextCorrect : styles.resultTextWrong]}>
                  {quizResult.message}
                </Text>
              </View>
            )}
          </View>
        )}

        {isCompleted ? (
          <View style={styles.completedBadge}>
            <CheckCircle2 color={Theme.colors.accent} size={20} strokeWidth={2.5} />
            <Text style={styles.completedText}>Lesson Completed</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.completeBtn, (quiz && quizResult?.correct !== true) && styles.disabledBtn]} 
            onPress={handleMarkComplete}
            disabled={quiz && quizResult?.correct !== true || isCompleting}
          >
            {isCompleting ? <ActivityIndicator color={Theme.colors.card} /> : (
              <>
                <CheckCircle2 color={Theme.colors.card} size={20} strokeWidth={2.5} />
                <Text style={styles.completeBtnText}>Mark Lesson Complete</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

// MODERN, STRUCTURAL MARKDOWN TYPOGRAPHY
const markdownStyles = {
  body: { color: '#3f3f46', fontSize: 16, lineHeight: 26, fontFamily: 'Manrope_500Medium' },
  heading1: { color: Theme.colors.text, fontSize: 32, fontFamily: 'Raleway_900Black', letterSpacing: -1, marginTop: 24, marginBottom: 12 },
  heading2: { color: Theme.colors.text, fontSize: 24, fontFamily: 'Raleway_800ExtraBold', letterSpacing: -0.5, marginTop: 20, marginBottom: 10 },
  paragraph: { marginBottom: 16 },
  strong: { color: Theme.colors.text, fontFamily: 'Manrope_800ExtraBold' },
  em: { fontStyle: 'italic' as const },
  code_inline: { backgroundColor: '#f4f4f5', color: Theme.colors.text, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', borderWidth: 1, borderColor: Theme.colors.border },
  code_block: { backgroundColor: '#f4f4f5', color: Theme.colors.text, padding: 16, borderRadius: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  blockquote: { borderLeftWidth: 4, borderLeftColor: Theme.colors.text, paddingLeft: 16, opacity: 0.9, backgroundColor: Theme.colors.background, paddingVertical: 8 },
  list_item: { marginBottom: 6 },
  bullet_list: { marginBottom: 16 },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, backgroundColor: Theme.colors.card },
  backBtn: { padding: 5 },
  headerTitle: { fontFamily: 'Raleway_900Black', color: Theme.colors.text, fontSize: 16, letterSpacing: -0.5 },
  scrollContent: { padding: 20, paddingBottom: 80 },
  lessonTitle: { fontFamily: 'Raleway_900Black', color: Theme.colors.text, fontSize: 36, letterSpacing: -1, marginBottom: 24, lineHeight: 40 },
  videoContainer: { borderRadius: 12, overflow: 'hidden', marginBottom: 24, backgroundColor: '#000', borderWidth: 1, borderColor: Theme.colors.border },
  markdownContainer: { marginBottom: 30 },
  
  quizCard: { backgroundColor: Theme.colors.card, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 30 },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingBottom: 12 },
  quizIconBg: { backgroundColor: '#f4f4f5', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border },
  quizTitle: { fontFamily: 'Raleway_900Black', color: Theme.colors.text, fontSize: 18, letterSpacing: -0.5 },
  quizQuestion: { fontFamily: 'Manrope_700Bold', color: Theme.colors.text, fontSize: 16, marginBottom: 20, lineHeight: 24 },
  optionsContainer: { gap: 10, marginBottom: 24 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.card },
  optionBtnSelected: { borderColor: Theme.colors.text, backgroundColor: Theme.colors.background },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Theme.colors.subtext, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: Theme.colors.text },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.colors.text },
  optionText: { fontFamily: 'Manrope_600SemiBold', color: Theme.colors.subtext, fontSize: 14, flex: 1 },
  optionTextSelected: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text },
  submitQuizBtn: { backgroundColor: Theme.colors.text, padding: 16, borderRadius: 10, alignItems: 'center' },
  submitQuizText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.card, fontSize: 14 },
  
  resultBox: { marginTop: 16, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  resultCorrect: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  resultWrong: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  resultText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 12 },
  resultTextCorrect: { color: '#059669' },
  resultTextWrong: { color: '#dc2626' },

  completeBtn: { flexDirection: 'row', backgroundColor: Theme.colors.accent, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10 },
  completeBtnText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.card, fontSize: 14 },
  disabledBtn: { opacity: 0.5 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#f0fdfa', borderRadius: 12, borderWidth: 1, borderColor: '#ccfbf1' },
  completedText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.accent, fontSize: 14 },
});