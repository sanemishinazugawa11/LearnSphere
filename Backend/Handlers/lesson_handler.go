package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	models "github.com/sanemishinazugawa11/LearnSphere/Models"
	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"
)

type LessonHandler struct{ DB *sql.DB }

// 1. GET /api/courses/{courseID}/lessons
func (h *LessonHandler) GetLessonsByCourse(w http.ResponseWriter, r *http.Request) {
	courseID := r.PathValue("courseID")

	authHeader := r.Header.Get("Authorization")
	isEnrolled := false
	var userID string

	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateToken(tokenString)
		if err == nil {
			userID = claims.UserID.String()
			err := h.DB.QueryRow("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", userID, courseID).Scan(&userID)
			if err == nil || claims.Role == "instructor" {
				isEnrolled = true
			}
		}
	}

	query := `SELECT id, course_id, title, content, order_index, created_at, COALESCE(video_url, '') as video_url FROM lessons WHERE course_id = $1 ORDER BY order_index ASC`
	rows, err := h.DB.Query(query, courseID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to fetch lessons")
		return
	}
	defer rows.Close()

	lessons := []models.Lesson{}
	for rows.Next() {
		var l models.Lesson
		if err := rows.Scan(&l.ID, &l.CourseID, &l.Title, &l.Content, &l.OrderIndex, &l.CreatedAt, &l.VideoURL); err != nil {
			continue
		}

		if !isEnrolled {
			l.Content = "Locked: Please enroll to view content."
			l.VideoURL = "" // Hide the video if they aren't enrolled!
		}

		lessons = append(lessons, l)
	}

	utils.SendJSON(w, http.StatusOK, lessons)
}

// 2. POST /api/courses/{courseID}/lessons
func (h *LessonHandler) CreateLesson(w http.ResponseWriter, r *http.Request) {
	courseID := r.PathValue("courseID")
	if courseID == "" {
		utils.SendError(w, http.StatusBadRequest, "Course ID is required in the URL")
		return
	}

	var input models.Lesson
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	query := `
		INSERT INTO lessons (course_id, title, content, order_index, video_url) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, course_id, title, content, order_index, created_at, COALESCE(video_url, '')`

	var lesson models.Lesson
	err := h.DB.QueryRow(query, courseID, input.Title, input.Content, input.OrderIndex, input.VideoURL).Scan(
		&lesson.ID, &lesson.CourseID, &lesson.Title, &lesson.Content, &lesson.OrderIndex, &lesson.CreatedAt, &lesson.VideoURL,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to create lesson")
		return
	}

	utils.SendJSON(w, http.StatusCreated, lesson)
}

// DELETE /api/lessons/{lessonID}
func (h *LessonHandler) DeleteLesson(w http.ResponseWriter, r *http.Request) {
	lessonID := r.PathValue("lessonID")

	_, err := h.DB.Exec(`DELETE FROM lessons WHERE id = $1`, lessonID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to delete lesson")
		return
	}
	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Lesson deleted"})
}
