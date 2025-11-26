import { useState, useEffect } from 'react';

export interface SatisfactionOption {
  questionId: string;
  level: number;
  text: { en: string; fr: string };
}

export function useSatisfactionOptions() {
  const [options, setOptions] = useState<SatisfactionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services/satisfaction-options', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load satisfaction options');
      }

      // Transform the data to an array of SatisfactionOption
      const optionsArray: SatisfactionOption[] = [];

      Object.keys(data).forEach((questionId) => {
        const levels = data[questionId];
        Object.keys(levels).forEach((level) => {
          optionsArray.push({
            questionId,
            level: parseInt(level, 10),
            text: levels[level],
          });
        });
      });

      setOptions(optionsArray);
    } catch (err) {
      console.error('Error fetching satisfaction options:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load satisfaction options',
      );
    } finally {
      setLoading(false);
    }
  };

  const getQuestionsByScale = (scaleType: string): string[] => {
    const prefix = scaleType + '_Q';
    const questionIds = options
      .filter((opt) => opt.questionId.startsWith(prefix))
      .map((opt) => opt.questionId);

    // Return unique question IDs
    return Array.from(new Set(questionIds));
  };

  const getLevelsForQuestion = (questionId: string): SatisfactionOption[] => {
    return options
      .filter((opt) => opt.questionId === questionId)
      .sort((a, b) => a.level - b.level);
  };

  return {
    options,
    loading,
    error,
    getQuestionsByScale,
    getLevelsForQuestion,
  };
}
