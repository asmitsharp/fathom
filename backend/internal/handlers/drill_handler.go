package handlers

import (
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/ashmitsharp/fathom/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var drillService = services.DrillService{}

// SetupDrillRoutes configures drill routes
func SetupDrillRoutes(router fiber.Router) {
	router.Post("/", CreateDrill)
	router.Get("/", GetDrills)
	router.Post("/:id/attend", AttendDrill)
}

// CreateDrill handles drill creation
func CreateDrill(c *fiber.Ctx) error {
	var drill models.SafetyDrill
	if err := c.BodyParser(&drill); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if err := drillService.CreateDrill(&drill); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(drill)
}

// GetDrills handles fetching drills with filters
func GetDrills(c *fiber.Ctx) error {
	shipID := c.Query("ship_id")
	date := c.Query("date")
	
	drills, err := drillService.GetDrills(shipID, date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(drills)
}

// AttendDrill handles crew attendance for a drill
func AttendDrill(c *fiber.Ctx) error {
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

	if err := drillService.AttendDrill(id, crewID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusOK)
}
