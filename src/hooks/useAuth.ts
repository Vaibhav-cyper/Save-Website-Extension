import { useState, useEffect } from "react";
import { AuthService } from "../service/auth";
import type { User } from "@supabase/supabase-js";

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
    // Avoid logging user objects in production; uncomment for local debugging only.
    // if (process.env.NODE_ENV !== 'production') console.debug('useAuth init');
        console.error("Failed to initialize auth state", err);
      } finally {
        setIsLoading(false);
      }
    };
    console.log('user' , user);
    initializeAuth();

    // You might want to set up a listener for auth state changes
    // This is a simplified version - in a real app you'd want to listen to Supabase auth events
    const interval = setInterval(async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser?.id !== user?.id) {
        setUser(currentUser);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.signIn();
      if (result.success) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    signInWithGoogle,
    signOut,
  };
}
