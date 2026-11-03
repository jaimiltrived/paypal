-- ============================================================
-- PayOps AI SQLite Complete Database Dump
-- Generated for PayOps AI Backend
-- Includes Table DDL, Indexes, Constraints, and Seed Data
-- ============================================================

BEGIN TRANSACTION;
CREATE TABLE audit_logs (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	action VARCHAR(100) NOT NULL, 
	entity_type VARCHAR(50) NOT NULL, 
	entity_id VARCHAR(100) NOT NULL, 
	old_values TEXT, 
	new_values TEXT, 
	ip_address VARCHAR(50), 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE disputes (
	id VARCHAR(36) NOT NULL, 
	paypal_dispute_id VARCHAR(100), 
	order_id VARCHAR(36) NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	reason VARCHAR(100), 
	dispute_amount_cents INTEGER NOT NULL, 
	currency VARCHAR(3) NOT NULL, 
	outcome VARCHAR(50), 
	evidence_summary TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id)
);
CREATE TABLE events (
	id VARCHAR(36) NOT NULL, 
	event_id VARCHAR(100) NOT NULL, 
	event_type VARCHAR(100) NOT NULL, 
	resource_type VARCHAR(100), 
	summary VARCHAR(255), 
	payload_json TEXT NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	error_message TEXT, 
	processed_at DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);
