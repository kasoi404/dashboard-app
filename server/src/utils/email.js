const nodemailer = require('nodemailer');

function createTransport() {
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
	if (!SMTP_HOST) {
		return null;
	}
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT || 587),
		secure: false,
		auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
	});
}

async function sendLowStockEmail(lowItems) {
	const transporter = createTransport();
	if (!transporter) return;
	const to = process.env.LOW_STOCK_EMAIL_TO || process.env.SMTP_USER;
	const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
	const subject = 'Low Stock Alert';
	const lines = lowItems.map((p) => `- ${p.product_code} ${p.product_name}: ${p.balance} ${p.unit} (min ${p.min_stock})`);
	const text = `The following items are below minimum stock:\n\n${lines.join('\n')}`;
	await transporter.sendMail({ from, to, subject, text });
}

module.exports = { sendLowStockEmail };