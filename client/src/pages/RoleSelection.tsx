import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserCog, Heart, Shield } from "lucide-react";
import type { UserRole } from "@/hooks/useRoleAccess";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: "admin" as UserRole,
      title: "ผู้ดูแลระบบ",
      description: "สิทธิ์เต็มในการจัดการระบบทั้งหมด",
      icon: Shield,
      color: "bg-red-500",
      permissions: [
        "จัดการข้อมูลผู้ป่วยทั้งหมด",
        "จัดการผู้ใช้งานระบบ",
        "เข้าถึงการตั้งค่าระบบ",
        "ส่งออกรายงานทุกประเภท",
        "ลบข้อมูลที่ไม่ต้องการ"
      ]
    },
    {
      id: "doctor" as UserRole,
      title: "แพทย์",
      description: "จัดการการวินิจฉัยและแผนการรักษา",
      icon: UserCog,
      color: "bg-blue-500",
      permissions: [
        "จัดการข้อมูลผู้ป่วย",
        "บันทึกการวินิจฉัย",
        "สร้างแผนการรักษา",
        "ดูและเพิ่มผลตรวจ",
        "สร้างรายงานทางการแพทย์"
      ]
    },
    {
      id: "nurse" as UserRole,
      title: "พยาบาล",
      description: "ดูแลผู้ป่วยและจัดการนัดหมาย",
      icon: Heart,
      color: "bg-green-500",
      permissions: [
        "ดูข้อมูลผู้ป่วย",
        "จัดการนัดหมาย",
        "บันทึกผลตรวจพื้นฐาน",
        "พิมพ์เอกสารสำหรับผู้ป่วย",
        "ดูรายงานทั่วไป"
      ]
    }
  ];

  const handleRoleSelection = () => {
    if (selectedRole) {
      // บันทึกบทบาทใน localStorage
      localStorage.setItem('userRole', selectedRole);
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 to-medical-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            เลือกบทบาทการเข้าใช้งาน
          </h1>
          <p className="text-gray-600">
            กรุณาเลือกบทบาทของคุณเพื่อเข้าสู่ระบบจัดการโรงพยาบาล
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedRole === role.id 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">สิทธิ์การเข้าถึง:</h4>
                    <ul className="space-y-1">
                      {role.permissions.map((permission, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <UserCheck className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedRole && (
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <p className="text-gray-700 mb-2">คุณเลือกบทบาท:</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {roles.find(r => r.id === selectedRole)?.title}
              </Badge>
            </div>
            
            <Button 
              onClick={handleRoleSelection}
              size="lg"
              className="bg-medical-blue hover:bg-medical-blue/90 text-white px-8 py-3"
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>ระบบจัดการโรงพยาบาล - แผนกโลหิตวิทยาและมะเร็งวิทยา</p>
        </div>
      </div>
    </div>
  );
}