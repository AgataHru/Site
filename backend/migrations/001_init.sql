-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    newsletter BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Категории товаров
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Товары
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    image_url VARCHAR(500),
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Корзина
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Сессии (если еще нет)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Вставляем тестовые данные
INSERT INTO categories (name, description) VALUES 
('Классические', 'Элегантные классические дизайны'),
('Современные', 'Современные стили и решения'),
('Римские', 'Практичные римские шторы'),
('Японские', 'Минималистичные японские панели')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, category_id, image_url) VALUES 
('Классические льняные шторы', 'Элегантные льняные шторы для гостиной с традиционным дизайном', 4500.00, 1, '/images/ClassicLen.jpg'),
('Современные черные шторы', 'Стильные черные шторы для спальни в современном стиле', 5200.00, 2, '/images/ModernBlack.jpg'),
('Римские бежевые шторы', 'Практичные римские шторы для кухни и офиса', 3800.00, 3, '/images/RimBej.jpg'),
('Японские панели "Минимал"', 'Минималистичные японские панели для современного интерьера', 6200.00, 4, '/images/japaneseMinimal.jpg'),
('Классические портьеры "Версаль"', 'Роскошные портьеры с золотой вышивкой', 7800.00, 1, '/images/Versal.jpeg'),
('Современные рулонные шторы', 'Функциональные рулонные шторы с механизмом фиксации', 3400.00, 2, '/images/ModernRulon.jpg')
ON CONFLICT (name) DO NOTHING;

-- Добавить поле material если таблица уже существует
ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(100);

-- Обновить существующие записи с материалами
UPDATE products SET material = 'Натуральный лен' WHERE name LIKE '%льняные%';
UPDATE products SET material = 'Полиэстер с тефлоновым покрытием' WHERE name LIKE '%черные%';
UPDATE products SET material = 'Плотный полиэстер' WHERE name LIKE '%имские%' AND name LIKE '%бежевые%';
UPDATE products SET material = 'Натуральный хлопок' WHERE name LIKE '%понские%';
UPDATE products SET material = 'Атлас с золотой нитью' WHERE name LIKE '%портьеры%' AND name LIKE '%Версаль%';
UPDATE products SET material = 'Синтетическая ткань' WHERE name LIKE '%рулонные%';