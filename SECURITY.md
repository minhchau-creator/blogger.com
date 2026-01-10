# 🔒 Security Guidelines

## Thông tin quan trọng về bảo mật

### ⚠️ KHÔNG BAO GIỜ COMMIT CÁC FILE SAU:

1. **File môi trường (.env)**
   - `.env`
   - `.env.local`
   - `.env.production`
   - Bất kỳ file nào chứa API keys, passwords, secrets

2. **File cấu hình nhạy cảm**
   - Các file chứa database credentials
   - Firebase configuration với API keys thật
   - AWS credentials
   - OAuth client secrets

3. **User uploads**
   - `server/uploads/` - Chứa file do người dùng tải lên
   - `uploads/` - Folder chứa ảnh người dùng

### ✅ Checklist trước khi commit:

- [ ] Đã kiểm tra không có file `.env` trong staging area
- [ ] Đã dùng `.env.example` thay vì file `.env` thật
- [ ] Đã kiểm tra `git status` để đảm bảo không có file nhạy cảm
- [ ] Đã review code để đảm bảo không hardcode API keys
- [ ] File `.gitignore` đã được cập nhật đúng

### 📝 Cách setup môi trường:

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Điền thông tin thật vào file `.env` (file này sẽ KHÔNG được commit)

3. Với frontend, tạo file `.env` trong folder `frontend/` hoặc `mern-blogging-website/frontend/`

### 🔍 Kiểm tra trước khi push:

```bash
# Xem những file sẽ được commit
git status

# Xem chi tiết thay đổi
git diff

# Đảm bảo .env không trong danh sách
git ls-files | grep .env
```

Nếu thấy file `.env`, ĐỪNG commit! Kiểm tra lại `.gitignore`.

### 🚨 Nếu đã vô tình commit secrets:

1. **KHÔNG** chỉ xóa file và commit lại - lịch sử vẫn chứa secrets
2. Phải thay đổi TẤT CẢ các API keys, passwords đã bị lộ
3. Xem xét dùng `git filter-branch` hoặc BFG Repo-Cleaner để xóa khỏi lịch sử
4. Force push (cẩn thận nếu làm việc nhóm)

### 📚 Tài nguyên:

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Git Secrets Prevention](https://github.com/awslabs/git-secrets)
