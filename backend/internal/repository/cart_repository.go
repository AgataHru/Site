package repository

import (
	"beladonna/backend/internal/models"
	"database/sql"
)

type CartRepository struct {
	db *sql.DB
}

func NewCartRepository(db *sql.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) GetCartItems(userID int) ([]models.CartItem, error) {
	query := `
        SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, 
               p.name as product_name, p.price, p.image_url, ci.added_at
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1
        ORDER BY ci.added_at DESC
    `

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var item models.CartItem
		err := rows.Scan(
			&item.ID, &item.UserID, &item.ProductID, &item.Quantity,
			&item.ProductName, &item.Price, &item.ImageURL, &item.AddedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *CartRepository) AddToCart(userID, productID, quantity int) error {
	query := `
        INSERT INTO cart_items (user_id, product_id, quantity) 
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id) 
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    `

	_, err := r.db.Exec(query, userID, productID, quantity)
	return err
}

func (r *CartRepository) UpdateCartItem(itemID, quantity int) error {
	if quantity <= 0 {
		return r.RemoveFromCart(itemID)
	}

	query := `UPDATE cart_items SET quantity = $1 WHERE id = $2`
	_, err := r.db.Exec(query, quantity, itemID)
	return err
}

func (r *CartRepository) RemoveFromCart(itemID int) error {
	query := `DELETE FROM cart_items WHERE id = $1`
	_, err := r.db.Exec(query, itemID)
	return err
}

func (r *CartRepository) ClearUserCart(userID int) error {
	query := `DELETE FROM cart_items WHERE user_id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}

func (r *CartRepository) GetCartItemByID(itemID int) (*models.CartItem, error) {
	query := `
        SELECT id, user_id, product_id, quantity, added_at
        FROM cart_items 
        WHERE id = $1
    `

	row := r.db.QueryRow(query, itemID)

	var item models.CartItem
	err := row.Scan(&item.ID, &item.UserID, &item.ProductID, &item.Quantity, &item.AddedAt)
	if err != nil {
		return nil, err
	}

	return &item, nil
}
