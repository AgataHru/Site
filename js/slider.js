// Класс для управления слайдером
class Slider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 секунд
        this.isAnimating = false; // Защита от множественных кликов
        
        this.init();
    }

    init() {
        console.log('Инициализация слайдера. Найдено слайдов:', this.slides.length);
        
        // Показываем первый слайд
        this.showSlide(this.currentSlide);
        
        // Запускаем автопрокрутку
        this.startAutoPlay();
        
        // Добавляем обработчики событий
        this.addHoverEvents();
        this.addKeyboardEvents();
    }

    // Показать конкретный слайд
    showSlide(index) {
        if (this.isAnimating || index < 0 || index >= this.slides.length) return;
        
        this.isAnimating = true;
        
        // Скрываем все слайды
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Обновляем точки
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Показываем текущий слайд
        this.slides[index].classList.add('active');
        this.dots[index].classList.add('active');
        
        this.currentSlide = index;
        
        // Сбрасываем флаг анимации после завершения перехода
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    // Переход к следующему слайду
    nextSlide() {
        if (this.isAnimating) return;
        
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
        this.resetAutoPlay();
    }

    // Переход к предыдущему слайду
    prevSlide() {
        if (this.isAnimating) return;
        
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
        this.resetAutoPlay();
    }

    // Переход к конкретному слайду
    goToSlide(slideIndex) {
        if (this.isAnimating || slideIndex === this.currentSlide) return;
        
        this.showSlide(slideIndex);
        this.resetAutoPlay();
    }

    // Автопрокрутка слайдов
    startAutoPlay() {
        this.stopAutoPlay(); // Останавливаем предыдущий интервал
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isAnimating) {
                this.nextSlide();
            }
        }, this.autoPlayDelay);
    }

    // Сброс автопрокрутки (при ручном управлении)
    resetAutoPlay() {
        this.startAutoPlay();
    }

    // Остановка автопрокрутки
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // События при наведении мыши
    addHoverEvents() {
        const sliderContainer = document.querySelector('.slider-container');
        
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                this.stopAutoPlay();
            });
            
            sliderContainer.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }
    }

    // Управление с клавиатуры
    addKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }
}

// Инициализация слайдера при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли слайдер на странице
    const sliderContainer = document.querySelector('.slider-container');
    
    if (sliderContainer) {
        window.slider = new Slider();
        console.log('Слайдер успешно инициализирован');
    } else {
        console.log('Слайдер не найден на странице');
    }
});

// Глобальные функции для кнопок (если нужно вызывать из HTML)
function nextSlide() {
    if (window.slider) {
        window.slider.nextSlide();
    }
}

function prevSlide() {
    if (window.slider) {
        window.slider.prevSlide();
    }
}