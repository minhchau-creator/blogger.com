@echo off
echo ================================
echo Starting MERN Blogging Application...
echo ================================
echo.

echo Starting Backend Server...
cd mern-blogging-website\server
start "Backend Server" cmd /k npm start

timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
cd ..\frontend
start "Frontend Server" cmd /k npm run dev

echo.
echo ================================
echo Both servers are running!
echo Backend Server: Check the Backend Server window
echo Frontend Server: Check the Frontend Server window
echo ================================
echo.
echo Close the terminal windows to stop the servers
pause
