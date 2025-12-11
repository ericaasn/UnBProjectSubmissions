const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos da pasta uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/", routes);

const PORT = process.env.PORT || 3001;

db.getConnection((err, conn) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
    process.exit(1);
  } else {
    console.log("MySQL conectado com sucesso!");
    if (conn) conn.release();
    app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));
  }
});