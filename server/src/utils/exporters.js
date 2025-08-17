const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

async function exportProductsExcel(products) {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet('Products');
	ws.columns = [
		{ header: 'ID', key: 'id', width: 8 },
		{ header: 'Product Code', key: 'product_code', width: 18 },
		{ header: 'Product List', key: 'product_name', width: 24 },
		{ header: 'Unit', key: 'unit', width: 10 },
		{ header: 'Total Inbound', key: 'totalIn', width: 16 },
		{ header: 'Total Outbound', key: 'totalOut', width: 16 },
		{ header: 'Balance', key: 'balance', width: 12 },
		{ header: 'Min Stock', key: 'min_stock', width: 12 },
		{ header: 'Barcode', key: 'barcode', width: 18 },
		{ header: 'Verify By', key: 'verify_by', width: 16 },
		{ header: 'Verify Time', key: 'verify_time', width: 20 },
		{ header: 'Low Stock?', key: 'low', width: 12 },
		{ header: 'Last Inbound Date', key: 'lastIn', width: 18 },
		{ header: 'Last Outbound Date', key: 'lastOut', width: 18 },
	];
	products.forEach((p) => ws.addRow({ ...p, low: p.balance < p.min_stock ? 'YES' : 'NO' }));
	return wb.xlsx.writeBuffer();
}

async function exportSimplePdf(title, rows, headers) {
	const doc = new PDFDocument({ size: 'A4', margin: 40 });
	const chunks = [];
	doc.on('data', (c) => chunks.push(c));
	doc.on('end', () => {});
	doc.fontSize(18).text(title, { align: 'center' });
	doc.moveDown();
	doc.fontSize(10);
	doc.text(headers.join(' | '));
	doc.moveDown();
	rows.forEach((r) => {
		const line = headers.map((h) => String(r[h] ?? '')).join(' | ');
		doc.text(line);
	});
	doc.end();
	return await new Promise((resolve) => {
		doc.on('end', () => resolve(Buffer.concat(chunks)));
	});
}

module.exports = { exportProductsExcel, exportSimplePdf };