# คู่มือการปรับแก้ Database สำหรับการใช้งานจริง

## การเปลี่ยนจาก Memory Storage เป็น Database Storage

### ขั้นตอนที่ 1: ตรวจสอบ Schema ปัจจุบัน

ไฟล์ `shared/schema.ts` มี database schema ครบถ้วนแล้ว รวมถึง:
- `users` - ข้อมูลผู้ใช้งาน
- `patients` - ข้อมูลผู้ป่วย
- `appointments` - การนัดหมาย
- `diagnoses` - การวินิจฉัย
- `labResults` - ผลแล็บ
- `treatmentPlans` - แผนการรักษา
- `documentLinks` - เอกสารอ้างอิง

### ขั้นตอนที่ 2: การปรับแก้ Authentication System

#### แก้ไข server/replitAuth.ts สำหรับ Local Database
สร้างไฟล์ `server/localAuth.ts` ใหม่:

```typescript
import express, { type RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";

// ข้อมูลผู้ใช้สำหรับระบบ Local
const localUsers = [
  {
    id: "admin001",
    username: "admin001",
    password: "$2b$10$encrypted_password_hash", // ใช้ bcrypt hash
    role: "admin",
    name: "ผู้ดูแลระบบ",
    email: "admin@hospital.local"
  },
  {
    id: "doctor001",
    username: "doctor001", 
    password: "$2b$10$encrypted_password_hash",
    role: "doctor",
    name: "แพทย์",
    email: "doctor@hospital.local"
  },
  {
    id: "nurse001",
    username: "nurse001",
    password: "$2b$10$encrypted_password_hash", 
    role: "nurse",
    name: "พยาบาล",
    email: "nurse@hospital.local"
  }
];

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 สัปดาห์
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupLocalAuth(app: express.Express) {
  app.use(getSession());
  
  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    const user = localUsers.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // บันทึกผู้ใช้ลง database
    await storage.upsertUser({
      id: user.id,
      email: user.email,
      firstName: user.name,
      lastName: "",
      profileImageUrl: null
    });
    
    // เก็บ session
    (req.session as any).user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };
    
    res.json({ success: true, user: { id: user.id, role: user.role, name: user.name } });
  });
  
  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // เพิ่ม user info ใน request
  (req as any).user = user;
  next();
};
```

### ขั้นตอนที่ 3: การสร้าง Password Hash

สร้างสคริปต์ `scripts/generatePasswords.js`:

```javascript
const bcrypt = require('bcrypt');

const passwords = {
  admin: 'Hospital@Admin2024!',
  doctor: 'Doctor@Secure2024!',
  nurse: 'Nurse@Care2024!'
};

async function generateHashes() {
  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role}: "${hash}"`);
  }
}

