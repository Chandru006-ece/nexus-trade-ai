/**
 * NexusTrade AI – Backend API Server
 * Express server that bridges Python logic with the React frontend
 */

const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const PYTHON_DIR = path.join(__dirname, "..", "python");

/**
 * GET /optimize
 * Runs Python script and returns computed route data
 */
app.get("/optimize", (req, res) => {
  exec(
    "python main.py",
    { cwd: PYTHON_DIR },
    (error, stdout, stderr) => {
      if (error) {
        console.error("Python error:", stderr);
        return res.status(500).json({ error: stderr || error.message });
      }
      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          return res.status(400).json(result);
        }
        res.json(result);
      } catch (parseErr) {
        console.error("Parse error:", parseErr.message);
        res.status(500).json({ error: "Failed to parse Python output" });
      }
    }
  );
});

/**
 * GET /health – Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "NexusTrade AI Backend" });
});

app.listen(PORT, () => {
  console.log(`NexusTrade AI Backend running on http://localhost:${PORT}`);
});
