import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, StyleSheet, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, BookText, PlayCircle, Lock, CheckCircle2 } from "lucide-react-native";
import api from "../../src/api/client";
import { Theme } from "../../src/theme/color";

export default function CourseDetail() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const insets = useSafeAreaInsets(); 

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState({ total_lessons: 0, completed_lessons: 0, percentage: 0 });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => { fetchCourseData(); }, [id]);

  const fetchCourseData = async () => {
    try {
      const { data: allCourses } = await api.get("/courses");
      const foundCourse = allCourses.find((c: any) => c.id === id);
      if (foundCourse) setCourse(foundCourse);

      const { data: lessonData } = await api.get(`/courses/${id}/lessons`);
      setLessons(lessonData || []);

      try {
        const { data: progressData } = await api.get(`/courses/${id}/progress`);
        setProgress(progressData);
        setIsEnrolled(true);
      } catch (err) { setIsEnrolled(false); }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setIsEnrolled(true);
      fetchCourseData(); 
    } catch (error: any) {
      alert("Failed to enroll: " + (error.response?.data?.error || "Network error"));
    } finally { setIsEnrolling(false); }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.errorText}>Course not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Theme.colors.text, fontFamily: 'Manrope_800ExtraBold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={Theme.colors.text} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Overview</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {course.image_url ? (
          <Image source={{ uri: course.image_url }} style={styles.banner} />
        ) : (
          <View style={[styles.banner, styles.bannerPlaceholder]}>
            <BookText color={Theme.colors.border} size={48} />
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.badge}>
            <Text style={styles.category}>{course.category}</Text>
          </View>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>

          {!isEnrolled ? (
            <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll} disabled={isEnrolling} activeOpacity={0.9}>
              {isEnrolling ? <ActivityIndicator color={Theme.colors.card} /> : <Text style={styles.enrollText}>Enroll Now to Unlock</Text>}
            </TouchableOpacity>
          ) : (
            <View style={styles.progressCard}>
              <View>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressPercent}>
                  {progress.percentage ? progress.percentage.toFixed(0) : 0}% Completed
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress.percentage || 0}%` }]} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.syllabusSection}>
          <Text style={styles.sectionTitle}>Course Syllabus</Text>

          {lessons.length === 0 ? (
            <Text style={styles.emptyText}>No lessons published yet.</Text>
          ) : (
            lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.id}
                activeOpacity={isEnrolled ? 0.7 : 1}
                onPress={() => isEnrolled && router.push({ pathname: "/lesson/[id]", params: { id: lesson.id, courseId: id } })}
                style={[styles.lessonCard, !isEnrolled && styles.lessonCardLocked]}
              >
                <View style={styles.lessonLeft}>
                  <View style={[styles.lessonNumberBadge, !isEnrolled && { backgroundColor: Theme.colors.background }]}>
                    <Text style={styles.lessonNumber}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lessonTitle, !isEnrolled && styles.lessonTextLocked]} numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    <View style={styles.lessonMeta}>
                      {lesson.video_url ? <PlayCircle size={12} color={Theme.colors.subtext} /> : <BookText size={12} color={Theme.colors.subtext} />}
                      <Text style={styles.lessonMetaText}>{lesson.video_url ? "Video Lesson" : "Text Lesson"}</Text>
                    </View>
                  </View>
                </View>

                <View>
                  {!isEnrolled ? (
                    <Lock size={16} color={Theme.colors.subtext} />
                  ) : (
                    <CheckCircle2 size={20} color={Theme.colors.subtext} /> 
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 15, backgroundColor: Theme.colors.card, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { padding: 5 },
  headerTitle: { color: Theme.colors.text, fontSize: 16, fontFamily: 'Raleway_900Black', letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 50 },
  banner: { width: "100%", height: 200, backgroundColor: Theme.colors.background, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  bannerPlaceholder: { justifyContent: "center", alignItems: "center" },
  infoSection: { padding: 24, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, backgroundColor: Theme.colors.card },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 12 },
  category: { color: Theme.colors.subtext, fontSize: 10, fontFamily: 'Manrope_800ExtraBold', textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: Theme.colors.text, fontSize: 28, fontFamily: 'Raleway_900Black', letterSpacing: -1, marginBottom: 12 },
  description: { color: Theme.colors.subtext, fontSize: 15, lineHeight: 24, marginBottom: 24, fontFamily: 'Manrope_500Medium' },
  enrollButton: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: 8, alignItems: "center" },
  enrollText: { color: Theme.colors.card, fontFamily: 'Manrope_800ExtraBold', fontSize: 14 },
  progressCard: { backgroundColor: Theme.colors.card, padding: 20, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: Theme.colors.border },
  progressLabel: { color: Theme.colors.subtext, fontSize: 10, fontFamily: 'Manrope_800ExtraBold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  progressPercent: { color: Theme.colors.text, fontSize: 20, fontFamily: 'Raleway_900Black', letterSpacing: -0.5 },
  progressBarBg: { width: "40%", height: 6, backgroundColor: Theme.colors.background, borderRadius: 3, overflow: "hidden", borderWidth: 1, borderColor: Theme.colors.border },
  progressBarFill: { height: "100%", backgroundColor: Theme.colors.accent },
  syllabusSection: { padding: 24 },
  sectionTitle: { color: Theme.colors.text, fontSize: 18, fontFamily: 'Raleway_900Black', letterSpacing: -0.5, marginBottom: 16 },
  lessonCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  lessonCardLocked: { opacity: 0.7, backgroundColor: "transparent" },
  lessonLeft: { flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 },
  lessonNumberBadge: { width: 32, height: 32, borderRadius: 6, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.border, justifyContent: "center", alignItems: "center", marginRight: 12 },
  lessonNumber: { color: Theme.colors.text, fontFamily: 'Manrope_800ExtraBold', fontSize: 12 },
  lessonTitle: { color: Theme.colors.text, fontSize: 14, fontFamily: 'Manrope_800ExtraBold', marginBottom: 4 },
  lessonTextLocked: { color: Theme.colors.subtext },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  lessonMetaText: { color: Theme.colors.subtext, fontSize: 11, fontFamily: 'Manrope_600SemiBold' },
  emptyText: { color: Theme.colors.subtext, fontStyle: "italic", fontSize: 14, fontFamily: 'Manrope_500Medium' },
  errorText: { color: Theme.colors.text, fontSize: 18, fontFamily: 'Raleway_900Black' },
});