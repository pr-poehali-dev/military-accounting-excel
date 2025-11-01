-- Военнослужащие
CREATE TABLE IF NOT EXISTS personnel (
    id SERIAL PRIMARY KEY,
    personal_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    rank VARCHAR(100),
    unit VARCHAR(255),
    phone VARCHAR(20),
    current_status VARCHAR(50) DEFAULT 'в_пвд',
    fitness_category VARCHAR(10),
    fitness_category_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- История движений
CREATE TABLE IF NOT EXISTS movements (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES personnel(id),
    movement_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    destination VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Посещения врачей
CREATE TABLE IF NOT EXISTS medical_visits (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER REFERENCES personnel(id),
    visit_date DATE NOT NULL,
    doctor_specialty VARCHAR(100) NOT NULL,
    diagnosis TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_personnel_unit ON personnel(unit);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON personnel(current_status);
CREATE INDEX IF NOT EXISTS idx_movements_personnel ON movements(personnel_id);
CREATE INDEX IF NOT EXISTS idx_movements_dates ON movements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_medical_personnel ON medical_visits(personnel_id);
