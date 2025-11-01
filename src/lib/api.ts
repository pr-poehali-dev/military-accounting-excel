import { mockApi } from './mockApi';

export const api = {
  getStats: () => mockApi.getStats(),
  getPersonnel: (search?: string) => mockApi.getPersonnel(search),
  createPersonnel: (data: any) => mockApi.createPersonnel(data),
  updatePersonnel: (id: number, data: any) => mockApi.updatePersonnel(id, data),
  deletePersonnel: (id: number) => mockApi.deletePersonnel(id),
  getLeaves: () => mockApi.getLeaves(),
  createLeave: (data: any) => mockApi.createLeave(data),
  updateLeave: (id: number, data: any) => mockApi.updateLeave(id, data),
  deleteLeave: (id: number) => mockApi.deleteLeave(id),
  getHospitalizations: () => mockApi.getHospitalizations(),
  createHospitalization: (data: any) => mockApi.createHospitalization(data),
  updateHospitalization: (id: number, data: any) => mockApi.updateHospitalization(id, data),
  deleteHospitalization: (id: number) => mockApi.deleteHospitalization(id),
  getProblems: () => mockApi.getProblems(),
  resolveProblem: (id: number) => mockApi.resolveProblem(id),
  getReports: () => mockApi.getReports(),
};
