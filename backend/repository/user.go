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

func (r *UserRepository) Create(email, passwordHash, name, role string) (*models.User, error) {
	result, err := r.db.Exec(
		"INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
		email, passwordHash, name, role,
	)
	if err != nil {
		return nil, err
	}
	id, _ := result.LastInsertId()
	return &models.User{ID: int(id), Email: email, Name: name, Role: role}, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	err := r.db.QueryRow(
		"SELECT id, email, password_hash, name, role FROM users WHERE email = ?",
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Role)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	user := &models.User{}
	err := r.db.QueryRow(
		"SELECT id, email, name, role, created_at FROM users WHERE id = ?",
		id,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}
