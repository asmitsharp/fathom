package handlers

import (
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/ashmitsharp/fathom/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var taskService = services.TaskService{}

// SetupTaskRoutes configures task routes
func SetupTaskRoutes(router fiber.Router) {
	router.Post("/", CreateTask)
	router.Get("/", GetTasks)
	router.Patch("/:id/status", UpdateTaskStatus)
	router.Post("/:id/notes", AddTaskNotes)
}

// CreateTask handles task creation
func CreateTask(c *fiber.Ctx) error {
	var task models.MaintenanceTask
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if err := taskService.CreateTask(&task); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(task)
}

// GetTasks handles fetching tasks with filters
func GetTasks(c *fiber.Ctx) error {
	shipID := c.Query("ship_id")
	status := c.Query("status")
	date := c.Query("date")
	
	tasks, err := taskService.GetTasks(shipID, status, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tasks)
}

// UpdateTaskStatus handles status updates by crew
func UpdateTaskStatus(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}
	
	crewIDVal := c.Locals("user_id")
	crewIDStr, ok := crewIDVal.(string)
	if !ok {
		// Just in case it's parsed as UUID in claims
		crewIDStr = c.Locals("user_id").(string) 
	}
	crewID, _ := uuid.Parse(crewIDStr)

	var input struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	
	if err := taskService.UpdateTaskStatus(id, crewID, input.Status); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusOK)
}

// AddTaskNotes handles adding notes to a task
func AddTaskNotes(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	crewIDVal := c.Locals("user_id")
	crewIDStr, ok := crewIDVal.(string)
	if !ok {
		crewIDStr = c.Locals("user_id").(string)
	}
	crewID, _ := uuid.Parse(crewIDStr)

	var input struct {
		Notes string `json:"notes"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := taskService.AddTaskNotes(id, crewID, input.Notes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusOK)
}
