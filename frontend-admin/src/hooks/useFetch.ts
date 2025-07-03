import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface FetchResult<T> {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFetch<T>(url: string): FetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<T>(url);
            setData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, setData, isLoading, error, refresh: fetchData };
} 