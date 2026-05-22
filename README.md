# VoiceFlow AI

VoiceFlow AI is a web application that generates realistic speech from text using Google Text-to-Speech (gTTS). It features a Python (FastAPI) backend and a React (Vite + Tailwind CSS) frontend.

---

## Prerequisite Tools

Ensure you have the following installed on your machine:
1. **Python** (version 3.8 or higher)
2. **Node.js** (version 18 or higher) and **npm**

---

## How to Run the Project

Follow these steps to run both the backend and frontend components.

### 1. Run the Backend

The backend is built with FastAPI. It handles user authentication, database management, and Text-to-Speech generation.

1. Open your terminal and navigate to the `voiceflow-backend` directory:
   ```powershell
   cd voiceflow-backend
   ```
2. Start the backend by running the pre-configured batch script:
   ```powershell
   .\start.bat
   ```
   *Note: This script will automatically create a virtual environment (`venv`), activate it, install the necessary dependencies from `requirements.txt`, and start the FastAPI server.*

3. Once started, the backend will be available at **`http://localhost:8080`**.
   - You can access the interactive API docs at **`http://localhost:8080/docs`**.

---

### 2. Run the Frontend

The frontend is a React application built with Vite and Tailwind CSS.

1. Open a **new terminal window/tab** (so the backend continues running).
2. Navigate to the `voiceflow-frontend` directory:
   ```powershell
   cd voiceflow-frontend
   ```
3. Install the frontend dependencies:
   ```powershell
   npm install
   ```
4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
5. Once started, open the local address shown in the terminal output (typically **`http://localhost:5173`**) in your web browser.
