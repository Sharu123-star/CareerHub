const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


// =====================================================
// SERVE FRONTEND
// =====================================================

app.use(express.static(path.join(__dirname, "../Frontend")));


// =====================================================
// MySQL CONNECTION
// =====================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "careerhub",
    port: process.env.DB_PORT
        ? Number(process.env.DB_PORT)
        : 3306
});


// Connect to MySQL
db.connect((err) => {

    if (err) {
        console.log("MySQL connection failed:", err);
    } else {
        console.log("MySQL connected successfully!");
    }

});


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../Frontend/index.html")
    );

});


// =====================================================
// REGISTER
// =====================================================

app.post("/api/register", (req, res) => {

    const { name, email, password, college } = req.body;

    if (!name || !email || !password || !college) {

        return res.status(400).json({
            message: "All fields are required"
        });

    }

    const sql = `
        INSERT INTO users
        (name, email, password, college)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password, college],
        (err, result) => {

            if (err) {

                console.log("Database error:", err);

                return res.status(500).json({
                    message: "Registration failed"
                });

            }

            res.json({
                message: "Account created successfully!"
            });

        }
    );

});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT id, name, email, college
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.log("Login database error:", err);

                return res.status(500).json({
                    message: "Login failed"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }

            res.json({
                message: "Login successful!",
                user: results[0]
            });

        }
    );

});


// =====================================================
// FORGOT PASSWORD / RESET PASSWORD
// =====================================================

app.put("/api/forgot-password", (req, res) => {

    const {
        email,
        newPassword
    } = req.body;

    if (!email || !newPassword) {

        return res.status(400).json({
            message: "Email and new password are required"
        });

    }

    const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
    `;

    db.query(
        checkSql,
        [email],
        (err, results) => {

            if (err) {

                console.log(
                    "Forgot password database error:",
                    err
                );

                return res.status(500).json({
                    message: "Database error"
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "No account found with this email"
                });

            }

            const updateSql = `
                UPDATE users
                SET password = ?
                WHERE email = ?
            `;

            db.query(
                updateSql,
                [newPassword, email],
                (err, result) => {

                    if (err) {

                        console.log(
                            "Password update error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to reset password"
                        });

                    }

                    res.json({
                        message:
                            "Password reset successfully!"
                    });

                }
            );

        }
    );

});


// =====================================================
// ADD SKILL
// =====================================================

app.post("/api/skills", (req, res) => {

    const { user_id, skill_name } = req.body;

    if (!user_id || !skill_name) {

        return res.status(400).json({
            message: "User ID and skill name are required"
        });

    }

    const sql = `
        INSERT INTO skills
        (user_id, skill_name)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [user_id, skill_name],
        (err, result) => {

            if (err) {

                console.log("Skill database error:", err);

                return res.status(500).json({
                    message: "Failed to add skill"
                });

            }

            res.json({
                message: "Skill added successfully!",
                skill: {
                    id: result.insertId,
                    user_id: user_id,
                    skill_name: skill_name
                }
            });

        }
    );

});


// =====================================================
// GET USER SKILLS
// =====================================================

app.get("/api/skills/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT id, skill_name
        FROM skills
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.log("Skills database error:", err);

                return res.status(500).json({
                    message: "Failed to load skills"
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// DELETE SKILL
// =====================================================

app.delete("/api/skills/:id", (req, res) => {

    const skillId = req.params.id;

    const sql = `
        DELETE FROM skills
        WHERE id = ?
    `;

    db.query(
        sql,
        [skillId],
        (err, result) => {

            if (err) {

                console.log("Delete skill error:", err);

                return res.status(500).json({
                    message: "Failed to delete skill"
                });

            }

            res.json({
                message: "Skill deleted successfully!"
            });

        }
    );

});


// =====================================================
// ADD PROJECT
// =====================================================

app.post("/api/projects", (req, res) => {

    const {
        user_id,
        project_name,
        description,
        technologies,
        project_link
    } = req.body;

    if (!user_id || !project_name || !description || !technologies) {

        return res.status(400).json({
            message: "Please fill all required project details"
        });

    }

    const sql = `
        INSERT INTO projects
        (user_id, project_name, description, technologies, project_link)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            project_name,
            description,
            technologies,
            project_link
        ],
        (err, result) => {

            if (err) {

                console.log("Project database error:", err);

                return res.status(500).json({
                    message: "Failed to add project"
                });

            }

            res.json({
                message: "Project added successfully!",
                project: {
                    id: result.insertId,
                    user_id: user_id,
                    project_name: project_name,
                    description: description,
                    technologies: technologies,
                    project_link: project_link
                }
            });

        }
    );

});


// =====================================================
// GET USER PROJECTS
// =====================================================

