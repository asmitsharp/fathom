package handlers

import (
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/ashmitsharp/fathom/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var shipService = services.ShipService{}

// SetupShipRoutes configures ship routes
func SetupShipRoutes(router fiber.Router) {
	router.Post("/", CreateShip)
	router.Get("/", GetShips)
	router.Get("/:id", GetShipByID)
	router.Put("/:id", UpdateShip)
	router.Delete("/:id", DeleteShip)
}

// CreateShip handles ship creation
func CreateShip(c *fiber.Ctx) error {
	var ship models.Ship
	if err := c.BodyParser(&ship); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if err := shipService.CreateShip(&ship); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(ship)
}

// GetShips handles fetching all ships
func GetShips(c *fiber.Ctx) error {
	ships, err := shipService.GetShips()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ships)
}

// GetShipByID handles fetching a single ship
func GetShipByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}
	ship, err := shipService.GetShipByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Ship not found"})
	}
	return c.JSON(ship)
}

// UpdateShip handles updating a ship
func UpdateShip(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}
	var ship models.Ship
	if err := c.BodyParser(&ship); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	ship.ID = id
	if err := shipService.UpdateShip(&ship); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ship)
}

// DeleteShip handles deleting a ship
func DeleteShip(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}
	if err := shipService.DeleteShip(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
