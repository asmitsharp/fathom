package handlers

import (
	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/ashmitsharp/fathom/internal/services"
	"github.com/gofiber/fiber/v2"
)

var complianceService = services.ComplianceService{}

// SetupComplianceRoutes configures compliance routes
func SetupComplianceRoutes(router fiber.Router) {
	router.Get("/", GetCompliance)
	router.Get("/summary", GetComplianceSummary)
}

// GetCompliance handles fetching compliance for a specific ship
func GetCompliance(c *fiber.Ctx) error {
	shipID := c.Query("ship_id")
	if shipID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ship_id query parameter is required"})
	}
	report, err := complianceService.GetShipCompliance(shipID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(report)
}

// GetComplianceSummary handles fetching compliance for all ships
func GetComplianceSummary(c *fiber.Ctx) error {
	var ships []models.Ship
	if err := config.DB.Find(&ships).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	summary := make(map[string]*services.ComplianceReport)
	for _, ship := range ships {
		report, _ := complianceService.GetShipCompliance(ship.ID.String())
		summary[ship.Name] = report
	}
	return c.JSON(summary)
}
