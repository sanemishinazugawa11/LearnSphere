package Database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq" // This underscore is required! It loads the Postgres driver behind the scenes.
)

func Connect() (*sql.DB, error) {
	// 1. Grab the URL from your .env file
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DB_URL environment variable is missing in your .env file")
	}

	// 2. Open the connection
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// 3. Ping the database to ensure Supabase is actually reachable
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping Supabase: %w", err)
	}

	fmt.Println("✅ Successfully connected to Supabase PostgreSQL!")
	return db, nil
}