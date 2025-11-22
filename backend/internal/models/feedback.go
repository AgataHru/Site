package models

import (
    "time"
)

type Feedback struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    Theme     string    `json:"theme"`
    Message   string    `json:"message"`
    CreatedAt time.Time `json:"created_at"`
    IsVisible bool      `json:"is_visible"`
}