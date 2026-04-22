-- Площадка
INSERT INTO venues (name, address) VALUES
('Концертный зал "Уфа"', 'г. Уфа, ул. Ленина, 1');

-- Места: 6 рядов (A-F) × 10 мест
-- Ряды A, B — VIP; C-F — standard
-- x: шаг 55px начиная с 100; y: шаг 60px начиная с 80

CREATE TEMPORARY TABLE tmp_rows (row_label VARCHAR(2), y_pos INT, seat_type VARCHAR(10));
INSERT INTO tmp_rows VALUES
('A', 80,  'vip'),
('B', 140, 'vip'),
('C', 200, 'standard'),
('D', 260, 'standard'),
('E', 320, 'standard'),
('F', 380, 'standard');

CREATE TEMPORARY TABLE tmp_seats (seat_num INT, x_pos INT);
INSERT INTO tmp_seats VALUES
(1, 100), (2, 155), (3, 210), (4, 265), (5, 320),
(6, 375), (7, 430), (8, 485), (9, 540), (10, 595);

INSERT INTO seats (venue_id, row_label, seat_number, x, y, type)
SELECT 1, r.row_label, s.seat_num, s.x_pos, r.y_pos, r.seat_type
FROM tmp_rows r CROSS JOIN tmp_seats s
ORDER BY r.row_label, s.seat_num;

DROP TEMPORARY TABLE tmp_rows;
DROP TEMPORARY TABLE tmp_seats;

-- Мероприятия
INSERT INTO events (venue_id, title, description, event_date, poster_url) VALUES
(1, 'Концерт группы «Кино»',     'Легендарные хиты советской рок-эпохи',           '2026-06-15 19:00:00', ''),
(1, 'Спектакль «Гамлет»',        'Классическая постановка Уфимского театра драмы',  '2026-07-20 18:00:00', ''),
(1, 'Stand-up: Дмитрий Романов', 'Вечер юмора для взрослой аудитории',             '2026-08-05 20:00:00', '');

-- Билеты для каждого события (цены по типу места)
INSERT INTO event_seats (event_id, seat_id, price, status)
SELECT 1, s.id,
    CASE s.type WHEN 'vip' THEN 5000.00 ELSE 2000.00 END,
    'available'
FROM seats s WHERE s.venue_id = 1;

INSERT INTO event_seats (event_id, seat_id, price, status)
SELECT 2, s.id,
    CASE s.type WHEN 'vip' THEN 3500.00 ELSE 1500.00 END,
    'available'
FROM seats s WHERE s.venue_id = 1;

INSERT INTO event_seats (event_id, seat_id, price, status)
SELECT 3, s.id,
    CASE s.type WHEN 'vip' THEN 4000.00 ELSE 1800.00 END,
    'available'
FROM seats s WHERE s.venue_id = 1;
