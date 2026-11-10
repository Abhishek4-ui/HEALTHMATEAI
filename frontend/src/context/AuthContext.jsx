import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('healthmate_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [guestSession, setGuestSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('healthmate_guest_session');
      return saved ? JSON.parse(saved) : { id: 'guest_' + Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    } catch {
      return { id: 'guest_' + Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('healthmate_active_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('healthmate_active_user');
    }
  }, [user]);

  useEffect(() => {
    if (guestSession) {
      sessionStorage.setItem('healthmate_guest_session', JSON.stringify(guestSession));
    }
  }, [guestSession]);

  const login = (role, email, name = '') => {
    if (!['PATIENT', 'DOCTOR', 'ADMINISTRATION'].includes(role)) {
      throw new Error(`Unauthorized role: ${role}. Exactly three roles permitted.`);
    }

    const userData = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      name: name || (role === 'DOCTOR' ? 'Dr. Medical Practitioner' : role === 'ADMINISTRATION' ? 'System Administrator' : 'Verified Patient'),
      role,
      authenticatedAt: new Date().toISOString(),
      isVerified: role === 'DOCTOR' ? true : true,
    };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('healthmate_active_user');
    // Re-initialize a clean guest session
    const newGuest = { id: 'guest_' + Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    setGuestSession(newGuest);
    sessionStorage.setItem('healthmate_guest_session', JSON.stringify(newGuest));
  };

  const purgeAllSessionData = () => {
    sessionStorage.clear();
    localStorage.removeItem('healthmate_temp_session');
    setUser(null);
    const newGuest = { id: 'guest_' + Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    setGuestSession(newGuest);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'GUEST',
        isAuthenticated: !!user,
        guestSession,
        login,
        logout,
        purgeAllSessionData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
