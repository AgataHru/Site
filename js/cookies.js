// Менеджер соглашения на куки
class CookieConsentManager {
    constructor() {
        this.cookieName = 'cookie_consent';
        this.consentDuration = 365; // дней
        this.init();
    }

    init() {
        // Проверяем, было ли уже дано согласие
        if (!this.getCookie(this.cookieName)) {
            this.showBanner();
        }
        
        this.setupEventListeners();
    }

    showBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            // Небольшая задержка для лучшего UX
            setTimeout(() => {
                banner.classList.add('show');
            }, 1000);
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('show');
            // Удаляем элемент из DOM после анимации
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    setupEventListeners() {
        // Кнопка принятия
        const acceptBtn = document.getElementById('cookieAccept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.setConsent('accepted');
                this.hideBanner();
            });
        }

        // Кнопка отклонения
        const rejectBtn = document.getElementById('cookieReject');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                this.setConsent('rejected');
                this.hideBanner();
            });
        }
    }

    setConsent(status) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.consentDuration);
        
        document.cookie = `${this.cookieName}=${status}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        
        // Вызываем событие для других частей приложения
        this.dispatchCookieEvent(status);
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    getConsentStatus() {
        return this.getCookie(this.cookieName);
    }

    dispatchCookieEvent(status) {
        const event = new CustomEvent('cookieConsent', {
            detail: { status: status }
        });
        window.dispatchEvent(event);
    }

    // Метод для проверки, можно ли использовать куки
    canUseCookies() {
        const status = this.getConsentStatus();
        return status === 'accepted';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.cookieConsentManager = new CookieConsentManager();
});

// Пример использования в других частях приложения:
// if (window.cookieConsentManager && window.cookieConsentManager.canUseCookies()) {
//     // Разрешаем использование куки и аналитики
// }