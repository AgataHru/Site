document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию при загрузке страницы
    checkAuth();
    
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Начало обработки формы входа');
        
        // Сброс ошибок
        clearErrors();
        hideAlerts();
        
        // Сбор данных формы
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        console.log('Отправляемые данные:', formData);

        // Показываем индикатор загрузки
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Вход...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('Статус ответа:', response.status);
            console.log('OK:', response.ok);

            const result = await response.json();
            console.log('Полный ответ:', result);

            if (response.ok && result.success) {
                showSuccess('Вход выполнен успешно! Перенаправляем на главную страницу...');
                
                // Сохраняем информацию о пользователе в localStorage (опционально)
                localStorage.setItem('user', JSON.stringify({
                    id: result.user_id,
                    name: result.name
                }));
                
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                handleServerError(result.message || result);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            showServerError('Ошибка соединения с сервером. Проверьте интернет-соединение.');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Функции для работы с ошибками
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.previousElementSibling?.classList?.remove('error');
        });
    }

    function hideAlerts() {
        const errorAlert = document.getElementById('errorAlert');
        const successAlert = document.getElementById('successAlert');
        if (errorAlert) errorAlert.style.display = 'none';
        if (successAlert) successAlert.style.display = 'none';
    }

    function showServerError(message) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        if (errorAlert && errorMessage) {
            errorMessage.textContent = message;
            errorAlert.style.display = 'flex';
            
            // Автоматическое скрытие через 10 секунд
            setTimeout(() => {
                errorAlert.style.display = 'none';
            }, 10000);
        } else {
            alert('Ошибка: ' + message); // fallback
        }
    }

    function showSuccess(message) {
        const successAlert = document.getElementById('successAlert');
        const successMessage = document.getElementById('successMessage');
        if (successAlert && successMessage) {
            successMessage.textContent = message;
            successAlert.style.display = 'flex';
        } else {
            alert(message); // fallback
        }
    }

    function handleServerError(errorMessage) {
        // Преобразование технических ошибок в понятные сообщения
        const userFriendlyMessages = {
            'неверный email или пароль': 'Неверный email или пароль.',
            'пользователь с таким email уже существует': 'Пользователь с таким email уже зарегистрирован.',
            'все обязательные поля должны быть заполнены': 'Пожалуйста, заполните все обязательные поля.',
            'неверный формат данных': 'Ошибка в данных формы. Проверьте правильность ввода.',
        };

        // Ищем понятное сообщение или используем оригинальное
        let friendlyMessage = errorMessage;
        for (const [tech, friendly] of Object.entries(userFriendlyMessages)) {
            if (errorMessage.toLowerCase().includes(tech.toLowerCase())) {
                friendlyMessage = friendly;
                break;
            }
        }

        showServerError(friendlyMessage);
    }

    // Проверка авторизации
    async function checkAuth() {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Пользователь уже авторизован - перенаправляем на главную
                    console.log('Пользователь уже авторизован, перенаправляем...');
                    window.location.href = '../index.html';
                }
            }
        } catch (error) {
            // Пользователь не авторизован - остаемся на странице входа
            console.log('Пользователь не авторизован');
        }
    }
});

// Глобальные функции для закрытия уведомлений (должны быть вне DOMContentLoaded)
function closeError() {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        errorAlert.style.display = 'none';
    }
}

function closeSuccess() {
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.style.display = 'none';
    }
}