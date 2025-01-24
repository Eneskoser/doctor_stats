import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export function useAsync<T>(asyncFunction: AsyncFunction<T>, immediate = false) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      const response = await asyncFunction(...args);
      setState({ data: response, isLoading: false, error: null });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, [asyncFunction]);

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, isLoading: false, error: null }),
  };
}

export default useAsync; 