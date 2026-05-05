package models

import "github.com/google/uuid"

type Progress struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"user_id"`
	LessonID    uuid.UUID `json:"lesson_id"`
	CompletedAt string    `json:"completed_at"`
}
