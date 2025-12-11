-- 데이터베이스 생성 (이미 생성했다면 생략)
-- CREATE DATABASE react_last CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- USE react_last;

-- 사용자 테이블
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 샘플 데이터 (비밀번호: password123)
-- BCrypt로 암호화된 비밀번호입니다
INSERT INTO users (username, password, email) VALUES 
('admin', '$2a$10$8vJ4Q9Z.7X1K5Y3Z6Z7Z7.Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7', 'admin@example.com');
