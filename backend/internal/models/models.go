package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email        string     `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"column:password_hash;not null" json:"-"`
	Name         string     `gorm:"not null" json:"name"`
	CreatedAt    time.Time  `json:"created_at"`
	ShipID       *uuid.UUID `gorm:"type:uuid;index" json:"ship_id"`
	Ship         *Ship      `gorm:"foreignKey:ShipID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"ship,omitempty"`
	Role         string     `gorm:"not null" json:"role"`
}

type Ship struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	IMONumber string    `gorm:"uniqueIndex;not null" json:"imo_number"`
	Status    string    `gorm:"not null;default:'Active'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type MaintenanceTask struct {
	ID          uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`

	ShipID uuid.UUID `gorm:"type:uuid;index;not null" json:"ship_id"`
	Ship   *Ship     `gorm:"foreignKey:ShipID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"ship,omitempty"`

	AssignedTo *uuid.UUID `gorm:"type:uuid;index" json:"assigned_to"`
	Assignee   *User      `gorm:"foreignKey:AssignedTo;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"assignee,omitempty"`

	Status string `gorm:"not null;default:'Pending'" json:"status"`

	DueDate     time.Time  `gorm:"index" json:"due_date"`
	CompletedAt *time.Time `json:"completed_at"`

	Notes string `json:"notes"`

	CreatedAt time.Time `json:"created_at"`
}

type SafetyDrill struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title"`
	DrillType string    `gorm:"not null" json:"drill_type"`

	ShipID uuid.UUID `gorm:"type:uuid;index;not null" json:"ship_id"`
	Ship   *Ship     `gorm:"foreignKey:ShipID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"ship,omitempty"`

	ScheduledDate time.Time `gorm:"index" json:"scheduled_date"`

	CreatedAt time.Time `json:"created_at"`
}

type DrillAttendance struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`

	DrillID uuid.UUID    `gorm:"type:uuid;uniqueIndex:idx_drill_crew;not null" json:"drill_id"`
	Drill   *SafetyDrill `gorm:"foreignKey:DrillID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"drill,omitempty"`

	CrewID uuid.UUID `gorm:"type:uuid;uniqueIndex:idx_drill_crew;not null" json:"crew_id"`
	Crew   *User     `gorm:"foreignKey:CrewID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"crew,omitempty"`

	Attended bool `gorm:"default:false" json:"attended"`

	SubmittedAt *time.Time `json:"submitted_at"`
}
