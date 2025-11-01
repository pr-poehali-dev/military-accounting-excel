-- Добавляем новые поля для движений
ALTER TABLE movements ADD COLUMN IF NOT EXISTS vmo VARCHAR(255);
ALTER TABLE movements ADD COLUMN IF NOT EXISTS leave_days INTEGER;
ALTER TABLE movements ADD COLUMN IF NOT EXISTS expected_return_date DATE;

-- Добавляем поле для отслеживания дней в статусе
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS days_in_current_status INTEGER DEFAULT 0;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP DEFAULT NOW();
