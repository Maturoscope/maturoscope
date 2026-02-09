import { useState, useEffect } from 'react';

export interface SatisfactionOption {
  questionId: string;
  level: number;
  text: { en: string; fr: string };
}

export interface QuestionInfo {
  id: string;
  question: { en: string; fr: string };
}

export function useSatisfactionOptions() {
  const [options, setOptions] = useState<SatisfactionOption[]>([]);
  const [questions, setQuestions] = useState<Record<string, QuestionInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.allSettled([fetchOptions(), fetchQuestions()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/services/satisfaction-options', {
        cache: 'no-store',
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to load satisfaction options';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Transform the data to an array of SatisfactionOption
      const optionsArray: SatisfactionOption[] = [];

      if (data && typeof data === 'object') {
        Object.keys(data).forEach((questionId) => {
          const levels = data[questionId];
          if (levels && typeof levels === 'object') {
            Object.keys(levels).forEach((level) => {
              optionsArray.push({
                questionId,
                level: parseInt(level, 10),
                text: levels[level],
              });
            });
          }
        });
      }

      setOptions(optionsArray);
    } catch (err) {
      console.error('Error fetching satisfaction options:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load satisfaction options',
      );
      throw err;
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/readiness-assessment/questions', {
        cache: 'no-store',
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to load questions';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Transform the data to a map of questionId -> QuestionInfo
      const questionsMap: Record<string, QuestionInfo> = {};

      if (data && typeof data === 'object') {
        Object.keys(data).forEach((scaleType) => {
          const scale = data[scaleType] as {
            questions?: Array<{
              id: string;
              question: { en: string; fr: string };
            }>;
          };
          if (scale.questions && Array.isArray(scale.questions)) {
            scale.questions.forEach((question) => {
              if (question.id && question.question) {
                questionsMap[question.id] = {
                  id: question.id,
                  question: question.question,
                };
              }
            });
          }
        });
      }

      setQuestions(questionsMap);
    } catch (err) {
      console.error('Error fetching questions:', err);
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

  const getQuestionText = (questionId: string, language: 'en' | 'fr'): string => {
    const question = questions[questionId];
    if (!question || !question.question) {
      return questionId;
    }
    const text = question.question[language];
    return text || questionId;
  };

  return {
    options,
    questions,
    loading,
    error,
    getQuestionsByScale,
    getLevelsForQuestion,
    getQuestionText,
  };
}
