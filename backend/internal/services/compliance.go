package services

import (
	"time"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
)

// ComplianceReport holds compliance data
type ComplianceReport struct {
	MaintenanceScore   float64                  `json:"maintenance_score"`
	DrillScore         float64                  `json:"drill_score"`
	AttendedDrillCount int64                    `json:"attended_drill_count"`
	MissedDrillCount   int64                    `json:"missed_drill_count"`
	OverallScore       float64                  `json:"overall_score"`
	OverdueTasks       []models.MaintenanceTask `json:"overdue_tasks"`
	MissedDrills       []models.SafetyDrill     `json:"missed_drills"`
}

// ComplianceService handles compliance calculations
type ComplianceService struct{}

// GetShipCompliance calculates compliance for a specific ship
func (s *ComplianceService) GetShipCompliance(shipID string) (*ComplianceReport, error) {
	var totalTasks int64
	var completedTasks int64
	var overdueTasks []models.MaintenanceTask

	config.DB.Model(&models.MaintenanceTask{}).Where("ship_id = ?", shipID).Count(&totalTasks)
	config.DB.Model(&models.MaintenanceTask{}).Where("ship_id = ? AND status = ?", shipID, "Completed").Count(&completedTasks)
	config.DB.Where("ship_id = ? AND due_date < ? AND status != ?", shipID, time.Now(), "Completed").Find(&overdueTasks)

	var totalDrills int64
	var attendedDrills int64
	var missedDrills []models.SafetyDrill

	config.DB.Model(&models.SafetyDrill{}).Where("ship_id = ? AND scheduled_date < ?", shipID, time.Now()).Count(&totalDrills)

	config.DB.Model(&models.SafetyDrill{}).
		Joins("JOIN drill_attendances ON drill_attendances.drill_id = safety_drills.id").
		Where("safety_drills.ship_id = ? AND drill_attendances.attended = ?", shipID, true).
		Distinct("safety_drills.id").
		Count(&attendedDrills)

	config.DB.Where("ship_id = ? AND scheduled_date < ? AND id NOT IN (SELECT drill_id FROM drill_attendances WHERE attended = ?)", shipID, time.Now(), true).Find(&missedDrills)
	missedDrillCount := int64(len(missedDrills))

	mScore := 100.0
	if totalTasks > 0 {
		mScore = float64(completedTasks) / float64(totalTasks) * 100.0
	}

	dScore := 100.0
	if totalDrills > 0 {
		dScore = float64(attendedDrills) / float64(totalDrills) * 100.0
	}

	overall := (mScore + dScore) / 2.0

	return &ComplianceReport{
		MaintenanceScore:   mScore,
		DrillScore:         dScore,
		AttendedDrillCount: attendedDrills,
		MissedDrillCount:   missedDrillCount,
		OverallScore:       overall,
		OverdueTasks:       overdueTasks,
		MissedDrills:       missedDrills,
	}, nil
}
