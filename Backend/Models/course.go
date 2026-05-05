package models

import "github.com/google/uuid"

type Course struct {
	ID           uuid.UUID `json:"id"`
	InstructorID uuid.UUID `json:"instructor_id"`
	Title        string    `json:"title"`
	Category     string    `json:"category"`
	Description  string    `json:"description"`
	CreatedAt    string    `json:"created_at"`
	ImageURL     string    `json:"image_url"`    // <-- NEW: For the Banner
	LessonCount  int       `json:"lesson_count"` // <-- NEW: For the Dashboard count
}

type Lesson struct {
	ID         uuid.UUID `json:"id"`
	CourseID   uuid.UUID `json:"course_id"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	OrderIndex int       `json:"order_index"`
	CreatedAt  string    `json:"created_at"`
	VideoURL   string    `json:"video_url"` // <-- NEW: For YouTube/NPTEL links
}
