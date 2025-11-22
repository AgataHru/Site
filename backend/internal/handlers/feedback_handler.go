package handlers

import (
	"fmt"
    "encoding/json"
    "net/http"
    "beladonna/backend/internal/models"
    "beladonna/backend/internal/service"
    "beladonna/backend/internal/utils"
)

type FeedbackHandler struct {
    feedbackService *service.FeedbackService
}

func NewFeedbackHandler(feedbackService *service.FeedbackService) *FeedbackHandler {
    return &FeedbackHandler{feedbackService: feedbackService}
}

// Добавляем метод getSessionData
func (h *FeedbackHandler) getSessionData(r *http.Request) (*utils.SessionData, error) {
    return utils.GetUserFromSession(r)
}

func (h *FeedbackHandler) CreateFeedback(w http.ResponseWriter, r *http.Request) {
    // Проверка авторизации
    sessionData, err := h.getSessionData(r)
    if err != nil {
        http.Error(w, "Authentication required", http.StatusUnauthorized)
        return
    }

    // Можно также использовать данные сессии для автоматического заполнения
    // имени и email пользователя, если нужно
    fmt.Printf("User %s (ID: %d) is submitting feedback\n", sessionData.Name, sessionData.UserID)

    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var feedback models.Feedback
    if err := json.NewDecoder(r.Body).Decode(&feedback); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Валидация
    if feedback.Name == "" || feedback.Email == "" || feedback.Message == "" {
        http.Error(w, "Name, email and message are required", http.StatusBadRequest)
        return
    }

    if err := h.feedbackService.CreateFeedback(&feedback); err != nil {
        http.Error(w, "Failed to create feedback", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "success": true,
        "message": "Feedback submitted successfully",
    })
}

func (h *FeedbackHandler) GetFeedbacks(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    feedbacks, err := h.feedbackService.GetVisibleFeedbacks()
    if err != nil {
        http.Error(w, "Failed to get feedbacks", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(feedbacks)
}