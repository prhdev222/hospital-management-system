import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calendar, Clock, User, MapPin, Edit, Trash2, CheckCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Patient, AppointmentWithPatient, TreatmentPlan } from "@/types";

export default function Appointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: 0,
    treatmentPlanId: 0,
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "",
    chemotherapyProtocol: "",
    radiationHospital: "",
    radiationDate: "",
    attendingStaff: "",
  });
  const { toast } = useToast();

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: appointments = [] } = useQuery<AppointmentWithPatient[]>({
    queryKey: ["/api/appointments/all"],
    queryFn: async () => {
      // Get appointments from the last 30 days and next 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const response = await fetch(`/api/appointments/date-range?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const fullDateTime = `${appointmentData.appointmentDate}T${appointmentData.appointmentTime}:00`;
      const payload = {
        ...appointmentData,
        appointmentDate: fullDateTime,
        appointmentTime: undefined,
      };
      await apiRequest("POST", "/api/appointments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAddDialogOpen(false);
      setNewAppointment({
        patientId: 0,
        treatmentPlanId: 0,
        appointmentDate: "",
        appointmentTime: "",
        appointmentType: "",
        chemotherapyProtocol: "",
        radiationHospital: "",
        radiationDate: "",
        attendingStaff: "",
      });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มการนัดหมายเรียบร้อยแล้ว",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดตการนัดหมายเรียบร้อยแล้ว",
      });
    },
  });

  const handleAddAppointment = () => {
    if (newAppointment.patientId && newAppointment.appointmentDate && newAppointment.appointmentTime && newAppointment.appointmentType) {
      createAppointmentMutation.mutate(newAppointment);
    }
  };

  const handleCheckIn = (appointment: AppointmentWithPatient) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      updates: {
        status: "checked_in",
        admissionTime: new Date(),
      },
    });
  };

  const handleMarkCompleted = (appointment: AppointmentWithPatient) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      updates: {
        status: "completed",
        dischargeTime: new Date(),
      },
    });
  };

  const handleReschedule = (appointment: AppointmentWithPatient) => {
    const reason = prompt("กรุณาระบุเหตุผลในการเลื่อนนัด:");
    if (reason) {
      updateAppointmentMutation.mutate({
        id: appointment.id,
        updates: {
          status: "rescheduled",
          rescheduleReason: reason,
        },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: "รอมา", color: "bg-blue-100 text-blue-800" },
      checked_in: { label: "เข้ารักษาแล้ว", color: "bg-green-100 text-green-800" },
      completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800" },
      missed: { label: "ไม่มา", color: "bg-red-100 text-red-800" },
      rescheduled: { label: "เลื่อนนัด", color: "bg-yellow-100 text-yellow-800" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={statusInfo.color} variant="secondary">
        {statusInfo.label}
      </Badge>
    );
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case "chemotherapy":
        return <Calendar className="w-4 h-4 text-medical-blue" />;
      case "radiation":
        return <MapPin className="w-4 h-4 text-medical-orange" />;
      case "followup":
        return <User className="w-4 h-4 text-medical-green" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAppointmentTypeName = (type: string) => {
    const typeMap = {
      chemotherapy: "เคมีบำบัด",
      radiation: "ฉายรังสี",
      followup: "ติดตามผล",
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patient?.hn?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort appointments by date (upcoming first, then past)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);
    return dateB.getTime() - dateA.getTime();
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
                การนัดหมาย
              </h2>
              <p className="text-sm text-gray-500">
                จัดการการนัดหมายผู้ป่วยเคมีบำบัดและฉายรังสี
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-medical-green hover:bg-medical-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มการนัดหมาย
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เพิ่มการนัดหมายใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ผู้ป่วย</Label>
                    <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, patientId: parseInt(value) })}>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>วันที่นัดหมาย</Label>
                      <Input
                        type="date"
                        value={newAppointment.appointmentDate}
                        onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>เวลานัดหมาย</Label>
                      <Input
                        type="time"
                        value={newAppointment.appointmentTime}
                        onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ประเภทการนัดหมาย</Label>
                    <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, appointmentType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทการนัดหมาย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chemotherapy">เคมีบำบัด</SelectItem>
                        <SelectItem value="radiation">ฉายรังสี</SelectItem>
                        <SelectItem value="followup">ติดตามผล</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newAppointment.appointmentType === "chemotherapy" && (
                    <div>
                      <Label>สูตรยาเคมีบำบัด</Label>
                      <Input
                        value={newAppointment.chemotherapyProtocol}
                        onChange={(e) => setNewAppointment({ ...newAppointment, chemotherapyProtocol: e.target.value })}
                        placeholder="เช่น R-CHOP Cycle 1, ABVD Cycle 2"
                      />
                    </div>
                  )}

                  {newAppointment.appointmentType === "radiation" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>โรงพยาบาลฉายรังสี</Label>
                        <Input
                          value={newAppointment.radiationHospital}
                          onChange={(e) => setNewAppointment({ ...newAppointment, radiationHospital: e.target.value })}
                          placeholder="ชื่อโรงพยาบาล"
                        />
                      </div>
                      <div>
                        <Label>วันที่ฉายรังสี</Label>
                        <Input
                          type="date"
                          value={newAppointment.radiationDate}
                          onChange={(e) => setNewAppointment({ ...newAppointment, radiationDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>ผู้รับผิดชอบ</Label>
                    <Input
                      value={newAppointment.attendingStaff}
                      onChange={(e) => setNewAppointment({ ...newAppointment, attendingStaff: e.target.value })}
                      placeholder="ชื่อแพทย์หรือพยาบาลผู้รับผิดชอบ"
                    />
                  </div>

                  <Button 
                    onClick={handleAddAppointment}
                    disabled={!newAppointment.patientId || !newAppointment.appointmentDate || !newAppointment.appointmentTime || !newAppointment.appointmentType || createAppointmentMutation.isPending}
                    className="w-full"
                  >
                    เพิ่มการนัดหมาย
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อผู้ป่วยหรือ HN"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select onValueChange={setStatusFilter} defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="scheduled">รอมา</SelectItem>
                <SelectItem value="checked_in">เข้ารักษาแล้ว</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="missed">ไม่มา</SelectItem>
                <SelectItem value="rescheduled">เลื่อนนัด</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedAppointments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== "all" ? "ไม่พบการนัดหมายที่ตรงกับการค้นหา" : "ยังไม่มีการนัดหมาย"}
                </p>
              </div>
            ) : (
              sortedAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getAppointmentTypeIcon(appointment.appointmentType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            HN: {appointment.patient?.hn} • อายุ {appointment.patient?.age} ปี
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(appointment.status)}
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">ประเภท:</span>
                        <Badge variant="outline">{getAppointmentTypeName(appointment.appointmentType)}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">วันที่เวลา:</span>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.appointmentDate).toLocaleDateString('th-TH')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(appointment.appointmentDate).toLocaleTimeString('th-TH', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>

                      {appointment.chemotherapyProtocol && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">สูตรยา:</span>
                          <span className="text-sm text-gray-900">{appointment.chemotherapyProtocol}</span>
                        </div>
                      )}

                      {appointment.radiationHospital && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">โรงพยาบาลฉายรังสี:</span>
                          <span className="text-sm text-gray-900">{appointment.radiationHospital}</span>
                        </div>
                      )}

                      {appointment.attendingStaff && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">ผู้รับผิดชอบ:</span>
                          <span className="text-sm text-gray-900">{appointment.attendingStaff}</span>
                        </div>
                      )}

                      {appointment.rescheduleReason && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">เหตุผลเลื่อนนัด:</span> {appointment.rescheduleReason}
                          </p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-medical-green hover:bg-medical-green/90 text-white flex-1"
                                onClick={() => handleCheckIn(appointment)}
                                disabled={updateAppointmentMutation.isPending}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Check In
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleReschedule(appointment)}
                                disabled={updateAppointmentMutation.isPending}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                เลื่อนนัด
                              </Button>
                            </>
                          )}
                          
                          {appointment.status === "checked_in" && (
                            <Button
                              size="sm"
                              className="bg-medical-blue hover:bg-medical-blue/90 text-white w-full"
                              onClick={() => handleMarkCompleted(appointment)}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              เสร็จสิ้น
                            </Button>
                          )}

                          {(appointment.status === "missed" || appointment.status === "rescheduled") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleReschedule(appointment)}
                              disabled={updateAppointmentMutation.isPending}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              นัดใหม่
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}