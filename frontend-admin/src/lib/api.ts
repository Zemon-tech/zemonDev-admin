import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useApi = () => {
  const { getToken } = useAuth();

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    if (options.body instanceof FormData) {
      delete (headers as any)['Content-Type'];
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message);
    }

    return response.json();
  }, [getToken]);

  return apiFetch;
}; 

export const useAcademyApi = () => {
  const apiFetch = useApi();

  const listPhases = async () => apiFetch('/academy/phases');
  const getPhase = async (id: string) => apiFetch(`/academy/phases/${id}`);
  const createPhase = async (data: any) => apiFetch('/academy/phases', { method: 'POST', body: JSON.stringify(data) });
  const updatePhase = async (id: string, data: any) => apiFetch(`/academy/phases/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  const togglePhase = async (id: string) => apiFetch(`/academy/phases/${id}/toggle`, { method: 'PATCH' });
  const deletePhase = async (id: string) => apiFetch(`/academy/phases/${id}`, { method: 'DELETE' });

  const listWeeks = async (phaseId?: string) => apiFetch(`/academy/weeks${phaseId ? `?phaseId=${phaseId}` : ''}`);
  const getWeek = async (id: string) => apiFetch(`/academy/weeks/${id}`);
  const createWeek = async (data: any) => apiFetch('/academy/weeks', { method: 'POST', body: JSON.stringify(data) });
  const updateWeek = async (id: string, data: any) => apiFetch(`/academy/weeks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  const toggleWeek = async (id: string) => apiFetch(`/academy/weeks/${id}/toggle`, { method: 'PATCH' });
  const deleteWeek = async (id: string) => apiFetch(`/academy/weeks/${id}`, { method: 'DELETE' });

  const listLessons = async (weekId?: string) => apiFetch(`/academy/lessons${weekId ? `?weekId=${weekId}` : ''}`);
  const getLesson = async (id: string) => apiFetch(`/academy/lessons/${id}`);
  const createLesson = async (data: any) => apiFetch('/academy/lessons', { method: 'POST', body: JSON.stringify(data) });
  const updateLesson = async (id: string, data: any) => apiFetch(`/academy/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  const toggleLesson = async (id: string) => apiFetch(`/academy/lessons/${id}/toggle`, { method: 'PATCH' });
  const deleteLesson = async (id: string) => apiFetch(`/academy/lessons/${id}`, { method: 'DELETE' });

  return {
    academy: {
      listPhases,
      getPhase,
      createPhase,
      updatePhase,
      togglePhase,
      deletePhase,
      listWeeks,
      getWeek,
      createWeek,
      updateWeek,
      toggleWeek,
      deleteWeek,
      listLessons,
      getLesson,
      createLesson,
      updateLesson,
      toggleLesson,
      deleteLesson,
    }
  } as const;
};