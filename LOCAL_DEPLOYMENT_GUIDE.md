# คู่มือการติดตั้งระบบจัดการโรงพยาบาลบน Local Network

## ข้อกำหนดเบื้องต้น

### Hardware Requirements
- **เซิร์ฟเวอร์:** CPU 4 cores, RAM 8GB, Storage 100GB SSD
- **Network:** Ethernet 1Gbps, Static IP Address
- **Client:** เครื่องคอมพิวเตอร์ที่สามารถเข้าถึง web browser

### Software Requirements
- **Operating System:** Ubuntu 20.04 LTS หรือ Windows Server 2019+
- **Node.js:** เวอร์ชัน 18.0 หรือสูงกว่า
- **PostgreSQL:** เวอร์ชัน 14 หรือสูงกว่า
- **Git:** สำหรับดาวน์โหลดโค้ด

## ขั้นตอนที่ 1: การเตรียมเซิร์ฟเวอร์

### Ubuntu Server Setup
```bash
# อัพเดท system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# ติดตั้ง Git
sudo apt install git -y

# ติดตั้ง Nginx (optional สำหรับ reverse proxy)
sudo apt install nginx -y
```

### Windows Server Setup
1. ดาวน์โหลดและติดตั้ง Node.js จาก https://nodejs.org
2. ดาวน์โหลดและติดตั้ง PostgreSQL จาก https://www.postgresql.org
3. ติดตั้ง Git จาก https://git-scm.com

## ขั้นตอนที่ 2: การตั้งค่า Database

### สร้าง Database และ User
```sql
-- เข้าสู่ PostgreSQL console
sudo -u postgres psql

-- สร้าง database
CREATE DATABASE hospital_management;

-- สร้าง user สำหรับระบบ
CREATE USER hospital_user WITH PASSWORD 'SecurePassword123!';

-- กำหนดสิทธิ์
GRANT ALL PRIVILEGES ON DATABASE hospital_management TO hospital_user;

-- ออกจาก console
\q
```

### ตั้งค่า PostgreSQL สำหรับ Network Access
แก้ไขไฟล์ `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = '*'
port = 5432
```

แก้ไขไฟล์ `/etc/postgresql/14/main/pg_hba.conf`:
```
# เพิ่มบรรทัดนี้สำหรับ local network
host    hospital_management    hospital_user    192.168.1.0/24    md5
```

รีสตาร์ท PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## ขั้นตอนที่ 3: การดาวน์โหลดและติดตั้งโค้ด

### ดาวน์โหลดโปรเจค
```bash
# สร้าง directory
sudo mkdir -p /opt/hospital-system
cd /opt/hospital-system

# ดาวน์โหลดโค้ดจาก GitHub
git clone https://github.com/Uraree222/hospital-management-system.git .

# หรือ upload ไฟล์ ZIP และแตกไฟล์
# unzip hospital-management-system.zip
```

### ติดตั้ง Dependencies
```bash
# ติดตั้ง packages
npm install

# สำหรับ production
npm install --production
```

## ขั้นตอนที่ 4: การปรับแก้โค้ดสำหรับ Local Deployment

### 4.1 สร้างไฟล์ Environment (.env)
```bash
# สร้างไฟล์ .env
touch .env
```

เพิ่มเนื้อหาใน `.env`:
```env
# Database Configuration
DATABASE_URL="postgresql://hospital_user:SecurePassword123!@localhost:5432/hospital_management"
PGHOST=localhost
PGPORT=5432
PGUSER=hospital_user
PGPASSWORD=SecurePassword123!
PGDATABASE=hospital_management

# Session Configuration
SESSION_SECRET=your_very_secure_session_secret_minimum_32_characters_long

# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Replit-specific (ไม่ใช้ใน local)
# REPLIT_DOMAINS=localhost
# REPL_ID=local-development
```

### 4.2 แก้ไขไฟล์ server/index.ts
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// เพิ่ม security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    log(`Error ${status}: ${message}`);
    res.status(status).json({ message });
  });

  // Setup Vite for development, serve static files for production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server configuration
  const port = parseInt(process.env.PORT || "3000");
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen(port, host, () => {
    log(`🏥 Hospital Management System running on http://${host}:${port}`);
    log(`🌐 Network access: http://[YOUR_SERVER_IP]:${port}`);
  });
})();
```

### 4.3 แก้ไขไฟล์ package.json
เพิ่ม scripts สำหรับ production:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "prod": "npm run build && npm run start",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 4.4 แก้ไขรหัสผ่านในไฟล์ client/src/pages/Login.tsx
```typescript
const predefinedUsers = [
  {
    username: "admin001",
    password: "Hospital@Admin2024!",
    role: "admin" as UserRole,
    name: "ผู้ดูแลระบบ",
    icon: Shield,
    color: "text-red-600"
  },
  {
    username: "doctor001", 
    password: "Doctor@Secure2024!",
    role: "doctor" as UserRole,
    name: "แพทย์",
    icon: UserCog,
    color: "text-blue-600"
  },
  {
    username: "nurse001",
    password: "Nurse@Care2024!", 
    role: "nurse" as UserRole,
    name: "พยาบาล",
    icon: Heart,
    color: "text-green-600"
  }
];
```

## ขั้นตอนที่ 5: การ Setup Database Schema

### รัน Database Migration
```bash
# Push schema ไปยัง database
npm run db:push

