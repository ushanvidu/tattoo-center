import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogin, authRegister, authMe, authUpdateProfile, authChangePassword } from '../utils/api';

const TOKEN_KEY = 'tc_user_token';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify stored token and hydrate user
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    authMe()
      .then(({ user: u }) => setUser(u))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const signUp = useCallback(async (email, password, fullName) => {
    const { token, user: u } = await authRegister({ email, password, fullName });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { token, user: u } = await authLogin({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { user: u } = await authUpdateProfile(updates);
    setUser(u);
    return u;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return authChangePassword({ currentPassword, newPassword });
  }, []);

  // profile is just the user object — kept for backward compat with AccountPage
  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signUp, signIn, signOut, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
