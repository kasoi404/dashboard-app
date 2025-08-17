const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../data/stock.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS employees (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	employee_code TEXT UNIQUE NOT NULL,
	name TEXT NOT NULL,
	position TEXT,
	email TEXT,
	picture TEXT
);

CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'viewer',
	email TEXT
);

CREATE TABLE IF NOT EXISTS products (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	product_code TEXT UNIQUE NOT NULL,
	product_name TEXT NOT NULL,
	unit TEXT NOT NULL,
	min_stock INTEGER NOT NULL DEFAULT 0,
	barcode TEXT,
	picture TEXT,
	verify_by TEXT,
	verify_time TEXT
);

CREATE TABLE IF NOT EXISTS inbound (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	transaction_no TEXT UNIQUE NOT NULL,
	inbound_date TEXT NOT NULL,
	inbound_time TEXT NOT NULL,
	product_code TEXT NOT NULL,
	product_name TEXT NOT NULL,
	quantity INTEGER NOT NULL,
	unit TEXT NOT NULL,
	requester TEXT,
	recorder TEXT,
	record_time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbound (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	transaction_no TEXT UNIQUE NOT NULL,
	outbound_date TEXT NOT NULL,
	outbound_time TEXT NOT NULL,
	product_code TEXT NOT NULL,
	product_name TEXT NOT NULL,
	quantity INTEGER NOT NULL,
	unit TEXT NOT NULL,
	requester TEXT,
	recorder TEXT,
	record_time TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inbound_product_code ON inbound(product_code);
CREATE INDEX IF NOT EXISTS idx_outbound_product_code ON outbound(product_code);
`);

function getTotalsForProduct(productCode) {
	const totalIn = db.prepare('SELECT COALESCE(SUM(quantity), 0) AS total FROM inbound WHERE product_code = ?').get(productCode).total;
	const totalOut = db.prepare('SELECT COALESCE(SUM(quantity), 0) AS total FROM outbound WHERE product_code = ?').get(productCode).total;
	const lastIn = db.prepare('SELECT inbound_date AS date FROM inbound WHERE product_code = ? ORDER BY id DESC LIMIT 1').get(productCode)?.date || null;
	const lastOut = db.prepare('SELECT outbound_date AS date FROM outbound WHERE product_code = ? ORDER BY id DESC LIMIT 1').get(productCode)?.date || null;
	return { totalIn, totalOut, balance: totalIn - totalOut, lastIn, lastOut };
}

module.exports = { db, getTotalsForProduct };