package routes

import (
	"database/sql"
	"net/http"

	handlers "github.com/sanemishinazugawa11/LearnSphere/Handlers"
	middleware "github.com/sanemishinazugawa11/LearnSphere/Middlewares"
	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"
)

func RegisterRoutes(mux *http.ServeMux, db *sql.DB) {
	// 1. Initialize Handlers
	authHandler := &handlers.AuthHandler{DB: db}
	courseHandler := &handlers.CourseHandler{DB: db}
	lessonHandler := &handlers.LessonHandler{DB: db}
	progressHandler := &handlers.ProgressHandler{DB: db} // <-- NEW
	quizHandler := &handlers.QuizHandler{DB: db}         // <-- NEW

	// 2. Public Routes
	mux.HandleFunc("POST /api/auth/register", authHandler.RegisterUser)
	mux.HandleFunc("POST /api/auth/login", authHandler.LoginUser)
	mux.HandleFunc("GET /api/courses", courseHandler.GetCourses)
	mux.HandleFunc("GET /api/courses/{courseID}/lessons", lessonHandler.GetLessonsByCourse)

	// Protected Routes (Requires JWT - Students & Instructors)
	mux.HandleFunc("POST /api/lessons/{lessonID}/complete", middleware.RequireAuth(progressHandler.MarkComplete)) // <-- NEW
	mux.HandleFunc("GET /api/lessons/{lessonID}/quiz", middleware.RequireAuth(quizHandler.GetQuiz))               // <-- NEW
	mux.HandleFunc("POST /api/lessons/{lessonID}/quiz/attempt", middleware.RequireAuth(quizHandler.SubmitQuiz))   // <-- NEW
	// Add this to your "Protected Routes (Requires JWT - Students & Instructors)" section:
	mux.HandleFunc("GET /api/courses/{courseID}/progress", middleware.RequireAuth(progressHandler.GetCourseProgress))
	mux.HandleFunc("POST /api/courses/{courseID}/enroll", middleware.RequireAuth(courseHandler.EnrollInCourse))

	// 3. Protected Routes (Requires JWT - Instructors Only)
	mux.HandleFunc("POST /api/courses", middleware.RequireInstructor(courseHandler.CreateCourse))
	mux.HandleFunc("POST /api/courses/{courseID}/lessons", middleware.RequireInstructor(lessonHandler.CreateLesson))
	// Add this to your "Protected Routes (Requires JWT - Instructors Only)" section:
	mux.HandleFunc("POST /api/lessons/{lessonID}/quiz", middleware.RequireInstructor(quizHandler.CreateQuiz))
	mux.HandleFunc("DELETE /api/courses/{courseID}", middleware.RequireInstructor(courseHandler.DeleteCourse))
	mux.HandleFunc("DELETE /api/lessons/{lessonID}", middleware.RequireInstructor(lessonHandler.DeleteLesson))
	mux.HandleFunc("DELETE /api/lessons/{lessonID}/quiz", middleware.RequireInstructor(quizHandler.DeleteQuiz))

	// Simple Protected Test Route
	mux.HandleFunc("GET /api/me", middleware.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		claims := r.Context().Value(middleware.UserContextKey).(*utils.Claims)
		utils.SendJSON(w, http.StatusOK, map[string]interface{}{
			"message": "You are authenticated!",
			"user_id": claims.UserID,
			"role":    claims.Role,
		})
	}))
}
