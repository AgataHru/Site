package utils

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// SessionData структура для хранения данных сессии
type SessionData struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
}

// CreateSession создает сессию через куки с base64 кодированием
func CreateSession(w http.ResponseWriter, userID int, email, name string) {
	sessionData := SessionData{
		UserID: userID,
		Email:  email,
		Name:   name,
	}

	// Конвертируем в JSON
	jsonData, err := json.Marshal(sessionData)
	if err != nil {
		fmt.Printf("Ошибка создания сессии: %v\n", err)
		return
	}

	// Кодируем в base64 чтобы избежать проблем с символами в куках
	encodedData := base64.URLEncoding.EncodeToString(jsonData)

	http.SetCookie(w, &http.Cookie{
		Name:     "user_session",
		Value:    encodedData,
		Path:     "/",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	fmt.Printf("Сессия создана: UserID=%d, Email=%s\n", userID, email)
}

// GetUserFromSession получает пользователя из сессии
func GetUserFromSession(r *http.Request) (*SessionData, error) {
	cookie, err := r.Cookie("user_session")
	if err != nil {
		return nil, fmt.Errorf("no session")
	}

	// Декодируем из base64
	decodedData, err := base64.URLEncoding.DecodeString(cookie.Value)
	if err != nil {
		return nil, fmt.Errorf("invalid base64 encoding: %v", err)
	}

	var sessionData SessionData
	err = json.Unmarshal(decodedData, &sessionData)
	if err != nil {
		return nil, fmt.Errorf("invalid session data: %v", err)
	}

	return &sessionData, nil
}

// ClearSession удаляет сессию
func ClearSession(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "user_session",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour),
		HttpOnly: true,
	})
}
