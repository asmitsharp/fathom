package services

import (
	"errors"
	"os"
	"time"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // e.g., "admin" or "crew"
}

// RegisterUser registers a new user
func (s *AuthService) RegisterUser(input RegisterInput) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		Role:         input.Role,
	}

	// Default role to "crew" if none is provided
	if user.Role == "" {
		user.Role = "crew"
	}

	// Save to DB
	if err := config.DB.Create(&user).Error; err != nil {
		return nil, errors.New("could not create user, email might already exist")
	}

	return &user, nil
}

// LoginUser logs in a user and returns a JWT token
func (s *AuthService) LoginUser(email, password string) (string, error) {
	var user models.User

	if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"ship_id": user.ShipID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "supersecret"
	}

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
