// Менеджер для модального окна PDF
class PdfViewer {
    constructor() {
        this.modal = document.getElementById('pdfModal');
        this.pdfViewer = document.getElementById('pdfViewer');
        this.pdfLoading = document.getElementById('pdfLoading');
        this.pdfModalTitle = document.getElementById('pdfModalTitle');
        
        this.init();
    }

    init() {
        // Добавляем обработчики событий
        this.addEventListeners();
    }

    // Открыть модальное окно с PDF
    openPdf(pdfUrl, title = 'Документ') {
        // Устанавливаем заголовок
        this.pdfModalTitle.textContent = title;
        
        // Обновляем ссылку для скачивания
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.href = pdfUrl;
            downloadBtn.download = this.getFileNameFromUrl(pdfUrl);
        }
        
        // Показываем загрузку
        this.showLoading();
        
        // Показываем модальное окно
        this.showModal();
        
        // Загружаем PDF
        this.loadPdf(pdfUrl);
    }

    // Загрузить PDF в iframe
    loadPdf(pdfUrl) {
        // Добавляем параметр для правильного отображения в iframe
        const fullPdfUrl = this.getPdfViewerUrl(pdfUrl);
        
        this.pdfViewer.onload = () => {
            this.hideLoading();
        };
        
        this.pdfViewer.onerror = () => {
            this.hideLoading();
            this.showError('Не удалось загрузить документ');
        };
        
        this.pdfViewer.src = fullPdfUrl;
    }

    // Получить URL для просмотра PDF
    getPdfViewerUrl(pdfUrl) {
        // Для корректного отображения в iframe
        return pdfUrl + '#view=FitH&toolbar=0&navpanes=0';
    }

    // Показать модальное окно
    showModal() {
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
        this.modal.classList.add('show');
    }

    // Скрыть модальное окно
    hideModal() {
        document.body.style.overflow = ''; // Разблокируем прокрутку
        this.modal.classList.remove('show');
        this.pdfViewer.src = ''; // Очищаем iframe
    }

    // Показать индикатор загрузки
    showLoading() {
        this.pdfLoading.style.display = 'flex';
    }

    // Скрыть индикатор загрузки
    hideLoading() {
        this.pdfLoading.style.display = 'none';
    }

    // Показать ошибку
    showError(message) {
        this.pdfLoading.innerHTML = `
            <div style="text-align: center; color: #dc3545;">
                <div style="font-size: 3rem; margin-bottom: 10px;">❌</div>
                <p>${message}</p>
                <button onclick="pdfViewer.hideModal()" style="
                    background: #8B4513;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Закрыть</button>
            </div>
        `;
    }

    // Получить имя файла из URL
    getFileNameFromUrl(url) {
        return url.split('/').pop();
    }

    // Добавить обработчики событий
    addEventListeners() {
        // Закрытие по клику вне модального окна
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Закрытие по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hideModal();
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.pdfViewer = new PdfViewer();
});

// Глобальные функции для вызова из HTML
function openPdfModal(pdfUrl, title) {
    if (window.pdfViewer) {
        window.pdfViewer.openPdf(pdfUrl, title);
    }
}

function closePdfModal() {
    if (window.pdfViewer) {
        window.pdfViewer.hideModal();
    }
}