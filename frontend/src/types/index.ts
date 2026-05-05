export interface User {
  id?: string;
  name?: string;
  email: string;
  role: 'student' | 'instructor';
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  category: string;
  description: string;
  created_at: string;
  image_url?: string;     // Added for Banners
  lesson_count?: number;  // Added for Dashboard stats
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  video_url?: string;     // Added for YouTube/NPTEL embeds
}