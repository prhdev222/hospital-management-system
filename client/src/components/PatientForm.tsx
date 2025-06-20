import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Patient } from "@/types";

const patientSchema = z.object({
  hn: z.string().min(1, "กรุณาระบุ HN"),
  firstName: z.string().min(1, "กรุณาระบุชื่อ"),
  lastName: z.string().min(1, "กรุณาระบุนามสกุล"),
  age: z.number().min(0, "อายุต้องมากกว่าหรือเท่ากับ 0").max(150, "อายุต้องน้อยกว่า 150"),
  phoneNumber: z.string().optional(),
  lineId: z.string().optional(),
  address: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSuccess?: () => void;
}

export default function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const { toast } = useToast();
  const isEditing = !!patient;

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      hn: patient?.hn || "",
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      age: patient?.age || 0,
      phoneNumber: patient?.phoneNumber || "",
      lineId: patient?.lineId || "",
      address: patient?.address || "",
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      if (isEditing) {
        await apiRequest("PUT", `/api/patients/${patient.id}`, data);
      } else {
        await apiRequest("POST", "/api/patients", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "สำเร็จ",
        description: isEditing ? "แก้ไขข้อมูลผู้ป่วยเรียบร้อยแล้ว" : "เพิ่มผู้ป่วยใหม่เรียบร้อยแล้ว",
      });
      onSuccess?.();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: isEditing ? "ไม่สามารถแก้ไขข้อมูลผู้ป่วยได้" : "ไม่สามารถเพิ่มผู้ป่วยได้",
        variant: "destructive",
      });
      console.error("Error saving patient:", error);
    },
  });

  const onSubmit = (data: PatientFormData) => {
    createPatientMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hn">HN *</Label>
          <Input
            id="hn"
            {...form.register("hn")}
            placeholder="เช่น HN12345678"
            disabled={isEditing} // HN shouldn't be editable
          />
          {form.formState.errors.hn && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.hn.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="age">อายุ *</Label>
          <Input
            id="age"
            type="number"
            {...form.register("age", { valueAsNumber: true })}
            placeholder="ระบุอายุ"
          />
          {form.formState.errors.age && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">ชื่อ *</Label>
          <Input
            id="firstName"
            {...form.register("firstName")}
            placeholder="ระบุชื่อ"
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">นามสกุล *</Label>
          <Input
            id="lastName"
            {...form.register("lastName")}
            placeholder="ระบุนามสกุล"
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
          <Input
            id="phoneNumber"
            {...form.register("phoneNumber")}
            placeholder="เช่น 081-234-5678"
          />
        </div>
        
        <div>
          <Label htmlFor="lineId">Line ID</Label>
          <Input
            id="lineId"
            {...form.register("lineId")}
            placeholder="เช่น @somsi123"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">ที่อยู่</Label>
        <Textarea
          id="address"
          {...form.register("address")}
          placeholder="ระบุที่อยู่"
          rows={3}
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button
          type="submit"
          disabled={createPatientMutation.isPending}
          className="bg-medical-blue hover:bg-medical-blue/90"
        >
          {createPatientMutation.isPending 
            ? "กำลังบันทึก..." 
            : isEditing 
              ? "แก้ไขข้อมูล" 
              : "เพิ่มผู้ป่วย"
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={createPatientMutation.isPending}
        >
          รีเซ็ต
        </Button>
      </div>
    </form>
  );
}
