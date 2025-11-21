// js/cart.js
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        // Не загружаем корзину сразу - дождемся проверки авторизации
    }

    async loadCart() {
        try {
            console.log('Загрузка корзины...');
            const response = await fetch('/api/cart');
            
            if (response.status === 401) {
                console.log('Пользователь не авторизован, корзина пустая');
                this.cart = [];
                this.updateCartUI();
                return;
            }
            
            if (response.ok) {
                this.cart = await response.json();
                console.log('Корзина загружена:', this.cart);
                this.updateCartUI();
            } else {
                console.error('Ошибка загрузки корзины:', response.status);
                this.cart = [];
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            this.cart = [];
            this.updateCartUI();
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            console.log('Добавление товара в корзину:', productId, quantity);
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            if (response.ok) {
                await this.loadCart();
                this.showMessage('Товар добавлен в корзину', 'success');
            } else if (response.status === 401) {
                this.showMessage('Для добавления в корзину необходимо войти в систему', 'error');
            } else {
                this.showMessage('Ошибка добавления в корзину', 'error');
            }
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            this.showMessage('Ошибка добавления в корзину', 'error');
        }
    }

    async updateCartItem(itemId, quantity) {
        try {
            const response = await fetch('/api/cart', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    item_id: itemId,
                    quantity: quantity
                })
            });

            if (response.ok) {
                await this.loadCart();
            }
        } catch (error) {
            console.error('Ошибка обновления корзины:', error);
        }
    }

    async removeFromCart(itemId) {
        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    item_id: itemId
                })
            });

            if (response.ok) {
                await this.loadCart();
                this.showMessage('Товар удален из корзины', 'success');
            }
        } catch (error) {
            console.error('Ошибка удаления из корзины:', error);
        }
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        console.log('Обновление UI корзины:', this.cart);

        // Обновляем счетчик
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }

        // Обновляем список товаров в модальном окне
        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
                if (cartTotal) cartTotal.textContent = '0 руб';
                if (checkoutBtn) checkoutBtn.disabled = true;
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div class="item-info">
                            <div class="item-name">${item.product_name}</div>
                            <div class="item-price">${this.formatPrice(item.price)} ₽ × ${item.quantity}</div>
                        </div>
                        <div class="item-quantity">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="cartManager.removeFromCart(${item.id})">×</button>
                    </div>
                `).join('');

                // Обновляем итоговую сумму
                const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                if (cartTotal) cartTotal.textContent = `${this.formatPrice(total)} руб`;
                if (checkoutBtn) checkoutBtn.disabled = false;
            }
        }
    }

    async updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            await this.removeFromCart(itemId);
        } else {
            await this.updateCartItem(itemId, newQuantity);
        }
    }

    changeQuantity(delta) {
        const input = document.getElementById('modalQuantity');
        if (input) {
            const newValue = parseInt(input.value) + delta;
            if (newValue >= 1 && newValue <= 10) {
                input.value = newValue;
            }
        }
    }

    setupEventListeners() {
        // Закрытие корзины при клике вне ее
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target.id === 'cartModal') {
                    this.closeCart();
                }
            });
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    showMessage(message, type) {
        console.log(`${type}: ${message}`);
        alert(message);
    }

    showCart() {
        // Всегда загружаем корзину при открытии
        this.loadCart().then(() => {
            const cartModal = document.getElementById('cartModal');
            if (cartModal) {
                cartModal.classList.add('show');
            }
        });
    }

    closeCart() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('show');
        }
    }
}

// Инициализация корзины и делаем глобальной
window.cartManager = new CartManager();

// Глобальные функции для HTML
function showCart() {
    window.cartManager.showCart();
}

function closeCart() {
    window.cartManager.closeCart();
}