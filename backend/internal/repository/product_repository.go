package repository

import (
	"beladonna/backend/internal/models"
	"database/sql"
	"fmt"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) GetProducts(filters models.ProductFilters) ([]models.Product, error) {
	query := `
        SELECT p.id, p.name, p.description, p.price, p.category_id, 
               c.name as category_name, p.image_url, p.in_stock, p.material, p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    `

	args := []interface{}{}
	argPos := 1

	if filters.CategoryID > 0 {
		query += fmt.Sprintf(" AND p.category_id = $%d", argPos)
		args = append(args, filters.CategoryID)
		argPos++
	}

	if filters.Search != "" {
		query += fmt.Sprintf(" AND (p.name ILIKE $%d OR p.description ILIKE $%d)", argPos, argPos)
		args = append(args, "%"+filters.Search+"%")
		argPos++
	}

	if filters.MinPrice > 0 {
		query += fmt.Sprintf(" AND p.price >= $%d", argPos)
		args = append(args, filters.MinPrice)
		argPos++
	}

	if filters.MaxPrice > 0 {
		query += fmt.Sprintf(" AND p.price <= $%d", argPos)
		args = append(args, filters.MaxPrice)
		argPos++
	}

	query += " AND p.in_stock = true ORDER BY p.created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.CategoryID,
			&p.CategoryName, &p.ImageURL, &p.InStock, &p.Material, &p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

func (r *ProductRepository) GetProductByID(id int) (*models.Product, error) {
	query := `
        SELECT p.id, p.name, p.description, p.price, p.category_id, 
               c.name as category_name, p.image_url, p.in_stock, p.material, p.created_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
    `

	row := r.db.QueryRow(query, id)

	var p models.Product
	err := row.Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.CategoryID,
		&p.CategoryName, &p.ImageURL, &p.InStock, &p.Material, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *ProductRepository) GetCategories() ([]models.Category, error) {
	query := `SELECT id, name, description, created_at FROM categories ORDER BY name`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}

	return categories, nil
}
