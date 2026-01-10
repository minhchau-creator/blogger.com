@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 GitHub Upload Helper
echo ========================================
echo.
echo ⚠️  QUAN TRỌNG: Kiểm tra bảo mật trước khi upload
echo.
echo 1. Đảm bảo file .env KHÔNG tồn tại (chỉ .env.example)
echo 2. Kiểm tra .gitignore đã đúng
echo 3. Review code không có hardcoded secrets
echo.
echo ========================================
echo 📋 Các bước thực hiện:
echo ========================================
echo.
echo Bước 1: Tạo repository mới trên GitHub
echo        https://github.com/new
echo.
echo Bước 2: Khởi tạo Git (nếu chưa có)
echo        git init
echo.
echo Bước 3: Kiểm tra files sẽ được commit
echo        git status
echo.
echo Bước 4: Thêm tất cả files (trừ những gì trong .gitignore)
echo        git add .
echo.
echo Bước 5: Commit với message mô tả
echo        git commit -m "Initial commit: MERN blogging website"
echo.
echo Bước 6: Thêm remote repository (thay YOUR_USERNAME bằng tên GitHub của bạn)
echo        git remote add origin https://github.com/YOUR_USERNAME/mern-blogging-website.git
echo.
echo Bước 7: Push code lên GitHub
echo        git branch -M main
echo        git push -u origin main
echo.
echo ========================================
echo 🔍 Kiểm tra cuối cùng:
echo ========================================
echo.
echo Trước khi push, chạy lệnh này để đảm bảo .env không được track:
echo        git ls-files ^| findstr .env
echo.
echo Nếu thấy file .env, ĐỪNG PUSH! Xóa khỏi staging:
echo        git rm --cached .env
echo        git commit -m "Remove .env from tracking"
echo.
echo ========================================
pause