# ตรวจสอบ database (optional)
npm run db:studio
```

## ขั้นตอนที่ 6: การ Build และ Start ระบบ

### Build Application
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### สร้าง systemd service (Ubuntu)
สร้างไฟล์ `/etc/systemd/system/hospital-system.service`:
```ini
[Unit]
Description=Hospital Management System
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/hospital-system
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

เปิดใช้งาน service:
```bash
sudo systemctl enable hospital-system
sudo systemctl start hospital-system
sudo systemctl status hospital-system
```

## ขั้นตอนที่ 7: การตั้งค่า Nginx (แนะนำ)

สร้างไฟล์ `/etc/nginx/sites-available/hospital-system`:
```nginx
server {
    listen 80;
    server_name 192.168.1.100;  # IP ของเซิร์ฟเวอร์

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

เปิดใช้งาน site:
```bash
sudo ln -s /etc/nginx/sites-available/hospital-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ขั้นตอนที่ 8: การตั้งค่า Firewall

### Ubuntu UFW
```bash
# เปิด ports ที่จำเป็น
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 3000/tcp    # Application (ถ้าไม่ใช้ Nginx)
sudo ufw allow from 192.168.1.0/24 to any port 5432  # PostgreSQL

# เปิดใช้งาน firewall
sudo ufw enable
```

## การใช้งานระบบ

### การเข้าถึงระบบ
เครื่องคอมพิวเตอร์ในโรงพยาบาลสามารถเข้าใช้ระบบได้ผ่าน:
- **ผ่าน Nginx:** `http://192.168.1.100`
- **โดยตรง:** `http://192.168.1.100:3000`

### ข้อมูลการเข้าสู่ระบบ
- **ผู้ดูแลระบบ:** admin001 / Hospital@Admin2024!
- **แพทย์:** doctor001 / Doctor@Secure2024!
- **พยาบาล:** nurse001 / Nurse@Care2024!

## การสำรองข้อมูลและ Maintenance

### การสำรองข้อมูล Database
```bash
# สร้าง backup directory
sudo mkdir -p /backup/hospital

# Manual backup
pg_dump -h localhost -U hospital_user hospital_management > /backup/hospital/backup_$(date +%Y%m%d_%H%M%S).sql

# Automatic backup (cron job)
# เพิ่มใน crontab: crontab -e
0 2 * * * pg_dump -h localhost -U hospital_user hospital_management > /backup/hospital/daily_$(date +\%Y\%m\%d).sql
0 2 * * 0 pg_dump -h localhost -U hospital_user hospital_management > /backup/hospital/weekly_$(date +\%Y\%m\%d).sql
```

### การ Restore ข้อมูล
```bash
# Restore จาก backup file
psql -h localhost -U hospital_user -d hospital_management < /backup/hospital/backup_20241220_020000.sql
```

### การตรวจสอบสถานะระบบ
```bash
# ตรวจสอบ application
sudo systemctl status hospital-system

# ตรวจสอบ database
sudo systemctl status postgresql

# ตรวจสอบ nginx
sudo systemctl status nginx

# ดู logs
sudo journalctl -u hospital-system -f
```

## การแก้ไขปัญหาเบื้องต้น

### ปัญหา Database Connection
```bash
# ตรวจสอบ PostgreSQL
sudo systemctl status postgresql

# ตรวจสอบ network connection
telnet localhost 5432

# ดู PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### ปัญหา Permission
```bash
# แก้ไข ownership
sudo chown -R www-data:www-data /opt/hospital-system

# แก้ไข permissions
sudo chmod -R 755 /opt/hospital-system
```

### การอัพเดทระบบ
```bash
# Pull โค้ดใหม่
cd /opt/hospital-system
git pull origin main

# ติดตั้ง dependencies ใหม่
npm install

# Build ใหม่
npm run build

# Restart service
sudo systemctl restart hospital-system
```

## Security Considerations

1. **เปลี่ยนรหัสผ่าน default** ทั้งหมดก่อนใช้งานจริง
2. **ตั้งค่า Firewall** ให้จำกัดการเข้าถึงเฉพาะ IP ในโรงพยาบาล
3. **สำรองข้อมูล** อย่างสม่ำเสมอ
4. **อัพเดท system และ dependencies** เป็นประจำ
5. **ติดตั้ง SSL certificate** สำหรับ HTTPS (แนะนำ)

## ผู้ติดต่อและการสนับสนุน

หากมีปัญหาหรือข้อสงสัยในการติดตั้ง กรุณาติดต่อทีม IT ของโรงพยาบาลหรือผู้พัฒนาระบบ

---

**หมายเหตุ:** คู่มือนี้เหมาะสำหรับการติดตั้งในสภาพแวดล้อม production ของโรงพยาบาล กรุณาทดสอบในสภาพแวดล้อม development ก่อนนำไปใช้งานจริง