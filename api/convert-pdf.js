// Vercel Serverless Function — proxy convert docx -> PDF lewat iLovePDF API.
// Secret key iLovePDF DISIMPEN DI ENVIRONMENT VARIABLE (bukan di kode ini),
// jadi aman walau file ini ada di repo publik sekalipun.
//
// Endpoint: POST /api/convert-pdf
// Body (JSON): { "fileName": "Invoice - ....docx", "fileBase64": "<base64 isi docx>" }
// Response: bytes PDF langsung (Content-Type: application/pdf)

const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed, pakai POST.' });
    return;
  }

  const { fileName, fileBase64 } = req.body || {};
  if (!fileName || !fileBase64) {
    res.status(400).json({ error: 'fileName dan fileBase64 wajib diisi di body.' });
    return;
  }

  const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
  const secretKey = process.env.ILOVEPDF_SECRET_KEY;
  if (!publicKey || !secretKey) {
    res.status(500).json({
      error: 'Server belum dikonfigurasi: ILOVEPDF_PUBLIC_KEY / ILOVEPDF_SECRET_KEY belum diset di Environment Variables Vercel.',
    });
    return;
  }

  // /tmp adalah satu-satunya folder yang writable di Vercel serverless
  // function, dan sifatnya sementara (hilang begitu invocation selesai).
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${safeName}`);

  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    fs.writeFileSync(tempPath, buffer);

    const instance = new ILovePDFApi(publicKey, secretKey);
    const task = instance.newTask('officepdf');

    await task.start();
    const file = new ILovePDFFile(tempPath);
    await task.addFile(file);
    await task.process();
    const pdfData = await task.download(); // Buffer isi PDF

    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(pdfData);
  } catch (err) {
    console.error('convert-pdf error:', err);
    res.status(500).json({ error: err.message || 'Gagal convert ke PDF lewat iLovePDF.' });
  } finally {
    fs.unlink(tempPath, () => {}); // beres-beres file sementara di /tmp
  }
};
