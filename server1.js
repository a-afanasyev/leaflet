const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Route for admin page
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// PostgreSQL connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "smart_building_monitoring",
    password: "postgres",
    port: 5432,
});

// Get all buildings
app.get("/api/buildings", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM buildings ORDER BY building_id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching buildings:", err);
        res.status(500).send("Database error");
    }
});

// Add a new building
app.post("/api/buildings", async (req, res) => {
    const { name, latitude, longitude } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO buildings (name, latitude, longitude) VALUES ($1, $2, $3) RETURNING *",
            [name, latitude, longitude]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error adding building:", err);
        res.status(500).send("Database error");
    }
});

// Update a building
app.put("/api/buildings/:id", async (req, res) => {
    const { id } = req.params;
    const { name, latitude, longitude } = req.body;

    try {
        const result = await pool.query(
            "UPDATE buildings SET name=$1, latitude=$2, longitude=$3 WHERE building_id=$4 RETURNING *",
            [name, latitude, longitude, id]
        );

        if (result.rowCount === 0) {
            res.status(404).send("Building not found");
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Error updating building:", err);
        res.status(500).send("Database error");
    }
});

// Delete a building
app.delete("/api/buildings/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM buildings WHERE building_id=$1", [id]);

        if (result.rowCount === 0) {
            res.status(404).send("Building not found");
        } else {
            res.send("Building deleted successfully");
        }
    } catch (err) {
        console.error("Error deleting building:", err);
        res.status(500).send("Database error");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
