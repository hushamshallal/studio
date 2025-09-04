
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User, getIdToken } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

async function setTokenCookie(user: User | null) {
    if(user) {
        const token = await user.getIdToken();
        const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
        document.cookie = `firebase-token=${JSON.stringify({uid: user.uid, token})}; path=/; expires=${expires.toUTCString()}; SameSite=Lax; Secure`;
    } else {
        document.cookie = `firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setTokenCookie(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
