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
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
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
	authGroup := api.Group("/auth")
	handlers.SetupAuthRoutes(authGroup)

	// --- PROTECTED ROUTES ---
	adminOnly := middleware.RequireRole("admin")
	protected := middleware.Protected()

	// Users (Admin Only)
	usersGroup := api.Group("/users", protected, adminOnly)
	handlers.SetupUserRoutes(usersGroup)

	// Ships (Admin Only)
	shipsGroup := api.Group("/ships", protected, adminOnly)
	handlers.SetupShipRoutes(shipsGroup)

	// Maintenance Tasks
	tasksGroup := api.Group("/tasks", protected)
	tasksGroup.Post("/", adminOnly, handlers.CreateTask)
	tasksGroup.Get("/", handlers.GetTasks)
	tasksGroup.Patch("/:id/status", handlers.UpdateTaskStatus)
	tasksGroup.Post("/:id/notes", handlers.AddTaskNotes)

	// Safety Drills
	drillsGroup := api.Group("/drills", protected)
	drillsGroup.Post("/", adminOnly, handlers.CreateDrill)
	drillsGroup.Get("/", handlers.GetDrills)
	drillsGroup.Post("/:id/attend", handlers.AttendDrill)

	// Compliance (Admin Only)
	complianceGroup := api.Group("/compliance", protected, adminOnly)
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
