-- Основная таблица военнослужащих
CREATE TABLE military_personnel (
    id SERIAL PRIMARY KEY,
    personal_number VARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(200) NOT NULL,
    rank VARCHAR(100) NOT NULL,
    full_name VARCHAR(300) NOT NULL,
    arrival_date DATE NOT NULL,
    treatment_period VARCHAR(50),
    status VARCHAR(100) NOT NULL DEFAULT 'Амбулаторное лечение',
    diagnosis TEXT NOT NULL,
    notes TEXT,
    status_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    problem_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица отпусков
CREATE TABLE leaves (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES military_personnel(id),
    leave_type VARCHAR(100) NOT NULL,
    duration_days INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_overdue BOOLEAN DEFAULT FALSE,
    comment TEXT,
    problem_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица госпитализации
CREATE TABLE hospitalizations (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES military_personnel(id),
    medical_facility VARCHAR(200) NOT NULL,
    admission_date DATE NOT NULL,
    days_in_hospital INTEGER DEFAULT 0,
    comment TEXT,
    problem_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица категорий Д и В
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES military_personnel(id),
    category_type VARCHAR(50) NOT NULL,
    notification_number VARCHAR(100),
    cvvk VARCHAR(200),
    dismissal_report BOOLEAN DEFAULT FALSE,
    personnel_location TEXT,
    documents_location TEXT,
    documents_sent_date DATE,
    leave_status VARCHAR(100),
    problem_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица проблемных вопросов
CREATE TABLE problem_issues (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES military_personnel(id),
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_personnel_status ON military_personnel(status);
CREATE INDEX idx_personnel_personal_number ON military_personnel(personal_number);
CREATE INDEX idx_leaves_personnel ON leaves(personnel_id);
CREATE INDEX idx_hospitalizations_personnel ON hospitalizations(personnel_id);
CREATE INDEX idx_categories_personnel ON categories(personnel_id);
CREATE INDEX idx_problems_personnel ON problem_issues(personnel_id);
CREATE INDEX idx_problems_resolved ON problem_issues(resolved);