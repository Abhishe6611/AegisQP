# AegisQP Server Startup Guide

To run the project locally on your machine, you need to start both the backend (FastAPI) and the frontend (Next.js) servers in separate terminal windows.

## 1. Start the Backend Server
The virtual environment containing `uvicorn` and the necessary Python packages is located in the parent folder's `.venv` directory.

1. Open a terminal (PowerShell).
2. Navigate to the backend directory:
   ```powershell
   cd C:\Users\Harsha\Downloads\AegisQP-main\AegisQP-main\backend
   ```
3. Run the following command to start FastAPI using the correct parent virtual environment:
   ```powershell
   ..\..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
   ```
   *(The server will start at `http://127.0.0.1:8000`)*

## 2. Start the Frontend Server
The frontend is a standard Next.js application.

1. Open a **new, separate** terminal window.
2. Navigate to the frontend directory:
   ```powershell
   cd C:\Users\Harsha\Downloads\AegisQP-main\AegisQP-main\frontend
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
   *(The app will be accessible at `http://localhost:3000`)*

---

### Troubleshooting
- **Port 3000 in use:** If the frontend complains that port 3000 is in use, you can kill the zombie process by running `taskkill /PID <Process_ID> /F` (replace `<Process_ID>` with the PID shown in the error message).
- **ModuleNotFoundError (Backend):** If you try running `.\venv\Scripts\uvicorn` and get an error, it is because that specific nested `venv` is broken. Always use the parent environment: `..\..\.venv\Scripts\python.exe` as shown in step 1.
