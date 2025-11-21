// Функция для проверки авторизации и обновления UI
async function checkAuthAndUpdateUI() {
    console.log('Проверяем авторизацию...');
    
    try {
        const response = await fetch('/api/profile');
        console.log('Статус ответа профиля:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Данные пользователя:', result);
            
            if (result.success) {
                // Пользователь авторизован - показываем личный кабинет
                showUserPanel(result.user);
                return true;
            }
        }
    } catch (error) {
        // Пользователь не авторизован
        console.log('Пользователь не авторизован:', error);
    }
    
    // Показываем кнопку входа
    showLoginButton();
    return false;
}

// Показать личный кабинет
function showUserPanel(user) {
    const loginButton = document.getElementById('loginButton');
    const userPanel = document.getElementById('userPanel');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    console.log('Показываем личный кабинет для:', user);
    
    if (loginButton && userPanel && userName && userEmail) {
        loginButton.style.display = 'none';
        userPanel.style.display = 'flex';
        userName.textContent = user.name;
        userEmail.textContent = user.email;
    }
}

// Показать кнопку входа
function showLoginButton() {
    const loginButton = document.getElementById('loginButton');
    const userPanel = document.getElementById('userPanel');
    
    if (loginButton && userPanel) {
        loginButton.style.display = 'block';
        userPanel.style.display = 'none';
    }
}

// Выход из системы
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            // Успешный выход
            showLoginButton();
            // Перезагружаем страницу чтобы обновить состояние
            window.location.reload();
        }
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        alert('Ошибка при выходе из системы');
    }
}

// Показать корзину
function showCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'flex';
        loadCartItems();
    }
}

// Закрыть корзину
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

// === ЗАМЕНИЛ ЗАГЛУШКУ НА РАБОЧИЙ КОД ===
// Загрузка товаров в корзину
async function loadCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartItems && cartCount && cartTotal && checkoutBtn) {
        try {
            console.log('Загрузка корзины...');
            const response = await fetch('/api/cart');
            
            if (response.ok) {
                const cartData = await response.json();
                console.log('Данные корзины:', cartData);
                
                if (cartData.length > 0) {
                    // Корзина не пустая - отображаем товары
                    let totalPrice = 0;
                    let totalItems = 0;
                    
                    cartItems.innerHTML = cartData.map(item => {
                        const itemTotal = item.price * item.quantity;
                        totalPrice += itemTotal;
                        totalItems += item.quantity;
                        
                        return `
                            <div class="cart-item">
                                <div class="item-info">
                                    <div class="item-name">${item.product_name || 'Товар'}</div>
                                    <div class="item-price">${formatPrice(item.price)} ₽ × ${item.quantity}</div>
                                    <div class="item-total">${formatPrice(itemTotal)} ₽</div>
                                </div>
                                <div class="item-quantity">
                                    <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
                                </div>
                                <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
                            </div>
                        `;
                    }).join('');
                    
                    cartCount.textContent = totalItems;
                    cartTotal.textContent = `${formatPrice(totalPrice)} руб`;
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'Перейти к оформлению';
                    
                } else {
                    // Корзина пустая
                    cartItems.innerHTML = `
                        <div class="empty-cart">
                            <p>Ваша корзина пуста</p>
                            <p>Добавьте товары из каталога</p>
                        </div>
                    `;
                    cartCount.textContent = '0';
                    cartTotal.textContent = '0 руб';
                    checkoutBtn.disabled = true;
                    checkoutBtn.textContent = 'Корзина пуста';
                }
                
            } else if (response.status === 401) {
                // Пользователь не авторизован
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <p>Для просмотра корзины необходимо войти в систему</p>
                        <button class="auth-btn" onclick="window.location.href='pages/login.html'">Войти</button>
                    </div>
                `;
                cartCount.textContent = '0';
                cartTotal.textContent = '0 руб';
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Войдите в систему';
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Ошибка загрузки корзины</p>
                    <p>Попробуйте обновить страницу</p>
                </div>
            `;
            cartCount.textContent = '0';
            cartTotal.textContent = '0 руб';
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Ошибка';
        }
    }
}

// Функция для форматирования цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

// Обновление количества товара в корзине
async function updateCartItem(itemId, newQuantity) {
    try {
        if (newQuantity < 1) {
            await removeFromCart(itemId);
            return;
        }
        
        const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                item_id: itemId,
                quantity: newQuantity
            })
        });
        
        if (response.ok) {
            await loadCartItems(); // Перезагружаем корзину
        } else {
            alert('Ошибка обновления количества');
        }
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        alert('Ошибка обновления количества');
    }
}

// Удаление товара из корзины
async function removeFromCart(itemId) {
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
            await loadCartItems(); // Перезагружаем корзину
            alert('Товар удален из корзины');
        } else {
            alert('Ошибка удаления товара');
        }
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Ошибка удаления товара');
    }
}
// === КОНЕЦ ЗАМЕНЫ ===

// Закрытие корзины при клике вне ее области
document.addEventListener('click', function(e) {
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.style.display === 'flex' && e.target === cartModal) {
        closeCart();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загружен user-panel.js');
    checkAuthAndUpdateUI();
});

// js/user-panel.js
function updateUserPanel(user) {
    const loginButton = document.getElementById('loginButton');
    const userPanel = document.getElementById('userPanel');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    if (user) {
        loginButton.style.display = 'none';
        userPanel.style.display = 'flex';
        userName.textContent = `${user.first_name} ${user.last_name}`;
        userEmail.textContent = user.email;
    } else {
        loginButton.style.display = 'block';
        userPanel.style.display = 'none';
    }
}

// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const userData = await response.json();
            updateUserPanel(userData.user);
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
});


