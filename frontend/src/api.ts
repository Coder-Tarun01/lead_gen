import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  website?: string;
  rating?: number;
  score: number;
  status: string;
  notes?: string;
  last_contacted?: string;
  next_followup?: string;
  reviews?: number;
  created_at: string;
}

export const fetchLeads = async (business: string, location: string): Promise<Lead[]> => {
  const response = await axios.get(`${API_BASE_URL}/leads`, {
    params: { business, location }
  });
  return response.data;
};

export const getDbLeads = async (status?: string, minScore?: number): Promise<Lead[]> => {
  const response = await axios.get(`${API_BASE_URL}/db-leads`, {
    params: { status, min_score: minScore }
  });
  return response.data;
};

export const getFollowups = async (): Promise<Lead[]> => {
  const response = await axios.get(`${API_BASE_URL}/followups`);
  return response.data;
};

export const updateLead = async (id: string, data: Partial<Lead>): Promise<Lead> => {
  const response = await axios.patch(`${API_BASE_URL}/leads/${id}`, data);
  return response.data;
};
