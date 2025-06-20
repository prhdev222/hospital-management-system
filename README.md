# ระบบจัดการโรงพยาบาล - แผนกโลหิตวิทยาและมะเร็งวิทยา

## ภาพรวมโครงการ

ระบบจัดการโรงพยาบาลที่ออกแบบมาเฉพาะสำหรับแผนกโลหิตวิทยาและมะเร็งวิทยา รองรับการทำงานในสภาพแวดล้อมโรงพยาบาลไทย พร้อมระบบจัดการข้อมูลผู้ป่วยที่ครบถ้วนและอินเทอร์เฟซที่ใช้งานง่าย

## คุณสมบัติหลัก

### 🏥 การจัดการผู้ป่วย
- ลงทะเบียนผู้ป่วยใหม่และค้นหาผู้ป่วยเดิม
- ระบบ HN (Hospital Number) แบบไทย
- ข้อมูลครบถ้วน: ชื่อ-สกุล, อายุ, เพศ, ที่อยู่, เบอร์โทร

### 📅 การจัดการนัดหมาย
- ตารางนัดหมายรายวัน
- ระบบเช็คอิน/เช็คเอาท์
- แจ้งเตือนนัดหมายที่พลาด
- สถานะผู้ป่วยรับไว้ในโรงพยาบาล

### 🧪 ผลตรวจทางห้องปฏิบัติการ
- เก็บข้อมูลในรูปแบบ JSON ที่ยืดหยุ่น
- พิมพ์ผลตรวจในรูปแบบข้อความ
- การตรวจทางรังสีวิทยา (X-ray, CT scan, MRI, PET scan)
- การตรวจไขกระดูก (Bone Marrow Studies)
- การจำแนกระยะการรักษา (ก่อน/ระหว่าง/หลังการรักษา)

### 💊 แผนการรักษา
- บันทึกการวินิจฉัย
- แผนการรักษาแบบละเอียด
- การติดตามความก้าวหน้า

### 📊 รายงานและสถิติ
- แดชบอร์ดสรุปสถานการณ์รายวัน
- รายงานทางการแพทย์
- การส่งออกข้อมูล

### 👤 ระบบควบคุมสิทธิ์การเข้าถึง
- **ผู้ดูแลระบบ (Admin)**: สิทธิ์เต็มทุกฟีเจอร์
- **แพทย์ (Doctor)**: จัดการผู้ป่วย แผนรักษา ผลตรวจ
- **พยาบาล (Nurse)**: ดูข้อมูลผู้ป่วย จัดการนัดหมาย

## เทคโนโลยี

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool ที่รวดเร็ว
- **Wouter** - Routing library
- **TanStack Query** - Data fetching และ caching
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Hook Form** + **Zod** - Form validation

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Primary database
- **Replit Authentication** - OpenID Connect

### การปรับใช้
- **Replit** - Development และ hosting platform
- รองรับการปรับใช้อัตโนมัติ

## การติดตั้งและใช้งาน

### ข้อกำหนดระบบ
- Node.js 20+
- PostgreSQL database
- ตัวแปรสภาพแวดล้อม: `DATABASE_URL`, `SESSION_SECRET`

### ขั้นตอนการติดตั้ง

1. **Clone repository**
```bash
git clone [your-repository-url]
cd hospital-management-system
```

2. **ติดตั้ง dependencies**
```bash
npm install
```

3. **ตั้งค่าฐานข้อมูล**
```bash
npm run db:push
```

4. **เริ่มเซิร์ฟเวอร์**
```bash
npm run dev
```

เซิร์ฟเวอร์จะทำงานที่ `http://localhost:5000`

## โครงสร้างโครงการ

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript types
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── replitAuth.ts      # Authentication setup
├── shared/                # Shared code
│   └── schema.ts          # Database schema และ types
└── components.json        # Shadcn/ui configuration
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - ข้อมูลผู้ใช้ปัจจุบัน
- `GET /api/login` - เริ่มกระบวนการเข้าสู่ระบบ
- `GET /api/logout` - ออกจากระบบ

### Patients
- `GET /api/patients` - รายชื่อผู้ป่วยทั้งหมด
- `POST /api/patients` - เพิ่มผู้ป่วยใหม่
- `PATCH /api/patients/:id` - แก้ไขข้อมูลผู้ป่วย
- `GET /api/patients/search?q=` - ค้นหาผู้ป่วย

### Appointments
- `GET /api/appointments/today` - นัดหมายวันนี้
- `GET /api/appointments/admitted` - ผู้ป่วยรับไว้
- `POST /api/appointments` - สร้างนัดหมายใหม่
- `PATCH /api/appointments/:id` - อัปเดตสถานะนัดหมาย

### Lab Results
- `GET /api/patients/:id/lab-results` - ผลตรวจของผู้ป่วย
- `POST /api/lab-results` - เพิ่มผลตรวจใหม่

### Treatment Plans
- `GET /api/patients/:id/treatment-plans` - แผนรักษาของผู้ป่วย
- `POST /api/treatment-plans` - สร้างแผนรักษาใหม่

## ฟีเจอร์พิเศษ

### 🎯 การตรวจทางการแพทย์
- **การตรวจทางรังสีวิทยา**: X-ray, CT scan, MRI, PET scan
- **การตรวจไขกระดูก**: Bone Marrow Biopsy, Bone Marrow Aspiration
- **ระยะการรักษา**: Before Treatment, During Treatment, After Treatment, Follow-up

### 📱 อินเทอร์เฟซที่ใช้งานง่าย
- รองรับภาษาไทยเต็มรูปแบบ
- ออกแบบสำหรับสภาพแวดล้อมโรงพยาบาล
- Responsive design สำหรับอุปกรณ์ทุกขนาด

### 🔒 ความปลอดภัย
- Replit Authentication ด้วย OpenID Connect
- Session management ที่ปลอดภัย
- Role-based access control

## การมีส่วนร่วม

เราต้องการผู้ร่วมพัฒนา! หากคุณสนใจพัฒนาระบบนี้ต่อ:

1. Fork repository นี้
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## License

โครงการนี้ใช้ MIT License - ดูไฟล์ [LICENSE](LICENSE) สำหรับรายละเอียด

## ผู้พัฒนา

พัฒนาโดยทีมงานสำหรับโรงพยาบาลไทย เพื่อปรับปรุงประสิทธิภาพการดูแลผู้ป่วยโลหิตวิทยาและมะเร็งวิทยา

---

**หมายเหตุ**: ระบบนี้ออกแบบมาเฉพาะสำหรับสภาพแวดล้อมการแพทย์ กรุณาปฏิบัติตามกฎระเบียบและมาตรฐานการรักษาความปลอดภัยข้อมูลผู้ป่วยของโรงพยาบาลของคุณ