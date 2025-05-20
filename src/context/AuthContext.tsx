import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

type Role = 'admin' | 'asm';

interface AuthUser extends User {
  role?: Role;
  phone_number?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (options: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

interface SignInOptions {
  email?: string;
  phone?: string;
  password: string;
  role: Role;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
        toast.error('Session error. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // In a real app, you would fetch the user's role from a profiles table
        if (session?.user) {
          // For demo purposes, simulate role retrieval
          // In a real app, you'd fetch this from your users/profiles table
          const simulatedRole = localStorage.getItem('userRole') || 'asm';
          setUser(user => user ? {...user, role: simulatedRole as Role} : null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, phone, password, role }: SignInOptions) => {
    setIsLoading(true);
    
    try {
      // Use phone auth for ASM and email auth for admin
      const { data, error } = role === 'asm'
        ? await supabase.auth.signInWithPassword({
            phone,
            password
          })
        : await supabase.auth.signInWithPassword({
            email,
            password
          });
        
      if (error) throw error;
      
      // Now verify if the user exists in the correct role table
      const { data: roleData, error: roleError } = await supabase
        .from(role === 'admin' ? 'application_admins' : 'area_sales_managers')
        .select('*')
        .eq(role === 'admin' ? 'admin_user_id' : 'asm_user_id', data.user.id)
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        // If role verification fails, sign out and throw error
        await supabase.auth.signOut();
        throw new Error('Invalid credentials or inactive account');
      }
      
      // Set user role and additional data
      const userData = {
        ...data.user,
        role,
        phone_number: roleData.phone_number,
        name: roleData.name
      };
      
      setUser(userData);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', roleData.name);
      
      toast.success(`Welcome back, ${roleData.name}`);
    } catch (error: any) {
      if (error.message === 'Invalid login credentials') {
        toast.error('Invalid phone number or password');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};