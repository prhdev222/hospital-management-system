import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPatientSchema, 
  insertAppointmentSchema, 
  insertTreatmentPlanSchema,
  insertDocumentLinkSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Patient routes
  app.post('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({ message: "Failed to create patient" });
    }
  });

  app.get('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const { search } = req.query;
      let patients;
      
      if (search) {
        patients = await storage.searchPatients(search as string);
      } else {
        patients = await storage.getAllPatients();
      }
      
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.put('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, updates);
      res.json(patient);
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(400).json({ message: "Failed to update patient" });
    }
  });

  app.delete('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.softDeletePatient(id);
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  app.get('/api/appointments/today', isAuthenticated, async (req: any, res) => {
    try {
      const appointments = await storage.getTodayAppointments();
      
      // Get patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getPatient(appointment.patientId);
          return { ...appointment, patient };
        })
      );
      
      res.json(appointmentsWithPatients);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/appointments/admitted', isAuthenticated, async (req: any, res) => {
    try {
      const appointments = await storage.getAdmittedPatients();
      
      // Get patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getPatient(appointment.patientId);
          return { ...appointment, patient };
        })
      );
      
      res.json(appointmentsWithPatients);
    } catch (error) {
      console.error("Error fetching admitted patients:", error);
      res.status(500).json({ message: "Failed to fetch admitted patients" });
    }
  });

  app.get('/api/appointments/missed', isAuthenticated, async (req: any, res) => {
    try {
      const appointments = await storage.getMissedAppointments();
      
      // Get patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getPatient(appointment.patientId);
          return { ...appointment, patient };
        })
      );
      
      res.json(appointmentsWithPatients);
    } catch (error) {
      console.error("Error fetching missed appointments:", error);
      res.status(500).json({ message: "Failed to fetch missed appointments" });
    }
  });

  app.put('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, updates);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  app.get('/api/appointments/date-range', isAuthenticated, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const appointments = await storage.getAppointmentsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      // Get patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getPatient(appointment.patientId);
          return { ...appointment, patient };
        })
      );
      
      res.json(appointmentsWithPatients);
    } catch (error) {
      console.error("Error fetching appointments by date range:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const [todayAppointments, admittedPatients, missedAppointments] = await Promise.all([
        storage.getTodayAppointments(),
        storage.getAdmittedPatients(),
        storage.getMissedAppointments()
      ]);

      const waitingPatients = todayAppointments.filter(apt => apt.status === 'scheduled');

      res.json({
        todayAppointments: todayAppointments.length,
        admittedPatients: admittedPatients.length,
        waitingPatients: waitingPatients.length,
        missedAppointments: missedAppointments.length
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Treatment plans routes
  app.post('/api/treatment-plans', isAuthenticated, async (req: any, res) => {
    try {
      const planData = insertTreatmentPlanSchema.parse(req.body);
      const plan = await storage.createTreatmentPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      res.status(400).json({ message: "Failed to create treatment plan" });
    }
  });

  app.get('/api/patients/:patientId/treatment-plans', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const plans = await storage.getTreatmentPlansForPatient(patientId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
      res.status(500).json({ message: "Failed to fetch treatment plans" });
    }
  });

  // Document links routes
  app.get('/api/document-links', isAuthenticated, async (req: any, res) => {
    try {
      const links = await storage.getAllDocumentLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching document links:", error);
      res.status(500).json({ message: "Failed to fetch document links" });
    }
  });

  app.post('/api/document-links', isAuthenticated, async (req: any, res) => {
    try {
      const linkData = insertDocumentLinkSchema.parse(req.body);
      const link = await storage.createDocumentLink(linkData);
      res.json(link);
    } catch (error) {
      console.error("Error creating document link:", error);
      res.status(400).json({ message: "Failed to create document link" });
    }
  });

  app.put('/api/document-links/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertDocumentLinkSchema.partial().parse(req.body);
      const link = await storage.updateDocumentLink(id, updates);
      res.json(link);
    } catch (error) {
      console.error("Error updating document link:", error);
      res.status(400).json({ message: "Failed to update document link" });
    }
  });

  app.delete('/api/document-links/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocumentLink(id);
      res.json({ message: "Document link deleted successfully" });
    } catch (error) {
      console.error("Error deleting document link:", error);
      res.status(500).json({ message: "Failed to delete document link" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
