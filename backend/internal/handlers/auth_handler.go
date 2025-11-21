package handlers

import (
	"beladonna/backend/internal/models"
	"beladonna/backend/internal/service"
	"beladonna/backend/internal/utils"
	"encoding/json"
	"log"
	"net/http"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register обработчик регистрации
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	log.Println("=== НОВЫЙ ЗАПРОС РЕГИСТРАЦИИ ===")
	log.Printf("Метод: %s", r.Method)
	log.Printf("URL: %s", r.URL)

	if r.Method != http.MethodPost {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		sendErrorResponse(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	log.Printf("Получены данные: %+v", req)

	// Валидация обязательных полей
	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		log.Printf("Не все обязательные поля заполнены: Email=%t, Password=%t, FirstName=%t, LastName=%t",
			req.Email != "", req.Password != "", req.FirstName != "", req.LastName != "")
		sendErrorResponse(w, "Все обязательные поля должны быть заполнены", http.StatusBadRequest)
		return
	}

	if !req.AgreeTerms {
		log.Printf("Пользователь %s не согласился с условиями", req.Email)
		sendErrorResponse(w, "Необходимо согласие с условиями использования", http.StatusBadRequest)
		return
	}

	response, err := h.authService.Register(req)
	if err != nil {
		log.Printf("Ошибка сервиса регистрации: %v", err)
		sendErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Создаем сессию после успешной регистрации
	fullName := req.FirstName + " " + req.LastName
	log.Printf("Создание сессии для пользователя: ID=%d, Email=%s, Name=%s", response.UserID, req.Email, fullName)
	utils.CreateSession(w, response.UserID, req.Email, fullName)

	w.Header().Set("Content-Type", "application/json")
	log.Printf("Успешная регистрация: %+v", response)
	json.NewEncoder(w).Encode(response)
}

// Login обработчик входа
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	log.Println("=== НОВЫЙ ЗАПРОС ВХОДА ===")
	log.Printf("Метод: %s", r.Method)
	log.Printf("URL: %s", r.URL)

	if r.Method != http.MethodPost {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		sendErrorResponse(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	log.Printf("Получены данные для входа: Email=%s, RememberMe=%t", req.Email, req.RememberMe)

	if req.Email == "" || req.Password == "" {
		log.Printf("Отсутствует email или пароль")
		sendErrorResponse(w, "Email и пароль обязательны", http.StatusBadRequest)
		return
	}

	response, err := h.authService.Login(req)
	if err != nil {
		log.Printf("Ошибка входа: %v", err)
		sendErrorResponse(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Создаем сессию после успешного входа
	log.Printf("Создание сессии для пользователя: ID=%d, Email=%s, Name=%s", response.UserID, req.Email, response.Name)
	utils.CreateSession(w, response.UserID, req.Email, response.Name)

	w.Header().Set("Content-Type", "application/json")
	log.Printf("Успешный вход: %+v", response)
	json.NewEncoder(w).Encode(response)
}

// Logout обработчик выхода
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	log.Println("=== ЗАПРОС ВЫХОДА ===")

	// Получаем информацию о пользователе перед выходом для логирования
	session, err := utils.GetUserFromSession(r)
	if err == nil {
		log.Printf("Выход пользователя: ID=%d, Email=%s, Name=%s", session.UserID, session.Email, session.Name)
	} else {
		log.Printf("Выход: пользователь не авторизован")
	}

	utils.ClearSession(w)

	w.Header().Set("Content-Type", "application/json")
	log.Println("Выход выполнен успешно")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Выход выполнен успешно",
	})
}

// Profile получение данных пользователя
func (h *AuthHandler) Profile(w http.ResponseWriter, r *http.Request) {
	log.Println("=== ЗАПРОС ПРОФИЛЯ ===")

	session, err := utils.GetUserFromSession(r)
	if err != nil {
		log.Printf("Ошибка получения сессии: %v", err)
		sendErrorResponse(w, "Неавторизован", http.StatusUnauthorized)
		return
	}

	log.Printf("Получение данных пользователя из сессии: ID=%d, Email=%s, Name=%s",
		session.UserID, session.Email, session.Name)

	w.Header().Set("Content-Type", "application/json")
	log.Printf("Отправка данных пользователя: %+v", session)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user": map[string]interface{}{
			"id":    session.UserID,
			"email": session.Email,
			"name":  session.Name,
		},
	})
}

// Вспомогательная функция для отправки ошибок
func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	log.Printf("Отправка ошибки: %s (код: %d)", message, statusCode)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"message": message,
		"error":   true,
	})
}

// Добавьте этот метод в AuthHandler
func (h *AuthHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionData, err := utils.GetUserFromSession(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.authService.GetUserByID(sessionData.UserID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"user": map[string]interface{}{
			"id":         user.ID,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
