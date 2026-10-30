
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken, requireAdmin } = require("./auth");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==================== HOME ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Grama Seva API is running",
  });
});

// ==================== DATABASE HEALTH ====================
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("Database health error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ==================== ADMIN LOGIN ====================
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [admins] = await db.execute(
      "SELECT id, email, password FROM admins WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    if (!admins.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(
      password,
      admin.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is missing from backend/.env");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
        source: "admins",
      },
      secret,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      message: "Admin login failed.",
    });
  }
});

// ==================== CITIZEN REGISTRATION ====================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users
       (full_name, email, phone, password, role)
       VALUES (?, ?, ?, ?, 'citizen')`,
      [
        name.trim(),
        normalizedEmail,
        phone.trim(),
        hashedPassword,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: result.insertId,
        full_name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: "citizen",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
});

// ==================== USER LOGIN ====================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await db.execute(
      `SELECT id, full_name, email, phone, password, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        source: "users",
      },
      secret,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

// ==================== VERIFY LOGIN ====================
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    if (req.user.source === "admins") {
      const [admins] = await db.execute(
        "SELECT id, email FROM admins WHERE id = ? LIMIT 1",
        [req.user.id]
      );

      if (!admins.length) {
        return res.status(401).json({
          success: false,
          message: "Admin account not found.",
        });
      }

      return res.json({
        success: true,
        user: {
          ...admins[0],
          role: "admin",
        },
      });
    }

    const [users] = await db.execute(
      `SELECT id, full_name, email, phone, role
       FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Account not found.",
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Account check error:", error);

    res.status(500).json({
      success: false,
      message: "Could not verify account.",
    });
  }
});

// ==================== GET COMPLAINTS ====================
app.get("/api/complaints", async (req, res) => {
  try {
    const [complaints] = await db.execute(
      `SELECT
         id,
         complaint_number,
         title,
         category,
         village,
         status,
         priority,
         created_at
       FROM complaints
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch complaints.",
    });
  }
});

// ==================== SUBMIT COMPLAINT ====================
app.post("/api/complaints", async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      category,
      village,
      location,
    } = req.body;

    if (
      !user_id ||
      !title ||
      !description ||
      !category ||
      !village
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required complaint details.",
      });
    }

    const complaintNumber = `GS${Date.now()}`;

    const [result] = await db.execute(
      `INSERT INTO complaints
       (user_id, complaint_number, title, description,
        category, village, location, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Medium')`,
      [
        user_id,
        complaintNumber,
        title,
        description,
        category,
        village,
        location || "",
        "Submitted",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      id: result.insertId,
      complaint_number: complaintNumber,
      status: "Submitted",
      priority: "Medium",
    });
  } catch (error) {
    console.error("Submit complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Could not submit complaint.",
    });
  }
});

// ==================== ADMIN: UPDATE COMPLAINT STATUS ====================
app.put(
  "/api/complaints/:complaintNumber/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { complaintNumber } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Submitted",
        "In Progress",
        "Resolved",
        "Rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint status.",
        });
      }

      const [result] = await db.execute(
        `UPDATE complaints
         SET status = ?
         WHERE complaint_number = ?`,
        [status, complaintNumber]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found.",
        });
      }

      res.json({
        success: true,
        message: "Complaint status updated successfully.",
        complaint_number: complaintNumber,
        status,
      });
    } catch (error) {
      console.error("Status update error:", error);

      res.status(500).json({
        success: false,
        message: "Could not update complaint status.",
      });
    }
  }
);

// ==================== ADMIN: GET PRIORITY PROBLEMS ====================
app.get(
  "/api/admin/priority-problems",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [complaints] = await db.execute(`
        SELECT
          id,
          complaint_number,
          title,
          description,
          category,
          village,
          location,
          status,
          priority,
          created_at
        FROM complaints
        ORDER BY
          FIELD(priority, 'Critical', 'High', 'Medium', 'Low'),
          CASE
            WHEN status IN ('Resolved', 'Rejected') THEN 1
            ELSE 0
          END,
          created_at ASC
      `);

      res.json({
        success: true,
        count: complaints.length,
        complaints,
      });
    } catch (error) {
      console.error("Get priority problems error:", error);

      res.status(500).json({
        success: false,
        message: "Could not fetch priority problems.",
      });
    }
  }
);

// ==================== ADMIN: UPDATE COMPLAINT PRIORITY ====================
app.put(
  "/api/admin/priority-problems/:complaintNumber",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { complaintNumber } = req.params;
    const priority = req.body?.priority;

      const allowedPriorities = [
        "Critical",
        "High",
        "Medium",
        "Low",
      ];

      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid priority. Use Critical, High, Medium, or Low.",
        });
      }

      if (
        typeof complaintNumber !== "string" ||
        !/^[A-Za-z0-9_-]{1,64}$/.test(complaintNumber)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint number.",
        });
      }

      await db.execute(
        `UPDATE complaints
         SET priority = ?
         WHERE complaint_number = ?`,
        [priority, complaintNumber]
      );

      const [complaints] = await db.execute(
        `SELECT
           id,
           complaint_number,
           title,
           description,
           category,
           village,
           location,
           status,
           priority,
           created_at
         FROM complaints
         WHERE complaint_number = ?
         LIMIT 1`,
        [complaintNumber]
      );

      if (!complaints.length) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found.",
        });
      }

      res.json({
        success: true,
        message: "Complaint priority updated successfully.",
        complaint: complaints[0],
      });
    } catch (error) {
      console.error("Update priority error:", error);

      res.status(500).json({
        success: false,
        message: "Could not update complaint priority.",
      });
    }
  }
);

// ==================== ADMIN: GET PRIORITY STATISTICS ====================
app.get(
  "/api/admin/priority-stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT priority, COUNT(*) AS total
         FROM complaints
         GROUP BY priority`
      );
      const stats = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
      };

      for (const row of rows) {
        if (Object.hasOwn(stats, row.priority)) {
          stats[row.priority] = Number(row.total);
        }
      }

      res.json({ success: true, stats });
    } catch (error) {
      console.error("Get priority stats error:", error);

      res.status(500).json({
        success: false,
        message: "Could not fetch priority statistics.",
      });
    }
  }
);

// ==================== TRACK A COMPLAINT ====================
app.get("/api/complaints/:complaintNumber", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM complaints WHERE complaint_number = ?",
      [req.params.complaintNumber]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    res.json({
      success: true,
      complaint: rows[0],
    });
  } catch (error) {
    console.error("Track complaint error:", error);

    res.status(500).json({
      success: false,
      message: "Could not track complaint.",
    });
  }
});

// ==================== UNKNOWN API ROUTES ====================
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
    method: req.method,
    path: req.originalUrl,
  });
});

// ==================== UNKNOWN NON-API ROUTES ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
    method: req.method,
    path: req.originalUrl,
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(
    `Grama Seva backend running at http://localhost:${PORT}`
  );
});
