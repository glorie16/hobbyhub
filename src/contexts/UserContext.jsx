import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../Client';

// Create context
export const UserContext = createContext();

// Create provider component
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
    };
    getSessionUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCurrentUserProfile(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setCurrentUserProfile(data);
      }
    };

    fetchProfile();
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, currentUserProfile }}>
      {children}
    </UserContext.Provider>
  );
}