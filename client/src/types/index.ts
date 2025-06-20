import type { 
  Patient, 
  Appointment, 
  TreatmentPlan, 
  DocumentLink,
  User,
  Diagnosis,
  LabResult 
} from "@shared/schema";

export type { 
  Patient, 
  Appointment, 
  TreatmentPlan, 
  DocumentLink,
  User,
  Diagnosis,
  LabResult 
};

export interface AppointmentWithPatient extends Appointment {
  patient?: Patient;
}

export interface DashboardStats {
  todayAppointments: number;
  admittedPatients: number;
  waitingPatients: number;
  missedAppointments: number;
}

export interface PatientWithDetails extends Patient {
  diagnoses?: Diagnosis[];
  labResults?: LabResult[];
  treatmentPlans?: TreatmentPlan[];
  appointments?: Appointment[];
}
