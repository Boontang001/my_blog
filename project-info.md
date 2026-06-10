# 📝 Project Info: Vue.js + Supabase Blog System

เอกสารนี้ระบุรายละเอียดของ Tech Stack, โครงสร้างฐานข้อมูล (Database Schema), ฟีเจอร์หลัก และโครงสร้างโปรเจกต์สำหรับระบบ Blog ที่พัฒนาด้วย **Vue 3** และ **Supabase**

---

## 🚀 1. Tech Stack & Libraries

ระบบนี้จะเน้นการออกแบบที่ทันสมัย มีความลื่นไหลสูง (High Performance) และดีไซน์ระดับ Premium ด้วยเทคโนโลยีดังต่อไปนี้:

| ส่วนงาน | เทคโนโลยีที่เลือกใช้ | เหตุผลและรายละเอียด |
| :--- | :--- | :--- |
| **Core Framework** | **Vue 3 (Composition API)** | ใช้ `<script setup>` ซึ่งเป็นมาตรฐานสมัยใหม่ เขียนง่าย จัดการ Logic ได้เป็นระเบียบ |
| **Build Tool** | **Vite** | ทำงานได้รวดเร็วมากเมื่อเทียบกับ Webpack เหมาะกับการพัฒนา Vue 3 |
| **State Management** | **Pinia** | Store สำหรับจัดการสถานะกลางของแอป (เช่น ข้อมูลผู้ใช้ที่ล็อกอิน, โหมดธีม) |
| **Routing** | **Vue Router** | จัดการเส้นทางหน้าเว็บ (เช่น หน้าแรก, หน้าบทความ, หน้าเขียนบทความ, หน้าล็อกอิน) |
| **Database & Auth** | **Supabase** | Backend-as-a-Service (BaaS) ที่ใช้ PostgreSQL มี Auth, Database, และ Storage ในตัว |
| **Styling** | **Vanilla CSS (Modern CSS)** | เน้นใช้ CSS Variables, CSS Grid/Flexbox, และ CSS Nesting เพื่อให้ได้หน้าเว็บที่โหลดเร็ว ดีไซน์แบบ Glassmorphism และ Micro-animations ที่ลื่นไหลตามข้อกำหนดของการออกแบบระดับพรีเมียม |
| **Icons** | **Lucide Vue** | ชุดไอคอนแบบ Vector ที่สวยงาม ทันสมัย และเบามาก |
| **Markdown Parser** | **marked** + **DOMPurify** | แปลงเนื้อหาที่เป็น Markdown ให้เป็น HTML เพื่อให้เขียนบล็อกได้สะดวก และป้องกัน XSS |
| **Animations** | **@vueuse/motion** | ใช้สำหรับทำ Micro-animations เมื่อขยับเมาส์ หรือเปลี่ยนหน้าเว็บให้ดูพรีเมียม |
| **Meta & SEO** | **@unhead/vue** | จัดการ Meta Tags, Title และ Open Graph สำหรับการทำ SEO ของหน้าบล็อกแต่ละหน้า |

---

## 🗄️ 2. Database Schema (Supabase / PostgreSQL)

โครงสร้างตารางฐานข้อมูลที่จำเป็นสำหรับระบบ Blog:

### 1) ตาราง `profiles` (เก็บข้อมูลผู้ใช้งานเพิ่มเติม เชื่อมโยงกับ Supabase Auth)
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);
```

### 2) ตาราง `posts` (เก็บข้อมูลบทความ)
```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  summary text,
  content text not null, -- เก็บเป็น Markdown format
  cover_image text, -- URL ของภาพหน้าปก (เก็บใน Supabase Storage)
  status text default 'draft' check (status in ('draft', 'published')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 3) ตาราง `comments` (เก็บความคิดเห็นใต้บทความ)
```sql
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4) ตาราง `tags` และ `post_tags` (สำหรับระบบหมวดหมู่/แท็กของบทความ)
```sql
create table tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null
);

