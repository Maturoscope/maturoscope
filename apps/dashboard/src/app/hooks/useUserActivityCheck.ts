import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/hooks/contexts/UserProvider';

/**
 * Hook that checks if the user is active on every click.
 * If the user is deactivated, it logs them out automatically.
 */
export function useUserActivityCheck() {
  const { user } = useUserContext();
  const router = useRouter();
  const isCheckingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const CHECK_THROTTLE_MS = 1000; // Only check once per second max

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call logout endpoint to clear cookies
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Redirect to login
        router.push('/login');
      }
    };

    const handleClick = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingRef.current) {
        return;
      }

      // Throttle checks to avoid too many requests
      const now = Date.now();
      if (now - lastCheckTimeRef.current < CHECK_THROTTLE_MS) {
        return;
      }

      // Only check if user is loaded
      if (!user) {
        return;
      }

      // If user is already marked as inactive, logout immediately
      if (user.isActive === false) {
        await handleLogout();
        return;
      }

      // Check user status from server
      isCheckingRef.current = true;
      lastCheckTimeRef.current = now;
      
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // If user is inactive, logout
          if (userData.isActive === false) {
            await handleLogout();
          }
          // If user is still active, no action needed
        } else if (response.status === 401 || response.status === 403) {
          // User is unauthorized, logout
          await handleLogout();
        }
      } catch (error) {
        console.error('Error checking user activity:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Add click listener
    document.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [user, router]);
}

