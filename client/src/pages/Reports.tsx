import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, BarChart3, PieChart, Download, Calendar, Users, Activity, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Patient, Appointment, TreatmentPlan } from "@/types";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/date-range", startDate, endDate],
    enabled: !!startDate && !!endDate,
    queryFn: async () => {
      const response = await fetch(`/api/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const generatePatientReport = (patientId: string) => {
    const patient = patients.find(p => p.id.toString() === patientId);
    if (!patient) return;

    const csvContent = "data:text/csv;charset=utf-8," + 
      "รายงานผู้ป่วย,HN: " + patient.hn + "\n" +
      "ชื่อ-นามสกุล," + patient.firstName + " " + patient.lastName + "\n" +
      "อายุ," + patient.age + " ปี\n" +
      "เบอร์โทร," + (patient.phoneNumber || "ไม่ระบุ") + "\n" +
      "Line ID," + (patient.lineId || "ไม่ระบุ") + "\n" +
      "ที่อยู่," + (patient.address || "ไม่ระบุ") + "\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `patient_report_${patient.hn}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAppointmentReport = () => {
    if (appointments.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8," + 
      "วันที่,เวลา,ชื่อผู้ป่วย,HN,ประเภทนัด,สถานะ,สูตรยา,ผู้รับผิดชอบ\n" +
      appointments.map(apt => {
        const date = new Date(apt.appointmentDate).toLocaleDateString('th-TH');
        const time = new Date(apt.appointmentDate).toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        return `${date},${time},${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''},${apt.patient?.hn || ''},${apt.appointmentType},${apt.status},${apt.chemotherapyProtocol || ''},${apt.attendingStaff || ''}`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `appointment_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateStatisticsReport = () => {
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const missedAppointments = appointments.filter(apt => apt.status === 'missed').length;
    const chemotherapyAppointments = appointments.filter(apt => apt.appointmentType === 'chemotherapy').length;
    const radiationAppointments = appointments.filter(apt => apt.appointmentType === 'radiation').length;

    const csvContent = "data:text/csv;charset=utf-8," + 
      "รายงานสถิติการรักษา," + startDate + " ถึง " + endDate + "\n" +
      "จำนวนนัดหมายทั้งหมด," + totalAppointments + "\n" +
      "นัดหมายที่เสร็จสิ้น," + completedAppointments + "\n" +
      "นัดหมายที่ไม่มา," + missedAppointments + "\n" +
      "นัดเคมีบำบัด," + chemotherapyAppointments + "\n" +
      "นัดฉายรังสี," + radiationAppointments + "\n" +
      "อัตราการมา," + (totalAppointments > 0 ? ((totalAppointments - missedAppointments) / totalAppointments * 100).toFixed(1) : 0) + "%\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statistics_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportOptions = [
    {
      id: "patient",
      title: "รายงานผู้ป่วยรายคน",
      description: "ข้อมูลผู้ป่วยรายละเอียดแยกตาม HN",
      icon: <Users className="w-5 h-5 text-medical-blue" />,
      action: () => selectedPatient && generatePatientReport(selectedPatient),
      disabled: !selectedPatient,
    },
    {
      id: "appointments",
      title: "รายงานการนัดหมาย",
      description: "รายงานการนัดหมายในช่วงเวลาที่กำหนด",
      icon: <Calendar className="w-5 h-5 text-medical-green" />,
      action: generateAppointmentReport,
      disabled: !startDate || !endDate || appointments.length === 0,
    },
    {
      id: "statistics",
      title: "รายงานสถิติการรักษา",
      description: "สถิติการรักษาและอัตราการมาของผู้ป่วย",
      icon: <BarChart3 className="w-5 h-5 text-medical-orange" />,
      action: generateStatisticsReport,
      disabled: !startDate || !endDate || appointments.length === 0,
    },
  ];

  const getAppointmentStatusCounts = () => {
    if (appointments.length === 0) return { completed: 0, missed: 0, scheduled: 0, checkedIn: 0 };
    
    return {
      completed: appointments.filter(apt => apt.status === 'completed').length,
      missed: appointments.filter(apt => apt.status === 'missed').length,
      scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
      checkedIn: appointments.filter(apt => apt.status === 'checked_in').length,
    };
  };

  const statusCounts = getAppointmentStatusCounts();

  return (
    <div className="flex h-screen overflow-hidden bg-medical-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                รายงาน
              </h2>
              <p className="text-sm text-gray-500">
                สร้างและส่งออกรายงานข้อมูลผู้ป่วยและสถิติการรักษา
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Report Parameters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-medical-blue" />
                พารามิเตอร์รายงาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>ช่วงวันที่เริ่มต้น</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>ช่วงวันที่สิ้นสุด</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>ผู้ป่วย (สำหรับรายงานรายคน)</Label>
                  <Select onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกผู้ป่วย" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName} (HN: {patient.hn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Overview */}
          {startDate && endDate && appointments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">นัดหมายทั้งหมด</p>
                      <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">เสร็จสิ้น</p>
                      <p className="text-2xl font-semibold text-gray-900">{statusCounts.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">ไม่มาตามนัด</p>
                      <p className="text-2xl font-semibold text-gray-900">{statusCounts.missed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <PieChart className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">อัตราการมา</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {appointments.length > 0 ? ((appointments.length - statusCounts.missed) / appointments.length * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportOptions.map((option) => (
              <Card key={option.id} className={`cursor-pointer transition-all ${option.disabled ? 'opacity-50' : 'hover:shadow-md'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {option.icon}
                      <span className="ml-2">{option.title}</span>
                    </div>
                    {!option.disabled && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        พร้อม
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  <Button
                    onClick={option.action}
                    disabled={option.disabled}
                    className="w-full bg-medical-blue hover:bg-medical-blue/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ส่งออกรายงาน
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Report Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">รูปแบบไฟล์ที่รองรับ</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• CSV (Comma Separated Values)</li>
                    <li>• เข้ากันได้กับ Microsoft Excel</li>
                    <li>• เข้ากันได้กับ Google Sheets</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">ข้อมูลที่รวมในรายงาน</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ข้อมูลผู้ป่วยและการติดต่อ</li>
                    <li>• ประวัติการนัดหมายและสถานะ</li>
                    <li>• สถิติการรักษาและการติดตาม</li>
                    <li>• ข้อมูลสูตรยาและแผนการรักษา</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}