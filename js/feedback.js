// Функция для отправки отзыва
async function submitFeedback() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const theme = document.getElementById('theme').value;
    const text = document.getElementById('text').value;

    // Валидация
    if (!name || !email || !text) {
        alert('Пожалуйста, заполните обязательные поля: Имя, Email и Сообщение');
        return;
    }

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                theme: theme,
                message: text
            })
        });

        if (response.status === 401) {
            alert('Для отправки отзыва необходимо войти в систему.');
            // Перенаправляем на страницу входа
            window.location.href = './login.html';
            return;
        }

        const result = await response.json();

        if (response.ok) {
            alert('Отзыв успешно отправлен! Спасибо за ваше мнение.');
            // Очищаем форму
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('theme').value = '';
            document.getElementById('text').value = '';
            
            // Обновляем список отзывов
            loadFeedbacks();
        } else {
            alert('Ошибка при отправке отзыва: ' + (result.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
    }
}

// Функция для загрузки и отображения отзывов
async function loadFeedbacks() {
    try {
        const response = await fetch('/api/feedbacks');
        const feedbacks = await response.json();

        const container = document.getElementById('feedbacksContainer');
        
        if (!response.ok || !feedbacks || feedbacks.length === 0) {
            container.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
            return;
        }

        container.innerHTML = feedbacks.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <strong>${escapeHtml(feedback.name)}</strong>
                    <span class="feedback-date">${formatDate(feedback.created_at)}</span>
                </div>
                ${feedback.theme ? `<div class="feedback-theme">Тема: ${escapeHtml(feedback.theme)}</div>` : ''}
                <div class="feedback-message">${escapeHtml(feedback.message)}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        document.getElementById('feedbacksContainer').innerHTML = 
            '<p>Ошибка при загрузке отзывов. Пожалуйста, обновите страницу.</p>';
    }
}

// Вспомогательные функции
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Загружаем отзывы при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadFeedbacks();
});