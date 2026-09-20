const reportService = require('../services/reportService');

async function summary(req, res) {
  const data = await reportService.summary(req.query);
  res.json({ success: true, data });
}

async function exportReport(req, res) {
  const { fileName, buffer } = await reportService.exportReport(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(Buffer.from(buffer));
}

module.exports = { summary, exportReport };
