package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	models "github.com/sanemishinazugawa11/LearnSphere/Models"
	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"
)

type QuizHandler struct{ DB *sql.DB }

// GET /api/lessons/{lessonID}/quiz
func (h *QuizHandler) GetQuiz(w http.ResponseWriter, r *http.Request) {
	lessonID := r.PathValue("lessonID")

	var quiz models.Quiz
	query := `SELECT id, lesson_id, question, options FROM quizzes WHERE lesson_id = $1`
	err := h.DB.QueryRow(query, lessonID).Scan(&quiz.ID, &quiz.LessonID, &quiz.Question, &quiz.Options)

	if err != nil {
		utils.SendError(w, http.StatusNotFound, "No quiz found for this lesson")
		return
	}

	utils.SendJSON(w, http.StatusOK, quiz)
}

// POST /api/lessons/{lessonID}/quiz/attempt
func (h *QuizHandler) SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	lessonID := r.PathValue("lessonID")

	var attempt models.QuizAttempt
	if err := json.NewDecoder(r.Body).Decode(&attempt); err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	var correctAnswer string
	query := `SELECT correct_answer FROM quizzes WHERE lesson_id = $1`
	err := h.DB.QueryRow(query, lessonID).Scan(&correctAnswer)

	if err != nil {
		utils.SendError(w, http.StatusNotFound, "Quiz not found")
		return
	}

	// Auto-grading logic
	if strings.EqualFold(strings.TrimSpace(attempt.Answer), strings.TrimSpace(correctAnswer)) {
		utils.SendJSON(w, http.StatusOK, map[string]interface{}{
			"correct": true,
			"message": "Excellent work! Answer is correct.",
		})
	} else {
		utils.SendJSON(w, http.StatusOK, map[string]interface{}{
			"correct": false,
			"message": "Incorrect answer. Try again!",
		})
	}
}

// POST /api/lessons/{lessonID}/quiz (Instructors Only)
func (h *QuizHandler) CreateQuiz(w http.ResponseWriter, r *http.Request) {
	lessonID := r.PathValue("lessonID")

	// Create a specific struct for the input since options is a JSON array
	var input struct {
		Question      string   `json:"question"`
		Options       []string `json:"options"`
		CorrectAnswer string   `json:"correct_answer"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	// Convert the string array to JSONB format for PostgreSQL
	optionsJSON, _ := json.Marshal(input.Options)

	query := `
		INSERT INTO quizzes (lesson_id, question, options, correct_answer) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, lesson_id, question, options`

	var quiz models.Quiz
	var returnedOptions []byte

	err := h.DB.QueryRow(query, lessonID, input.Question, string(optionsJSON), input.CorrectAnswer).Scan(
		&quiz.ID, &quiz.LessonID, &quiz.Question, &returnedOptions,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") {
			utils.SendError(w, http.StatusConflict, "This lesson already has a quiz")
			return
		}
		utils.SendError(w, http.StatusInternalServerError, "Failed to create quiz")
		return
	}

	quiz.Options = string(returnedOptions)
	utils.SendJSON(w, http.StatusCreated, quiz)
}


// DELETE /api/lessons/{lessonID}/quiz
func (h *QuizHandler) DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	lessonID := r.PathValue("lessonID")
	
	_, err := h.DB.Exec(`DELETE FROM quizzes WHERE lesson_id = $1`, lessonID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to delete quiz")
		return
	}
	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Quiz deleted"})
}