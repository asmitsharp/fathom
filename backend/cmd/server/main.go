package main

import (
	"fmt"
	"log"
	"os"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/handlers"
	"github.com/ashmitsharp/fathom/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// 1. Load configuration (.env)
	cfg := config.LoadConfig()

	// 2. Connect to Database and run auto-migrations
	_, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 3. Initialize Fiber application
	app := fiber.New(fiber.Config{
		AppName: "Fathom Maritime Operations Platform",
	})

	// Add request logger middleware
	app.Use(logger.New())

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"message": "Fathom API is running smoothly",
		})
	})

	// 4. Setup API Routes
	api := app.Group("/api")

	// --- PUBLIC ROUTES ---
	// Sets up /api/register and /api/login
	handlers.SetupAuthRoutes(api)

	// --- PROTECTED ROUTES (Requires valid JWT) ---
	protected := api.Group("/", middleware.Protected())

	// Crew Routes Example
	crewGroup := protected.Group("/crew")
	crewGroup.Get("/dashboard", func(c *fiber.Ctx) error {
		// Example of accessing values injected by our JWT middleware
		userID := c.Locals("user_id")
		role := c.Locals("role")
		return c.JSON(fiber.Map{
			"message": fmt.Sprintf("Welcome %v! You are logged in as a %v.", userID, role),
		})
	})

	// --- ADMIN ROUTES (Requires valid JWT AND 'admin' role) ---
	adminGroup := protected.Group("/admin", middleware.RequireRole("admin"))
	adminGroup.Get("/dashboard", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome Admin! You have access to sensitive operations.",
		})
	})

	// 5. Start the server
	appPort := os.Getenv("PORT")
	if appPort == "" {
		appPort = "8080"
	}

	log.Printf("Starting server on port %s...", appPort)
	if err := app.Listen(":" + appPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
