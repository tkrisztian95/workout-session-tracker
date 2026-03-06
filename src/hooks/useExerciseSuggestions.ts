import { useState, useEffect, useRef, useCallback } from 'react';
import { searchExercises, type WgerExercise } from '@/lib/wgerClient';

export function useExerciseSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<WgerExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchExercises(query);
      setSuggestions(results);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setLoading(false);
  }, []);

  const active = query.length >= 3;
  return {
    suggestions: active ? suggestions : [],
    loading: active ? loading : false,
    clearSuggestions,
  };
}
