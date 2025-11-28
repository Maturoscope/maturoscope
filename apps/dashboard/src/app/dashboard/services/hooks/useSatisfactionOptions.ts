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
      try {
        await Promise.all([fetchOptions(), fetchQuestions()]);
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
      throw err;
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/readiness-assessment/questions', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load questions');
      }

      // Transform the data to a map of questionId -> QuestionInfo
      const questionsMap: Record<string, QuestionInfo> = {};

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

          setQuestions(questionsMap);
    } catch (err) {
      console.error('Error fetching questions:', err);
      // Don't set error here, as satisfaction options might still work
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
