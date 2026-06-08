import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as apiLogin, adminVerify } from '../utils/api';

const Ctx = createContext(null);

export function AdminProvider({ children }) {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tc_admin_token');
    if (!token) { setLoading(false); return; }
    adminVerify()
      .then(d => { if (d?.valid) setAdmin({ username: d.username }); })
      .catch(() => localStorage.removeItem('tc_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await apiLogin(username, password);
    localStorage.setItem('tc_admin_token', data.token);
    setAdmin({ username: data.username });
    return data;
  }

  function logout() {
    localStorage.removeItem('tc_admin_token');
    setAdmin(null);
  }

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAdmin = () => useContext(Ctx);
