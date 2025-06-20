import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hospital,
  ChartPie,
  Users,
  Calendar,
  PillBottle,
  TestTube,
  FileText,
  Settings,
  Plus,
  User,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: "แดชบอร์ดหอเคมีบำบัด", href: "/", icon: ChartPie },
    { name: "จัดการข้อมูลผู้ป่วย", href: "/patients", icon: Users },
    { name: "การนัดหมาย", href: "/appointments", icon: Calendar },
    { name: "แผนการรักษา", href: "/treatments", icon: PillBottle },
    { name: "ผลการตรวจ", href: "/lab-results", icon: TestTube },
    { name: "รายงาน", href: "/reports", icon: FileText },
    { name: "การตั้งค่า", href: "/settings", icon: Settings },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "doctor": return "bg-blue-100 text-blue-800";
      case "nurse": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "doctor": return "Doctor";
      case "nurse": return "Nurse";
      default: return role;
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo and Hospital Name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
            <Hospital className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">โรงพยาบาลสงฆ์</h1>
            <p className="text-sm text-gray-500">ระบบโลหิตวิทยา</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <Badge 
              className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}
              variant="secondary"
            >
              <User className="w-3 h-3 mr-1" />
              {getRoleDisplayName(user?.role || '')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
                          (item.href === "/" && location === "/dashboard");
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-medical-blue text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/patients">
          <Button className="w-full bg-medical-green hover:bg-medical-green/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มผู้ป่วยใหม่
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/api/logout'}
        >
          <LogOut className="w-4 h-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
