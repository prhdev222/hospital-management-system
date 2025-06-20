import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "doctor", "nurse"] }).notNull().default("nurse"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  hn: varchar("hn").notNull().unique(), // Hospital Number
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  age: integer("age").notNull(),
  phoneNumber: varchar("phone_number"),
  lineId: varchar("line_id"),
  address: text("address"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Diagnoses table
export const diagnoses = pgTable("diagnoses", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  diseaseType: varchar("disease_type").notNull(), // ประเภทโรค
  diagnosisDate: date("diagnosis_date").notNull(),
  stage: varchar("stage"), // ระยะของมะเร็ง (I-IV)
  bonemarrowStudy: text("bonemarrow_study"), // ข้อมูลผล bone marrow study
  imagingResults: text("imaging_results"), // CT/MRI/PET scan results
  prognosticScore: text("prognosis_score"), // คะแนนพยากรณ์โรค (IPSS สำหรับ MDS)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lab Results table
export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  testType: varchar("test_type").notNull(), // CBC, BUN, Creatinine, etc.
  results: jsonb("results").notNull(), // Store lab values as JSON
  testDate: date("test_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Treatment Plans table
export const treatmentPlans = pgTable("treatment_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  diagnosisId: integer("diagnosis_id").references(() => diagnoses.id),
  planType: varchar("plan_type").notNull(), // chemotherapy, radiation, supportive
  status: varchar("status").notNull().default("active"), // active, completed, discontinued
  startDate: date("start_date"),
  endDate: date("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chemotherapy Protocols table
export const chemotherapyProtocols = pgTable("chemotherapy_protocols", {
  id: serial("id").primaryKey(),
  treatmentPlanId: integer("treatment_plan_id").references(() => treatmentPlans.id).notNull(),
  protocolName: varchar("protocol_name").notNull(), // R-CHOP, ABVD, etc.
  cycle: integer("cycle").notNull(),
  totalCycles: integer("total_cycles"),
  bsa: decimal("bsa", { precision: 5, scale: 2 }), // Body Surface Area
  creatinineClearance: decimal("creatinine_clearance", { precision: 5, scale: 2 }),
  auc: decimal("auc", { precision: 5, scale: 2 }), // Area Under Curve for ICE regimen
  doseReduction: integer("dose_reduction"), // Percentage reduction
  reductionReason: text("reduction_reason"),
  sideEffects: text("side_effects"),
  supportiveMedications: text("supportive_medications"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  treatmentPlanId: integer("treatment_plan_id").references(() => treatmentPlans.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentType: varchar("appointment_type").notNull(), // chemotherapy, radiation, followup
  status: varchar("status").notNull().default("scheduled"), // scheduled, checked_in, completed, missed, rescheduled
  chemotherapyProtocol: varchar("chemotherapy_protocol"),
  radiationHospital: varchar("radiation_hospital"),
  radiationDate: date("radiation_date"),
  bedNumber: varchar("bed_number"),
  attendingStaff: varchar("attending_staff"),
  admissionTime: timestamp("admission_time"),
  dischargeTime: timestamp("discharge_time"),
  rescheduleReason: text("reschedule_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follow-up Results table
export const followupResults = pgTable("followup_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  treatmentPlanId: integer("treatment_plan_id").references(() => treatmentPlans.id),
  followupDate: date("followup_date").notNull(),
  diseaseStatus: varchar("disease_status"), // remission, progression, stable
  imagingResults: text("imaging_results"), // CT/MRI/PET scan/BM study results
  nextFollowupDate: date("next_followup_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progression/Relapse table
export const progressionRelapses = pgTable("progression_relapses", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  progressionDate: date("progression_date").notNull(),
  progressionType: varchar("progression_type").notNull(), // progression, relapse
  newTreatmentPlanId: integer("new_treatment_plan_id").references(() => treatmentPlans.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Palliative Care table
export const palliativeCare = pgTable("palliative_care", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  startDate: date("start_date").notNull(),
  careDetails: text("care_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deaths table
export const deaths = pgTable("deaths", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  deathDate: date("death_date").notNull(),
  causeOfDeath: text("cause_of_death"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document Links table
export const documentLinks = pgTable("document_links", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  url: text("url").notNull(),
  category: varchar("category").notNull(), // standing_order, guidelines, patient_care, drug_info
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  diagnoses: many(diagnoses),
  labResults: many(labResults),
  treatmentPlans: many(treatmentPlans),
  appointments: many(appointments),
  followupResults: many(followupResults),
  progressionRelapses: many(progressionRelapses),
  palliativeCare: many(palliativeCare),
  deaths: many(deaths),
}));

export const diagnosesRelations = relations(diagnoses, ({ one, many }) => ({
  patient: one(patients, {
    fields: [diagnoses.patientId],
    references: [patients.id],
  }),
  treatmentPlans: many(treatmentPlans),
}));

export const treatmentPlansRelations = relations(treatmentPlans, ({ one, many }) => ({
  patient: one(patients, {
    fields: [treatmentPlans.patientId],
    references: [patients.id],
  }),
  diagnosis: one(diagnoses, {
    fields: [treatmentPlans.diagnosisId],
    references: [diagnoses.id],
  }),
  chemotherapyProtocols: many(chemotherapyProtocols),
  appointments: many(appointments),
  followupResults: many(followupResults),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  treatmentPlan: one(treatmentPlans, {
    fields: [appointments.treatmentPlanId],
    references: [treatmentPlans.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertPatient = typeof patients.$inferInsert;
export type Patient = typeof patients.$inferSelect;

export type InsertDiagnosis = typeof diagnoses.$inferInsert;
export type Diagnosis = typeof diagnoses.$inferSelect;

export type InsertTreatmentPlan = typeof treatmentPlans.$inferInsert;
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;

export type InsertChemotherapyProtocol = typeof chemotherapyProtocols.$inferInsert;
export type ChemotherapyProtocol = typeof chemotherapyProtocols.$inferSelect;

export type InsertAppointment = typeof appointments.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;

export type InsertLabResult = typeof labResults.$inferInsert;
export type LabResult = typeof labResults.$inferSelect;

export type InsertFollowupResult = typeof followupResults.$inferInsert;
export type FollowupResult = typeof followupResults.$inferSelect;

export type InsertProgressionRelapse = typeof progressionRelapses.$inferInsert;
export type ProgressionRelapse = typeof progressionRelapses.$inferSelect;

export type InsertDocumentLink = typeof documentLinks.$inferInsert;
export type DocumentLink = typeof documentLinks.$inferSelect;

// Schema validations
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTreatmentPlanSchema = createInsertSchema(treatmentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentLinkSchema = createInsertSchema(documentLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
