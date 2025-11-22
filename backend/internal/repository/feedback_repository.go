package repository

import (
    "database/sql"
    "time"
    "beladonna/backend/internal/models"
)

type FeedbackRepository struct {
    DB *sql.DB
}

func NewFeedbackRepository(db *sql.DB) *FeedbackRepository {
    return &FeedbackRepository{DB: db}
}

func (r *FeedbackRepository) CreateFeedback(feedback *models.Feedback) error {
    query := `INSERT INTO feedbacks (name, email, theme, message, created_at, is_visible) 
              VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
    
    err := r.DB.QueryRow(
        query,
        feedback.Name,
        feedback.Email,
        feedback.Theme,
        feedback.Message,
        time.Now(),
        true,
    ).Scan(&feedback.ID)
    
    return err
}

func (r *FeedbackRepository) GetVisibleFeedbacks() ([]models.Feedback, error) {
    query := `SELECT id, name, email, theme, message, created_at 
              FROM feedbacks 
              WHERE is_visible = true 
              ORDER BY created_at DESC`
    
    rows, err := r.DB.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var feedbacks []models.Feedback
    for rows.Next() {
        var feedback models.Feedback
        err := rows.Scan(
            &feedback.ID,
            &feedback.Name,
            &feedback.Email,
            &feedback.Theme,
            &feedback.Message,
            &feedback.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        feedbacks = append(feedbacks, feedback)
    }
    
    return feedbacks, nil
}