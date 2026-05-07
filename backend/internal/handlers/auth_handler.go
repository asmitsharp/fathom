package handlers

import (
	"github.com/ashmitsharp/fathom/internal/services"
	"github.com/gofiber/fiber/v2"
)

var authService = services.AuthService{}

// SetupAuthRoutes binds the authentication endpoints to the provided router group
func SetupAuthRoutes(router fiber.Router) {
	router.Post("/register", Register)
	router.Post("/login", Login)
}

// Register handles the registration of a new user
func Register(c *fiber.Ctx) error {
	var input services.RegisterInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	user, err := authService.RegisterUser(input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User registered successfully",
		"user_id": user.ID,
	})
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login handles the login of a user
func Login(c *fiber.Ctx) error {
	var input LoginInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	token, err := authService.LoginUser(input.Email, input.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"token": token,
	})
}