app.get("/api/projects/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            id,
            project_name,
            description,
            technologies,
            project_link
        FROM projects
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.log("Projects database error:", err);

                return res.status(500).json({
                    message: "Failed to load projects"
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// DELETE PROJECT
// =====================================================

app.delete("/api/projects/:id", (req, res) => {

    const projectId = req.params.id;

    const sql = `
        DELETE FROM projects
        WHERE id = ?
    `;

    db.query(
        sql,
        [projectId],
        (err, result) => {

            if (err) {

                console.log("Delete project error:", err);

                return res.status(500).json({
                    message: "Failed to delete project"
                });

            }

            res.json({
                message: "Project deleted successfully!"
            });

        }
    );

});


// =====================================================
// ADD CERTIFICATION
// =====================================================

app.post("/api/certifications", (req, res) => {

    const {
        user_id,
        certificate_name,
        organization,
        issue_date,
        certificate_link
    } = req.body;

    if (!user_id || !certificate_name || !organization) {

        return res.status(400).json({
            message: "Please fill all required certification details"
        });

    }

    const sql = `
        INSERT INTO certifications
        (
            user_id,
            certificate_name,
            organization,
            issue_date,
            certificate_link
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            certificate_name,
            organization,
            issue_date || null,
            certificate_link || null
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "Certification database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to add certification"
                });

            }

            res.json({
                message: "Certification added successfully!",
                certification: {
                    id: result.insertId,
                    user_id: user_id,
                    certificate_name: certificate_name,
                    organization: organization,
                    issue_date: issue_date,
                    certificate_link: certificate_link
                }
            });

        }
    );

});


// =====================================================
// GET USER CERTIFICATIONS
// =====================================================

app.get("/api/certifications/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            id,
            certificate_name,
            organization,
            issue_date,
            certificate_link
        FROM certifications
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.log(
                    "Certifications database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to load certifications"
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// DELETE CERTIFICATION
// =====================================================

app.delete("/api/certifications/:id", (req, res) => {

    const certificationId = req.params.id;

    const sql = `
        DELETE FROM certifications
        WHERE id = ?
    `;

    db.query(
        sql,
        [certificationId],
        (err, result) => {

            if (err) {

                console.log(
                    "Delete certification error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to delete certification"
                });

            }

            res.json({
                message: "Certification deleted successfully!"
            });

        }
    );

});


// =====================================================
// GET ALL INTERNSHIPS
// =====================================================

app.get("/api/internships", (req, res) => {

    const sql = `
        SELECT
            id,
            company_name,
            internship_title,
            description,
            required_skills,
            location,
            application_link
        FROM internships
        ORDER BY id DESC
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "Internships database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to load internships"
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// APPLY FOR INTERNSHIP
// =====================================================

app.post("/api/applications", (req, res) => {

    const { user_id, internship_id } = req.body;

    if (!user_id || !internship_id) {

        return res.status(400).json({
            message: "User ID and Internship ID are required"
        });

    }

    const checkSql = `
        SELECT id
        FROM applications
        WHERE user_id = ? AND internship_id = ?
    `;

    db.query(
        checkSql,
        [user_id, internship_id],
        (err, results) => {

            if (err) {

                console.log("Application check error:", err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            if (results.length > 0) {

                return res.status(400).json({
                    message: "You have already applied for this internship."
                });

            }

            const insertSql = `
                INSERT INTO applications
                (user_id, internship_id, status)
                VALUES (?, ?, 'Applied')
            `;

            db.query(
                insertSql,
                [user_id, internship_id],
                (err, result) => {

                    if (err) {

                        console.log(
                            "Application database error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to apply"
                        });

                    }

                    res.json({
                        message: "Application submitted successfully!"
                    });

                }
            );

        }
    );

});


// =====================================================
// GET USER APPLICATIONS
// =====================================================

app.get("/api/applications/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            applications.id,
            applications.internship_id,
            applications.status,
            applications.applied_date,
            internships.company_name,
            internships.internship_title,
            internships.location,
            internships.application_link
        FROM applications
        INNER JOIN internships
            ON applications.internship_id = internships.id
        WHERE applications.user_id = ?
        ORDER BY applications.id DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.log(
                    "Applications database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to load applications"
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

app.put("/api/applications/:id", (req, res) => {

    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
        "Applied",
        "Interview",
        "Selected",
        "Rejected"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message: "Invalid application status"
        });

    }

    const sql = `
        UPDATE applications
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, applicationId],
        (err, result) => {

            if (err) {

                console.log(
                    "Status update error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to update status"
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Application not found"
                });

            }

            res.json({
                message: "Application status updated!"
            });

        }
    );

});


// =====================================================
// DELETE APPLICATION
// =====================================================

app.delete("/api/applications/:id", (req, res) => {

    const applicationId = req.params.id;

    const sql = `
        DELETE FROM applications
        WHERE id = ?
    `;

    db.query(
        sql,
        [applicationId],
        (err, result) => {

            if (err) {

                console.log(
                    "Delete application error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to delete application"
                });

            }

            res.json({
                message: "Application deleted successfully!"
            });

        }
    );

});


// =====================================================
// ADMIN - GET ALL APPLICATIONS
// =====================================================

app.get("/api/admin/applications", (req, res) => {

    const sql = `
        SELECT
            applications.id,
            applications.user_id,
            applications.internship_id,
            applications.status,
            applications.applied_date,

            users.name AS student_name,
            users.email AS student_email,

            internships.company_name,
            internships.internship_title,
            internships.location

        FROM applications

        INNER JOIN users
            ON applications.user_id = users.id

        INNER JOIN internships
            ON applications.internship_id = internships.id

        ORDER BY applications.id DESC
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "Admin applications error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to load applications"
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// ADMIN - UPDATE APPLICATION STATUS
// =====================================================

app.put("/api/admin/applications/:id", (req, res) => {

    const applicationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
        "Applied",
        "Interview",
        "Selected",
        "Rejected"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message: "Invalid application status"
        });

    }

    const sql = `
        UPDATE applications
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, applicationId],
        (err, result) => {

            if (err) {

                console.log(
                    "Update application error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to update application status"
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Application not found"
                });

            }

            res.json({
                message: "Application status updated successfully!"
            });

        }
    );

});


// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT id, name, email
        FROM admins
        WHERE email = ? AND password = ?
    `;

    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.log(
                    "Admin login error:",
                    err
                );

                return res.status(500).json({
                    message: "Admin login failed"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    message: "Invalid admin email or password"
                });

            }

            res.json({
                message: "Admin login successful!",
                admin: results[0]
            });

        }
    );

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});