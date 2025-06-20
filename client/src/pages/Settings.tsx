import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, User, Shield, Bell, Database, Download, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    missedAppointments: true,
    newPatients: true,
    labResults: false,
    systemUpdates: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "บันทึกแล้ว",
      description: "การตั้งค่าการแจ้งเตือนได้รับการอัปเดตแล้ว",
    });
  };

  const exportDatabase = () => {
    // Simulate database export
    toast({
      title: "กำลังส่งออกข้อมูล",
      description: "กำลังสร้างไฟล์สำรองข้อมูล...",
    });
    
    setTimeout(() => {
      toast({
        title: "ส่งออกสำเร็จ",
        description: "ไฟล์สำรองข้อมูลได้รับการสร้างเรียบร้อยแล้ว",
      });
    }, 2000);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "ผู้ดูแลระบบ";
      case "doctor": return "แพทย์";
      case "nurse": return "พยาบาล";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "doctor": return "bg-blue-100 text-blue-800";
      case "nurse": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-medical-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                การตั้งค่า
              </h2>
              <p className="text-sm text-gray-500">
                จัดการการตั้งค่าระบบและบัญชีผู้ใช้
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-medical-blue" />
                  ข้อมูลผู้ใช้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>ชื่อ</Label>
                      <Input value={user?.firstName || ""} disabled />
                    </div>
                    <div>
                      <Label>นามสกุล</Label>
                      <Input value={user?.lastName || ""} disabled />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>อีเมล</Label>
                      <Input value={user?.email || ""} disabled />
                    </div>
                    <div>
                      <Label>บทบาท</Label>
                      <div className="mt-2">
                        <Badge className={getRoleColor(user?.role || '')} variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          {getRoleDisplayName(user?.role || '')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  ข้อมูลส่วนตัวได้รับการจัดการผ่านระบบ Replit Authentication
                </p>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-medical-green" />
                  การแจ้งเตือน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>ผู้ป่วยไม่มาตามนัด</Label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเมื่อผู้ป่วยไม่มาตามการนัดหมาย</p>
                    </div>
                    <Switch
                      checked={notifications.missedAppointments}
                      onCheckedChange={(checked) => handleNotificationChange('missedAppointments', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>ผู้ป่วยใหม่</Label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีการเพิ่มผู้ป่วยใหม่</p>
                    </div>
                    <Switch
                      checked={notifications.newPatients}
                      onCheckedChange={(checked) => handleNotificationChange('newPatients', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>ผลการตรวจแลป</Label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีผลการตรวจใหม่</p>
                    </div>
                    <Switch
                      checked={notifications.labResults}
                      onCheckedChange={(checked) => handleNotificationChange('labResults', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อัปเดตระบบ</Label>
                      <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีการอัปเดตระบบ</p>
                    </div>
                    <Switch
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2 text-medical-orange" />
                  การตั้งค่าระบบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>เขตเวลา</Label>
                    <Select defaultValue="asia/bangkok">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia/bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>ภาษา</Label>
                    <Select defaultValue="th">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="th">ไทย</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-purple-600" />
                  การจัดการข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={exportDatabase}
                  >
                    <Download className="w-6 h-6 text-medical-blue" />
                    <div className="text-center">
                      <div className="font-medium">ส่งออกข้อมูล</div>
                      <div className="text-xs text-gray-500">สำรองข้อมูลทั้งหมด</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    disabled
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <div className="text-center">
                      <div className="font-medium text-gray-400">นำเข้าข้อมูล</div>
                      <div className="text-xs text-gray-400">ต้องการสิทธิ์ Admin</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลระบบ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">เวอร์ชัน</Label>
                    <div className="font-medium">v1.0.0</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">อัปเดตล่าสุด</Label>
                    <div className="font-medium">20 ม.ค. 2568</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">ฐานข้อมูล</Label>
                    <div className="font-medium">PostgreSQL</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">สถานะ</Label>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      ออนไลน์
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>ความช่วยเหลือและการสนับสนุน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <div className="font-medium">คู่มือการใช้งาน</div>
                    <div className="text-xs text-gray-500">วิธีการใช้งานระบบ</div>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <div className="font-medium">ติดต่อฝ่ายสนับสนุน</div>
                    <div className="text-xs text-gray-500">รายงานปัญหาหรือข้อสงสัย</div>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                    <div className="font-medium">อัปเดตระบบ</div>
                    <div className="text-xs text-gray-500">ตรวจสอบการอัปเดต</div>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}