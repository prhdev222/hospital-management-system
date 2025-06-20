import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, UserCog, Heart, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserRole } from "@/hooks/useRoleAccess";

interface LoginProps {
  onLoginSuccess: (role: UserRole) => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const predefinedUsers = [
  {
    username: "1111",
    password: "admin123",
    role: "admin" as UserRole,
    name: "ผู้ดูแลระบบ",
    icon: Shield,
    color: "text-red-600"
  },
  {
    username: "2222", 
    password: "doctor123",
    role: "doctor" as UserRole,
    name: "แพทย์",
    icon: UserCog,
    color: "text-blue-600"
  },
  {
    username: "3333",
    password: "nurse123", 
    role: "nurse" as UserRole,
    name: "พยาบาล",
    icon: Heart,
    color: "text-green-600"
  }
];

export default function Login({ onLoginSuccess }: LoginProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginCredentials) => {
      // Simulate API call for authentication
      const user = predefinedUsers.find(
        u => u.username === loginData.username && u.password === loginData.password
      );
      
      if (!user) {
        throw new Error("Invalid username or password");
      }
      
      return user;
    },
    onSuccess: (user) => {
      // Store login info
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('isLoggedIn', 'true');
      
      onLoginSuccess(user.role);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!credentials.username || !credentials.password) {
      setError("กรุณากรอก username และ password");
      return;
    }
    
    loginMutation.mutate(credentials);
  };

  const handleQuickLogin = (user: typeof predefinedUsers[0]) => {
    setCredentials({
      username: user.username,
      password: user.password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 to-medical-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              เข้าสู่ระบบ
            </CardTitle>
            <CardDescription>
              ระบบจัดการโรงพยาบาล - แผนกโลหิตวิทยาและมะเร็งวิทยา
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="ชื่อผู้ใช้"
                  disabled={loginMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="รหัสผ่าน"
                  disabled={loginMutation.isPending}
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-medical-blue hover:bg-medical-blue/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
            
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
}