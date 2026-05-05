package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	models "github.com/sanemishinazugawa11/LearnSphere/Models"
	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct{ DB *sql.DB }

// --- 1. REGISTER USER ---
func (h *AuthHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1048576) // 1MB limit

	var input models.RegisterInput
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&input); err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
		return
	}

	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" || len(input.Password) < 6 {
		utils.SendError(w, http.StatusBadRequest, "Name, valid email, and a password (min 6 chars) are required")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to process password")
		return
	}

	// Inside RegisterUser, replace your SQL query with this:
	role := input.Role
	if role != "instructor" {
		role = "student" // Default fallback
	}

	query := `
    INSERT INTO users (name, email, password_hash, role) 
    VALUES ($1, $2, $3, $4) 
    RETURNING id, name, email, role, created_at`

	var user models.User
	err = h.DB.QueryRow(query, input.Name, input.Email, string(hashedPassword), role).Scan(
		&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key") {
			utils.SendError(w, http.StatusConflict, "A user with this email already exists")
			return
		}
		utils.SendError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	utils.SendJSON(w, http.StatusCreated, user)
}

// --- 2. LOGIN USER ---
func (h *AuthHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	var user models.User
	query := `SELECT id, password_hash, role FROM users WHERE email = $1`
	err := h.DB.QueryRow(query, input.Email).Scan(&user.ID, &user.PasswordHash, &user.Role)
	if err != nil {
		utils.SendError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Verify Password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		utils.SendError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate JWT
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	utils.SendJSON(w, http.StatusOK, map[string]string{
		"token":   token,
		"message": "Login successful",
	})
}
