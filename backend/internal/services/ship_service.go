package services

import (
	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/google/uuid"
)

// ShipService handles ship business logic
type ShipService struct{}

// CreateShip creates a new ship
func (s *ShipService) CreateShip(ship *models.Ship) error {
	return config.DB.Create(ship).Error
}

// GetShips retrieves all ships
func (s *ShipService) GetShips() ([]models.Ship, error) {
	var ships []models.Ship
	err := config.DB.Find(&ships).Error
	return ships, err
}

// GetShipByID retrieves a ship by its UUID
func (s *ShipService) GetShipByID(id uuid.UUID) (*models.Ship, error) {
	var ship models.Ship
	err := config.DB.First(&ship, "id = ?", id).Error
	return &ship, err
}

// UpdateShip updates an existing ship
func (s *ShipService) UpdateShip(ship *models.Ship) error {
	return config.DB.Save(ship).Error
}

// DeleteShip deletes a ship by its UUID
func (s *ShipService) DeleteShip(id uuid.UUID) error {
	return config.DB.Delete(&models.Ship{}, "id = ?", id).Error
}
