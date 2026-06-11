-- ==========================================
-- ✍️ SUPABASE DATABASE INITIALIZATION SCRIPT
-- ==========================================
-- วิธีใช้: คัดลอกคำสั่งทั้งหมดไปรันใน SQL Editor ของ Supabase Project ของคุณ

-- ------------------------------------------
-- 1. สร้างตาราง Profiles (เชื่อมโยงกับ auth.users ใน Supabase)
-- ------------------------------------------
create table public.profiles (
  firebase_uid text primary key, -- ทำหน้าที่เก็บ UID ของผู้ใช้จาก Supabase Auth (เดิมคือ Firebase UID)
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- เปิดใช้ Row Level Security (RLS)
alter table public.profiles enable row level security;

-- นโยบายความปลอดภัย (Policies) สำหรับ Profiles
create policy "โปรไฟล์เป็นข้อมูลสาธารณะ อ่านได้ทุกคน" 
  on public.profiles for select 
  using (true);

create policy "ผู้ใช้สามารถสร้างโปรไฟล์ตัวเองได้เท่านั้น" 
  on public.profiles for insert 
  with check (auth.uid()::text = firebase_uid);

create policy "ผู้ใช้สามารถอัปเดตโปรไฟล์ตัวเองได้เท่านั้น" 
  on public.profiles for update 
  using (auth.uid()::text = firebase_uid);


-- ------------------------------------------
-- 2. สร้างตาราง Posts (ตารางเก็บบทความบล็อก)
-- ------------------------------------------
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id text references public.profiles(firebase_uid) on delete cascade not null,
  title text not null,
  slug text unique not null,
  summary text,
  content text not null,
  cover_image text,
  status text default 'draft' check (status in ('draft', 'published')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- เปิดใช้ RLS สำหรับ Posts
alter table public.posts enable row level security;

-- นโยบายความปลอดภัยสำหรับ Posts
create policy "ทุกคนสามารถอ่านบทความที่เผยแพร่แล้วได้" 
  on public.posts for select 
  using (status = 'published');

create policy "ผู้เขียนสามารถอ่านบทความฉบับร่างของตัวเองได้" 
  on public.posts for select 
  using (auth.uid()::text = author_id);

create policy "ผู้ใช้ที่ล็อกอินแล้วสามารถเขียนบทความใหม่ได้" 
  on public.posts for insert 
  with check (auth.uid()::text = author_id);

create policy "ผู้เขียนสามารถแก้ไขบทความตัวเองได้เท่านั้น" 
  on public.posts for update 
  using (auth.uid()::text = author_id);

create policy "ผู้เขียนสามารถลบบทความตัวเองได้เท่านั้น" 
  on public.posts for delete 
  using (auth.uid()::text = author_id);


-- ------------------------------------------
-- 3. สร้างตาราง Comments (ความคิดเห็น)
-- ------------------------------------------
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id text references public.profiles(firebase_uid) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- เปิดใช้ RLS สำหรับ Comments
alter table public.comments enable row level security;

-- นโยบายความปลอดภัยสำหรับ Comments
create policy "ทุกคนสามารถอ่านความคิดเห็นได้" 
  on public.comments for select 
  using (true);

create policy "ผู้ใช้ที่ล็อกอินแล้วสามารถแสดงความเห็นได้" 
  on public.comments for insert 
  with check (auth.uid()::text = author_id);

create policy "ผู้เขียนความเห็นสามารถลบความเห็นตัวเองได้" 
  on public.comments for delete 
  using (auth.uid()::text = author_id);


-- ------------------------------------------
-- 4. สร้างตาราง Tags & Post_tags (สำหรับจัดหมวดหมู่)
-- ------------------------------------------
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null
);

create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- เปิดใช้ RLS
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;

-- นโยบาย Tags & Post_tags
create policy "ทุกคนสามารถดูแท็กได้" on public.tags for select using (true);
create policy "ผู้ใช้ล็อกอินสามารถสร้างแท็กใหม่ได้" on public.tags for insert with check (auth.role() = 'authenticated');

create policy "ทุกคนสามารถดูความสัมพันธ์แท็กได้" on public.post_tags for select using (true);
create policy "ผู้ใช้ล็อกอินสามารถจัดการแท็กของบทความได้" on public.post_tags for all using (auth.role() = 'authenticated');
