# วิธีการอัปโหลดโครงการไปยัง GitHub

## ขั้นตอนที่ 1: สร้าง GitHub Repository

1. เข้าไปที่ [GitHub.com](https://github.com) และล็อกอิน
2. คลิกปุ่ม **"New"** (สีเขียว) เพื่อสร้าง repository ใหม่
3. กรอกข้อมูล:
   - **Repository name**: `hospital-management-system` หรือชื่อที่ต้องการ
   - **Description**: `ระบบจัดการโรงพยาบาล - แผนกโลหิตวิทยาและมะเร็งวิทยา`
   - เลือก **Public** หรือ **Private** ตามต้องการ
   - **ไม่ต้อง** เลือก "Add a README file" (เพราะเรามี README.md แล้ว)
4. คลิก **"Create repository"**

## ขั้นตอนที่ 2: เตรียมไฟล์ในโครงการ

โครงการของคุณมีไฟล์ที่จำเป็นแล้ว:
- ✅ `README.md` - คำอธิบายโครงการ
- ✅ `LICENSE` - สิทธิ์การใช้งาน
- ✅ `.env.example` - ตัวอย่างการตั้งค่า environment variables
- ✅ `.gitignore` - ไฟล์ที่ไม่ต้องอัปโหลด

## ขั้นตอนที่ 3: อัปโหลดผ่าน GitHub Web Interface

### วิธีที่ 1: Upload ผ่านเว็บ (แนะนำสำหรับผู้เริ่มต้น)

1. ในหน้า repository ที่เพิ่งสร้าง คลิก **"uploading an existing file"**
2. ลากไฟล์ทั้งหมดจากโครงการ หรือคลิก "choose your files"
3. เลือกไฟล์ทั้งหมดในโฟลเดอร์โครงการ (ยกเว้น `node_modules`, `.env`)
4. เขียน commit message: `Initial commit: Hospital Management System`
5. คลิก **"Commit changes"**

### วิธีที่ 2: ใช้ Git Command Line

```bash
# คัดลอกลิงก์ repository จาก GitHub
git remote add origin https://github.com/[your-username]/[repository-name].git

# เพิ่มไฟล์ทั้งหมด
git add .

# สร้าง commit
git commit -m "Initial commit: Hospital Management System"

# อัปโหลดไปยัง GitHub
git push -u origin main
```

## ขั้นตอนที่ 4: ตรวจสอบการอัปโหลด

1. รีเฟรชหน้า GitHub repository
2. ตรวจสอบว่าไฟล์ทั้งหมดอัปโหลดสำเร็จ
3. ตรวจสอบว่า README.md แสดงผลถูกต้อง

## ขั้นตอนที่ 5: แชร์โครงการ

หลังจากอัปโหลดเสร็จ คุณสามารถ:
- แชร์ลิงก์ repository กับผู้อื่น
- เชิญผู้ร่วมงาน (Collaborators)
- ตั้งค่า GitHub Pages (ถ้าต้องการ)

## ไฟล์ที่ไม่ควรอัปโหลด

โครงการมี `.gitignore` ที่จะป้องกันไฟล์เหล่านี้อัตโนมัติ:
- `node_modules/` - dependencies
- `.env` - ข้อมูลลับ
- `dist/` - ไฟล์ build
- `.replit` - การตั้งค่า Replit

## การแก้ไขปัญหา

### ถ้าอัปโหลดไม่สำเร็จ:
1. ตรวจสอบขนาดไฟล์ (GitHub จำกัดที่ 100MB ต่อไฟล์)
2. ตรวจสอบชื่อไฟล์ (ไม่ควรมีอักขระพิเศษ)
3. ลองอัปโหลดทีละไฟล์

### ถ้าต้องการลบไฟล์ที่อัปโหลดผิด:
1. ไปที่ไฟล์ใน GitHub
2. คลิกไอคอนถังขยะ
3. เขียน commit message และ commit

## ขั้นตอนถัดไป

หลังจากอัปโหลดเสร็จ:
1. อ่านไฟล์ `DEPLOYMENT.md` สำหรับการ deploy
2. ตั้งค่า GitHub Actions (ถ้าต้องการ CI/CD)
3. เชิญทีมงานเข้า repository