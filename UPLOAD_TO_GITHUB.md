# วิธีการอัปโหลดโครงการไปยัง GitHub Repository ของคุณ

## Repository: https://github.com/Uraree222/hospital-management-system.git

## ขั้นตอนการอัปโหลด

### วิธีที่ 1: อัปโหลดผ่าน GitHub Web Interface (แนะนำ)

1. **เปิด repository ของคุณ**
   - ไปที่ https://github.com/Uraree222/hospital-management-system
   - ล็อกอินด้วยบัญชี GitHub ของคุณ

2. **อัปโหลดไฟล์**
   - คลิก "Add file" → "Upload files"
   - ลากไฟล์ทั้งหมดจากโฟลเดอร์โครงการ หรือ "choose your files"
   
3. **ไฟล์ที่ต้องอัปโหลด:**
   ```
   📁 client/              (ทั้งโฟลเดอร์)
   📁 server/              (ทั้งโฟลเดอร์) 
   📁 shared/              (ทั้งโฟลเดอร์)
   📄 README.md
   📄 LICENSE
   📄 DEPLOYMENT.md
   📄 GITHUB_UPLOAD_INSTRUCTIONS.md
   📄 .env.example
   📄 .gitignore
   📄 package.json
   📄 package-lock.json
   📄 components.json
   📄 drizzle.config.ts
   📄 postcss.config.js
   📄 tailwind.config.ts
   📄 tsconfig.json
   📄 vite.config.ts
   ```

4. **ไฟล์ที่ไม่ต้องอัปโหลด:**
   ```
   ❌ node_modules/       (ใหญ่เกินไป)
   ❌ .env               (ข้อมูลลับ)
   ❌ .replit            (เฉพาะ Replit)
   ❌ .cache/            (ไฟล์ cache)
   ❌ .local/            (ไฟล์ local)
   ❌ .upm/              (ไฟล์ package manager)
   ```

5. **Commit การเปลี่ยนแปลง**
   - เขียน commit message: `Initial commit: Hospital Management System for Hematology-Oncology`
   - คลิก "Commit changes"

### วิธีที่ 2: ใช้ Git Command Line (สำหรับผู้ที่คุ้นเคย)

```bash
# ใน Terminal/Command Prompt
git clone https://github.com/Uraree222/hospital-management-system.git
cd hospital-management-system

# คัดลอกไฟล์จากโครงการเดิมมาใส่ที่นี่
# (ยกเว้น node_modules, .env, .replit)

git add .
git commit -m "Initial commit: Hospital Management System"
git push origin main
```

## หลังจากอัปโหลดเสร็จ

1. **ตรวจสอบ Repository**
   - รีเฟรชหน้า GitHub
   - ตรวจสอบว่าไฟล์ทั้งหมดอัปโหลดสำเร็จ
   - ดู README.md ว่าแสดงผลถูกต้อง

2. **การตั้งค่าเพิ่มเติม**
   - ตั้งค่า Repository description
   - เพิ่ม topics/tags เช่น: `hospital`, `healthcare`, `react`, `typescript`
   - ตั้งค่า visibility (Public/Private)

3. **การแชร์**
   - แชร์ลิงก์ repository: https://github.com/Uraree222/hospital-management-system
   - เชิญผู้ร่วมงาน (ถ้ามี): Settings → Collaborators

## การ Deploy

### บน Replit (ปัจจุบัน)
- โครงการพร้อม deploy บน Replit แล้ว
- คลิกปุ่ม "Deploy" ในแถบด้านบน

### บนแพลตฟอร์มอื่น
- อ่านไฟล์ `DEPLOYMENT.md` สำหรับคำแนะนำการ deploy
- แพลตฟอร์มที่แนะนำ: Vercel, Netlify, Railway

## ข้อมูลโครงการ

- **ชื่อ**: Hospital Management System for Hematology-Oncology
- **ภาษา**: TypeScript, React, Node.js
- **ฐานข้อมูล**: PostgreSQL
- **UI**: Tailwind CSS + Shadcn/ui
- **Authentication**: Replit Auth

## การดูแลรักษา

1. **อัปเดตโครงการ**
   ```bash
   git add .
   git commit -m "Update: [describe changes]"
   git push origin main
   ```

2. **การสำรองข้อมูล**
   - GitHub เป็น backup อัตโนมัติ
   - Export ฐานข้อมูลเป็นประจำ

3. **การร่วมงาน**
   - ใช้ Pull Requests สำหรับการเปลี่ยนแปลงใหญ่
   - ตั้งค่า branch protection rules

## การแก้ไขปัญหา

- **ไฟล์ใหญ่เกินไป**: แยกอัปโหลดทีละส่วน
- **Permission denied**: ตรวจสอบสิทธิ์ repository
- **Merge conflicts**: ใช้ GitHub web interface แก้ไข

Repository ของคุณพร้อมใช้งานแล้วที่: 
https://github.com/Uraree222/hospital-management-system