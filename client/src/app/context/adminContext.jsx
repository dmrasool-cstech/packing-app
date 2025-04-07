"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  // Restore user from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    const role = localStorage.getItem("userrole");
    const userData = localStorage.getItem("userData");

    if (token && role) {
      setUser({ token, role });
      setUserInfo(JSON.parse(userData));
    }

    setLoading(false); // auth check complete
  }, []);

  const login = (data) => {
    // console.log(data);
    setUser({ token: data.token, role: data.user.role });
    setUserInfo(data.user);
  };

  const logout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("userrole");
    localStorage.removeItem("userData");
    setUser(null);
    setUserInfo(null);
    router.push("/login");
  };

  return (
    <AdminContext.Provider value={{ user, userInfo, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAuth = () => useContext(AdminContext);
