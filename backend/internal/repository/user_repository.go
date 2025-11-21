package repository

import (
	"beladonna/backend/internal/models"
	"database/sql"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(user *models.User) error {
	query := `INSERT INTO users (email, password_hash, first_name, last_name, phone, newsletter) 
              VALUES ($1, $2, $3, $4, $5, $6) 
              RETURNING id, created_at`
	err := r.db.QueryRow(
		query,
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.Phone,
		user.Newsletter,
	).Scan(&user.ID, &user.CreatedAt)
	return err
}

func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, password_hash, first_name, last_name, phone, newsletter, created_at 
              FROM users WHERE email = $1`
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Phone,
		&user.Newsletter,
		&user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (r *UserRepository) UserExists(email string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	err := r.db.QueryRow(query, email).Scan(&exists)
	return exists, err
}

// GetUserByID получает пользователя по ID
func (r *UserRepository) GetUserByID(userID int) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, email, first_name, last_name, phone, newsletter, created_at 
              FROM users WHERE id = $1`
	err := r.db.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Phone,
		&user.Newsletter,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}
