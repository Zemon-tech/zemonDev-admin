import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

const API_URL = 'http://localhost:5001/api';

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