const express = require("express");
const router = express.Router();
const documentController = require("./documentController");

// Endpoint de upload
router.post("/upload", documentController.uploadFile);

// Endpoint para buscar informações do arquivo pelo hash
router.get("/files/hash/:hash", documentController.getFileByHash);

// Endpoint para download do arquivo físico pelo hash (sem log)
router.get("/download/:hash", documentController.downloadFileByHash);

// NOVA ROTA: Download com registro de evento (cadeia de custódia)
router.post("/download-log/:hash", documentController.downloadAndLog);

// Verificar se arquivo existe
router.get("/check/:hash", documentController.checkFileExists);

module.exports = router;