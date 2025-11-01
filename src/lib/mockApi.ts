interface Personnel {
  id: number;
  personal_number: string;
  unit: string;
  rank: string;
  full_name: string;
  arrival_date: string;
  treatment_period: string;
  status: string;
  diagnosis: string;
  notes: string;
  days_in_pvd: number;
  estimated_return_date: string;
  status_date: string;
  last_activity: string;
  problem_resolved: boolean;
}

interface Leave {
  id: number;
  personnel_id: number;
  full_name: string;
  unit: string;
  rank: string;
  personal_number: string;
  leave_type: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  is_overdue: boolean;
  comment: string;
  problem_resolved: boolean;
}

interface Hospitalization {
  id: number;
  personnel_id: number;
  full_name: string;
  unit: string;
  rank: string;
  personal_number: string;
  medical_facility: string;
  admission_date: string;
  days_in_hospital: number;
  comment: string;
  problem_resolved: boolean;
}

interface Problem {
  id: number;
  personnel_id: number;
  full_name: string;
  unit: string;
  rank: string;
  issue_type: string;
  description: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

let personnelData: Personnel[] = [
  {
    id: 1,
    personal_number: 'ВС-12345',
    unit: '1-й мотострелковый полк',
    rank: 'Рядовой',
    full_name: 'Иванов Иван Иванович',
    arrival_date: '2024-10-15',
    treatment_period: '2 недели',
    status: 'Амбулаторное лечение',
    diagnosis: 'ОРВИ, легкая форма',
    notes: '',
    days_in_pvd: 18,
    estimated_return_date: '2024-10-29',
    status_date: '2024-10-15T10:00:00',
    last_activity: '2024-11-01T15:30:00',
    problem_resolved: false,
  },
  {
    id: 2,
    personal_number: 'ВС-12346',
    unit: '2-й танковый батальон',
    rank: 'Сержант',
    full_name: 'Петров Петр Петрович',
    arrival_date: '2024-09-20',
    treatment_period: 'более месяца',
    status: 'проходит ВВК',
    diagnosis: 'Травма нижней конечности',
    notes: 'Направлен на комиссию',
    days_in_pvd: 43,
    estimated_return_date: '2024-11-04',
    status_date: '2024-09-20T08:00:00',
    last_activity: '2024-10-30T12:00:00',
    problem_resolved: false,
  },
  {
    id: 3,
    personal_number: 'ВС-12347',
    unit: '1-й мотострелковый полк',
    rank: 'Младший сержант',
    full_name: 'Сидоров Сидор Сидорович',
    arrival_date: '2024-10-28',
    treatment_period: 'Менее 1 недели',
    status: 'годен в строй',
    diagnosis: 'Ушиб мягких тканей',
    notes: 'Выздоровел',
    days_in_pvd: 5,
    estimated_return_date: '2024-11-04',
    status_date: '2024-10-28T09:00:00',
    last_activity: '2024-11-02T10:00:00',
    problem_resolved: true,
  },
];

let leavesData: Leave[] = [
  {
    id: 1,
    personnel_id: 4,
    full_name: 'Смирнов Алексей Владимирович',
    unit: '3-й артиллерийский дивизион',
    rank: 'Старший сержант',
    personal_number: 'ВС-12348',
    leave_type: 'основной',
    duration_days: 30,
    start_date: '2024-10-20',
    end_date: '2024-11-19',
    is_overdue: false,
    comment: '',
    problem_resolved: false,
  },
];

let hospitalizationsData: Hospitalization[] = [
  {
    id: 1,
    personnel_id: 5,
    full_name: 'Кузнецов Дмитрий Сергеевич',
    unit: '1-й мотострелковый полк',
    rank: 'Ефрейтор',
    personal_number: 'ВС-12349',
    medical_facility: 'ВГ МВО',
    admission_date: '2024-10-01',
    days_in_hospital: 32,
    comment: 'Хирургическое вмешательство',
    problem_resolved: false,
  },
];

const problemsData: Problem[] = [
  {
    id: 1,
    personnel_id: 2,
    full_name: 'Петров Петр Петрович',
    unit: '2-й танковый батальон',
    rank: 'Сержант',
    issue_type: 'ПВД более 30 дней',
    description: 'Военнослужащий находится в ПВД 43 дня. Требуется разбор ситуации.',
    severity: 'high',
    resolved: false,
    created_at: '2024-10-25T10:00:00',
  },
  {
    id: 2,
    personnel_id: 5,
    full_name: 'Кузнецов Дмитрий Сергеевич',
    unit: '1-й мотострелковый полк',
    rank: 'Ефрейтор',
    issue_type: 'Госпитализация более 30 дней',
    description: 'Военнослужащий госпитализирован 32 дня. Требуется контроль.',
    severity: 'high',
    resolved: false,
    created_at: '2024-10-28T14:00:00',
  },
];

let nextPersonnelId = 6;
let nextLeaveId = 2;
let nextHospitalizationId = 2;
const nextProblemId = 3;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async getStats() {
    await delay(300);
    return {
      total: personnelData.length + leavesData.length + hospitalizationsData.length,
      active: personnelData.filter(p => 
        !['отпуск', 'госпитализация', 'Категория Д', 'категория В'].includes(p.status)
      ).length,
      onLeave: leavesData.length,
      hospitalized: hospitalizationsData.length,
      categoryDV: personnelData.filter(p => 
        ['Категория Д', 'категория В'].includes(p.status)
      ).length,
      problems: problemsData.filter(p => !p.resolved).length,
      longTreatment: personnelData.filter(p => p.days_in_pvd > 30).length,
      overdueLeaves: leavesData.filter(l => l.is_overdue).length,
    };
  },

