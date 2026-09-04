import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("shopnex_user");
    const token = localStorage.getItem("shopnex_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("shopnex_token", data.token);
    localStorage.setItem("shopnex_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("shopnex_token", data.token);
    localStorage.setItem("shopnex_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("shopnex_token");
    localStorage.removeItem("shopnex_user");
    setUser(null);
  };

  const updateUserInStorage = (updatedUser) => {
    localStorage.setItem("shopnex_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUserInStorage }}
    >
      {children}
    </AuthContext.Provider>
  );
};
