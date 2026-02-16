📘 Smart Bookmark App

A simple, private, real-time bookmark manager built with Next.js (App Router) and Supabase.

Users can sign in with Google, add bookmarks, edit them, delete them, and see updates in real-time across multiple tabs.

🚀 Live Demo

🔗 Live URL:
https://bookmark-app-tan.vercel.app

🛠 Tech Stack

Next.js (App Router)

Supabase

Authentication (Google OAuth)

PostgreSQL Database

Realtime subscriptions

Tailwind CSS

Vercel (Deployment)

✨ Features

✅ Google OAuth login (no email/password)

✅ Add bookmarks (Title + URL)

✅ Edit bookmarks

✅ Delete single bookmark

✅ Delete multiple bookmarks

✅ Real-time updates (across tabs)

✅ Private bookmarks (Row Level Security)

✅ Responsive UI with Tailwind

✅ Deployed on Vercel

🔐 Authentication

Google OAuth is handled via Supabase Auth.

Only Google login is allowed.

No email/password authentication is used.

🗄 Database Design
bookmarks table
Column	Type
id	uuid (primary key)
user_id	uuid (references auth.users)
title	text
url	text
created_at	timestamp
🔒 Security (Row Level Security - RLS)

RLS is enabled to ensure:

Users can only view their own bookmarks

Users can only insert their own bookmarks

Users can only update their own bookmarks

Users can only delete their own bookmarks

Example policy:

create policy "Users can update own bookmarks"
on bookmarks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

⚡ Real-Time Updates

Supabase Realtime is enabled for the bookmarks table.

If a bookmark is:

Added

Updated

Deleted

It instantly reflects in other open tabs without refreshing the page.

🧠 Problems Faced & Solutions
1️⃣ Google OAuth redirect issues

Problem:
After deployment, login did not redirect to /dashboard.

Cause:
Supabase only allows redirects to URLs listed in Authentication → URL Configuration.

Solution:

Added production URL in:

Site URL

Redirect URLs

Used dynamic redirect:

redirectTo: `${window.location.origin}/dashboard`

2️⃣ Error: redirect_uri_mismatch

Problem:
Google showed error 400: redirect_uri_mismatch.

Cause:
Authorized Redirect URI in Google Console did not match Supabase callback URL.

Solution:
Added this exact URL in Google Cloud Console:

https://<project-id>.supabase.co/auth/v1/callback

3️⃣ Update button not working

Problem:
Edit feature appeared to update but showed old data.

Cause:
Missing UPDATE policy in Row Level Security.

Solution:
Added UPDATE RLS policy:

create policy "Users can update own bookmarks"
on bookmarks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

4️⃣ Invalid URL opening (localhost/www.google.com
)

Problem:
Entering google.com opened:

http://localhost:3000/google.com


Cause:
Missing protocol (http/https).

Solution:
Auto-prepended https:// before saving URL.

💻 Local Development Setup
1️⃣ Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

2️⃣ Install dependencies
npm install

3️⃣ Add environment variables

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

4️⃣ Run development server
npm run dev


Open:

http://localhost:3000

🌍 Deployment

Deployed using Vercel.

Steps:

Push to GitHub

Import repo in Vercel

Add environment variables

Set Supabase production Site URL

Add production Redirect URLs

📌 Assignment Requirements Status
Requirement	Status
Google OAuth only	✅
Add bookmark	✅
Private per user	✅
Real-time updates	✅
Delete bookmarks	✅
Deployed on Vercel	✅
Public GitHub repo	✅
README with problems	✅
🙌 Conclusion

This project demonstrates:

Authentication flow handling

Secure database access with RLS

Real-time subscriptions

Production deployment handling

Debugging OAuth & redirect issues
