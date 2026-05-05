import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, AlertCircle, CheckCircle2, ArrowLeft, Trash2, BookOpen, Layers, HelpCircle } from 'lucide-react-native';
import api from '../../src/api/client';
import { Theme } from '../../src/theme/color';

const CATEGORIES = [
  "Personal Finance", "Ancient Indian History", "Logic & Critical Thinking", 
  "Psychology & Human Behavior", "Business & Entrepreneurship", 
  "Data Science & Technology", "Creative Arts & Design", 
  "Health & Wellness", "Digital Marketing", "Language & Communication"
];

export default function Studio() {
  const insets = useSafeAreaInsets();
  
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessons, setActiveLessons] = useState<any[]>([]);

  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState(CATEGORIES[0]);
  const [courseDesc, setCourseDesc] = useState('');
  const [courseImage, setCourseImage] = useState('');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState('');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  useEffect(() => {
    checkRoleAndFetch();
  }, []);

  const checkRoleAndFetch = async () => {
    try {
      const { data } = await api.get('/me');
      setRole(data.role);
      setUserId(data.user_id);
      
      if (data.role === 'instructor') {
        const { data: allCourses } = await api.get('/courses');
        setMyCourses((allCourses || []).filter((c: any) => c.instructor_id === data.user_id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessonsForCourse = async (courseId: string) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/lessons`);
      setActiveLessons(data || []);
      setLessonOrder(((data?.length || 0) + 1).toString());
    } catch (error) {
      setActiveLessons([]);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateCourse = async () => {
    if (!courseTitle || !courseDesc) { alert("Title and Description required"); return; }
    setIsCreatingCourse(true);
    try {
      const { data } = await api.post('/courses', {
        title: courseTitle, category: courseCategory, description: courseDesc, image_url: courseImage
      });
      showSuccess('Course created!');
      setCourseTitle(''); setCourseDesc(''); setCourseImage('');
      
      const { data: allCourses } = await api.get('/courses');
      setMyCourses((allCourses || []).filter((c: any) => c.instructor_id === userId));
      
      setActiveCourseId(data.id || data.ID);
      fetchLessonsForCourse(data.id || data.ID);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create course");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!activeCourseId || !lessonTitle || !lessonContent) { alert("Title and Content required"); return; }
    setIsCreatingLesson(true);
    try {
      await api.post(`/courses/${activeCourseId}/lessons`, {
        title: lessonTitle, content: lessonContent, order_index: parseInt(lessonOrder), video_url: lessonVideo
      });
      showSuccess('Lesson published!');
      setLessonTitle(''); setLessonContent(''); setLessonVideo('');
      fetchLessonsForCourse(activeCourseId);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create lesson");
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizLessonId || !quizQuestion || !quizAnswer) return;
    setIsCreatingQuiz(true);
    try {
      await api.post(`/lessons/${quizLessonId}/quiz`, {
        question: quizQuestion,
        options: quizOptions.split(',').map(s => s.trim()),
        correct_answer: quizAnswer.trim()
      });
      showSuccess('Quiz attached!');
      setQuizLessonId(null); setQuizQuestion(''); setQuizOptions(''); setQuizAnswer('');
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to add quiz");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const performDelete = async () => {
      try {
        await api.delete(`/courses/${id}`);
        setMyCourses(myCourses.filter(c => c.id !== id));
        setActiveCourseId(null);
        showSuccess('Course deleted');
      } catch (error) { alert("Failed to delete course"); }
    };
    if (Platform.OS === 'web') { if (window.confirm("Are you sure you want to delete this entire course? This cannot be undone.")) { performDelete(); } } 
    else { Alert.alert("Delete Course", "Are you sure? This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: performDelete }]); }
  };

  const handleDeleteLesson = async (id: string) => {
    const performDelete = async () => {
      try {
        await api.delete(`/lessons/${id}`);
        setActiveLessons(activeLessons.filter(l => l.id !== id));
        showSuccess('Lesson deleted');
      } catch (error) { alert("Failed to delete lesson"); }
    };
    if (Platform.OS === 'web') { if (window.confirm("Are you sure you want to delete this lesson?")) { performDelete(); } } 
    else { Alert.alert("Delete Lesson", "Are you sure?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: performDelete }]); }
  };

  const handleDeleteQuiz = async (id: string) => {
    const performDelete = async () => {
      try {
        await api.delete(`/lessons/${id}/quiz`);
        showSuccess('Quiz removed');
      } catch (error) { alert("Failed to delete quiz"); }
    };
    if (Platform.OS === 'web') { if (window.confirm("Delete the quiz attached to this lesson?")) { performDelete(); } } 
    else { Alert.alert("Remove Quiz", "Delete the quiz attached to this lesson?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: performDelete }]); }
  };

  if (isLoading) return <View style={[styles.container, styles.center]}><ActivityIndicator color={Theme.colors.primary} size="large" /></View>;

  if (role !== 'instructor') {
    return (
      <View style={[styles.container, styles.center, { padding: 20 }]}>
        <AlertCircle color={Theme.colors.error} size={48} style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>Access Denied</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
        {!activeCourseId ? (
          <View>
            <Text style={styles.headerTitle}>Studio</Text>
            <Text style={styles.headerSubtitle}>Manage your curriculum.</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.backBtn} onPress={() => { setActiveCourseId(null); setQuizLessonId(null); }}>
            <ArrowLeft color={Theme.colors.text} size={20} />
            <Text style={styles.backBtnText}>Back to Studio</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {successMsg ? (
          <View style={styles.successBox}>
            <CheckCircle2 color={Theme.colors.success} size={16} />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {!activeCourseId ? (
          <View>
            <Text style={styles.sectionLabel}>Your Courses</Text>
            {myCourses.length === 0 ? (
               <Text style={styles.emptyText}>No courses created yet.</Text>
            ) : (
              myCourses.map(c => (
                <TouchableOpacity key={c.id} style={styles.courseItem} onPress={() => { setActiveCourseId(c.id); fetchLessonsForCourse(c.id); }}>
                  <BookOpen color={Theme.colors.text} size={18} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.courseItemTitle} numberOfLines={1}>{c.title}</Text>
                    <Text style={styles.courseItemCat} numberOfLines={1}>{c.category}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <View style={[styles.formCard, { marginTop: 30 }]}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Draft New Course</Text>
              </View>

              <Text style={styles.label}>Course Title</Text>
              <TextInput style={styles.input} placeholderTextColor={Theme.colors.subtext} value={courseTitle} onChangeText={setCourseTitle} />

              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setCourseCategory(cat)} style={[styles.chip, courseCategory === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, courseCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Banner Image URL (Optional)</Text>
              <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={Theme.colors.subtext} value={courseImage} onChangeText={setCourseImage} autoCapitalize="none" />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholderTextColor={Theme.colors.subtext} value={courseDesc} onChangeText={setCourseDesc} multiline numberOfLines={4} textAlignVertical="top" />

              <TouchableOpacity style={[styles.submitBtn, isCreatingCourse && { opacity: 0.7 }]} onPress={handleCreateCourse} disabled={isCreatingCourse}>
                {isCreatingCourse ? <ActivityIndicator color={Theme.colors.card} /> : <Text style={styles.submitText}>Publish Course</Text>}
              </TouchableOpacity>
            </View>
          </View>

        ) : (

          <View>
            <View style={styles.workspaceHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.workspaceTitle} numberOfLines={2}>{myCourses.find(c => c.id === activeCourseId)?.title}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteCourse(activeCourseId)}>
                <Trash2 color={Theme.colors.error} size={16} />
              </TouchableOpacity>
            </View>

            {activeLessons.length > 0 && (
              <View style={{ marginBottom: 30 }}>
                <Text style={styles.sectionLabel}>Current Lessons</Text>
                
                {activeLessons.map((lesson, idx) => (
                  <View key={lesson.id} style={styles.lessonItem}>
                    
                    <View style={styles.lessonItemTop}>
                      <Text style={styles.lessonItemTitle} numberOfLines={1}>
                        <Text style={{ color: Theme.colors.subtext }}>{idx + 1}. </Text>{lesson.title}
                      </Text>
                      <TouchableOpacity onPress={() => handleDeleteLesson(lesson.id)} style={{ padding: 5 }}>
                        <Trash2 color={Theme.colors.error} size={14} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.lessonItemActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => setQuizLessonId(lesson.id)}>
                        <Text style={styles.actionBtnText}>+ Quiz</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteQuiz(lesson.id)}>
                        <Text style={styles.actionBtnText}>- Quiz</Text>
                      </TouchableOpacity>
                    </View>

                    {quizLessonId === lesson.id && (
                      <View style={styles.quizForm}>
                        <Text style={styles.quizFormTitle}>Knowledge Check</Text>
                        <TextInput style={styles.quizInput} placeholder="Question..." placeholderTextColor={Theme.colors.subtext} value={quizQuestion} onChangeText={setQuizQuestion} />
                        <TextInput style={styles.quizInput} placeholder="Options (comma separated)" placeholderTextColor={Theme.colors.subtext} value={quizOptions} onChangeText={setQuizOptions} />
                        <TextInput style={styles.quizInput} placeholder="Exact Correct Answer" placeholderTextColor={Theme.colors.subtext} value={quizAnswer} onChangeText={setQuizAnswer} />
                        
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
                          <TouchableOpacity style={styles.quizSubmitBtn} onPress={handleCreateQuiz} disabled={isCreatingQuiz}>
                            <Text style={styles.quizSubmitText}>{isCreatingQuiz ? 'Saving...' : 'Save'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ padding: 8 }} onPress={() => setQuizLessonId(null)}>
                            <Text style={{ color: Theme.colors.subtext, fontFamily: 'Manrope_700Bold' }}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Draft New Lesson</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.label}>Lesson Title</Text>
                  <TextInput style={styles.input} placeholderTextColor={Theme.colors.subtext} value={lessonTitle} onChangeText={setLessonTitle} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Order</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={lessonOrder} onChangeText={setLessonOrder} />
                </View>
              </View>

              <Text style={styles.label}>YouTube Video URL (Optional)</Text>
              <TextInput style={styles.input} placeholder="https://youtube.com/..." placeholderTextColor={Theme.colors.subtext} value={lessonVideo} onChangeText={setLessonVideo} autoCapitalize="none" />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.label}>Markdown Content</Text>
              </View>
              <TextInput style={[styles.input, styles.textArea, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]} placeholder="## Welcome..." placeholderTextColor={Theme.colors.subtext} value={lessonContent} onChangeText={setLessonContent} multiline numberOfLines={8} textAlignVertical="top" />

              <TouchableOpacity style={[styles.submitBtn, isCreatingLesson && { opacity: 0.7 }]} onPress={handleCreateLesson} disabled={isCreatingLesson}>
                {isCreatingLesson ? <ActivityIndicator color={Theme.colors.card} /> : <Text style={styles.submitText}>Save Lesson</Text>}
              </TouchableOpacity>
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, backgroundColor: Theme.colors.card },
  headerTitle: { fontFamily: 'Raleway_900Black', fontSize: 24, color: Theme.colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: Theme.colors.subtext },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text, fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  errorTitle: { fontFamily: 'Raleway_900Black', fontSize: 24, color: Theme.colors.text, letterSpacing: -0.5 },
  
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#a7f3d0' },
  successText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.success, fontSize: 12 },

  sectionLabel: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.subtext, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  emptyText: { fontFamily: 'Manrope_500Medium', color: Theme.colors.subtext, marginBottom: 20, fontSize: 12 },
  
  courseItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Theme.colors.border },
  courseItemTitle: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text, fontSize: 14 },
  courseItemCat: { fontFamily: 'Manrope_700Bold', color: Theme.colors.subtext, fontSize: 10, marginTop: 2, textTransform: 'uppercase' },

  formCard: { backgroundColor: Theme.colors.card, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingBottom: 15, marginBottom: 15 },
  formTitle: { fontFamily: 'Raleway_900Black', fontSize: 18, color: Theme.colors.text, letterSpacing: -0.5 },
  
  label: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 15 },
  input: { fontFamily: 'Manrope_500Medium', backgroundColor: Theme.colors.background, padding: 12, borderRadius: 8, color: Theme.colors.text, fontSize: 14, borderWidth: 1, borderColor: Theme.colors.border },
  textArea: { height: 120 },
  
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: Theme.colors.card, borderWidth: 1, borderColor: Theme.colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  chipText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.subtext, fontSize: 12 },
  chipTextActive: { color: Theme.colors.card },

  submitBtn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.card, fontSize: 14 },

  workspaceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  workspaceTitle: { fontFamily: 'Raleway_900Black', fontSize: 20, color: Theme.colors.text, letterSpacing: -0.5 },
  deleteBtn: { backgroundColor: '#fef2f2', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#fecaca' },

  lessonItem: { backgroundColor: Theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  lessonItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lessonItemTitle: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text, fontSize: 14, flex: 1 },
  lessonItemActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.background },
  actionBtnText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text, fontSize: 10 },

  quizForm: { marginTop: 12, padding: 12, backgroundColor: Theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border },
  quizFormTitle: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text, marginBottom: 10, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  quizInput: { fontFamily: 'Manrope_500Medium', backgroundColor: Theme.colors.card, padding: 10, borderRadius: 6, color: Theme.colors.text, fontSize: 12, marginBottom: 8, borderWidth: 1, borderColor: Theme.colors.border },
  quizSubmitBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  quizSubmitText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.card, fontSize: 12 }
});