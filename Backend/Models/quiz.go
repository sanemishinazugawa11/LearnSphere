package models

import "github.com/google/uuid"

type Quiz struct {
	ID            uuid.UUID `json:"id"`
	LessonID      uuid.UUID `json:"lesson_id"`
	Question      string    `json:"question"`
	Options       string    `json:"options"` // Stored as JSONB in DB, retrieved as a string
	CorrectAnswer string    `json:"-"`       // Hide from JSON so students can't cheat!
}

type QuizAttempt struct {
	Answer string `json:"answer"`
}
