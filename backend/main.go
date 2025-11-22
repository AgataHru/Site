package main

import (
	"beladonna/backend/config"
	"beladonna/backend/internal/handlers"
	"beladonna/backend/internal/repository"
	"beladonna/backend/internal/service"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatal("Config error:", err)
	}
	defer cfg.DB.Close()

	// Выполнить миграции
	err = config.RunMigrations(cfg.DB, "backend/migrations/001_init.sql")
	if err != nil {
		log.Printf("Migration warning: %v", err)
	}

	// === ДОБАВЛЕНО: Инициализация репозиториев и сервисов для корзины и продуктов ===
	userRepo := repository.NewUserRepository(cfg.DB)
	productRepo := repository.NewProductRepository(cfg.DB) // ДОБАВЛЕНО
	cartRepo := repository.NewCartRepository(cfg.DB)       // ДОБАВЛЕНО

	// === ДОБАВЛЕНО: Инициализация сервисов для корзины и продуктов ===
	authService := service.NewAuthService(userRepo)
	productService := service.NewProductService(productRepo) // ДОБАВЛЕНО
	cartService := service.NewCartService(cartRepo)          // ДОБАВЛЕНО

	// === ДОБАВЛЕНО: Инициализация обработчиков для корзины и продуктов ===
	authHandler := handlers.NewAuthHandler(authService)
	productHandler := handlers.NewProductHandler(productService) // ДОБАВЛЕНО
	cartHandler := handlers.NewCartHandler(cartService)          // ДОБАВЛЕНО

	feedbackRepo := repository.NewFeedbackRepository(cfg.DB)
	feedbackService := service.NewFeedbackService(feedbackRepo)
	feedbackHandler := handlers.NewFeedbackHandler(feedbackService)

	// Настройка CORS для разработки
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization")

			if r.Method == "OPTIONS" {
				return
			}

			next(w, r)
		}
	}

	// Статические файлы - НЕ ИЗМЕНЯЛОСЬ
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)

	// API routes - существующие маршруты (НЕ ИЗМЕНЯЛИСЬ)
	http.HandleFunc("/api/register", corsMiddleware(authHandler.Register))
	http.HandleFunc("/api/login", corsMiddleware(authHandler.Login))
	http.HandleFunc("/api/logout", authHandler.Logout)
	http.HandleFunc("/api/profile", authHandler.Profile)

	// === ДОБАВЛЕНО: Маршруты для каталога товаров ===
	http.HandleFunc("/api/products", corsMiddleware(productHandler.GetProducts))
	http.HandleFunc("/api/product", corsMiddleware(productHandler.GetProduct))
	http.HandleFunc("/api/categories", corsMiddleware(productHandler.GetCategories))

	http.HandleFunc("/api/feedback", feedbackHandler.CreateFeedback)
	http.HandleFunc("/api/feedbacks", feedbackHandler.GetFeedbacks)

	// === ДОБАВЛЕНО: Маршруты для корзины ===
	http.HandleFunc("/api/cart", func(w http.ResponseWriter, r *http.Request) {
		// Применяем CORS middleware
		corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				cartHandler.GetCart(w, r)
			case http.MethodPost:
				cartHandler.AddToCart(w, r)
			case http.MethodPut:
				cartHandler.UpdateCart(w, r)
			case http.MethodDelete:
				cartHandler.RemoveFromCart(w, r)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	// Существующий health check - НЕ ИЗМЕНЯЛОСЬ
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok", "database": "connected"}`))
	})

	log.Println("Server starting on http://localhost:8080")
	log.Println("✅ Аутентификация: /api/register, /api/login, /api/logout, /api/profile")
	log.Println("✅ Каталог товаров: /api/products, /api/product, /api/categories") // ДОБАВЛЕНО
	log.Println("✅ Корзина: /api/cart (GET, POST, PUT, DELETE)")                   // ДОБАВЛЕНО
	log.Fatal(http.ListenAndServe(":8080", nil))
}
