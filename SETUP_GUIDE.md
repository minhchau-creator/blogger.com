# Google OAuth & Forgot Password Setup Guide

## 🚀 Features Added
1. ✅ Google OAuth Login/Signup
2. ✅ Forgot Password với OTP qua email
3. ✅ Email verification system

## 📋 Setup Instructions

### 1. Google OAuth Setup

#### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**

#### Bước 2: Tạo OAuth 2.0 Client ID
1. Click **Create Credentials** → **OAuth client ID**
2. Chọn Application type: **Web application**
3. Thêm Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
4. Thêm Authorized redirect URIs:
   ```
   http://localhost:5173
   ```
5. Click **Create** và copy **Client ID**

#### Bước 3: Thêm vào .env files
**Frontend (.env):**
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Backend (.env):**
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

---

### 2. Email Service Setup (Gmail)

#### Bước 1: Tạo App Password
1. Truy cập [Google Account Settings](https://myaccount.google.com/)
2. Vào **Security** → **2-Step Verification** (bật nếu chưa có)
3. Scroll xuống → **App passwords**
4. Chọn app: **Mail**, device: **Other (Custom name)**
5. Đặt tên: "Blogger OTP"
6. Copy 16-digit password

#### Bước 2: Thêm vào Backend .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**⚠️ Lưu ý:**
- App password khác với password thường
- Không chia sẻ app password với ai
- Xóa spaces trong app password khi paste vào .env

---

## 🎯 Testing

### Test Google OAuth:
1. Vào `/signin` hoặc `/signup`
2. Click **Sign in with Google** button
3. Chọn Google account
4. Kiểm tra đã login thành công

### Test Forgot Password:
1. Vào `/signin`
2. Click **Forgot Password?**
3. Nhập email đã đăng ký
4. Check email → nhập OTP (6 số)
5. Nhập mật khẩu mới
6. Login với password mới

---

## 📁 Files Created/Modified

### New Files:
- `server/Schema/OTP.js` - OTP schema
- `server/utils/emailService.js` - Email sending service
- `frontend/src/pages/forgot-password.page.jsx` - Forgot password UI
- `frontend/src/components/blog-filter.component.jsx` - Blog filter component

### Modified Files:
- `server/server.js` - Added endpoints: `/google-auth`, `/forgot-password`, `/verify-otp`, `/reset-password`
- `frontend/src/pages/userAuthForm.page.jsx` - Added Google button & forgot password link
- `frontend/src/App.jsx` - Added forgot password route
- `frontend/src/pages/home.page.jsx` - Added filter/sort functionality

---

## 🔧 Environment Variables Summary

### Frontend (.env):
```env
VITE_SERVER_DOMAIN=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend (.env):
```env
DB_LOCATION=mongodb://localhost:27017/blogging-website
SECRET_ACCESS_KEY=my-super-secret-jwt-key
PORT=3000
CLIENT_URL=http://localhost:5173

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 📦 New Dependencies

### Backend:
```bash
npm install nodemailer google-auth-library
```

### Frontend:
```bash
npm install @react-oauth/google
```

---

## ⚡ Quick Start

1. Install dependencies (đã chạy rồi)
2. Configure `.env` files với Google Client ID và Gmail credentials
3. Restart server:
```bash
cd server
npm start
```

4. Restart frontend:
```bash
cd frontend
npm run dev
```

---

## 🎨 Features Overview

### Google OAuth:
- ✅ One-click sign in/sign up
- ✅ Auto profile picture from Google
- ✅ Email verification
- ✅ Welcome email on first signup

### Forgot Password:
- ✅ 3-step process (Email → OTP → New Password)
- ✅ OTP expires in 10 minutes
- ✅ Professional email template
- ✅ Resend OTP functionality
- ✅ Password validation

### Blog Filters:
- ✅ Sort by: Latest, Most Liked, Most Commented
- ✅ Date range filter
- ✅ Multi-tag selection
- ✅ Results count display

---

## 🐛 Troubleshooting

### Google OAuth không hoạt động:
- Kiểm tra GOOGLE_CLIENT_ID đúng ở cả frontend và backend
- Kiểm tra authorized origins/redirects trong Google Console
- Clear browser cache và cookies

### Email không gửi được:
- Kiểm tra đã bật 2-Step Verification
- Kiểm tra app password chính xác (16 digits, no spaces)
- Check email có đúng định dạng không
- Xem server logs để debug

### OTP expired:
- OTP chỉ valid trong 10 phút
- Request OTP mới bằng "Resend OTP"

---

## 📸 Screenshots

Các màn hình mới:
1. Login với Google button
2. Forgot Password flow (3 steps)
3. OTP email template
4. Blog filters (Sort + Date range)

---

Enjoy! 🎉
