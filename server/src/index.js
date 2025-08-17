require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');

const { db, getTotalsForProduct } = require('./db');
const { authMiddleware, requireRole } = require('./middleware/auth');
const { exportProductsExcel, exportSimplePdf } = require('./utils/exporters');
const { sendLowStockEmail } = require('./utils/email');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

app.get('/health', (req, res) => res.json({ ok: true }));

// Auth
app.post('/auth/login', (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });
	const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const ok = bcrypt.compareSync(password, user.password_hash);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
	const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' });
	res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Seed admin if empty
app.post('/auth/seed-admin', (req, res) => {
	const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
	if (count > 0) return res.json({ ok: true, message: 'Users already exist' });
	const password_hash = bcrypt.hashSync('admin123', 10);
	db.prepare('INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)')
		.run('admin', password_hash, 'admin', 'admin@example.com');
	res.json({ ok: true, username: 'admin', password: 'admin123' });
});

// Employees
app.get('/employees', authMiddleware, (req, res) => {
	const rows = db.prepare('SELECT * FROM employees ORDER BY id DESC').all();
	res.json(rows);
});
app.post('/employees', authMiddleware, requireRole('admin', 'editor'), upload.single('picture'), (req, res) => {
	const { employee_code, name, position, email } = req.body;
	const picture = req.file ? `/uploads/${req.file.filename}` : null;
	const r = db.prepare('INSERT INTO employees (employee_code, name, position, email, picture) VALUES (?, ?, ?, ?, ?)')
		.run(employee_code, name, position, email, picture);
	res.json({ id: r.lastInsertRowid });
});

// Users management
app.get('/users', authMiddleware, requireRole('admin'), (req, res) => {
	const rows = db.prepare('SELECT id, username, role, email FROM users ORDER BY id DESC').all();
	res.json(rows);
});
app.post('/users', authMiddleware, requireRole('admin'), (req, res) => {
	const { username, password, role, email } = req.body;
	const password_hash = bcrypt.hashSync(password, 10);
	const r = db.prepare('INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)')
		.run(username, password_hash, role || 'viewer', email || null);
	res.json({ id: r.lastInsertRowid });
});
app.put('/users/:id', authMiddleware, requireRole('admin'), (req, res) => {
	const { role, email, password } = req.body;
	if (password) {
		const password_hash = bcrypt.hashSync(password, 10);
		db.prepare('UPDATE users SET role = ?, email = ?, password_hash = ? WHERE id = ?')
			.run(role, email, password_hash, req.params.id);
	} else {
		db.prepare('UPDATE users SET role = ?, email = ? WHERE id = ?')
			.run(role, email, req.params.id);
	}
	res.json({ ok: true });
});

// Products (Current Stock)
app.get('/products', authMiddleware, (req, res) => {
	const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
	const withTotals = products.map((p) => ({ ...p, ...getTotalsForProduct(p.product_code) }));
	res.json(withTotals);
});
app.post('/products', authMiddleware, requireRole('admin', 'editor'), upload.single('picture'), (req, res) => {
	const { product_code, product_name, unit, min_stock, barcode, verify_by, verify_time } = req.body;
	const picture = req.file ? `/uploads/${req.file.filename}` : null;
	const r = db.prepare('INSERT INTO products (product_code, product_name, unit, min_stock, barcode, picture, verify_by, verify_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
		.run(product_code, product_name, unit, Number(min_stock || 0), barcode || null, picture, verify_by || null, verify_time || null);
	res.json({ id: r.lastInsertRowid });
});

// Inbound
app.get('/inbound', authMiddleware, (req, res) => {
	const rows = db.prepare('SELECT * FROM inbound ORDER BY id DESC').all();
	res.json(rows);
});
app.post('/inbound', authMiddleware, requireRole('admin', 'editor'), (req, res) => {
	const { transaction_no, inbound_date, inbound_time, product_code, quantity, requester, recorder } = req.body;
	const product = db.prepare('SELECT * FROM products WHERE product_code = ?').get(product_code);
	if (!product) return res.status(400).json({ message: 'Product not found' });
	const unit = product.unit;
	const product_name = product.product_name;
	const record_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
	db.prepare('INSERT INTO inbound (transaction_no, inbound_date, inbound_time, product_code, product_name, quantity, unit, requester, recorder, record_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
		.run(transaction_no, inbound_date, inbound_time, product_code, product_name, Number(quantity), unit, requester || null, recorder || null, record_time);
	res.json({ ok: true });
});

// Outbound
app.get('/outbound', authMiddleware, (req, res) => {
	const rows = db.prepare('SELECT * FROM outbound ORDER BY id DESC').all();
	res.json(rows);
});
app.post('/outbound', authMiddleware, requireRole('admin', 'editor'), (req, res) => {
	const { transaction_no, outbound_date, outbound_time, product_code, quantity, requester, recorder } = req.body;
	const product = db.prepare('SELECT * FROM products WHERE product_code = ?').get(product_code);
	if (!product) return res.status(400).json({ message: 'Product not found' });
	const unit = product.unit;
	const product_name = product.product_name;
	const record_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
	db.prepare('INSERT INTO outbound (transaction_no, outbound_date, outbound_time, product_code, product_name, quantity, unit, requester, recorder, record_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
		.run(transaction_no, outbound_date, outbound_time, product_code, product_name, Number(quantity), unit, requester || null, recorder || null, record_time);
	res.json({ ok: true });
});

// Exports
app.get('/exports/products.xlsx', authMiddleware, async (req, res) => {
	const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all().map((p) => ({ ...p, ...getTotalsForProduct(p.product_code) }));
	const buffer = await exportProductsExcel(products);
	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	res.setHeader('Content-Disposition', 'attachment; filename="products.xlsx"');
	res.send(Buffer.from(buffer));
});

app.get('/exports/inbound.pdf', authMiddleware, async (req, res) => {
	const rows = db.prepare('SELECT * FROM inbound ORDER BY id DESC').all();
	const headers = ['transaction_no','inbound_date','inbound_time','product_code','product_name','quantity','unit','requester','recorder','record_time'];
	const buffer = await exportSimplePdf('Inbound Transactions', rows, headers);
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', 'attachment; filename="inbound.pdf"');
	res.send(buffer);
});

app.get('/exports/outbound.pdf', authMiddleware, async (req, res) => {
	const rows = db.prepare('SELECT * FROM outbound ORDER BY id DESC').all();
	const headers = ['transaction_no','outbound_date','outbound_time','product_code','product_name','quantity','unit','requester','recorder','record_time'];
	const buffer = await exportSimplePdf('Outbound Transactions', rows, headers);
	res.setHeader('Content-Type', 'application/pdf');
	res.setHeader('Content-Disposition', 'attachment; filename="outbound.pdf"');
	res.send(buffer);
});

// Low stock check + email
app.post('/alerts/low-stock', authMiddleware, requireRole('admin', 'editor'), async (req, res) => {
	const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
	const withTotals = products.map((p) => ({ ...p, ...getTotalsForProduct(p.product_code) }));
	const low = withTotals.filter((p) => p.balance < p.min_stock);
	await sendLowStockEmail(low);
	res.json({ ok: true, count: low.length });
});

app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`API running on http://localhost:${PORT}`);
});