export interface Personnel {
  id: number;
  personal_number: string;
  full_name: string;
  rank?: string;
  unit?: string;
  phone?: string;
  current_status: string;
  fitness_category?: string;
  fitness_category_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: number;
  personnel_id: number;
  movement_type: string;
  start_date: string;
  end_date?: string;
  destination?: string;
  notes?: string;
  created_at: string;
}

export interface MedicalVisit {
  id: number;
  personnel_id: number;
  visit_date: string;
  doctor_specialty: string;
  diagnosis?: string;
  recommendations?: string;
  created_at: string;
}

export interface Stats {
  total: number;
  v_pvd: number;
  v_stroyu: number;
  gospitalizaciya: number;
  otpusk: number;
  ubyl: number;
}

const mockPersonnel: Personnel[] = [
  {
    id: 1,
    personal_number: 'В-12345',
    full_name: 'Иванов Иван Иванович',
    rank: 'Рядовой',
    unit: 'Рота А',
    phone: '+7 (999) 123-45-67',
    current_status: 'в_строю',
    fitness_category: 'А',
    fitness_category_date: '2024-01-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    personal_number: 'В-23456',
    full_name: 'Петров Петр Петрович',
    rank: 'Ефрейтор',
    unit: 'Рота Б',
    phone: '+7 (999) 234-56-78',
    current_status: 'в_пвд',
    fitness_category: 'Б',
    fitness_category_date: '2024-02-10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    personal_number: 'В-34567',
    full_name: 'Сидоров Сидор Сидорович',
    rank: 'Младший сержант',
    unit: 'Рота А',
    phone: '',
    current_status: 'госпитализация',
    fitness_category: 'В',
    fitness_category_date: '2024-03-05',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockMovements: Movement[] = [
  {
    id: 1,
    personnel_id: 2,
    movement_type: 'в_пвд',
    start_date: '2024-10-15',
    destination: 'ПВД',
    notes: 'Направлен на обследование',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    personnel_id: 3,
    movement_type: 'госпитализация',
    start_date: '2024-10-20',
    destination: 'Военный госпиталь №1',
    notes: 'Плановая госпитализация',
    created_at: new Date().toISOString()
  }
];

const mockMedicalVisits: MedicalVisit[] = [
  {
    id: 1,
    personnel_id: 2,
    visit_date: '2024-10-16',
    doctor_specialty: 'Терапевт',
    diagnosis: 'ОРВИ',
    recommendations: 'Постельный режим, обильное питье',
    created_at: new Date().toISOString()
  }
];

export const militaryApi = {
  async getStats(): Promise<Stats> {
    const stats = {
      total: mockPersonnel.length,
      v_pvd: mockPersonnel.filter(p => p.current_status === 'в_пвд').length,
      v_stroyu: mockPersonnel.filter(p => p.current_status === 'в_строю').length,
      gospitalizaciya: mockPersonnel.filter(p => p.current_status === 'госпитализация').length,
      otpusk: mockPersonnel.filter(p => p.current_status === 'отпуск').length,
      ubyl: mockPersonnel.filter(p => p.current_status === 'убыл').length
    };
    return Promise.resolve(stats);
  },

  async getPersonnel(search?: string, unit?: string, status?: string): Promise<{ personnel: Personnel[], units: string[] }> {
    let filtered = [...mockPersonnel];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.full_name.toLowerCase().includes(searchLower) || 
        p.personal_number.toLowerCase().includes(searchLower)
      );
    }
    
    if (unit) {
      filtered = filtered.filter(p => p.unit === unit);
    }
    
    if (status) {
      filtered = filtered.filter(p => p.current_status === status);
    }
    
    const units = Array.from(new Set(mockPersonnel.map(p => p.unit).filter(Boolean))) as string[];
    
    return Promise.resolve({ personnel: filtered, units });
  },

  async getPersonnelDetail(id: number): Promise<{ personnel: Personnel, movements: Movement[], medical_visits: MedicalVisit[] }> {
    const personnel = mockPersonnel.find(p => p.id === id);
    if (!personnel) throw new Error('Personnel not found');
    
    const movements = mockMovements.filter(m => m.personnel_id === id);
    const medical_visits = mockMedicalVisits.filter(v => v.personnel_id === id);
    
    return Promise.resolve({ personnel, movements, medical_visits });
  },

  async createPersonnel(data: Omit<Personnel, 'id' | 'created_at' | 'updated_at'>): Promise<Personnel> {
    const newPersonnel: Personnel = {
      ...data,
      id: Math.max(...mockPersonnel.map(p => p.id), 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPersonnel.push(newPersonnel);
    return Promise.resolve(newPersonnel);
  },

  async updatePersonnel(id: number, data: Partial<Personnel>): Promise<Personnel> {
    const index = mockPersonnel.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Personnel not found');
    
    mockPersonnel[index] = {
      ...mockPersonnel[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    return Promise.resolve(mockPersonnel[index]);
  },

  async addMovement(data: Omit<Movement, 'id' | 'created_at'>): Promise<Movement> {
    const newMovement: Movement = {
      ...data,
      id: Math.max(...mockMovements.map(m => m.id), 0) + 1,
      created_at: new Date().toISOString()
    };
    mockMovements.push(newMovement);
    
    if (['госпитализация', 'отпуск', 'убыл'].includes(data.movement_type)) {
      const personnel = mockPersonnel.find(p => p.id === data.personnel_id);
      if (personnel) {
        personnel.current_status = data.movement_type;
        personnel.updated_at = new Date().toISOString();
      }
    }
    
    return Promise.resolve(newMovement);
  },

  async addMedicalVisit(data: Omit<MedicalVisit, 'id' | 'created_at'> & { fitness_category?: string }): Promise<MedicalVisit> {
    const newVisit: MedicalVisit = {
      id: Math.max(...mockMedicalVisits.map(v => v.id), 0) + 1,
      personnel_id: data.personnel_id,
      visit_date: data.visit_date,
      doctor_specialty: data.doctor_specialty,
      diagnosis: data.diagnosis,
      recommendations: data.recommendations,
      created_at: new Date().toISOString()
    };
    mockMedicalVisits.push(newVisit);
    
    if (data.fitness_category) {
      const personnel = mockPersonnel.find(p => p.id === data.personnel_id);
      if (personnel) {
        personnel.fitness_category = data.fitness_category;
        personnel.fitness_category_date = data.visit_date;
        personnel.updated_at = new Date().toISOString();
      }
    }
    
    return Promise.resolve(newVisit);
  },

  async exportData(): Promise<Personnel[]> {
    return Promise.resolve([...mockPersonnel]);
  }
};
