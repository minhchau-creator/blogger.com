# 🔧 Google OAuth Troubleshooting Guide

## Các lỗi thường gặp và cách fix:

### 1. "Authentication failed" / "Google Sign In Failed"

**Nguyên nhân:**
- Client ID không đúng hoặc không khớp giữa frontend/backend
- Authorized origins chưa được setup trong Google Console
- Token verification failed

**Cách fix:**

#### Bước 1: Kiểm tra Client ID
```bash
# Chạy test script
cd server
node test-google-auth.js
```

Đảm bảo:
- ✅ Client ID giống nhau ở `frontend/.env` và `server/.env`
- ✅ Client ID có format: `xxxxx.apps.googleusercontent.com`

#### Bước 2: Kiểm tra Google Cloud Console
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. Kiểm tra **Authorized JavaScript origins** phải có:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
6. Kiểm tra **Authorized redirect URIs** (optional):
   ```
   http://localhost:5173
   ```

#### Bước 3: Clear Cache và Test
1. Clear browser cache và cookies
2. Restart server: `npm start`
3. Restart frontend: `npm run dev`
4. Thử sign in lại

---

### 2. "This email was signed up without google"

**Nguyên nhân:**
- Email đã được dùng để đăng ký bằng email/password thông thường

**Cách fix:**
- Dùng email khác để test Google OAuth
- Hoặc sign in bằng email/password cho account đó

---

### 3. "Google account is not verified"

**Nguyên nhân:**
- Google account chưa verify email

**Cách fix:**
- Verify email trong Google account
- Dùng Google account khác đã verified

---

### 4. Button "Sign in with Google" không hiện

**Nguyên nhân:**
- Thiếu VITE_GOOGLE_CLIENT_ID trong frontend/.env
- Google OAuth library chưa load

**Cách fix:**

1. Kiểm tra `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

2. Restart frontend dev server (quan trọng!):
```bash
# Stop server (Ctrl+C)
npm run dev
```

3. Check browser console xem có lỗi gì

---

### 5. CORS Error

**Nguyên nhân:**
- Frontend và backend không cùng origin
- CORS chưa được config

**Cách fix:**

Server đã có CORS, nhưng nếu vẫn lỗi:
```javascript
// server.js - đã có rồi
import cors from 'cors';
server.use(cors());
```

---

## 🎯 Debug Step-by-Step

### Frontend Debug:

1. Mở browser console (F12)
2. Click "Sign in with Google"
3. Xem logs:
```
Google credential received: {...}
```

4. Nếu không thấy log → Google button setup sai
5. Nếu có log nhưng lỗi → Xem error message

### Backend Debug:

1. Check server terminal khi click Google button
2. Logs sẽ hiện:
```
Received Google auth request
Client ID from env: xxxxx
Google auth successful for email: xxx
```

3. Nếu không có log → Request không đến server
4. Nếu có lỗi → Đọc error message chi tiết

---

## ✅ Verification Checklist

Trước khi test, đảm bảo:

- [ ] ✅ Google Client ID đã tạo trong Google Cloud Console
- [ ] ✅ Authorized JavaScript origins: `http://localhost:5173`, `http://localhost:3000`
- [ ] ✅ Client ID trong `frontend/.env` khớp với `server/.env`
- [ ] ✅ Server đã restart sau khi thay đổi .env
- [ ] ✅ Frontend đã restart sau khi thay đổi .env
- [ ] ✅ Browser cache đã clear
- [ ] ✅ MongoDB đang chạy
- [ ] ✅ Không bị block bởi firewall/antivirus

---

## 🔍 Advanced Debugging

### Test Token Verification:

1. Click Google button
2. Copy credential từ console
3. Test verify:

```bash
# Create test file
node
```

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('your-client-id');

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: 'your-client-id'
  });
  console.log(ticket.getPayload());
}

verify('paste-token-here');
```

---

## 📞 Still Having Issues?

### Common Mistakes:

1. **Forgot to restart server** sau khi sửa .env
2. **Wrong Client ID** - copy/paste lỗi
3. **Test account chưa verify email**
4. **Authorized origins thiếu http:// prefix**

### How to Get Help:

1. Check browser console errors
2. Check server terminal logs
3. Screenshot error messages
4. Verify steps trong checklist

### Emergency Reset:

1. Xóa old Client ID trong Google Console
2. Tạo mới Client ID
3. Update cả 2 .env files
4. Restart everything
5. Clear browser cache

---

## 📊 Test Results:

Run this after setup:

```bash
cd server
node test-google-auth.js
```

Expected output:
```
✓ GOOGLE_CLIENT_ID: Set
✓ OAuth2Client: Initialized
```

Then test in browser:
1. Go to `/signin`
2. Click Google button
3. Should redirect and login successfully

---

Good luck! 🚀
