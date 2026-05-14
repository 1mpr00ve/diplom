package repository

import (
	"database/sql"
	"tickets/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(email, passwordHash, name string) (*models.User, error) {
	result, err := r.db.Exec(
		"INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
		email, passwordHash, name,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &models.User{ID: int(id), Email: email, Name: name}, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	err := r.db.QueryRow(
		"SELECT id, email, password_hash, name FROM users WHERE email = ?",
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name)
	if err != nil {
		return nil, err
	}
	return user, nil
}
