package handlers

import (
	"database/sql"
	"net/http"

	middleware "github.com/sanemishinazugawa11/LearnSphere/Middlewares"
	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"
)

type ProgressHandler struct{ DB *sql.DB }

// POST /api/lessons/{lessonID}/complete
func (h *ProgressHandler) MarkComplete(w http.ResponseWriter, r *http.Request) {
	lessonID := r.PathValue("lessonID")
	claims := r.Context().Value(middleware.UserContextKey).(*utils.Claims)

	// SECURITY PATCH: Check if the user is actually enrolled in the course this lesson belongs to
	checkQuery := `
		SELECT e.id FROM enrollments e
		JOIN lessons l ON e.course_id = l.course_id
		WHERE e.user_id = $1 AND l.id = $2
	`
	var enrollmentID string
	err := h.DB.QueryRow(checkQuery, claims.UserID, lessonID).Scan(&enrollmentID)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendError(w, http.StatusForbidden, "You must enroll in this course before completing lessons")
			return
		}
		utils.SendError(w, http.StatusInternalServerError, "Failed to verify enrollment")
		return
	}

	// If we got here, they are enrolled! Mark it complete.
	insertQuery := `
		INSERT INTO progress (user_id, lesson_id) 
		VALUES ($1, $2) 
		ON CONFLICT DO NOTHING`

	_, err = h.DB.Exec(insertQuery, claims.UserID, lessonID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to mark lesson complete")
		return
	}

	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Lesson completed!"})
}

// GET /api/courses/{courseID}/progress
// GET /api/courses/{courseID}/progress
func (h *ProgressHandler) GetCourseProgress(w http.ResponseWriter, r *http.Request) {
	courseID := r.PathValue("courseID")
	claims := r.Context().Value(middleware.UserContextKey).(*utils.Claims)

	// 1) Verify actual enrollment first
	var enrollmentID string
	err := h.DB.QueryRow(
		`SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
		claims.UserID, courseID,
	).Scan(&enrollmentID)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendError(w, http.StatusForbidden, "You must enroll in this course before viewing progress")
			return
		}
		utils.SendError(w, http.StatusInternalServerError, "Failed to verify enrollment")
		return
	}

	// 2) Get completion numbers
	query := `
		WITH CourseLessons AS (
			SELECT id FROM lessons WHERE course_id = $1
		),
		CompletedLessons AS (
			SELECT lesson_id FROM progress 
			WHERE user_id = $2 AND lesson_id IN (SELECT id FROM CourseLessons)
		)
		SELECT 
			(SELECT COUNT(*) FROM CourseLessons) AS total_lessons,
			(SELECT COUNT(*) FROM CompletedLessons) AS completed_lessons;
	`

	var total, completed int
	err = h.DB.QueryRow(query, courseID, claims.UserID).Scan(&total, &completed)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to calculate progress")
		return
	}

	percentage := 0.0
	if total > 0 {
		percentage = (float64(completed) / float64(total)) * 100
	}

	// 3) NEW: Get the exact IDs of completed lessons
	rows, _ := h.DB.Query(`SELECT lesson_id FROM progress WHERE user_id = $1 AND lesson_id IN (SELECT id FROM lessons WHERE course_id = $2)`, claims.UserID, courseID)
	defer rows.Close()
	var completedIDs []string
	for rows.Next() {
		var id string
		rows.Scan(&id)
		completedIDs = append(completedIDs, id)
	}

	utils.SendJSON(w, http.StatusOK, map[string]interface{}{
		"total_lessons":        total,
		"completed_lessons":    completed,
		"percentage":           percentage,
		"completed_lesson_ids": completedIDs, // We send this to React now!
	})
}
