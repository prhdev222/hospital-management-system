import { useQuery } from "@tanstack/react-query";
import { Calendar, Bed, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AppointmentCard from "@/components/AppointmentCard";
import AdmittedPatientCard from "@/components/AdmittedPatientCard";
import SearchPanel from "@/components/SearchPanel";
import DocumentLinks from "@/components/DocumentLinks";
import type { DashboardStats, AppointmentWithPatient } from "@/types";

export default function Dashboard() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: todayAppointments = [] } = useQuery<AppointmentWithPatient[]>({
    queryKey: ["/api/appointments/today"],
  });

  const { data: admittedPatients = [] } = useQuery<AppointmentWithPatient[]>({
    queryKey: ["/api/appointments/admitted"],
  });

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex h-screen overflow-hidden bg-medical-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                แดชบอร์ดหอผู้ป่วยเคมีบำบัด
              </h2>
              <p className="text-sm text-gray-500">
                วันที่ {currentDate}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats?.missedAppointments || 0}
                </span>
              </button>
              <button className="bg-medical-blue text-white px-4 py-2 rounded-lg hover:bg-medical-blue/90 transition-colors">
                <i className="fas fa-download mr-2"></i>
                ส่งออกรายงาน
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-medical-blue" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">นัดหมายวันนี้</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.todayAppointments || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Bed className="w-6 h-6 text-medical-green" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">ผู้ป่วยใน</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.admittedPatients || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">รอเข้ารักษา</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.waitingPatients || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">ไม่มาตามนัด</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.missedAppointments || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Boxes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Calendar className="inline w-5 h-5 text-medical-blue mr-2" />
                    ผู้ป่วยนัดหมายรอเข้ารักษา
                  </h3>
                  <span className="text-sm text-gray-500">วันนี้</span>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {todayAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ไม่มีนัดหมายสำหรับวันนี้</p>
                ) : (
                  todayAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                    />
                  ))
                )}
              </div>
            </div>

            {/* Box 2: Admitted Patients */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Bed className="inline w-5 h-5 text-medical-green mr-2" />
                    ผู้ป่วยที่กำลัง Admit
                  </h3>
                  <span className="text-sm text-gray-500">ขณะนี้</span>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {admittedPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ไม่มีผู้ป่วยที่กำลัง admit</p>
                ) : (
                  admittedPatients.map((patient) => (
                    <AdmittedPatientCard 
                      key={patient.id} 
                      appointment={patient} 
                    />
                  ))
                )}
              </div>
            </div>

            {/* Box 3: Search Panel */}
            <SearchPanel />

            {/* Box 4: Document Links */}
            <DocumentLinks />
          </div>
        </main>
      </div>
    </div>
  );
}
