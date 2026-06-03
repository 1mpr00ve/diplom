package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func Connect() (*sql.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	// Настройки пула — критично для долгой работы на сервере.
	// Без этого коннекшны протухают и БД "отваливается" через день.
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	for i := 1; i <= 15; i++ {
		if err = db.Ping(); err == nil {
			return db, nil
		}
		log.Printf("БД не готова, попытка %d/15: %v", i, err)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("не удалось подключиться к БД после 15 попыток: %w", err)
}
