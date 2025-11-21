package service

import (
	"beladonna/backend/internal/models"
	"beladonna/backend/internal/repository"
)

type ProductService struct {
	productRepo *repository.ProductRepository
}

func NewProductService(productRepo *repository.ProductRepository) *ProductService {
	return &ProductService{productRepo: productRepo}
}

func (s *ProductService) GetProducts(filters models.ProductFilters) ([]models.Product, error) {
	return s.productRepo.GetProducts(filters)
}

func (s *ProductService) GetProductByID(id int) (*models.Product, error) {
	return s.productRepo.GetProductByID(id)
}

func (s *ProductService) GetCategories() ([]models.Category, error) {
	return s.productRepo.GetCategories()
}
