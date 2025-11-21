package handlers

import (
	"beladonna/backend/internal/models"
	"beladonna/backend/internal/service"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type ProductHandler struct {
	productService *service.ProductService
}

func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

func (h *ProductHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	filters := models.ProductFilters{
		Search: r.URL.Query().Get("search"),
	}

	if categoryID := r.URL.Query().Get("category"); categoryID != "" {
		if id, err := strconv.Atoi(categoryID); err == nil {
			filters.CategoryID = id
		}
	}

	products, err := h.productService.GetProducts(filters)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error fetching products", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func (h *ProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	product, err := h.productService.GetProductByID(id)
	if err != nil {
		log.Println(err)
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	categories, err := h.productService.GetCategories()
	if err != nil {
		log.Println(err)
		http.Error(w, "Error fetching categories", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
