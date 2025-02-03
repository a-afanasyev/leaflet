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

// Получение всех метрик
// Get all buildings and their controllers
app.get("/api/metrics", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.building_id,
                b.name AS building_name,
                b.latitude,
                b.longitude,
                c.controller_id,
                m.electricity_ph1, 
                m.electricity_ph2, 
                m.electricity_ph3, 
                m.amperage_ph1, 
                m.amperage_ph2, 
                m.amperage_ph3, 
                m.cold_water_pressure, 
                m.hot_water_in_pressure, 
                m.hot_water_out_pressure, 
                m.hot_water_in_temp, 
                m.hot_water_out_temp, 
                m.leak_sensor, 
                m.air_temp, 
                m.humidity
            FROM buildings b
            LEFT JOIN controllers c ON b.building_id = c.building_id
            LEFT JOIN metrics m ON c.controller_id = m.controller_id;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching buildings:", err);
        res.status(500).send("Database error");
    }
});



// Get all buildings
app.get("/api/buildings", async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
        const result = await pool.query(
            "SELECT * FROM buildings ORDER BY building_id ASC LIMIT $1 OFFSET $2",
            [limit, offset]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching buildings:", err);
        res.status(500).send("Database error");
    }
});


app.get("/api/controllers", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM controllers ORDER BY serial_number ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching contollers:", err);
        res.status(500).send("Database error");
    }
});

// Add a new building
app.post("/api/buildings", async (req, res) => {
    const { name, address, town, latitude, longitude, management_company } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO buildings (name, address, town, latitude, longitude, management_company) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, address, town, latitude, longitude, management_company]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting building:", err);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/api/controllers", async (req, res) => {
    const { serial_number, vendor, model, building_id, status } = req.body;

    if (!serial_number || !building_id || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO controllers (serial_number, vendor, model, building_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [serial_number, vendor, model, building_id, status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting controller:", err);
        res.status(500).json({ error: "Database error" });
    }
});

app.put("/api/controllers/:id", async (req, res) => {
    const { id } = req.params;
    const { serial_number, vendor, model, building_id, status } = req.body;

    try {
        const result = await pool.query(
            "UPDATE controllers SET serial_number=$1, vendor=$2, model=$3, building_id=$4, status=$5 WHERE controller_id=$6 RETURNING *",
            [serial_number, vendor, model, building_id, status, id]
        );

        if (result.rowCount === 0) {
            res.status(404).send("Controller not found");
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Error updating controller:", err);
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
        // Check if controllers exist before deleting
        const controllerCheck = await pool.query("SELECT * FROM controllers WHERE building_id=$1", [id]);
        if (controllerCheck.rowCount > 0) {
            return res.status(400).send("Cannot delete building, assigned controllers exist.");
        }

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
