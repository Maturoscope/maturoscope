import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  userId: string;
  email: string;
  name: string;
  picture: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  organization?: {
    id?: string;
    key?: string;
    name?: string;
    email?: string;
    avatar?: string;
    font?: string;
    theme?: string;
    signature?: string;
    language?: string;
  };
  termsAccepted: boolean;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        console.log('Token invalid or expired, redirecting to login');
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status}`;
        
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error, redirecting to login');
          router.push('/login');
          return;
        } else {
          throw new Error(errorMessage);
        }
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching user data:', err);
      
      if (errorMessage.includes('Failed to fetch') && errorMessage.includes('401')) {
        console.log('Network error with auth implications, redirecting to login');
        router.push('/login');
      }
      
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(currentUser => currentUser ? { ...currentUser, ...updates } : null)
  }, [])

  return { user, loading, error, refetch: fetchUser, updateUser };
};
