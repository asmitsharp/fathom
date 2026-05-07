package handlers

import (
	"github.com/ashmitsharp/fathom/internal/services"
	"github.com/gofiber/fiber/v2"
)

var userService = services.UserService{}

func SetupUserRoutes(router fiber.Router) {
	router.Get("/", GetUsers)
}

func GetUsers(c *fiber.Ctx) error {
	shipID := c.Query("ship_id")
	role := c.Query("role")

	users, err := userService.GetUsers(shipID, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(users)
}
