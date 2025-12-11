const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("✅ Controller carregado com sucesso!");

// Cria a pasta uploads se não existir (UMA VEZ SÓ)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  console.log(`📁 Criando pasta uploads: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log(`📁 Pasta uploads já existe: ${uploadDir}`);
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, uniqueSuffix + "-" + safeName);
  }
});

const upload = multer({ storage: storage }).single("file");

// Upload de arquivo
const uploadFile = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("❌ Erro no upload:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    const file = req.file;
    if (!file) {
      console.error("❌ Nenhum arquivo recebido");
      return res.status(400).json({ success: false, error: "Arquivo ausente" });
    }

    console.log(`📄 Arquivo recebido: ${file.originalname}`);
    
    // Pega o hash do frontend
    const hash = req.body.hash;
    
    if (!hash) {
      console.error("❌ Hash não fornecido");
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        success: false, 
        error: "Hash não fornecido" 
      });
    }

    console.log(`🔑 Hash recebido: ${hash}`);

    // PASSO 1: Verificar se já existe
    db.query("SELECT * FROM files WHERE hash = ?", [hash], (err, results) => {
      if (err) {
        console.error("❌ Erro ao verificar duplicata:", err);
        fs.unlinkSync(file.path);
        return res.status(500).json({ 
          success: false, 
          error: "Erro no banco de dados" 
        });
      }

      if (results.length > 0) {
        // Arquivo já existe
        console.log("♻️ Arquivo duplicado, removendo...");
        fs.unlinkSync(file.path);
        
        return res.json({
          success: true,
          message: "Arquivo já existente",
          hash: hash,
          duplicated: true
        });
      }

      // PASSO 2: Salvar novo arquivo
      const sql = "INSERT INTO files (filename, filepath, mimetype, size, hash) VALUES (?, ?, ?, ?, ?)";
      const values = [
        file.originalname,
        file.filename,
        file.mimetype,
        file.size,
        hash
      ];
      
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Erro ao salvar no banco:", err);
          fs.unlinkSync(file.path);
          return res.status(500).json({ 
            success: false, 
            error: "Erro ao salvar no banco" 
          });
        }

        console.log("✅ Arquivo salvo com ID:", result.insertId);
        
        res.json({
          success: true,
          message: "Upload realizado com sucesso!",
          hash: hash,
          filename: file.originalname,
          storedName: file.filename,
          downloadUrl: `/download/${hash}`,
          insertId: result.insertId
        });
      });
    });
  });
};

// Buscar arquivo pelo hash
const getFileByHash = (req, res) => {
  const { hash } = req.params;
  console.log(`🔍 Buscando arquivo com hash: ${hash}`);
  
  db.query("SELECT * FROM files WHERE hash = ?", [hash], (err, results) => {
    if (err) {
      console.error("Erro na busca:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }
    
    res.json(results[0]);
  });
};

// Download de arquivo pelo hash
const downloadFileByHash = (req, res) => {
  const { hash } = req.params;
  console.log(`⬇️  Download solicitado para hash: ${hash}`);
  
  db.query("SELECT * FROM files WHERE hash = ?", [hash], (err, results) => {
    if (err) {
      console.error("Erro no download:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    const file = results[0];
    const filePath = path.join(uploadDir, file.filepath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Arquivo físico não encontrado" });
    }

    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error("Erro ao enviar arquivo:", err);
      }
    });
  });
};

// Verificar se arquivo existe
const checkFileExists = (req, res) => {
  const { hash } = req.params;
  console.log(`🔎 Verificando existência do hash: ${hash}`);
  
  db.query("SELECT filename, filepath, mimetype, size FROM files WHERE hash = ?", [hash], (err, results) => {
    if (err) {
      console.error("Erro na verificação:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }
    
    if (results.length === 0) {
      return res.json({ exists: false });
    }
    
    res.json({
      exists: true,
      file: results[0]
    });
  });
};

// Download e registro de evento (cadeia de custódia) - NOVA FUNÇÃO
const downloadAndLog = (req, res) => {
  const { hash } = req.params;
  const { userId, action = "DOWNLOAD" } = req.body;
  
  console.log(`⬇️  Download solicitado para hash: ${hash} por: ${userId || 'desconhecido'}`);
  
  // 1. Buscar arquivo
  db.query("SELECT * FROM files WHERE hash = ?", [hash], (err, results) => {
    if (err) {
      console.error("Erro ao buscar arquivo:", err);
      return res.status(500).json({ error: "Erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    const file = results[0];
    const filePath = path.join(uploadDir, file.filepath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Arquivo físico não encontrado" });
    }

    // 2. Registrar evento na cadeia de custódia
    const eventSql = `
      INSERT INTO access_events 
      (file_hash, user_id, action, filename, accessed_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    db.query(eventSql, [hash, userId || 'unknown', action, file.filename], (eventErr) => {
      if (eventErr) {
        console.error("Erro ao registrar evento:", eventErr);
        // Continua mesmo com erro no log
      } else {
        console.log(`📝 Evento registrado: ${action} - ${file.filename}`);
      }

      // 3. Fazer download do arquivo
      res.download(filePath, file.filename, (downloadErr) => {
        if (downloadErr) {
          console.error("Erro ao enviar arquivo:", downloadErr);
        }
      });
    });
  });
};

module.exports = { 
  uploadFile, 
  getFileByHash, 
  downloadFileByHash,
  checkFileExists,
  downloadAndLog  // ← NOVA FUNÇÃO ADICIONADA
};