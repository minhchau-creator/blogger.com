# 📤 Hướng dẫn Upload Code lên GitHub

## 🔐 Bảo mật là ưu tiên hàng đầu!

Trước khi upload, hãy đọc kỹ file [SECURITY.md](SECURITY.md) để đảm bảo không commit thông tin nhạy cảm.

## 📋 Các bước thực hiện

### Bước 1: Chuẩn bị Repository trên GitHub

1. Đăng nhập vào GitHub
2. Tạo repository mới tại: https://github.com/new
3. Đặt tên repository (ví dụ: `mern-blogging-website`)
4. **KHÔNG** chọn "Initialize with README" (vì đã có sẵn trong project)
5. Click **Create repository**

### Bước 2: Kiểm tra bảo mật

```bash
# Đảm bảo không có file .env trong project
dir /s /b .env

# Nếu có file .env, đảm bảo nó trong .gitignore
type .gitignore | findstr .env
```

✅ **Checklist quan trọng:**
- [ ] File `.env` KHÔNG tồn tại (chỉ có `.env.example`)
- [ ] File `.gitignore` đã được cập nhật
- [ ] Đã review code không có API keys hardcoded
- [ ] Folder `uploads/` và `node_modules/` được ignore

### Bước 3: Khởi tạo Git (nếu chưa có)

```bash
# Di chuyển vào thư mục project
cd d:\Base_Blogging

# Khởi tạo git repository
git init

# Kiểm tra branch hiện tại (nên là main hoặc master)
git branch
```

### Bước 4: Thêm files vào Git

```bash
# Xem danh sách files sẽ được thêm
git status

# Thêm tất cả files (trừ những gì trong .gitignore)
git add .

# Xem lại files đã được staged
git status

# ⚠️ KIỂM TRA QUAN TRỌNG: Đảm bảo .env KHÔNG trong danh sách
```

### Bước 5: Commit changes

```bash
# Commit với message mô tả rõ ràng
git commit -m "Initial commit: MERN blogging website với đầy đủ tính năng"

# Hoặc commit với message chi tiết hơn
git commit -m "Initial commit: MERN blogging website

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + MongoDB
- Tính năng: Blog editor, Comments, Notifications
- Auth: JWT + Google OAuth
- Image upload ready
- Password reset with OTP"
```

### Bước 6: Kết nối với GitHub Repository

Thay `YOUR_USERNAME` bằng username GitHub của bạn:

```bash
# Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/mern-blogging-website.git

# Kiểm tra remote đã được thêm
git remote -v

# Đổi tên branch thành main (nếu đang dùng master)
git branch -M main
```

### Bước 7: Push code lên GitHub

```bash
# Push lần đầu
git push -u origin main

# Nhập username và password/token khi được yêu cầu
```

**Lưu ý về authentication:**
- GitHub không còn chấp nhận password thông thường
- Bạn cần tạo **Personal Access Token (PAT)**:
  1. Vào Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token
  3. Chọn quyền: `repo` (Full control of private repositories)
  4. Dùng token này thay cho password

### Bước 8: Kiểm tra trên GitHub

1. Vào repository trên GitHub
2. Kiểm tra:
   - [ ] Code đã được upload đầy đủ
   - [ ] File `.env` KHÔNG có trong repository
   - [ ] Chỉ có file `.env.example`
   - [ ] README.md hiển thị đúng

## 🔄 Cập nhật code sau này

```bash
# Kiểm tra thay đổi
git status

# Thêm files đã thay đổi
git add .

# Hoặc thêm từng file cụ thể
git add path/to/file.js

# Commit với message mô tả
git commit -m "Add new feature: xyz"

# Push lên GitHub
git push
```

## 🆘 Xử lý sự cố

### Lỗi: remote origin already exists

```bash
# Xóa remote cũ
git remote remove origin

# Thêm lại remote mới
git remote add origin https://github.com/YOUR_USERNAME/mern-blogging-website.git
```

### Đã vô tình commit file .env

```bash
# NGỪNG NGAY! Không push

# Xóa file khỏi staging (giữ file local)
git rm --cached .env
git rm --cached server/.env
git rm --cached frontend/.env

# Thêm vào .gitignore nếu chưa có
echo .env >> .gitignore

# Commit lại
git commit -m "Remove .env files from tracking"

# ⚠️ Nếu đã push: BẮT BUỘC phải thay đổi TẤT CẢ API keys và passwords!
```

### File không được ignore đúng cách

```bash
# Xóa cache của git (không xóa file thật)
git rm -r --cached .

# Thêm lại tất cả files (sẽ respect .gitignore)
git add .

# Commit
git commit -m "Fix .gitignore"
```

## 📚 Tài liệu tham khảo

- [GitHub Docs](https://docs.github.com)
- [Git Basics](https://git-scm.com/book/en/v2)
- [Protecting Sensitive Data](https://docs.github.com/en/code-security/getting-started/best-practices-for-preventing-data-leaks)

## 💡 Tips

1. **Commit thường xuyên** với messages có ý nghĩa
2. **Review code trước khi commit**: `git diff`
3. **Tạo branches** cho features mới: `git checkout -b feature-name`
4. **Không commit file lớn** (>100MB) - dùng Git LFS nếu cần
5. **Backup quan trọng** trước khi force push

---

✅ **Hoàn thành!** Code của bạn đã an toàn trên GitHub!
