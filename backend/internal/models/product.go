package models

import (
	"time"
)

type Category struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type Product struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Price        float64   `json:"price"`
	CategoryID   int       `json:"category_id"`
	CategoryName string    `json:"category_name,omitempty"`
	ImageURL     string    `json:"image_url"`
	InStock      bool      `json:"in_stock"`
	CreatedAt    time.Time `json:"created_at"`
}

type CartItem struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	ProductID   int       `json:"product_id"`
	Quantity    int       `json:"quantity"`
	ProductName string    `json:"product_name"`
	Price       float64   `json:"price"`
	ImageURL    string    `json:"image_url"`
	AddedAt     time.Time `json:"added_at"`
}

type ProductFilters struct {
	CategoryID int     `json:"category_id"`
	Search     string  `json:"search"`
	MinPrice   float64 `json:"min_price"`
	MaxPrice   float64 `json:"max_price"`
	InStock    bool    `json:"in_stock"`
}
