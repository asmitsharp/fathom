package services

import (
	"time"

	"github.com/ashmitsharp/fathom/internal/config"
	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/google/uuid"
)

// TaskService handles maintenance task logic
type TaskService struct{}

// CreateTask creates a new maintenance task
func (s *TaskService) CreateTask(task *models.MaintenanceTask) error {
	return config.DB.Create(task).Error
}

// GetTasks retrieves tasks with optional filters
func (s *TaskService) GetTasks(shipID, status, date string) ([]models.MaintenanceTask, error) {
	var tasks []models.MaintenanceTask
	query := config.DB.Model(&models.MaintenanceTask{})
	if shipID != "" {
		query = query.Where("ship_id = ?", shipID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if date != "" {
		query = query.Where("DATE(due_date) = ?", date)
	}
	err := query.Find(&tasks).Error
	return tasks, err
}

// UpdateTaskStatus updates the status of an assigned task
func (s *TaskService) UpdateTaskStatus(taskID, crewID uuid.UUID, status string) error {
	updates := map[string]interface{}{"status": status}
	if status == "Completed" {
		now := time.Now()
		updates["completed_at"] = &now
	}
	return config.DB.Model(&models.MaintenanceTask{}).
		Where("id = ? AND assigned_to = ?", taskID, crewID).
		Updates(updates).Error
}

// AddTaskNotes appends notes to a task
func (s *TaskService) AddTaskNotes(taskID, crewID uuid.UUID, notes string) error {
	var task models.MaintenanceTask
	if err := config.DB.First(&task, "id = ? AND assigned_to = ?", taskID, crewID).Error; err != nil {
		return err
	}
	newNotes := task.Notes
	if newNotes != "" {
		newNotes += "\n"
	}
	newNotes += notes
	return config.DB.Model(&models.MaintenanceTask{}).Where("id = ?", taskID).Update("notes", newNotes).Error
}

// DetectOverdueTasks identifies and marks tasks as overdue
func (s *TaskService) DetectOverdueTasks() error {
	return config.DB.Model(&models.MaintenanceTask{}).
		Where("due_date < ? AND status != ?", time.Now(), "Completed").
		Update("status", "Overdue").Error
}
