const express = require("express");
const mysql = require("mysql2"); // MySQL client
const cors = require("cors"); // To enable cross-origin requests
const app = express();

app.use(express.json()); // To parse JSON requests
app.use(cors()); // Enable CORS to allow frontend communication

// API endpoint to test DB connection
app.post("/test-connection", (req, res) => {
  const { host, port, username, password, database } = req.body;

  const connection = mysql.createConnection({
    host,
    port,
    user: username,
    password,
    database,
  });

  connection.connect((err) => {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    res.send({ success: true });
    connection.end();
  });
});

// API endpoint to fetch schema (tables)
app.get("/get-schema", (req, res) => {
  const { host, port, username, password, database } = req.query;

  const connection = mysql.createConnection({
    host,
    port,
    user: username,
    password,
    database,
  });

  connection.connect((err) => {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
  });

  const query = "SHOW TABLES"; // MySQL query to fetch tables
  connection.query(query, (error, results) => {
    if (error) {
      return res.send({ success: false, message: error.message });
    }
    const tables = results.map((row) => Object.values(row)[0]);
    res.send({ success: true, tables });
    connection.end();
  });
});

// Start server on port 8000
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
