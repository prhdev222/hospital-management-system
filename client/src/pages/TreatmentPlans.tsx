import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Calendar, FileText, Activity } from "lucide-react";
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
import type { Patient, TreatmentPlan, Diagnosis } from "@/types";

export default function TreatmentPlans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPlan, setNewPlan] = useState({
    patientId: 0,
    diagnosisId: 0,
    planType: "",
    notes: "",
    startDate: "",
  });
  const { toast } = useToast();

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: treatmentPlans = [] } = useQuery<(TreatmentPlan & { patient?: Patient })[]>({
    queryKey: ["/api/treatment-plans/all"],
    queryFn: async () => {
      // Get all treatment plans with patient details
      const allPlans: TreatmentPlan[] = [];
      for (const patient of patients) {
        const response = await fetch(`/api/patients/${patient.id}/treatment-plans`);
        if (response.ok) {
          const plans = await response.json();
          plans.forEach((plan: TreatmentPlan) => {
            allPlans.push({ ...plan, patient });
          });
        }
      }
      return allPlans;
    },
    enabled: patients.length > 0,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: typeof newPlan) => {
      await apiRequest("POST", "/api/treatment-plans", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-plans"] });
      setIsAddDialogOpen(false);
      setNewPlan({ patientId: 0, diagnosisId: 0, planType: "", notes: "", startDate: "" });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มแผนการรักษาเรียบร้อยแล้ว",
      });
    },
  });

  const handleAddPlan = () => {
    if (newPlan.patientId && newPlan.planType && newPlan.startDate) {
      createPlanMutation.mutate(newPlan);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">กำลังรักษา</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">เสร็จสิ้น</Badge>;
      case "discontinued":
        return <Badge className="bg-red-100 text-red-800">หยุดการรักษา</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanTypeIcon = (planType: string) => {
    switch (planType) {
      case "chemotherapy":
        return <Activity className="w-4 h-4 text-medical-blue" />;
      case "radiation":
        return <FileText className="w-4 h-4 text-medical-orange" />;
      case "supportive":
        return <Calendar className="w-4 h-4 text-medical-green" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlanTypeName = (planType: string) => {
    switch (planType) {
      case "chemotherapy":
        return "เคมีบำบัด";
      case "radiation":
        return "ฉายรังสี";
      case "supportive":
        return "ประคับประคอง";
      default:
        return planType;
    }
  };

  const filteredPlans = treatmentPlans.filter(plan =>
    plan.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.patient?.hn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-medical-gray">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                แผนการรักษา
              </h2>
              <p className="text-sm text-gray-500">
                จัดการแผนการรักษาสำหรับผู้ป่วยมะเร็งทางโลหิตวิทยา
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-medical-green hover:bg-medical-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มแผนการรักษา
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เพิ่มแผนการรักษาใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>ผู้ป่วย</Label>
                    <Select onValueChange={(value) => setNewPlan({ ...newPlan, patientId: parseInt(value) })}>
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

                  <div>
                    <Label>ประเภทการรักษา</Label>
                    <Select onValueChange={(value) => setNewPlan({ ...newPlan, planType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทการรักษา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chemotherapy">เคมีบำบัด</SelectItem>
                        <SelectItem value="radiation">ฉายรังสี</SelectItem>
                        <SelectItem value="supportive">ประคับประคอง</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>วันที่เริ่มรักษา</Label>
                    <Input
                      type="date"
                      value={newPlan.startDate}
                      onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>รายละเอียดแผนการรักษา</Label>
                    <Textarea
                      value={newPlan.notes}
                      onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                      placeholder="ระบุรายละเอียดแผนการรักษา เช่น สูตรยา จำนวนรอบ ฯลฯ"
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleAddPlan}
                    disabled={!newPlan.patientId || !newPlan.planType || !newPlan.startDate || createPlanMutation.isPending}
                    className="w-full"
                  >
                    เพิ่มแผนการรักษา
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อผู้ป่วยหรือ HN"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Treatment Plans List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? "ไม่พบแผนการรักษาที่ตรงกับการค้นหา" : "ยังไม่มีแผนการรักษา"}
                </p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getPlanTypeIcon(plan.planType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {plan.patient?.firstName} {plan.patient?.lastName}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            HN: {plan.patient?.hn} • อายุ {plan.patient?.age} ปี
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(plan.status)}
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">ประเภทการรักษา:</span>
                        <Badge variant="outline">{getPlanTypeName(plan.planType)}</Badge>
                      </div>
                      
                      {plan.startDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">วันที่เริ่ม:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(plan.startDate).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      )}

                      {plan.endDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">วันที่สิ้นสุด:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(plan.endDate).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      )}

                      {plan.notes && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">รายละเอียด:</span>
                          </p>
                          <p className="text-sm text-gray-900 mt-1">{plan.notes}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            ดูการนัดหมาย
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <FileText className="w-3 h-3 mr-1" />
                            ผลการรักษา
                          </Button>
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