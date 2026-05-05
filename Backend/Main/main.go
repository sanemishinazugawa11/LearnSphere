package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	database "github.com/sanemishinazugawa11/LearnSphere/Database"
	middleware "github.com/sanemishinazugawa11/LearnSphere/Middlewares"
	routes "github.com/sanemishinazugawa11/LearnSphere/Routes"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load Environment Variables
	_ = godotenv.Load()

	// 2. Connect to Supabase
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("❌ Fatal Database Error: %v", err)
	}
	defer db.Close()

	// 3. Initialize the Router
	mux := http.NewServeMux()

	// 4. Register All API Endpoints
	routes.RegisterRoutes(mux, db)

	// 5. CRITICAL FIX: Wrap the mux with CORS Middleware
	// This ensures React (frontend) can talk to Go (backend)
	handlerWithCORS := middleware.CORS(mux)

	// 6. Define Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 7. Start the Server using the wrapped handler
	fmt.Printf("🚀 LearnSphere API running on http://localhost:%s\n", port)

	// Use 'handlerWithCORS' instead of 'mux' here
	err = http.ListenAndServe(":"+port, handlerWithCORS)
	if err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}
