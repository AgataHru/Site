package service

import (
	"beladonna/backend/internal/models"
	"beladonna/backend/internal/repository"
	"beladonna/backend/internal/utils"
	"errors"
	"log"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.AuthResponse, error) {
	log.Printf("Начало регистрации для email: %s", req.Email)

	// Проверяем согласие с условиями
	if !req.AgreeTerms {
		log.Printf("Пользователь %s не согласился с условиями", req.Email)
		return nil, errors.New("необходимо согласие с условиями использования")
	}

	// Проверяем существование пользователя
	log.Printf("Проверка существования пользователя: %s", req.Email)
	exists, err := s.userRepo.UserExists(req.Email)
	if err != nil {
		log.Printf("Ошибка проверки пользователя: %v", err)
		return nil, err
	}
	if exists {
		log.Printf("Пользователь %s уже существует", req.Email)
		return nil, errors.New("пользователь с таким email уже существует")
	}

	// Хешируем пароль
	log.Printf("Хеширование пароля для: %s", req.Email)
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("Ошибка хеширования пароля: %v", err)
		return nil, err
	}

	// Создаем пользователя
	user := &models.User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Phone:        req.Phone,
		Newsletter:   req.Newsletter,
	}

	log.Printf("Создание пользователя в БД: %s %s", user.FirstName, user.LastName)
	err = s.userRepo.CreateUser(user)
	if err != nil {
		log.Printf("Ошибка создания пользователя в БД: %v", err)
		return nil, err
	}

	log.Printf("Пользователь успешно создан: ID=%d", user.ID)
	return &models.AuthResponse{
		Success: true,
		Message: "Регистрация успешна",
		UserID:  user.ID,
		Name:    user.FirstName + " " + user.LastName,
	}, nil
}

func (s *AuthService) Login(req models.LoginRequest) (*models.AuthResponse, error) {
	log.Printf("Попытка входа для email: %s", req.Email)

	user, err := s.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("Ошибка получения пользователя: %v", err)
		return nil, err
	}
	if user == nil {
		log.Printf("Пользователь не найден: %s", req.Email)
		return nil, errors.New("неверный email или пароль")
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		log.Printf("Неверный пароль для: %s", req.Email)
		return nil, errors.New("неверный email или пароль")
	}

	log.Printf("Успешный вход: %s", req.Email)
	return &models.AuthResponse{
		Success: true,
		Message: "Вход выполнен успешно",
		UserID:  user.ID,
		Name:    user.FirstName + " " + user.LastName,
	}, nil
}

// GetUserByID получает пользователя по ID
func (s *AuthService) GetUserByID(userID int) (*models.User, error) {
	log.Printf("Получение пользователя по ID: %d", userID)

	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		log.Printf("Ошибка получения пользователя по ID %d: %v", userID, err)
		return nil, err
	}

	log.Printf("Пользователь найден: ID=%d, Email=%s", user.ID, user.Email)
	return user, nil
}
