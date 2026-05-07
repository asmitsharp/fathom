package services

import (
	"errors"
	"time"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DrillService handles safety drill logic
type DrillService struct{}

// CreateDrill creates a new drill
func (s *DrillService) CreateDrill(drill *models.SafetyDrill) error {
	return config.DB.Create(drill).Error
}

// GetDrills retrieves drills with optional filters
func (s *DrillService) GetDrills(shipID, date string, crewID uuid.UUID) ([]models.SafetyDrill, error) {
	var drills []models.SafetyDrill
	query := config.DB.Model(&models.SafetyDrill{})

	if shipID != "" {
		query = query.Where("ship_id = ?", shipID)
	}
	if date != "" {
		query = query.Where("DATE(scheduled_date) = ?", date)
	}

	if err := query.Find(&drills).Error; err != nil {
		return nil, err
	}

	if crewID == uuid.Nil || len(drills) == 0 {
		return drills, nil
	}

	drillIDs := make([]uuid.UUID, 0, len(drills))
	for _, drill := range drills {
		drillIDs = append(drillIDs, drill.ID)
	}

	var attendances []models.DrillAttendance
	if err := config.DB.Where("drill_id IN ? AND crew_id = ?", drillIDs, crewID).Find(&attendances).Error; err != nil {
		return drills, err
	}

	attendanceMap := make(map[uuid.UUID]bool, len(attendances))
	for _, a := range attendances {
		attendanceMap[a.DrillID] = a.Attended
	}

	for i := range drills {
		drills[i].Attended = attendanceMap[drills[i].ID]
	}

	return drills, nil
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

	var existing models.DrillAttendance
	if err := config.DB.Where("drill_id = ? AND crew_id = ?", drillID, crewID).First(&existing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return config.DB.Create(&attendance).Error
		}
		return err
	}

	return config.DB.Model(&existing).Updates(map[string]interface{}{
		"attended":     true,
		"submitted_at": now,
	}).Error
}
