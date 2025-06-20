import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import Sidebar from "@/components/Sidebar";
import PatientForm from "@/components/PatientForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Patient } from "@/types";

export default function PatientManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasPermission, userRole, getRoleDisplayName } = useRoleAccess();

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/patients${searchQuery ? `?search=${searchQuery}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json();
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      await apiRequest("DELETE", `/api/patients/${patientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "สำเร็จ",
        description: "ลบข้อมูลผู้ป่วยเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลผู้ป่วยได้",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (patientId: number) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้ป่วยนี้?")) {
      deletePatientMutation.mutate(patientId);
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
                จัดการข้อมูลผู้ป่วย
              </h2>
              <p className="text-sm text-gray-500">
                ระบบจัดการข้อมูลผู้ป่วยมะเร็งทางโลหิตวิทยา
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-medical-green hover:bg-medical-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มผู้ป่วยใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>เพิ่มผู้ป่วยใหม่</DialogTitle>
                </DialogHeader>
                <PatientForm onSuccess={() => setIsAddDialogOpen(false)} />
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
                placeholder="ค้นหาด้วย HN, ชื่อ, หรือเบอร์โทร"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : patients.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? "ไม่พบผู้ป่วยที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลผู้ป่วย"}
                </p>
              </div>
            ) : (
              patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          HN: {patient.hn} • อายุ {patient.age} ปี
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(patient)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {patient.phoneNumber && (
                        <p className="text-gray-600">
                          <span className="font-medium">โทร:</span> {patient.phoneNumber}
                        </p>
                      )}
                      {patient.lineId && (
                        <p className="text-gray-600">
                          <span className="font-medium">Line:</span> {patient.lineId}
                        </p>
                      )}
                      {patient.address && (
                        <p className="text-gray-600 truncate">
                          <span className="font-medium">ที่อยู่:</span> {patient.address}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Badge variant="secondary" className="text-xs">
                        สร้างเมื่อ {new Date(patient.createdAt!).toLocaleDateString('th-TH')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ป่วย</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PatientForm 
              patient={selectedPatient}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedPatient(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
