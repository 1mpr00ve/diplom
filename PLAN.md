# План разработки сайта продажи билетов

## Стек
- **Frontend**: React + Redux + TypeScript
- **Backend**: Go + Gin
- **БД**: MySQL 8.0
- **Контейнеры**: Docker + docker-compose

---

## Шаги

### Шаг 1 — Структура проекта и docker-compose ✅
- [x] Создать папки `frontend/`, `backend/`
- [x] Написать `docker-compose.yml` (postgres, backend, frontend)
- [x] Dockerfile для backend (Go)
- [x] Dockerfile для frontend (React)
- [x] `backend/main.go` и `go.mod` (заглушка с `/api/health`)
- [x] `.env.example`

### Шаг 2 — База данных ✅
- [x] `db/001_schema.sql` — таблицы: `users`, `venues`, `seats`, `events`, `event_seats`, `orders`, `order_items`
- [x] `db/002_seed.sql` — площадка, 60 мест (6 рядов × 10), 3 события, билеты
- [x] Adminer добавлен в docker-compose (порт 8081)

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

### Шаг 7 — Frontend: основа
- [ ] Create React App / Vite + TypeScript
- [ ] React Router — роутинг страниц
- [ ] Redux store — корзина, авторизация
- [ ] Axios — http-клиент

### Шаг 8 — Frontend: страницы
- [ ] Главная — список мероприятий
- [ ] Страница события — описание
- [ ] Страница авторизации — вход / регистрация
- [ ] Личный кабинет — история заказов

### Шаг 9 — Frontend: интерактивная схема зала
- [ ] SVG-компонент карты зала
- [ ] Места по координатам X/Y из БД
- [ ] Цвета: свободно / занято / выбрано
- [ ] Выбор мест — добавление в корзину

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
**Шаг 7** — Frontend: основа
