import { useState, useEffect } from "react";
import type { UserRole } from "./useRoleAccess";

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole') as UserRole;
    const userName = localStorage.getItem('userName');

    if (isLoggedIn === 'true' && userRole && userName) {
      setUser({
        id: userRole,
        name: userName,
        role: userRole
      });
    }
    
    setIsLoading(false);
  }, []);

  const login = (role: UserRole, name: string) => {
    const authUser = {
      id: role,
      name,
      role
    };
    
    setUser(authUser);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    // Force redirect to root path and reload
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
}