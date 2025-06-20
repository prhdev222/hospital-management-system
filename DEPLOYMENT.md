# คู่มือการอัปโหลดไปยัง GitHub และ Deploy

## ขั้นตอนการอัปโหลดไปยัง GitHub

### 1. เตรียม GitHub Repository

1. ไปที่ [GitHub.com](https://github.com) และเข้าสู่ระบบ
2. คลิก "New repository" (สีเขียว)
3. ตั้งชื่อ repository เช่น `hospital-management-system`
4. เลือก "Public" หรือ "Private" ตามต้องการ
5. **อย่า**เลือก "Initialize with README" (เพราะเรามี README แล้ว)
6. คลิก "Create repository"

### 2. อัปโหลดโครงการ

หลังจากสร้าง repository แล้ว GitHub จะแสดงคำแนะนำ ให้ทำตามขั้นตอนนี้:

```bash
# เปิด Terminal/Command Prompt ในโฟลเดอร์โครงการ

# เพิ่ม remote repository
git remote add origin https://github.com/[username]/[repository-name].git

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit ไฟล์
git commit -m "Initial commit: Hospital Management System"

# Push ไปยัง GitHub
git push -u origin main
```

### 3. การ Deploy บน Replit

โครงการนี้พร้อม deploy บน Replit แล้ว:

1. คลิกปุ่ม **"Deploy"** ในแถบด้านบนของ Replit
2. เลือก "Static Deployment" หรือ "Autoscale Deployment"
3. ตั้งค่า Environment Variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `REPL_ID`
4. คลิก "Deploy"

### 4. การ Deploy บนแพลตฟอร์มอื่น

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
1. เชื่อมต่อ GitHub repository กับ Netlify
2. ตั้งค่า Build command: `npm run build`
3. ตั้งค่า Publish directory: `dist`

#### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## ตัวแปรสภาพแวดล้อมที่จำเป็น

### สำหรับ Production
```env
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-super-secret-session-key
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.replit.app
NODE_ENV=production
```

### สำหรับ Development
```env
DATABASE_URL=postgresql://localhost:5432/hospital_db
SESSION_SECRET=dev-session-secret
NODE_ENV=development
```

## การสำรองข้อมูล

### PostgreSQL Backup
```bash
# สำรองข้อมูล
pg_dump $DATABASE_URL > backup.sql

# กู้คืนข้อมูล
psql $DATABASE_URL < backup.sql
```

### Migration
```bash
# ดูการเปลี่ยนแปลง schema
npm run db:generate

# Push การเปลี่ยนแปลงไปฐานข้อมูล
npm run db:push
```

## การตรวจสอบการทำงาน

### Health Check Endpoints
- `GET /` - หน้าหลักแอปพลิเคชัน
- `GET /api/auth/user` - ตรวจสอบการ authentication
- `GET /api/patients` - ตรวจสอบการเชื่อมต่อฐานข้อมูล

### การ Monitor
- ตรวจสอบ logs ใน Console
- Monitor database performance
- ตรวจสอบ response time

## ข้อแนะนำความปลอดภัย

1. **อย่า** commit ไฟล์ `.env` ไปยัง GitHub
2. ใช้ strong passwords สำหรับฐานข้อมูล
3. อัปเดต dependencies เป็นประจำ
4. ใช้ HTTPS สำหรับ production
5. Backup ข้อมูลเป็นประจำ

## การแก้ไขปัญหาเบื้องต้น

### ปัญหาการเชื่อมต่อฐานข้อมูล
- ตรวจสอบ `DATABASE_URL`
- ตรวจสอบ network connectivity
- ตรวจสอบ database credentials

### ปัญหา Authentication
- ตรวจสอบ `SESSION_SECRET`
- ตรวจสอบ `REPL_ID` และ `REPLIT_DOMAINS`
- Clear browser cookies

### ปัญหา Build
- รัน `npm install` ใหม่
- ตรวจสอบ Node.js version
- ลบ `node_modules` และติดตั้งใหม่