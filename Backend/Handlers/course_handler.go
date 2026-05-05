package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	middleware "github.com/sanemishinazugawa11/LearnSphere/Middlewares"
	models "github.com/sanemishinazugawa11/LearnSphere/Models"
	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"
)

type CourseHandler struct{ DB *sql.DB }

// 1. GET /api/courses
func (h *CourseHandler) GetCourses(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")

	// Notice COALESCE to prevent NULL crashes, and the subquery to count lessons
	query := `
		SELECT c.id, c.instructor_id, c.title, c.category, c.description, c.created_at, 
		COALESCE(c.image_url, '') as image_url,
		(SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as lesson_count
		FROM courses c WHERE 1=1`

	args := []interface{}{}
	argId := 1

	if category != "" && category != "All" {
		query += fmt.Sprintf(" AND c.category = $%d", argId)
		args = append(args, category)
		argId++
	}
	if search != "" {
		query += fmt.Sprintf(" AND c.title ILIKE $%d", argId)
		args = append(args, "%"+search+"%")
		argId++
	}

	query += " ORDER BY c.created_at DESC"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to fetch courses")
		return
	}
	defer rows.Close()

	courses := []models.Course{}
	for rows.Next() {
		var c models.Course
		// Must scan in exact order of the SELECT statement
		if err := rows.Scan(&c.ID, &c.InstructorID, &c.Title, &c.Category, &c.Description, &c.CreatedAt, &c.ImageURL, &c.LessonCount); err != nil {
			continue
		}
		courses = append(courses, c)
	}

	utils.SendJSON(w, http.StatusOK, courses)
}

// 2. POST /api/courses
func (h *CourseHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*utils.Claims)
	if !ok {
		utils.SendError(w, http.StatusUnauthorized, "User context missing")
		return
	}

	var input models.Course
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	query := `
		INSERT INTO courses (instructor_id, title, category, description, image_url) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, instructor_id, title, category, description, created_at, COALESCE(image_url, '')`

	var course models.Course
	err := h.DB.QueryRow(query, claims.UserID, input.Title, input.Category, input.Description, input.ImageURL).Scan(
		&course.ID, &course.InstructorID, &course.Title, &course.Category, &course.Description, &course.CreatedAt, &course.ImageURL,
	)

	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to create course")
		return
	}

	utils.SendJSON(w, http.StatusCreated, course)
}

// POST /api/courses/{courseID}/enroll
func (h *CourseHandler) EnrollInCourse(w http.ResponseWriter, r *http.Request) {
	courseID := r.PathValue("courseID")
	claims := r.Context().Value(middleware.UserContextKey).(*utils.Claims)

	query := `
		INSERT INTO enrollments (user_id, course_id) 
		VALUES ($1, $2) 
		ON CONFLICT DO NOTHING`

	_, err := h.DB.Exec(query, claims.UserID, courseID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to enroll in course")
		return
	}

	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Successfully enrolled!"})
}

// DELETE /api/courses/{courseID}
func (h *CourseHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	courseID := r.PathValue("courseID")
	claims := r.Context().Value(middleware.UserContextKey).(*utils.Claims)

	res, err := h.DB.Exec(`DELETE FROM courses WHERE id = $1 AND instructor_id = $2`, courseID, claims.UserID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to delete course")
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		utils.SendError(w, http.StatusForbidden, "Not authorized to delete this course")
		return
	}

	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Course deleted"})
}
