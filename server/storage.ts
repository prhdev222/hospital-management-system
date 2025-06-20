import {
  users,
  patients,
  diagnoses,
  treatmentPlans,
  appointments,
  labResults,
  followupResults,
  documentLinks,
  chemotherapyProtocols,
  type User,
  type UpsertUser,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type TreatmentPlan,
  type InsertTreatmentPlan,
  type DocumentLink,
  type InsertDocumentLink,
  type Diagnosis,
  type InsertDiagnosis,
  type LabResult,
  type InsertLabResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, or, like, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Patient operations
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByHN(hn: string): Promise<Patient | undefined>;
  updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient>;
  softDeletePatient(id: number): Promise<void>;
  searchPatients(query: string): Promise<Patient[]>;
  getAllPatients(): Promise<Patient[]>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment>;
  getTodayAppointments(): Promise<Appointment[]>;
  getAdmittedPatients(): Promise<Appointment[]>;
  getMissedAppointments(): Promise<Appointment[]>;
  
  // Treatment Plan operations
  createTreatmentPlan(plan: InsertTreatmentPlan): Promise<TreatmentPlan>;
  getTreatmentPlansForPatient(patientId: number): Promise<TreatmentPlan[]>;
  updateTreatmentPlan(id: number, updates: Partial<InsertTreatmentPlan>): Promise<TreatmentPlan>;
  
  // Diagnosis operations
  createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis>;
  getDiagnosesForPatient(patientId: number): Promise<Diagnosis[]>;
  
  // Lab Results operations
  createLabResult(labResult: InsertLabResult): Promise<LabResult>;
  getLabResultsForPatient(patientId: number): Promise<LabResult[]>;
  
  // Document Links operations
  createDocumentLink(link: InsertDocumentLink): Promise<DocumentLink>;
  getAllDocumentLinks(): Promise<DocumentLink[]>;
  updateDocumentLink(id: number, updates: Partial<InsertDocumentLink>): Promise<DocumentLink>;
  deleteDocumentLink(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Patient operations
  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();
    return newPatient;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, id), eq(patients.isDeleted, false)));
    return patient;
  }

  async getPatientByHN(hn: string): Promise<Patient | undefined> {
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.hn, hn), eq(patients.isDeleted, false)));
    return patient;
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient> {
    const [updatedPatient] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  async softDeletePatient(id: number): Promise<void> {
    await db
      .update(patients)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(patients.id, id));
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.isDeleted, false),
          or(
            like(patients.hn, `%${query}%`),
            like(patients.firstName, `%${query}%`),
            like(patients.lastName, `%${query}%`),
            like(patients.phoneNumber, `%${query}%`)
          )
        )
      )
      .orderBy(asc(patients.lastName));
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .where(eq(patients.isDeleted, false))
      .orderBy(asc(patients.lastName));
  }

  // Appointment operations
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(asc(appointments.appointmentDate));
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate)
        )
      )
      .orderBy(asc(appointments.appointmentDate));
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date();
    return this.getAppointmentsByDate(today);
  }

  async getAdmittedPatients(): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.status, "checked_in"),
          isNull(appointments.dischargeTime)
        )
      )
      .orderBy(asc(appointments.admissionTime));
  }

  async getMissedAppointments(): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.status, "missed"))
      .orderBy(desc(appointments.appointmentDate));
  }

  // Treatment Plan operations
  async createTreatmentPlan(plan: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const [newPlan] = await db
      .insert(treatmentPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async getTreatmentPlansForPatient(patientId: number): Promise<TreatmentPlan[]> {
    return await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.patientId, patientId))
      .orderBy(desc(treatmentPlans.startDate));
  }

  async updateTreatmentPlan(id: number, updates: Partial<InsertTreatmentPlan>): Promise<TreatmentPlan> {
    const [updatedPlan] = await db
      .update(treatmentPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(treatmentPlans.id, id))
      .returning();
    return updatedPlan;
  }

  // Diagnosis operations
  async createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis> {
    const [newDiagnosis] = await db
      .insert(diagnoses)
      .values(diagnosis)
      .returning();
    return newDiagnosis;
  }

  async getDiagnosesForPatient(patientId: number): Promise<Diagnosis[]> {
    return await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.patientId, patientId))
      .orderBy(desc(diagnoses.diagnosisDate));
  }

  // Lab Results operations
  async createLabResult(labResult: InsertLabResult): Promise<LabResult> {
    const [newLabResult] = await db
      .insert(labResults)
      .values(labResult)
      .returning();
    return newLabResult;
  }

  async getLabResultsForPatient(patientId: number): Promise<LabResult[]> {
    return await db
      .select()
      .from(labResults)
      .where(eq(labResults.patientId, patientId))
      .orderBy(desc(labResults.testDate));
  }

  // Document Links operations
  async createDocumentLink(link: InsertDocumentLink): Promise<DocumentLink> {
    const [newLink] = await db
      .insert(documentLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async getAllDocumentLinks(): Promise<DocumentLink[]> {
    return await db
      .select()
      .from(documentLinks)
      .where(eq(documentLinks.isActive, true))
      .orderBy(asc(documentLinks.category), asc(documentLinks.title));
  }

  async updateDocumentLink(id: number, updates: Partial<InsertDocumentLink>): Promise<DocumentLink> {
    const [updatedLink] = await db
      .update(documentLinks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentLinks.id, id))
      .returning();
    return updatedLink;
  }

  async deleteDocumentLink(id: number): Promise<void> {
    await db
      .update(documentLinks)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(documentLinks.id, id));
  }
}

export const storage = new DatabaseStorage();
