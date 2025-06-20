import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AppointmentWithPatient } from "@/types";

interface AppointmentCardProps {
  appointment: AppointmentWithPatient;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { toast } = useToast();

  const checkInMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/appointments/${appointment.id}`, {
        status: "checked_in",
        admissionTime: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "สำเร็จ",
        description: "Check in ผู้ป่วยเรียบร้อยแล้ว",
      });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiRequest("PUT", `/api/appointments/${appointment.id}`, {
        status: "rescheduled",
        rescheduleReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "สำเร็จ",
        description: "เลื่อนนัดหมายเรียบร้อยแล้ว",
      });
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate();
  };

  const handleReschedule = () => {
    const reason = prompt("กรุณาระบุเหตุผลในการเลื่อนนัด:");
    if (reason) {
      rescheduleMutation.mutate(reason);
    }
  };

  const handleMarkMissed = () => {
    if (confirm("ยืนยันว่าผู้ป่วยไม่มาตามนัดหมาย?")) {
      rescheduleMutation.mutate("ไม่มาตามนัดหมาย");
    }
  };

  const getStatusBadge = () => {
    switch (appointment.status) {
      case "missed":
        return <Badge variant="destructive">ไม่มาตามนัด</Badge>;
      case "rescheduled":
        return <Badge variant="secondary">เลื่อนนัด</Badge>;
      case "checked_in":
        return <Badge className="bg-green-100 text-green-800">เข้ารักษาแล้ว</Badge>;
      default:
        return <Badge variant="outline">รอเข้ารักษา</Badge>;
    }
  };

  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
  const formattedTime = appointmentDate.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isMissed = appointment.status === "missed";

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isMissed ? "border-yellow-300 bg-yellow-50" : "border-gray-200"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">
              {appointment.patient?.firstName} {appointment.patient?.lastName}
            </h4>
            <span className="text-sm text-gray-500">
              อายุ {appointment.patient?.age} ปี
            </span>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">HN:</span> {appointment.patient?.hn}
            </p>
            {appointment.patient?.phoneNumber && (
              <p>
                <span className="font-medium">โทร:</span> {appointment.patient.phoneNumber}
              </p>
            )}
            {appointment.patient?.lineId && (
              <p>
                <span className="font-medium">Line:</span> {appointment.patient.lineId}
              </p>
            )}
            <p>
              <span className="font-medium">นัดหมาย:</span> {formattedDate} เวลา {formattedTime}
            </p>
            {appointment.chemotherapyProtocol && (
              <p>
                <span className="font-medium">สูตรยา:</span> {appointment.chemotherapyProtocol}
              </p>
            )}
            {appointment.radiationHospital && (
              <p className="text-red-600">
                <span className="font-medium">ส่งตัวฉายแสง:</span> {appointment.radiationHospital}
                {appointment.radiationDate && ` (${new Date(appointment.radiationDate).toLocaleDateString('th-TH')})`}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          {appointment.status === "scheduled" && (
            <>
              <Button
                size="sm"
                className="bg-medical-green hover:bg-medical-green/90 text-white"
                onClick={handleCheckIn}
                disabled={checkInMutation.isPending}
              >
                <Check className="w-3 h-3 mr-1" />
                Check In
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-medical-orange border-medical-orange hover:bg-medical-orange hover:text-white"
                onClick={handleReschedule}
                disabled={rescheduleMutation.isPending}
              >
                <Calendar className="w-3 h-3 mr-1" />
                เลื่อนนัด
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleMarkMissed}
                disabled={rescheduleMutation.isPending}
              >
                ไม่มาตามนัด
              </Button>
            </>
          )}
          
          {isMissed && (
            <>
              <Button
                size="sm"
                className="bg-medical-blue hover:bg-medical-blue/90 text-white"
              >
                <Phone className="w-3 h-3 mr-1" />
                โทรติดตาม
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReschedule}
                disabled={rescheduleMutation.isPending}
              >
                นัดใหม่
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
