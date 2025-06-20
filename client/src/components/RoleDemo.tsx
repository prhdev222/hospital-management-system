import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Users, 
  Calendar, 
  TestTube, 
  FileText, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  PillBottle,
  BarChart3,
  ChartPie,
  CheckCircle,
  XCircle
} from "lucide-react";

type UserRole = "admin" | "doctor" | "nurse";

interface RolePermissions {
  canViewPatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;
  canViewAppointments: boolean;
  canEditAppointments: boolean;
  canViewTreatmentPlans: boolean;
  canEditTreatmentPlans: boolean;
  canViewLabResults: boolean;
  canEditLabResults: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canAccessDocumentLinks: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canViewAppointments: true,
    canEditAppointments: true,
    canViewTreatmentPlans: true,
    canEditTreatmentPlans: true,
    canViewLabResults: true,
    canEditLabResults: true,
    canViewReports: true,
    canExportData: true,
    canAccessSettings: true,
    canManageUsers: true,
    canAccessDocumentLinks: true,
  },
  doctor: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewAppointments: true,
    canEditAppointments: true,
    canViewTreatmentPlans: true,
    canEditTreatmentPlans: true,
    canViewLabResults: true,
    canEditLabResults: true,
    canViewReports: true,
    canExportData: true,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessDocumentLinks: true,
  },
  nurse: {
    canViewPatients: true,
    canEditPatients: false,
    canDeletePatients: false,
    canViewAppointments: true,
    canEditAppointments: true,
    canViewTreatmentPlans: true,
    canEditTreatmentPlans: false,
    canViewLabResults: true,
    canEditLabResults: false,
    canViewReports: false,
    canExportData: false,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessDocumentLinks: true,
  },
};

const sampleUsers = {
  admin: {
    name: "ผู้อำนวยการ สมหมาย",
    email: "admin@hospital.com",
    role: "admin" as UserRole,
    description: "ผู้ดูแลระบบและจัดการโรงพยาบาล"
  },
  doctor: {
    name: "นพ.สมศักดิ์ ใจดี",
    email: "doctor@hospital.com", 
    role: "doctor" as UserRole,
    description: "แพทย์ผู้เชี่ยวชาญด้านโลหิตวิทยา"
  },
  nurse: {
    name: "พยาบาล สมใจ รักษ์ผู้ป่วย",
    email: "nurse@hospital.com",
    role: "nurse" as UserRole,
    description: "พยาบาลประจำหอผู้ป่วยเคมีบำบัด"
  }
};

const menuItems = [
  { name: "แดชบอร์ด", icon: ChartPie, permission: null },
  { name: "จัดการผู้ป่วย", icon: Users, permission: "canViewPatients" as keyof RolePermissions },
  { name: "การนัดหมาย", icon: Calendar, permission: "canViewAppointments" as keyof RolePermissions },
  { name: "แผนการรักษา", icon: PillBottle, permission: "canViewTreatmentPlans" as keyof RolePermissions },
  { name: "ผลการตรวจ", icon: TestTube, permission: "canViewLabResults" as keyof RolePermissions },
  { name: "รายงาน", icon: FileText, permission: "canViewReports" as keyof RolePermissions },
  { name: "การตั้งค่า", icon: Settings, permission: "canAccessSettings" as keyof RolePermissions },
];

const actions = [
  { name: "เพิ่มผู้ป่วย", icon: Plus, permission: "canEditPatients" as keyof RolePermissions },
  { name: "แก้ไขผู้ป่วย", icon: Edit, permission: "canEditPatients" as keyof RolePermissions },
  { name: "ลบผู้ป่วย", icon: Trash2, permission: "canDeletePatients" as keyof RolePermissions },
  { name: "แก้ไขแผนรักษา", icon: Edit, permission: "canEditTreatmentPlans" as keyof RolePermissions },
  { name: "เพิ่มผลการตรวจ", icon: Plus, permission: "canEditLabResults" as keyof RolePermissions },
  { name: "ส่งออกรายงาน", icon: BarChart3, permission: "canExportData" as keyof RolePermissions },
];

export default function RoleDemo() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("doctor");
  
  const currentUser = sampleUsers[selectedRole];
  const permissions = rolePermissions[selectedRole];

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 border-red-200";
      case "doctor": return "bg-blue-100 text-blue-800 border-blue-200";
      case "nurse": return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "admin": return "ผู้ดูแลระบบ";
      case "doctor": return "แพทย์";
      case "nurse": return "พยาบาล";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ตัวอย่างสิทธิ์การเข้าถึงตามบทบาท
        </h1>
        <p className="text-gray-600">
          เลือกบทบาทเพื่อดูความแตกต่างในการเข้าถึงระบบ
        </p>
      </div>

      {/* Role Selector */}
      <div className="flex justify-center space-x-4">
        {(Object.keys(sampleUsers) as UserRole[]).map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? "default" : "outline"}
            onClick={() => setSelectedRole(role)}
            className={selectedRole === role ? getRoleColor(role) : ""}
          >
            <Shield className="w-4 h-4 mr-2" />
            {getRoleDisplayName(role)}
          </Button>
        ))}
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <span>ข้อมูลผู้ใช้ปัจจุบัน</span>
            <Badge className={getRoleColor(selectedRole)}>
              {getRoleDisplayName(selectedRole)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">ชื่อ:</span>
              <p className="text-gray-900">{currentUser.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">อีเมล:</span>
              <p className="text-gray-900">{currentUser.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">หน้าที่:</span>
              <p className="text-gray-900">{currentUser.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Access */}
        <Card>
          <CardHeader>
            <CardTitle>การเข้าถึงเมนู</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {menuItems.map((item) => {
                const hasAccess = !item.permission || permissions[item.permission];
                const Icon = item.icon;
                
                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasAccess 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        hasAccess ? "text-green-600" : "text-red-600"
                      }`} />
                      <span className={hasAccess ? "text-green-900" : "text-red-900"}>
                        {item.name}
                      </span>
                    </div>
                    {hasAccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>สิทธิ์การดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actions.map((action) => {
                const hasPermission = permissions[action.permission];
                const Icon = action.icon;
                
                return (
                  <div
                    key={action.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasPermission 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        hasPermission ? "text-green-600" : "text-red-600"
                      }`} />
                      <span className={hasPermission ? "text-green-900" : "text-red-900"}>
                        {action.name}
                      </span>
                    </div>
                    {hasPermission ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปความแตกต่าง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold text-red-900">ผู้ดูแลระบบ</h3>
              <p className="text-sm text-red-700 mt-2">
                เข้าถึงทุกฟีเจอร์ สามารถจัดการผู้ใช้ ตั้งค่าระบบ และลบข้อมูลได้
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">แพทย์</h3>
              <p className="text-sm text-blue-700 mt-2">
                จัดการผู้ป่วย แผนรักษา ผลตรวจ และดูรายงาน แต่ไม่สามารถตั้งค่าระบบได้
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">พยาบาล</h3>
              <p className="text-sm text-green-700 mt-2">
                ดูข้อมูลผู้ป่วย จัดการนัดหมาย แต่ไม่สามารถแก้ไขแผนรักษาหรือดูรายงานได้
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}