CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venues (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    address     VARCHAR(500) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    venue_id    INT NOT NULL,
    row_label   VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    x           FLOAT NOT NULL,
    y           FLOAT NOT NULL,
    type        ENUM('standard', 'vip') DEFAULT 'standard',
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    venue_id    INT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    event_date  DATETIME NOT NULL,
    poster_url  VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS event_seats (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_id    INT NOT NULL,
    seat_id     INT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    status      ENUM('available', 'booked') DEFAULT 'available',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE KEY uq_event_seat (event_id, seat_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status      ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    event_seat_id INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (event_seat_id) REFERENCES event_seats(id)
);
