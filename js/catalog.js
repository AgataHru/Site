// js/catalog.js
class CatalogManager {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
    }

    async loadProducts(categoryId = 'all', search = '') {
        try {
            const params = new URLSearchParams();
            if (categoryId !== 'all') params.append('category', categoryId);
            if (search) params.append('search', search);

            const response = await fetch(`/api/products?${params}`);
            this.products = await response.json();
            
            this.renderProducts();
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            this.showError('Не удалось загрузить товары');
        }
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        
        if (this.products.length === 0) {
            grid.innerHTML = '<div class="loading">Товары не найдены</div>';
            return;
        }

        grid.innerHTML = this.products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px;">` :
                        '🪟'
                    }
                </div>
                <h3>${product.name}</h3>
                <p class="product-price">${this.formatPrice(product.price)} ₽</p>
                <p class="product-description">${product.description || 'Описание отсутствует'}</p>
                <div class="product-actions">
                    <label for="productModal" class="product-btn" onclick="catalogManager.openProductModal(${product.id})">
                        Подробнее
                    </label>
                    <button class="add-to-cart-btn" onclick="cartManager.addToCart(${product.id})">
                        В корзину
                    </button>
                </div>
            </div>
        `).join('');
    }

    async openProductModal(productId) {
    try {
        console.log('Загрузка информации о товаре ID:', productId);
        
        // === ИСПРАВИЛ: правильный URL для получения товара ===
        const response = await fetch(`/api/product?id=${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Получены данные товара:', product);
        
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) {
            throw new Error('Элемент modalContent не найден');
        }
        
        modalContent.innerHTML = `
            <h2>${product.name || 'Название не указано'}</h2>
            ${product.image_url ? 
                `<img src="${product.image_url}" alt="${product.name}" class="modal-image" onerror="this.style.display='none'">` :
                '<div style="text-align: center; font-size: 4rem; margin: 20px 0;">🪟</div>'
            }
            <p class="modal-price">${this.formatPrice(product.price || 0)} ₽</p>
            <div class="modal-details">
                <p><strong>Материал:</strong> ${product.material || 'Не указан'}</p>
                <p><strong>Категория:</strong> ${product.category_name || 'Не указана'}</p>
                <p><strong>Описание:</strong> ${product.description || 'Описание отсутствует'}</p>
                <p><strong>Наличие:</strong> ${product.in_stock ? 'В наличии' : 'Нет в наличии'}</p>
            </div>
            <div class="modal-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="cartManager.changeQuantity(-1)">-</button>
                    <input type="number" class="quantity-input" id="modalQuantity" value="1" min="1" max="10">
                    <button class="quantity-btn" onclick="cartManager.changeQuantity(1)">+</button>
                </div>
                <button class="add-to-cart-btn" onclick="cartManager.addToCart(${product.id}, parseInt(document.getElementById('modalQuantity').value || 1))">
                    Добавить в корзину
                </button>
            </div>
        `;
        
        // === ДОБАВИЛ: Активируем модальное окно ===
        document.getElementById('productModal').checked = true;
        
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        
        const modalContent = document.getElementById('modalContent');
        if (modalContent) {
            modalContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h2>Ошибка загрузки товара</h2>
                    <p>Не удалось загрузить информацию о товаре</p>
                    <p style="color: #666; font-size: 14px;">${error.message}</p>
                    <button class="product-btn" onclick="document.getElementById('productModal').checked = false">
                        Закрыть
                    </button>
                </div>
            `;
        }
        
        // Все равно открываем модальное окно чтобы показать ошибку
        document.getElementById('productModal').checked = true;
    }
    }

    setupEventListeners() {
        // Фильтрация по категориям
        document.querySelectorAll('.category-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.loadProducts(this.currentCategory, this.currentSearch);
            });
        });

        // Поиск по товарам
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProducts();
            }
        });

        const searchButton = document.querySelector('.search-btn');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.searchProducts();
            });
        }
    }

    searchProducts() {
        this.currentSearch = document.getElementById('searchInput').value;
        this.loadProducts(this.currentCategory, this.currentSearch);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    showError(message) {
        // Простая реализация показа ошибок
        alert(message);
    }
}

// Инициализация каталога
const catalogManager = new CatalogManager();