generateHashes();
```

รันสคริปต์:
```bash
npm install bcrypt
node scripts/generatePasswords.js
```

### ขั้นตอนที่ 4: การปรับแก้ Routes

แก้ไข `server/routes.ts`:

```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated } from "./localAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupLocalAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json({
        ...user,
        role: req.user.role // เพิ่ม role จาก session
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Patient routes
  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patient = await storage.createPatient(req.body);
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.get("/api/patients/:id", isAuthenticated, async (req, res) => {
    try {
      const patient = await storage.getPatient(parseInt(req.params.id));
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.patch("/api/patients/:id", isAuthenticated, async (req, res) => {
    try {
      const patient = await storage.updatePatient(parseInt(req.params.id), req.body);
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const { date, range } = req.query;
      let appointments;
      
      if (date) {
        appointments = await storage.getAppointmentsByDate(new Date(date as string));
      } else if (range === 'today') {
        appointments = await storage.getTodayAppointments();
      } else if (range === 'admitted') {
        appointments = await storage.getAdmittedPatients();
      } else if (range === 'missed') {
        appointments = await storage.getMissedAppointments();
      } else {
        // Get appointments for next 7 days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        appointments = await storage.getAppointmentsByDateRange(startDate, endDate);
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const appointment = await storage.createAppointment(req.body);
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(parseInt(req.params.id), req.body);
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Treatment Plan routes
  app.get("/api/treatment-plans", isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.query;
      if (patientId) {
        const plans = await storage.getTreatmentPlansForPatient(parseInt(patientId as string));
        res.json(plans);
      } else {
        // Get all treatment plans with patient info
        const plans = await storage.getAllTreatmentPlans();
        res.json(plans);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch treatment plans" });
    }
  });

  app.post("/api/treatment-plans", isAuthenticated, async (req, res) => {
    try {
      const plan = await storage.createTreatmentPlan(req.body);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create treatment plan" });
    }
  });

  // Lab Results routes
  app.get("/api/lab-results", isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.query;
      if (patientId) {
        const results = await storage.getLabResultsForPatient(parseInt(patientId as string));
        res.json(results);
      } else {
        const results = await storage.getAllLabResults();
        res.json(results);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lab results" });
    }
  });

  app.post("/api/lab-results", isAuthenticated, async (req, res) => {
    try {
      const result = await storage.createLabResult(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to create lab result" });
    }
  });

  // Document Links routes
  app.get("/api/document-links", isAuthenticated, async (req, res) => {
    try {
      const links = await storage.getAllDocumentLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document links" });
    }
  });

  app.post("/api/document-links", isAuthenticated, async (req, res) => {
    try {
      const link = await storage.createDocumentLink(req.body);
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document link" });
    }
  });

  app.patch("/api/document-links/:id", isAuthenticated, async (req, res) => {
    try {
      const link = await storage.updateDocumentLink(parseInt(req.params.id), req.body);
      res.json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document link" });
    }
  });

  app.delete("/api/document-links/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDocumentLink(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document link" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const [todayAppointments, admittedPatients, missedAppointments] = await Promise.all([
        storage.getTodayAppointments(),
        storage.getAdmittedPatients(),
        storage.getMissedAppointments()
      ]);

      const stats = {
        todayAppointments: todayAppointments.length,
        admittedPatients: admittedPatients.length,
        waitingPatients: todayAppointments.filter(apt => apt.status === 'scheduled').length,
        missedAppointments: missedAppointments.length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

### ขั้นตอนที่ 5: การเพิ่ม Methods ใน Storage

แก้ไข `server/storage.ts` เพิ่ม methods ที่ขาดหายไป:

```typescript
// เพิ่ม methods เหล่านี้ใน DatabaseStorage class

async getAllTreatmentPlans(): Promise<(TreatmentPlan & { patient?: Patient })[]> {
  const plans = await db
    .select()
    .from(treatmentPlans)
    .leftJoin(patients, eq(treatmentPlans.patientId, patients.id))
    .where(eq(patients.isDeleted, false));
  
  return plans.map(row => ({
    ...row.treatment_plans,
    patient: row.patients || undefined
  }));
}

async getAllLabResults(): Promise<(LabResult & { patient?: Patient })[]> {
  const results = await db
    .select()
    .from(labResults)
    .leftJoin(patients, eq(labResults.patientId, patients.id))
    .where(eq(patients.isDeleted, false));
  
  return results.map(row => ({
    ...row.lab_results,
    patient: row.patients || undefined
  }));
}
```

### ขั้นตอนที่ 6: การปรับแก้ Frontend สำหรับ Database

แก้ไข `client/src/pages/Login.tsx` ให้ใช้ API:

```typescript
const loginMutation = useMutation({
  mutationFn: async (loginData: LoginCredentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    if (!response.ok) {
      throw new Error('Invalid username or password');
    }
    
    return response.json();
  },
  onSuccess: (data) => {
    onLoginSuccess(data.user.role);
    setError(null);
  },
  onError: (error: Error) => {
    setError(error.message);
  }
});
```

### ขั้นตอนที่ 7: การ Initialize ข้อมูลเริ่มต้น

สร้างสคริปต์ `scripts/initializeData.js`:

```javascript
const { pool } = require('../server/db');

async function initializeData() {
  const client = await pool.connect();
  
  try {
    // Insert sample patients
    await client.query(`
      INSERT INTO patients (hn, first_name, last_name, date_of_birth, gender, phone, address)
      VALUES 
        ('HN001', 'สมชาย', 'ใจดี', '1980-01-15', 'male', '081-111-1111', '123 ถ.รามคำแหง กรุงเทพฯ'),
        ('HN002', 'สมหญิง', 'ใจงาม', '1975-05-20', 'female', '082-222-2222', '456 ถ.สุขุมวิท กรุงเทพฯ'),
        ('HN003', 'วิชัย', 'มั่นคง', '1990-12-10', 'male', '083-333-3333', '789 ถ.พหลโยธิน กรุงเทพฯ')
      ON CONFLICT (hn) DO NOTHING;
    `);
    
    // Insert sample document links
    await client.query(`
      INSERT INTO document_links (title, url, description, category)
      VALUES 
        ('Clinical Guidelines - Leukemia', 'https://example.com/guidelines', 'แนวทางการรักษามะเร็งเม็ดเลือดขาว', 'guidelines'),
        ('Laboratory Reference Values', 'https://example.com/lab-ref', 'ค่าอ้างอิงผลแล็บ', 'reference'),
        ('Drug Information Database', 'https://example.com/drugs', 'ฐานข้อมูลยา', 'drugs')
      ON CONFLICT (title) DO NOTHING;
    `);
    
    console.log('✅ ข้อมูลเริ่มต้นถูกสร้างเรียบร้อย');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างข้อมูลเริ่มต้น:', error);
  } finally {
    client.release();
  }
}

initializeData();
```

### ขั้นตอนที่ 8: การรัน Migration และ Initialize

```bash
# Push schema ไปยัง database
npm run db:push

# รันข้อมูลเริ่มต้น
node scripts/initializeData.js

# Generate password hashes
node scripts/generatePasswords.js
```

### ขั้นตอนที่ 9: การทดสอบ Database Connection

สร้างสคริปต์ `scripts/testConnection.js`:

```javascript
const { pool } = require('../server/db');

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('⏰ Server time:', result.rows[0].now);
    
    // Test tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Available tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

## สรุปขั้นตอนการ Deploy

1. **Setup PostgreSQL** และสร้าง database
2. **สร้าง environment file** (.env)
3. **Generate password hashes** สำหรับผู้ใช้
4. **Push database schema** ด้วย `npm run db:push`
5. **Initialize ข้อมูลเริ่มต้น** ด้วย script
6. **Test database connection**
7. **Build และ start application**

หลังจากทำตามขั้นตอนเหล่านี้ ระบบจะใช้ PostgreSQL database แทน memory storage และพร้อมสำหรับการใช้งานจริงในโรงพยาบาล