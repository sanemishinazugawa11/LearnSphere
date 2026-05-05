package models

import "github.com/google/uuid"

// User represents the structure of our PostgreSQL users table
type User struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // The "-" ensures the hash is NEVER sent in JSON responses
	Role         string    `json:"role"`
	CreatedAt    string    `json:"created_at"`
}

// RegisterInput represents the JSON body we expect from the frontend
type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // <-- ADD THIS LINE
}
