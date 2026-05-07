package services

import (
	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
)

type UserService struct{}

func (s *UserService) GetUsers(shipID, role string) ([]models.User, error) {
	var users []models.User
	query := config.DB.Model(&models.User{})
	if shipID != "" {
		query = query.Where("ship_id = ?", shipID)
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
