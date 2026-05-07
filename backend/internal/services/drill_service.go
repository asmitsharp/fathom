package services

import (
	"time"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/google/uuid"
)

// DrillService handles safety drill logic
type DrillService struct{}

// CreateDrill creates a new drill
func (s *DrillService) CreateDrill(drill *models.SafetyDrill) error {
	return config.DB.Create(drill).Error
}

// GetDrills retrieves drills with optional filters
func (s *DrillService) GetDrills(shipID, date string) ([]models.SafetyDrill, error) {
	var drills []models.SafetyDrill
	query := config.DB.Model(&models.SafetyDrill{})
	
	if shipID != "" {
		query = query.Where("ship_id = ?", shipID)
	}
	if date != "" {
		query = query.Where("DATE(scheduled_date) = ?", date)
	}
	
	err := query.Find(&drills).Error
	return drills, err
}

// AttendDrill marks a crew member as attended for a drill
func (s *DrillService) AttendDrill(drillID, crewID uuid.UUID) error {
	now := time.Now()
	attendance := models.DrillAttendance{
		DrillID:     drillID,
		CrewID:      crewID,
		Attended:    true,
		SubmittedAt: &now,
	}
	return config.DB.Create(&attendance).Error
}
