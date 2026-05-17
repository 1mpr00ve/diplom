# План разработки сайта продажи билетов

## Стек
- **Frontend**: React + Redux + TypeScript + Tailwind CSS v4
- **Backend**: Go + Gin
- **БД**: MySQL 8.0
- **Контейнеры**: Docker + docker-compose

---

## Шаги

### Шаг 1 — Структура проекта и docker-compose ✅
- [x] Создать папки `frontend/`, `backend/`
- [x] Написать `docker-compose.yml` (mysql, adminer, backend, frontend)
- [x] Dockerfile для backend (Go)
- [x] Dockerfile для frontend (React)
- [x] `backend/main.go` и `go.mod` (заглушка с `/api/health`)
- [x] `.env.example`

### Шаг 2 — База данных ✅
- [x] `db/001_schema.sql` — таблицы: `users`, `venues`, `seats`, `events`, `event_seats`, `orders`, `order_items`
- [x] `db/002_seed.sql` — площадка, 60 мест (6 рядов × 10), 3 события, билеты
- [x] Adminer добавлен в docker-compose (порт 8081)
- [x] Кодировка utf8mb4 — поддержка кириллицы

### Шаг 3 — Backend: основа ✅
- [x] Подключение к MySQL (`go-sql-driver/mysql`) — `backend/db/db.go`
- [x] Структура папок: `handlers/`, `models/`, `repository/`, `middleware/`
- [x] `GET /api/health` — возвращает статус сервера и БД
- [x] Gin + CORS middleware в `main.go`

### Шаг 4 — Backend: авторизация ✅
- [x] `POST /api/auth/register`
- [x] `POST /api/auth/login`
- [x] JWT middleware — `middleware/auth.go`

### Шаг 5 — Backend: мероприятия и места ✅
- [x] `GET /api/events` — список событий
- [x] `GET /api/events/:id` — детали события + 60 мест с координатами и статусами

### Шаг 6 — Backend: заказы
- [ ] `POST /api/orders` — создать заказ (транзакция + блокировка мест)
- [ ] `GET /api/orders/:id` — детали заказа
- [ ] `GET /api/me/orders` — история заказов пользователя

### Шаг 7 — Frontend: основа ✅
- [x] Vite + React + TypeScript — `frontend/`
- [x] React Router — роутинг (`/`, `/events/:id`, `/login`, `/checkout`)
- [x] Redux store — `authSlice` (токен, юзер), `cartSlice` (корзина мест)
- [x] Axios-клиент с JWT-интерцептором — `src/api/index.ts`
- [x] TypeScript-типы — `src/types/index.ts`
- [x] Vite настроен на порт 3000, совместим с Docker

### Шаг 8 — Frontend: страницы ✅
- [x] Главная — hero-секция + сетка мероприятий из API
- [x] Страница события — мета-блоки с иконками + схема зала + фиксированная панель корзины
- [x] Страница авторизации — вход / регистрация с tab-переключателем
- [x] Header — логотип, иконка темы, счётчик корзины

### Шаг 9 — Frontend: интерактивная схема зала ✅
- [x] SVG-компонент `SeatMap` с координатами X/Y из БД
- [x] Цвета: стандарт / VIP / выбрано / занято
- [x] Glow-эффект на выбранных местах
- [x] Выбор мест — добавление/удаление из Redux-корзины

### Шаг 9.5 — Frontend: дизайн ✅
- [x] Tailwind CSS v4 — переход с vanilla CSS
- [x] Светлая и тёмная тема с переключателем (localStorage)
- [x] Светлая тема: белый фон, чистый вид
- [x] Тёмная тема: dark navy (#0f172a), карточки #1e293b
- [x] Hero-секция с glow-эффектами и градиентным заголовком
- [x] Карточки событий с градиентной полоской (teal → cyan)
- [x] Фиксированная панель корзины снизу (sticky cart panel)
- [x] Auth-страница с декоративным фоном и labels у полей
- [x] lucide-react иконки в header и страницах

### Шаг 10 — Frontend: оформление заказа
- [ ] Страница checkout — список выбранных мест + сумма
- [ ] `POST /api/orders` — отправка заказа
- [ ] Страница подтверждения заказа

### Шаг 11 — Финальная полировка
- [ ] Обработка ошибок (занятое место, не авторизован и т.д.)
- [ ] Адаптивная верстка
- [ ] Проверка полного флоу: выбор → заказ → подтверждение

---

## Текущий шаг
**Шаг 10** — Frontend: оформление заказа + Шаг 6 — Backend: заказы
