document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registrationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Начало обработки формы регистрации');
        
        // Сброс ошибок
        clearErrors();
        hideAlerts();
        
        // Валидация паролей
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Пароли не совпадают');
            showServerError('Пароли не совпадают. Проверьте правильность ввода.');
            return;
        }
        
        if (password.length < 6) {
            showError('passwordError', 'Пароль должен содержать минимум 6 символов');
            showServerError('Пароль должен содержать минимум 6 символов.');
            return;
        }
        
        // Проверка согласия с условиями
        if (!document.getElementById('agreeTerms').checked) {
            showError('agreeTermsError', 'Необходимо согласие с условиями');
            showServerError('Для регистрации необходимо согласие с условиями использования.');
            return;
        }
        
        // Сбор данных формы
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: password,
            newsletter: document.getElementById('newsletter').checked,
            agreeTerms: document.getElementById('agreeTerms').checked
        };

        console.log('Отправляемые данные:', formData);

        // Показываем индикатор загрузки
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('Полный ответ:', result);

            if (response.ok) {
                showSuccess('Регистрация успешна! Перенаправляем на страницу входа...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                // Обработка различных ошибок сервера
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

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            const input = errorElement.previousElementSibling;
            if (input && input.tagName === 'INPUT') {
                input.classList.add('error');
            }
        }
    }

    function hideAlerts() {
        document.getElementById('errorAlert').style.display = 'none';
        document.getElementById('successAlert').style.display = 'none';
    }

    function showServerError(message) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorAlert.style.display = 'flex';
        
        // Автоматическое скрытие через 10 секунд
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 10000);
    }

    function showSuccess(message) {
        const successAlert = document.getElementById('successAlert');
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        successAlert.style.display = 'flex';
    }

    function handleServerError(errorMessage) {
        // Преобразование технических ошибок в понятные сообщения
        const userFriendlyMessages = {
            'пользователь с таким email уже существует': 'Пользователь с таким email уже зарегистрирован.',
            'необходимо согласие с условиями использования': 'Для регистрации необходимо согласие с условиями использования.',
            'неверный email или пароль': 'Неверный email или пароль.',
            'все обязательные поля должны быть заполнены': 'Пожалуйста, заполните все обязательные поля.',
            'неверный формат данных': 'Ошибка в данных формы. Проверьте правильность ввода.',
            'password must be at least': 'Пароль должен содержать минимум 6 символов.'
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
});

// Глобальные функции для закрытия уведомлений
function closeError() {
    document.getElementById('errorAlert').style.display = 'none';
}

function closeSuccess() {
    document.getElementById('successAlert').style.display = 'none';
}