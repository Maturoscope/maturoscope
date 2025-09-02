'use client';

import { useUser } from '@/app/hooks/useUser';
import { UserAvatar } from '@/components/UserAvatar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        router.push('/login');
      } else {
        console.error('Error during logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600">{error || 'Could not load user information'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <UserAvatar 
              src={user.picture} 
              alt={user.name}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information Card */}
          <div className="p-6 bg-card rounded-lg border">
            <div className="flex items-center space-x-3 mb-4">
              <UserAvatar 
                src={user.picture} 
                alt={user.name}
                size="md"
              />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name:</label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email:</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID:</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.userId}</p>
              </div>
            </div>
          </div>

          {/* User Roles Card */}
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">User Roles</h3>
            <div className="space-y-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground">No roles assigned</p>
              )}
            </div>
          </div>

          {/* Account Status Card */}
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Terms Accepted:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.termsAccepted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.termsAccepted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session Status:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Welcome Message Card */}
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Welcome to Dashboard</h2>
            <p className="text-muted-foreground">
              You have successfully logged in. Here you can manage your account and view your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