create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
```

---

## ✨ 3. Key Features (ฟีเจอร์หลัก)

1. **ระบบบทความ (Blog Engine)**:
   - แสดงรายการบล็อกล่าสุด (พร้อมระบบ Pagination หรือ Infinite Scroll)
   - หน้าแสดงรายละเอียดบล็อก (แปลงจาก Markdown เป็น HTML สวยงาม)
   - ระบบค้นหาบทความ และการกรองตามแท็ก (Tag Filtering)
2. **ระบบจัดการบล็อก (Admin/Author Dashboard)**:
   - ระบบเขียนบล็อก (Markdown Editor พร้อม Live Preview)
   - ระบบอัปโหลดรูปภาพหน้าปกบล็อก (เชื่อมโยงกับ Supabase Storage)
   - ระบบบันทึกแบบร่าง (Draft) หรือสั่งเผยแพร่ (Publish)
3. **ระบบผู้ใช้และความปลอดภัย (Authentication & Profiles)**:
   - ระบบสมัครสมาชิก, เข้าสู่ระบบ, และออกจากระบบผ่าน Supabase Auth
   - หน้าแก้ไขข้อมูลส่วนตัว (Profile Page) และรูปโปรไฟล์
4. **ระบบปฏิสัมพันธ์ (Interactive Features)**:
   - คอมเมนต์ใต้บทความแบบ Real-time
   - ระบบกดถูกใจบทความ (Likes)
5. **ดีไซน์ระดับ Premium**:
   - รองรับธีมสว่าง/มืด (Light/Dark Mode) แบบนุ่มนวล
   - ดีไซน์การ์ดและปุ่มในสไตล์ Glassmorphism
   - Micro-animations ที่ตอบสนองต่อการชี้เมาส์และจังหวะการโหลดข้อมูล

---

## 📂 4. Project Structure (โครงสร้างโฟลเดอร์)

โครงสร้างซอร์สโค้ดในฝั่ง Frontend (Vue 3):

```text
src/
├── assets/          # ไฟล์สไตล์ส่วนกลาง, รูปภาพโลโก้
│   ├── main.css     # CSS Variables & Global Styles (ธีมระบบ)
│   └── logo.svg
├── components/      # UI Components ขนาดเล็กที่นำกลับมาใช้ซ้ำได้
│   ├── BlogCard.vue
│   ├── CommentSection.vue
│   ├── MarkdownEditor.vue
│   ├── Navbar.vue
│   └── Footer.vue
├── views/           # หน้าเว็บหลัก (Pages)
│   ├── HomeView.vue        # หน้าแรกแสดงรายการบล็อก
│   ├── PostDetailView.vue  # หน้าอ่านบทความ
│   ├── DashboardView.vue   # หน้าจัดการบทความของผู้เขียน
│   ├── EditorView.vue      # หน้าเขียน/แก้ไขบทความ
│   ├── LoginView.vue       # หน้าเข้าสู่ระบบ/สมัครสมาชิก
│   └── ProfileView.vue     # หน้าจัดการบัญชีผู้ใช้
├── router/          # จัดการเส้นทาง (Vue Router)
│   └── index.js
├── stores/          # จัดการข้อมูลกลาง (Pinia Store)
│   ├── auth.js      # เก็บสถานะผู้ใช้ปัจจุบัน
│   └── theme.js     # เก็บสถานะ Dark/Light Mode
├── services/        # ตัวเชื่อมโยงกับ Supabase Client
│   └── supabase.js
├── App.vue          # Root component ของ Vue
└── main.js          # จุดเริ่มต้นของแอปพลิเคชัน
```

---

## 🛠️ 5. Next Steps: วิธีเริ่มต้นติดตั้ง

หากตกลงเลือกใช้ Tech Stack นี้แล้ว ขั้นตอนถัดไปคือ:

1. **สร้างโปรเจกต์ Vue 3 + Vite**:
   ```bash
   npm create vue@latest
   ```
2. **ติดตั้งไลบรารีที่ระบุ**:
   ```bash
   npm install @supabase/supabase-js pinia vue-router lucide-vue-next marked dompurify @vueuse/core @vueuse/motion @unhead/vue
   ```
3. **เชื่อมต่อ Supabase**:
   สร้างฐานข้อมูลใน Supabase Console และคัดลอก `SUPABASE_URL` และ `SUPABASE_ANON_KEY` มาใส่ในไฟล์ `.env` ของโปรเจกต์
