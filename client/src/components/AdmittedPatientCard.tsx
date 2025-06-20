import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, LogOut, Play, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AppointmentWithPatient } from "@/types";

interface AdmittedPatientCardProps {
  appointment: AppointmentWithPatient;
}

export default function AdmittedPatientCard({ appointment }: AdmittedPatientCardProps) {
  const { toast } = useToast();

  const dischargeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/appointments/${appointment.id}`, {
        status: "completed",
        dischargeTime: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "สำเร็จ",
        description: "Discharge ผู้ป่วยเรียบร้อยแล้ว",
      });
    },
  });

  const handleDischarge = () => {
    if (confirm("ยืนยันการ discharge ผู้ป่วยนี้?")) {
      dischargeMutation.mutate();
    }
  };

  const getStatusInfo = () => {
    // This would normally come from a more detailed status tracking system
    const statuses = [
      { key: "admitted", label: "กำลังรักษา", color: "bg-green-200 text-green-800" },
      { key: "preparing", label: "เตรียมยา", color: "bg-blue-200 text-blue-800" },
      { key: "waiting_lab", label: "รอผลแลป", color: "bg-yellow-200 text-yellow-800" },
    ];
    
    // Simple status determination based on time since admission
    const admissionTime = appointment.admissionTime ? new Date(appointment.admissionTime) : new Date();
    const hoursSinceAdmission = (Date.now() - admissionTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceAdmission < 2) {
      return statuses[1]; // preparing
    } else if (hoursSinceAdmission < 4) {
      return statuses[2]; // waiting_lab
    } else {
      return statuses[0]; // admitted
    }
  };

  const statusInfo = getStatusInfo();
  
  const admissionTime = appointment.admissionTime ? new Date(appointment.admissionTime) : new Date();
  const formattedAdmissionTime = admissionTime.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }) + ' ' + admissionTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`border rounded-lg p-4 ${
      statusInfo.key === 'admitted' ? 'border-green-200 bg-green-50' : 
      statusInfo.key === 'preparing' ? 'border-blue-200 bg-blue-50' : 
      'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </h4>
            <Badge className={statusInfo.color} variant="secondary">
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">เตียง:</span> {appointment.bedNumber || "ยังไม่ระบุ"}
            </p>
            <p>
              <span className="font-medium">เข้ารักษา:</span> {formattedAdmissionTime}
            </p>
            {appointment.chemotherapyProtocol && (
              <p>
                <span className="font-medium">สูตรยา:</span> {appointment.chemotherapyProtocol}
              </p>
            )}
            <p>
              <span className="font-medium">ผู้รับผิดชอบ:</span> {appointment.attendingStaff || "ยังไม่ระบุ"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="text-medical-blue border-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <Eye className="w-3 h-3 mr-1" />
            ดูรายละเอียด
          </Button>
          
          {statusInfo.key === "preparing" && (
            <Button
              size="sm"
              className="bg-medical-green hover:bg-medical-green/90 text-white"
            >
              <Play className="w-3 h-3 mr-1" />
              เริ่มให้ยา
            </Button>
          )}
          
          {statusInfo.key === "waiting_lab" && (
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <TestTube className="w-3 h-3 mr-1" />
              ตรวจผลแลป
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 border-red-300 hover:bg-red-50"
            onClick={handleDischarge}
            disabled={dischargeMutation.isPending}
          >
            <LogOut className="w-3 h-3 mr-1" />
            Discharge
          </Button>
        </div>
      </div>
    </div>
  );
}
