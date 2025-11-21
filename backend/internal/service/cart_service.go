package service

import (
	"beladonna/backend/internal/models"
	"beladonna/backend/internal/repository"
	"fmt"
)

type CartService struct {
	cartRepo *repository.CartRepository
}

func NewCartService(cartRepo *repository.CartRepository) *CartService {
	return &CartService{cartRepo: cartRepo}
}

func (s *CartService) GetCartItems(userID int) ([]models.CartItem, error) {
	return s.cartRepo.GetCartItems(userID)
}

func (s *CartService) AddToCart(userID, productID, quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("quantity must be positive")
	}
	return s.cartRepo.AddToCart(userID, productID, quantity)
}

func (s *CartService) UpdateCartItem(userID, itemID, quantity int) error {
	// Проверяем, что товар принадлежит пользователю
	item, err := s.cartRepo.GetCartItemByID(itemID)
	if err != nil {
		return err
	}
	if item.UserID != userID {
		return fmt.Errorf("unauthorized")
	}

	return s.cartRepo.UpdateCartItem(itemID, quantity)
}

func (s *CartService) RemoveFromCart(userID, itemID int) error {
	// Проверяем, что товар принадлежит пользователю
	item, err := s.cartRepo.GetCartItemByID(itemID)
	if err != nil {
		return err
	}
	if item.UserID != userID {
		return fmt.Errorf("unauthorized")
	}

	return s.cartRepo.RemoveFromCart(itemID)
}

func (s *CartService) ClearCart(userID int) error {
	return s.cartRepo.ClearUserCart(userID)
}
