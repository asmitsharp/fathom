package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/ashmitsharp/fathom/internal/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

// LoadConfig loads the .env file and parses the database configuration.
func LoadConfig() *DBConfig {
	err := godotenv.Load()
	if err != nil {
		log.Println("Notice: No .env file found or error reading it, falling back to OS environment variables")
	}

	portStr := os.Getenv("DB_PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil || port == 0 {
		port = 5432
	}

	return &DBConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     port,
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
	}
}

// ConnectDB establishes a connection to PostgreSQL and auto-migrates the models.
func ConnectDB(cfg *DBConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=UTC",
		cfg.Host, cfg.User, cfg.Password, cfg.DBName, cfg.Port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Successfully connected to the PostgreSQL database")

	err = db.AutoMigrate(
		&models.Ship{},
		&models.User{},
		&models.MaintenanceTask{},
		&models.SafetyDrill{},
		&models.DrillAttendance{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	log.Println("Database auto-migration completed successfully")

	DB = db
	return db, nil
}