  async getPersonnel(search?: string) {
    await delay(300);
    if (!search) return personnelData;
    
    const searchLower = search.toLowerCase();
    return personnelData.filter(p => 
      p.full_name.toLowerCase().includes(searchLower) ||
      p.personal_number.toLowerCase().includes(searchLower) ||
      p.unit.toLowerCase().includes(searchLower)
    );
  },

  async createPersonnel(data: Omit<Personnel, 'id' | 'days_in_pvd' | 'estimated_return_date' | 'status_date' | 'last_activity' | 'problem_resolved'>) {
    await delay(300);
    const arrivalDate = new Date(data.arrival_date);
    const today = new Date();
    const days_in_pvd = Math.floor((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const newPersonnel: Personnel = {
      ...data,
      id: nextPersonnelId++,
      days_in_pvd,
      estimated_return_date: new Date(arrivalDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      problem_resolved: false,
    };
    
    personnelData.push(newPersonnel);
    return { id: newPersonnel.id, success: true };
  },

  async updatePersonnel(id: number, data: Partial<Personnel>) {
    await delay(300);
    const index = personnelData.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Personnel not found');
    
    personnelData[index] = {
      ...personnelData[index],
      ...data,
      last_activity: new Date().toISOString(),
    };
    
    return { success: true };
  },

  async deletePersonnel(id: number) {
    await delay(300);
    personnelData = personnelData.filter(p => p.id !== id);
    return { success: true };
  },

  async getLeaves() {
    await delay(300);
    return leavesData.map(leave => {
      const endDate = new Date(leave.end_date);
      const today = new Date();
      return {
        ...leave,
        is_overdue: endDate < today,
      };
    });
  },

  async createLeave(data: Omit<Leave, 'id' | 'full_name' | 'unit' | 'rank' | 'personal_number' | 'is_overdue' | 'problem_resolved'>) {
    await delay(300);
    const personnel = personnelData.find(p => p.id === data.personnel_id);
    if (!personnel) throw new Error('Personnel not found');
    
    const startDate = new Date(data.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + data.duration_days);
    
    const newLeave: Leave = {
      ...data,
      id: nextLeaveId++,
      full_name: personnel.full_name,
      unit: personnel.unit,
      rank: personnel.rank,
      personal_number: personnel.personal_number,
      end_date: endDate.toISOString().split('T')[0],
      is_overdue: false,
      problem_resolved: false,
    };
    
    leavesData.push(newLeave);
    
    personnelData = personnelData.filter(p => p.id !== data.personnel_id);
    
    return { id: newLeave.id, success: true };
  },

  async updateLeave(id: number, data: Partial<Leave>) {
    await delay(300);
    const index = leavesData.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Leave not found');
    
    leavesData[index] = { ...leavesData[index], ...data };
    return { success: true };
  },

  async deleteLeave(id: number) {
    await delay(300);
    const leave = leavesData.find(l => l.id === id);
    if (!leave) throw new Error('Leave not found');
    
    leavesData = leavesData.filter(l => l.id !== id);
    
    const returnedPersonnel: Personnel = {
      id: leave.personnel_id,
      personal_number: leave.personal_number,
      unit: leave.unit,
      rank: leave.rank,
      full_name: leave.full_name,
      arrival_date: new Date().toISOString().split('T')[0],
      treatment_period: '',
      status: 'годен в строй',
      diagnosis: 'Вернулся из отпуска',
      notes: '',
      days_in_pvd: 0,
      estimated_return_date: new Date().toISOString().split('T')[0],
      status_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      problem_resolved: true,
    };
    
    personnelData.push(returnedPersonnel);
    
    return { success: true };
  },

  async getHospitalizations() {
    await delay(300);
    return hospitalizationsData.map(hosp => {
      const admissionDate = new Date(hosp.admission_date);
      const today = new Date();
      const days_in_hospital = Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...hosp,
        days_in_hospital,
      };
    });
  },

  async createHospitalization(data: Omit<Hospitalization, 'id' | 'full_name' | 'unit' | 'rank' | 'personal_number' | 'days_in_hospital' | 'problem_resolved'>) {
    await delay(300);
    const personnel = personnelData.find(p => p.id === data.personnel_id);
    if (!personnel) throw new Error('Personnel not found');
    
    const newHosp: Hospitalization = {
      ...data,
      id: nextHospitalizationId++,
      full_name: personnel.full_name,
      unit: personnel.unit,
      rank: personnel.rank,
      personal_number: personnel.personal_number,
      days_in_hospital: 0,
      problem_resolved: false,
    };
    
    hospitalizationsData.push(newHosp);
    
    personnelData = personnelData.filter(p => p.id !== data.personnel_id);
    
    return { id: newHosp.id, success: true };
  },

  async updateHospitalization(id: number, data: Partial<Hospitalization>) {
    await delay(300);
    const index = hospitalizationsData.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Hospitalization not found');
    
    hospitalizationsData[index] = { ...hospitalizationsData[index], ...data };
    return { success: true };
  },

  async deleteHospitalization(id: number) {
    await delay(300);
    const hosp = hospitalizationsData.find(h => h.id === id);
    if (!hosp) throw new Error('Hospitalization not found');
    
    hospitalizationsData = hospitalizationsData.filter(h => h.id !== id);
    
    const returnedPersonnel: Personnel = {
      id: hosp.personnel_id,
      personal_number: hosp.personal_number,
      unit: hosp.unit,
      rank: hosp.rank,
      full_name: hosp.full_name,
      arrival_date: new Date().toISOString().split('T')[0],
      treatment_period: '',
      status: 'годен в строй',
      diagnosis: 'Выписан из ВМО',
      notes: '',
      days_in_pvd: 0,
      estimated_return_date: new Date().toISOString().split('T')[0],
      status_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      problem_resolved: true,
    };
    
    personnelData.push(returnedPersonnel);
    
    return { success: true };
  },

  async getProblems() {
    await delay(300);
    return problemsData.filter(p => !p.resolved);
  },

  async resolveProblem(id: number) {
    await delay(300);
    const index = problemsData.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Problem not found');
    
    problemsData[index].resolved = true;
    return { success: true };
  },

  async getReports() {
    await delay(300);
    
    const statusCounts = personnelData.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    
    const unitCounts = personnelData.reduce((acc, p) => {
      if (!acc[p.unit]) {
        acc[p.unit] = { name: p.unit, total: 0, active: 0, problems: 0 };
      }
      acc[p.unit].total++;
      if (!['отпуск', 'госпитализация'].includes(p.status)) {
        acc[p.unit].active++;
      }
      return acc;
    }, {} as Record<string, any>);
    
    const byUnit = Object.values(unitCounts);
    
    const treatmentCounts = personnelData.reduce((acc, p) => {
      if (p.treatment_period) {
        acc[p.treatment_period] = (acc[p.treatment_period] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const byTreatmentPeriod = Object.entries(treatmentCounts).map(([name, value]) => ({ name, value }));
    
    return {
      byStatus,
      byUnit,
      byTreatmentPeriod,
      timeline: [
        { date: '29.10', added: 3, returned: 2 },
        { date: '30.10', added: 2, returned: 1 },
        { date: '31.10', added: 4, returned: 3 },
        { date: '01.11', added: 2, returned: 2 },
        { date: '02.11', added: 1, returned: 1 },
      ],
    };
  },
};
