# ✍️ Premium Blog System (Vue 3 + Firebase)

ระบบบล็อกสไตล์มินิมอลที่มีลูกเล่นระดับพรีเมียม (Glassmorphism & Micro-animations) พัฒนาด้วย **Vue 3** ร่วมกับ **Firebase** สำหรับเป็นบล็อกส่วนตัวหรือแพลตฟอร์มเผยแพร่บทความ

---

## ✨ คุณสมบัติเด่น (Key Features)

*   **⚡ Modern Vue 3 & Vite**: เขียนด้วย Composition API (`<script setup>`) รวดเร็ว มีประสิทธิภาพสูง
*   **🔥 Real-time Database**: ใช้ **Firebase Firestore** ในการเก็บข้อมูลบทความและการแสดงความคิดเห็นแบบเรียลไทม์
*   **🔐 Authentication**: ระบบล็อกอินสำหรับผู้เขียนบล็อกด้วย **Firebase Auth** (รองรับ Email/Password และ Google Sign-In)
*   **📷 Cloud Storage**: อัปโหลดรูปภาพหน้าปกและภาพประกอบบทความผ่าน **Firebase Storage**
*   **🌓 Dark/Light Mode**: เปลี่ยนธีมสว่างและมืดได้ลื่นไหล พร้อมเก็บข้อมูลธีมที่ผู้ใช้เลือกไว้ใน LocalStorage
*   **📝 Markdown Editor**: เขียนบทความด้วยรูปแบบ Markdown พร้อมการแสดงตัวอย่างแบบเรียลไทม์ (Live Preview)
*   **💬 Interactive Comments**: ระบบคอมเมนต์ใต้บทความแบบเรียลไทม์

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

*   **Frontend**: Vue 3 (Composition API), Vite, Vue Router, Pinia
*   **Backend & Database**: Firebase (Auth, Firestore, Cloud Storage)
*   **Styling**: Vanilla CSS (ใช้ Modern CSS Nesting & CSS Variables)
*   **Libraries เพิ่มเติม**:
    *   `lucide-vue-next` (ชุดไอคอน SVG)
    *   `marked` (สำหรับแปลง Markdown เป็น HTML)
    *   `dompurify` (ป้องกันการโจมตีประเภท XSS จากบทความ/คอมเมนต์)
    *   `@vueuse/motion` (สำหรับ Micro-animations)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
src/
├── assets/          # สไตล์หลักและรูปภาพประกอบ
│   └── main.css     # CSS Variables & Global Theme
├── components/      # UI Components ที่แชร์ใช้งานร่วมกัน
│   ├── BlogCard.vue
│   ├── CommentSection.vue
│   ├── Navbar.vue
│   └── Footer.vue
├── views/           # หน้าเว็บหลัก (Pages)
│   ├── HomeView.vue        # หน้าหลักรายการบล็อก
│   ├── PostDetailView.vue  # หน้าอ่านบทความตัวเต็ม
│   ├── DashboardView.vue   # แดชบอร์ดจัดการบล็อก (สำหรับ Author)
│   ├── EditorView.vue      # หน้าเขียน/แก้ไขบล็อก
│   └── LoginView.vue       # หน้าเข้าสู่ระบบ
├── router/          # การนำทางหน้าเว็บ (Vue Router)
├── stores/          # การจัดการ State (Pinia)
│   ├── auth.js      # จัดการ Login State
│   └── theme.js     # จัดการธีมสว่าง/มืด
├── firebase/        # ไฟล์การตั้งค่า Firebase Client
│   └── config.js
├── App.vue          # Root Component
└── main.js          # จุดเริ่มต้นแอปพลิเคชัน
```

---

## ⚙️ การเริ่มต้นใช้งาน (Getting Started)

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies

```bash
# โคลนโปรเจกต์
git clone <repository-url>
cd my_blog

# ติดตั้งแพ็กเกจ
npm install
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env` ที่โฟลเดอร์หลัก (Root) ของโปรเจกต์ และใส่ข้อมูลตั้งค่า Firebase ของคุณ:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. รันโปรเจกต์ในโหมดพัฒนา (Development)

```bash
npm run dev
```

แอปพลิเคชันจะทำงานที่ `http://localhost:5173`

---

## 🔥 การตั้งค่า Firebase (Firebase Configuration Guidelines)

1.  **Firebase Authentication**:
    *   เข้าไปที่ Firebase Console
    *   เปิดใช้งาน **Email/Password** และ **Google** Sign-In ที่เมนู Authentication
2.  **Cloud Firestore**:
    *   สร้างฐานข้อมูล Firestore
    *   ตั้งค่า Security Rules เพื่ออนุญาตให้เฉพาะเจ้าของบล็อกเขียนบทความได้ และบุคคลทั่วไปอ่านบทความได้เท่านั้น ตัวอย่าง Rules:
        ```javascript
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /posts/{postId} {
              allow read: if true;
              allow write: if request.auth != null; // อนุญาตให้เขียนเฉพาะเมื่อล็อกอินแล้ว
            }
            match /comments/{commentId} {
              allow read: if true;
              allow write: if true; // หรือ allow write: if request.auth != null;
            }
          }
        }
        ```
3.  **Firebase Storage**:
    *   สร้าง Bucket สำหรับเก็บรูปภาพ
    *   เปิดสิทธิ์ให้อัปโหลดภาพหน้าปกบทความได้เฉพาะผู้ที่ผ่านการยืนยันตัวตน