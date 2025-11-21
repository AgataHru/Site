package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

type Config struct {
	DB *sql.DB
}

func NewConfig() (*Config, error) {
	// Параметры подключения (лучше вынести в переменные окружения)
	connStr := "user=postgres password=postgres dbname=beladonna sslmode=disable host=localhost port=5432"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// Проверка подключения
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("Successfully connected to database")
	return &Config{DB: db}, nil
}

// Функция для выполнения миграций из файла
func RunMigrations(db *sql.DB, migrationFilePath string) error {
	// Получаем абсолютный путь к файлу
	absPath, err := filepath.Abs(migrationFilePath)
	if err != nil {
		return fmt.Errorf("failed to get absolute path for %s: %v", migrationFilePath, err)
	}

	// Проверяем существование файла
	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		return fmt.Errorf("migration file does not exist: %s", absPath)
	}

	// Читаем содержимое файла
	content, err := os.ReadFile(absPath)
	if err != nil {
		return fmt.Errorf("failed to read migration file %s: %v", absPath, err)
	}

	// Выполняем SQL
	_, err = db.Exec(string(content))
	if err != nil {
		return fmt.Errorf("migration failed in file %s: %v", absPath, err)
	}

	log.Printf("Migrations from %s completed successfully", filepath.Base(absPath))
	return nil
}

// Функция для выполнения всех миграций из папки
func RunAllMigrations(db *sql.DB, migrationsDir string) error {
	absPath, err := filepath.Abs(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to get absolute path for directory %s: %v", migrationsDir, err)
	}

	// Читаем содержимое папки
	entries, err := os.ReadDir(absPath)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory %s: %v", absPath, err)
	}

	// Выполняем каждый SQL файл
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".sql" {
			filePath := filepath.Join(absPath, entry.Name())
			err := RunMigrations(db, filePath)
			if err != nil {
				return fmt.Errorf("failed to run migration %s: %v", entry.Name(), err)
			}
		}
	}

	log.Printf("All migrations from %s completed successfully", absPath)
	return nil
}

// Старая функция для обратной совместимости (можно удалить позже)
func RunMigrationsOld(db *sql.DB) error {
	// По умолчанию пытаемся выполнить миграции из папки migrations
	return RunAllMigrations(db, "migrations")
}