CREATE TABLE invoices (
	id VARCHAR(36) NOT NULL, 
	invoice_number VARCHAR(50) NOT NULL, 
	user_id VARCHAR(36), 
	order_id VARCHAR(36), 
	status VARCHAR(30) NOT NULL, 
	currency VARCHAR(3) NOT NULL, 
	total_amount_cents INTEGER NOT NULL, 
	due_date DATETIME, 
	issued_date DATETIME, 
	metadata_json TEXT, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id)
);
CREATE TABLE orders (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	paypal_order_id VARCHAR(100), 
	status VARCHAR(30) NOT NULL, 
	currency VARCHAR(3) NOT NULL, 
	amount_cents INTEGER NOT NULL, 
	description VARCHAR(255), 
	custom_id VARCHAR(100), 
	payer_email VARCHAR(255), 
	capture_id VARCHAR(100), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE pending_actions (
	id VARCHAR(36) NOT NULL, 
	action_type VARCHAR(50) NOT NULL, 
	entity_type VARCHAR(50) NOT NULL, 
	entity_id VARCHAR(100) NOT NULL, 
	payload_json TEXT NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	proposed_by_user_id VARCHAR(36) NOT NULL, 
	confirmed_by_user_id VARCHAR(36), 
	resolved_at DATETIME, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(proposed_by_user_id) REFERENCES users (id), 
	FOREIGN KEY(confirmed_by_user_id) REFERENCES users (id)
);
CREATE TABLE refunds (
	id VARCHAR(36) NOT NULL, 
	order_id VARCHAR(36) NOT NULL, 
	paypal_refund_id VARCHAR(100), 
	amount_cents INTEGER NOT NULL, 
	currency VARCHAR(3) NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	reason VARCHAR(255), 
	initiated_by_user_id VARCHAR(36), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id), 
	FOREIGN KEY(initiated_by_user_id) REFERENCES users (id)
);
CREATE TABLE roles (
	id VARCHAR(36) NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	description VARCHAR(255), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO "roles" VALUES('d772c918-063a-47df-86dc-1d6fc8d0a4c4','admin','Administrator with full system privileges','2026-11-03 06:54:10.536639','2026-11-03 06:54:10.536639');
INSERT INTO "roles" VALUES('d8074c1a-890e-460d-b42f-a259bde4dd22','operator','Payment and refunds operations officer','2026-11-03 06:54:10.546884','2026-11-03 06:54:10.546884');
INSERT INTO "roles" VALUES('4556722f-8599-4255-a1d9-8b5169787e25','auditor','Read-only auditor for ledger and transactions','2026-11-03 06:54:10.558445','2026-11-03 06:54:10.558445');
INSERT INTO "roles" VALUES('583f184b-4a18-4b0e-a432-82e263b3fc54','user','Standard customer account','2026-11-03 06:54:10.567691','2026-11-03 06:54:10.567691');
CREATE TABLE skus (
	id VARCHAR(36) NOT NULL, 
	sku_code VARCHAR(50) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	description VARCHAR(255), 
	price_cents INTEGER NOT NULL, 
	currency VARCHAR(3) NOT NULL, 
	stock_quantity INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO "skus" VALUES('84f38298-b9d8-4b3e-8abd-1bdf4cf415b7','SKU-PRO-MONTHLY','PayOps Pro Monthly Subscription','Monthly subscription for PayOps automation suite',4900,'USD',1000,1,'2026-11-03 07:59:44.762401','2026-11-03 07:59:44.762401');
INSERT INTO "skus" VALUES('d852075d-64e5-4668-8f11-23389c1ccbab','SKU-ENTERPRISE-ANNUAL','PayOps Enterprise Annual License','Annual enterprise license with priority 24/7 support',49900,'USD',500,1,'2026-11-03 07:59:44.762401','2026-11-03 07:59:44.762401');
CREATE TABLE users (
	id VARCHAR(36) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	full_name VARCHAR(100) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	role_id VARCHAR(36) NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(role_id) REFERENCES roles (id)
);
INSERT INTO "users" VALUES('88b63afc-0a84-4768-8d44-8528095cc71b','admin@payops.ai','$2b$12$bQZdAp0TDsVWWJrYczKt9ObFTvEGOFaMF/7HldKIJeRPovNbrmP0y','PayOps AI Administrator',1,'d772c918-063a-47df-86dc-1d6fc8d0a4c4','2026-11-03 07:59:19.518993','2026-11-03 07:59:19.518993');
CREATE INDEX ix_roles_created_at ON roles (created_at);
CREATE UNIQUE INDEX ix_roles_name ON roles (name);
CREATE UNIQUE INDEX ix_events_event_id ON events (event_id);
CREATE INDEX ix_events_event_type ON events (event_type);
CREATE INDEX ix_events_created_at ON events (created_at);
CREATE INDEX ix_events_status ON events (status);
CREATE INDEX ix_skus_created_at ON skus (created_at);
CREATE UNIQUE INDEX ix_skus_sku_code ON skus (sku_code);
CREATE INDEX ix_users_created_at ON users (created_at);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_role_id ON users (role_id);
CREATE UNIQUE INDEX ix_orders_paypal_order_id ON orders (paypal_order_id);
CREATE INDEX ix_orders_status ON orders (status);
CREATE INDEX ix_orders_capture_id ON orders (capture_id);
CREATE INDEX ix_orders_user_id ON orders (user_id);
CREATE INDEX ix_orders_created_at ON orders (created_at);
CREATE INDEX ix_orders_custom_id ON orders (custom_id);
CREATE INDEX ix_audit_logs_action ON audit_logs (action);
CREATE INDEX ix_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX ix_audit_logs_entity_type ON audit_logs (entity_type);
CREATE INDEX ix_audit_logs_entity_id ON audit_logs (entity_id);
CREATE INDEX ix_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX ix_pending_actions_entity_id ON pending_actions (entity_id);
CREATE INDEX ix_pending_actions_status ON pending_actions (status);
CREATE INDEX ix_pending_actions_created_at ON pending_actions (created_at);
CREATE INDEX ix_pending_actions_action_type ON pending_actions (action_type);
CREATE INDEX ix_refunds_created_at ON refunds (created_at);
CREATE UNIQUE INDEX ix_refunds_paypal_refund_id ON refunds (paypal_refund_id);
CREATE INDEX ix_refunds_status ON refunds (status);
CREATE INDEX ix_refunds_order_id ON refunds (order_id);
CREATE INDEX ix_invoices_order_id ON invoices (order_id);
CREATE UNIQUE INDEX ix_invoices_invoice_number ON invoices (invoice_number);
CREATE INDEX ix_invoices_created_at ON invoices (created_at);
CREATE INDEX ix_invoices_user_id ON invoices (user_id);
CREATE INDEX ix_invoices_status ON invoices (status);
CREATE INDEX ix_disputes_order_id ON disputes (order_id);
CREATE INDEX ix_disputes_status ON disputes (status);
CREATE INDEX ix_disputes_created_at ON disputes (created_at);
CREATE UNIQUE INDEX ix_disputes_paypal_dispute_id ON disputes (paypal_dispute_id);
COMMIT;
