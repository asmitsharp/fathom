package main

import (
	"log"
	"os"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/handlers"
	"github.com/ashmitsharp/fathom/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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

	// Add request logger and CORS middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

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
	handlers.SetupAuthRoutes(api)

	// --- PROTECTED ROUTES (Requires valid JWT) ---
	protected := api.Group("/", middleware.Protected())
	adminOnly := middleware.RequireRole("admin")

	// Ships (Admin Only)
	shipsGroup := protected.Group("/ships", adminOnly)
	handlers.SetupShipRoutes(shipsGroup)

	// Maintenance Tasks
	tasksGroup := protected.Group("/tasks")
	tasksGroup.Post("/", adminOnly, handlers.CreateTask) // Admin only
	tasksGroup.Get("/", handlers.GetTasks)                // Crew & Admin
	tasksGroup.Patch("/:id/status", handlers.UpdateTaskStatus) // Crew
	tasksGroup.Post("/:id/notes", handlers.AddTaskNotes)       // Crew

	// Safety Drills
	drillsGroup := protected.Group("/drills")
	drillsGroup.Post("/", adminOnly, handlers.CreateDrill) // Admin only
	drillsGroup.Get("/", handlers.GetDrills)               // Crew & Admin
	drillsGroup.Post("/:id/attend", handlers.AttendDrill)  // Crew

	// Compliance (Admin Only)
	complianceGroup := protected.Group("/compliance", adminOnly)
	handlers.SetupComplianceRoutes(complianceGroup)

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
