package service

import (
    "beladonna/backend/internal/models"
    "beladonna/backend/internal/repository"
)

type FeedbackService struct {
    feedbackRepo *repository.FeedbackRepository
}

func NewFeedbackService(feedbackRepo *repository.FeedbackRepository) *FeedbackService {
    return &FeedbackService{feedbackRepo: feedbackRepo}
}

func (s *FeedbackService) CreateFeedback(feedback *models.Feedback) error {
    return s.feedbackRepo.CreateFeedback(feedback)
}

func (s *FeedbackService) GetVisibleFeedbacks() ([]models.Feedback, error) {
    return s.feedbackRepo.GetVisibleFeedbacks()
}