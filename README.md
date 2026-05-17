# TicketShop

Система продажи билетов на мероприятия. Дипломный проект, ГБПОУ УКРТБ, 2026.

## Стек технологий

| Слой | Технологии |
|------|-----------|
| Frontend | React 19, TypeScript, Redux Toolkit, React Router v7, Tailwind CSS v4, Vite |
| Backend | Go 1.25, Gin, JWT (golang-jwt) |
| База данных | MySQL 8.0 |
| Инфраструктура | Docker, Docker Compose |

## Функциональность

### Покупатель
- Просмотр мероприятий с поиском по названию и дате
- Интерактивная схема зала: выбор мест (стандарт / VIP)
- Бронирование мест с 10-минутным таймером (другие пользователи видят места как занятые)
- Оплата (mock) с вводом данных карты
- История заказов в профиле

### Организатор
- Создание мероприятий (название, описание, дата, площадка, постер, цены)
- Управление своими мероприятиями: просмотр и удаление
- Места копируются автоматически из выбранной площадки

### Общее
- Регистрация и вход для двух ролей: покупатель и организатор
- Светлая и тёмная темы (переключатель в шапке, сохраняется в localStorage)
- Адаптивный дизайн (mobile-first)

## Запуск

### Требования
- Docker Desktop

### Команды

```bash
# Первый запуск
docker-compose up --build

# Последующие запуски
docker-compose up

# Полный сброс (удаляет данные)
docker-compose down -v && docker-compose up --build
```

Сервисы после запуска:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health check: http://localhost:8080/api/health

## Структура проекта

```
diplom/
├── backend/
│   ├── db/           # подключение к БД с retry-логикой
│   ├── handlers/     # HTTP-обработчики (auth, events, orders, users)
│   ├── middleware/   # JWT-аутентификация, проверка роли
│   ├── models/       # структуры данных
│   ├── repository/   # слой работы с БД
│   ├── main.go       # маршруты и точка входа
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/          # axios-клиент
│   │   ├── components/   # Header, SeatMap
│   │   ├── contexts/     # ThemeContext
│   │   ├── pages/        # все страницы приложения
│   │   ├── store/        # Redux store (auth, cart)
│   │   └── types/        # TypeScript-интерфейсы
│   └── Dockerfile
├── db/
│   └── 001_schema.sql    # схема БД и начальные данные
└── docker-compose.yml
```

## API

### Публичные

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/events` | Список мероприятий |
| GET | `/api/events/:id` | Детали мероприятия + схема мест |
| GET | `/api/venues` | Список площадок |

### Аутентифицированные (Bearer токен)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/me` | Профиль текущего пользователя |
| GET | `/api/me/orders` | История заказов |
| POST | `/api/orders/reserve` | Забронировать места (10 мин) |
| POST | `/api/orders/:id/pay` | Оплатить заказ (mock) |
| GET | `/api/orders/:id` | Детали заказа |

### Только для организаторов

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/me/events` | Мои мероприятия |
| POST | `/api/events` | Создать мероприятие |
| DELETE | `/api/events/:id` | Удалить мероприятие |

## Схема БД

```
users          — пользователи (id, email, password_hash, name, role)
venues         — площадки (id, name, address)
seats          — абстрактные места площадки (id, venue_id, row_label, seat_number, type, x, y)
events         — мероприятия (id, organizer_id, venue_id, title, description, event_date, poster_url)
event_seats    — места конкретного мероприятия (id, event_id, seat_id, price, status, reserved_until, reserved_by)
orders         — заказы (id, user_id, event_id, total_price, status, created_at)
order_items    — позиции заказа (id, order_id, event_seat_id, price)
```

## Механизм бронирования

1. Пользователь выбирает места и нажимает «Оформить».
2. Frontend вызывает `POST /api/orders/reserve` со списком `seat_id`.
3. Backend открывает транзакцию, блокирует строки (`SELECT ... FOR UPDATE`).
4. Для каждого места проверяет статус: `booked` — ошибка; `reserved` с не истёкшим `reserved_until` — ошибка.
5. Обновляет статус мест в `reserved`, устанавливает `reserved_until = NOW() + 10min`.
6. Создаёт заказ со статусом `pending`.
7. Frontend показывает обратный отсчёт. Другие пользователи видят места как занятые.
8. При оплате (`POST /api/orders/:id/pay`) статус меняется на `paid`, места переходят в `booked`.
