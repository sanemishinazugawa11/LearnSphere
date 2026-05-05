package middleware

import (
	"context"
	"net/http"
	"strings"

	utils "github.com/sanemishinazugawa11/LearnSphere/Utils"
)

type contextKey string
const UserContextKey contextKey = "user"

// RequireAuth ensures the request has a valid JWT
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			utils.SendError(w, http.StatusUnauthorized, "Missing or invalid token")
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.SendError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// Store user data in the request context for handlers to use
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// RequireInstructor ensures the user is specifically an instructor
func RequireInstructor(next http.HandlerFunc) http.HandlerFunc {
	return RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(UserContextKey).(*utils.Claims)
		if !ok || claims.Role != "instructor" {
			utils.SendError(w, http.StatusForbidden, "Instructor access required")
			return
		}
		next.ServeHTTP(w, r)
	})
}