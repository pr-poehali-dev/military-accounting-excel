const API_URL = 'https://functions.poehali.dev/1832f881-34ce-4118-ae39-9d393481f0be';

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

export const militaryApi = {
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_URL}?action=stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getPersonnel(search?: string, unit?: string, status?: string): Promise<{ personnel: Personnel[], units: string[] }> {
    const params = new URLSearchParams({ action: 'personnel' });
    if (search) params.append('search', search);
    if (unit) params.append('unit', unit);
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch personnel');
    return response.json();
  },

  async getPersonnelDetail(id: number): Promise<{ personnel: Personnel, movements: Movement[], medical_visits: MedicalVisit[] }> {
    const response = await fetch(`${API_URL}?action=personnel_detail&id=${id}`);
    if (!response.ok) throw new Error('Failed to fetch personnel detail');
    return response.json();
  },

  async createPersonnel(data: Partial<Personnel>): Promise<Personnel> {
    const response = await fetch(`${API_URL}?action=create_personnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create personnel');
    return response.json();
  },

  async updatePersonnel(id: number, data: Partial<Personnel>): Promise<Personnel> {
    const response = await fetch(`${API_URL}?action=update_personnel&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update personnel');
    return response.json();
  },

  async addMovement(data: Partial<Movement>): Promise<Movement> {
    const response = await fetch(`${API_URL}?action=add_movement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add movement');
    return response.json();
  },

  async addMedicalVisit(data: Partial<MedicalVisit> & { fitness_category?: string }): Promise<MedicalVisit> {
    const response = await fetch(`${API_URL}?action=add_medical_visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add medical visit');
    return response.json();
  },

  async exportData(unit?: string, status?: string): Promise<{ data: Personnel[], message: string }> {
    const params = new URLSearchParams({ action: 'export' });
    if (unit) params.append('unit', unit);
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error('Failed to export data');
    return response.json();
  }
};
