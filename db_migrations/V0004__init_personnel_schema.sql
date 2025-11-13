CREATE TABLE IF NOT EXISTS personnel (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    personal_number VARCHAR(50) UNIQUE,
    rank VARCHAR(50),
    birth_date DATE,
    military_id VARCHAR(100),
    unit VARCHAR(255),
    phone VARCHAR(50),
    current_status VARCHAR(50) DEFAULT 'active',
    fitness_category VARCHAR(10),
    fitness_category_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movements (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER NOT NULL REFERENCES personnel(id),
    movement_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    vmo VARCHAR(255),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_checkups (
    id SERIAL PRIMARY KEY,
    personnel_id INTEGER NOT NULL REFERENCES personnel(id),
    checkup_date DATE NOT NULL,
    diagnosis TEXT,
    fitness_category VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personnel_personal_number ON personnel(personal_number);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON personnel(current_status);
CREATE INDEX IF NOT EXISTS idx_movements_personnel ON movements(personnel_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_medical_personnel ON medical_checkups(personnel_id);