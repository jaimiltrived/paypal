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
INSERT INTO "audit_logs" VALUES('3c5984bb-4091-47d1-a6b2-9e0c975dea0c','db862531-b7e1-4525-a516-2fb4955b303c','USER_REGISTERED','user','db862531-b7e1-4525-a516-2fb4955b303c',NULL,'{"email": "operator@payops.ai", "role": "operator"}',NULL,'2026-11-04 08:33:34.058493');
INSERT INTO "audit_logs" VALUES('d3c5e002-d000-4135-ad78-fe6d5d1b7faf','b3614405-a384-4f1c-b3d6-59df744d2443','USER_REGISTERED','user','b3614405-a384-4f1c-b3d6-59df744d2443',NULL,'{"email": "auditor@payops.ai", "role": "auditor"}',NULL,'2026-11-04 08:33:34.269103');
INSERT INTO "audit_logs" VALUES('aud_001','88b63afc-0a84-4768-8d44-8528095cc71b','CONFIRM_PENDING_ACTION','PendingAction','pact_33190','{"status": "PENDING", "approved_by": null}','{"status": "EXECUTED", "approved_by": "Alex Vance (Admin)", "refund_capture_ref": "re_paypal_881902"}','192.168.1.104','2026-11-04 08:36:36.516674');
INSERT INTO "audit_logs" VALUES('aud_002',NULL,'FLAG_ANOMALY','AnomalyInsight','ins_ai_01',NULL,'{"insight_id": "ins_ai_01", "severity": "high", "affected_records": 18}','127.0.0.1','2026-11-04 08:36:36.516674');
INSERT INTO "audit_logs" VALUES('aud_003','db862531-b7e1-4525-a516-2fb4955b303c','CREATE_REFUND_REQUEST','Refund','ref_99182-3819-44cb-a912','{"order_status": "COMPLETED", "refunded_amount_cents": 0}','{"order_status": "REFUND_PENDING_APPROVAL", "refund_requested_cents": 125000}','192.168.1.118','2026-11-04 08:36:36.516674');
INSERT INTO "audit_logs" VALUES('aud_004',NULL,'PAYMENT_CAPTURE_COMPLETED','Order','ord_91823-3891-44af-811c-99a012e84120','{"status": "CREATED", "capture_id": null}','{"status": "COMPLETED", "capture_id": "CAP-789218390", "amount_cents": 34500}','173.0.82.126','2026-11-04 08:36:36.516674');
INSERT INTO "audit_logs" VALUES('aud_005','88b63afc-0a84-4768-8d44-8528095cc71b','UPDATE_SECURITY_SETTINGS','Settings','sec_cfg_01','{"dual_approval_threshold_cents": 50000}','{"dual_approval_threshold_cents": 10000}','192.168.1.104','2026-11-04 08:36:36.516674');
INSERT INTO "audit_logs" VALUES('6932a42e-b716-4ad0-b254-b2cf6d4dc19d','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-04 09:26:44.104848');
INSERT INTO "audit_logs" VALUES('1300482b-1465-4d04-928e-689925345c02','88b63afc-0a84-4768-8d44-8528095cc71b','PAYOUT_DISBURSED','payout','98ce9b43-826b-4504-805c-c0602d389c81',NULL,'{"batch_id": "BATCH-2026-CC3AC179", "recipient_email": "seller.alpha@partner.net", "amount_cents": 45000, "currency": "USD", "status": "SUCCESS"}','127.0.0.1','2026-11-04 09:35:32.868510');
INSERT INTO "audit_logs" VALUES('3bc3ac23-60e6-4bc2-bf54-eb8dc05c884b','88b63afc-0a84-4768-8d44-8528095cc71b','PAYOUT_DISBURSED','payout','dd95622e-8cd1-42f9-8cd1-2dff08b68d28',NULL,'{"batch_id": "BATCH-2026-2F94AFF7", "recipient_email": "contractor.dev@cloudops.org", "amount_cents": 120000, "currency": "USD", "status": "SUCCESS"}','127.0.0.1','2026-11-04 09:35:32.875663');
INSERT INTO "audit_logs" VALUES('15ca3503-e44b-43ae-9536-88389c015af9','88b63afc-0a84-4768-8d44-8528095cc71b','PAYOUT_DISBURSED','payout','c0728818-f951-4fc0-8a85-eb2ef13872fa',NULL,'{"batch_id": "BATCH-2026-033E40E3", "recipient_email": "affiliate.network@growthpay.io", "amount_cents": 18500, "currency": "USD", "status": "SUCCESS"}','127.0.0.1','2026-11-04 09:35:32.881402');
INSERT INTO "audit_logs" VALUES('31742ade-bea6-4480-ad53-d11a51acf998','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,NULL,'2026-11-04 09:38:55.798607');
INSERT INTO "audit_logs" VALUES('ce0ff13e-4fdd-47a2-a066-e4da3dcf5f82','88b63afc-0a84-4768-8d44-8528095cc71b','PAYOUT_DISBURSED','payout','fa2b4b08-d20b-4d50-bbc2-dca252e7b660',NULL,'{"batch_id": "BATCH-2026-2D2C928D", "recipient_email": "vendor@enterprise-cloud.io", "amount_cents": 85000, "currency": "USD", "status": "SUCCESS"}','127.0.0.1','2026-11-04 09:38:55.820947');
INSERT INTO "audit_logs" VALUES('35a9aa3b-64d3-4367-9473-9ce71c803b1b','db862531-b7e1-4525-a516-2fb4955b303c','LOGIN_SUCCESS','user','db862531-b7e1-4525-a516-2fb4955b303c',NULL,NULL,'127.0.0.1','2026-11-04 09:55:32.253995');
INSERT INTO "audit_logs" VALUES('6729cd34-43ef-4e48-8f74-06ff3a807560','db862531-b7e1-4525-a516-2fb4955b303c','LOGOUT','user','db862531-b7e1-4525-a516-2fb4955b303c',NULL,NULL,'127.0.0.1','2026-11-04 09:55:41.625693');
INSERT INTO "audit_logs" VALUES('0ed9a411-950e-46e9-be91-c5321feb9fb8','b3614405-a384-4f1c-b3d6-59df744d2443','LOGIN_SUCCESS','user','b3614405-a384-4f1c-b3d6-59df744d2443',NULL,NULL,'127.0.0.1','2026-11-04 09:55:44.189850');
INSERT INTO "audit_logs" VALUES('5449d05f-b147-4f0e-b40c-fb08dcc460b3','b3614405-a384-4f1c-b3d6-59df744d2443','LOGOUT','user','b3614405-a384-4f1c-b3d6-59df744d2443',NULL,NULL,'127.0.0.1','2026-11-04 09:55:50.300704');
INSERT INTO "audit_logs" VALUES('3214f53e-049c-41d5-ae47-5da2e0f5fafa','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-04 09:55:52.142458');
INSERT INTO "audit_logs" VALUES('4e244657-3572-4bdf-90cb-14e9fc634ea2','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_FAILED','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 05:51:25.469277');
INSERT INTO "audit_logs" VALUES('f640d4a3-4ff8-4021-a5a8-ab0819068c19','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 05:52:17.992160');
INSERT INTO "audit_logs" VALUES('7e554940-7feb-4eaa-b838-4593bd474bea','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 05:53:07.463808');
INSERT INTO "audit_logs" VALUES('17ae1848-c298-4bc3-82b3-942d7ce8e626','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 05:53:32.015647');
INSERT INTO "audit_logs" VALUES('148456ca-2c45-484c-839f-143e6ddf11b5','88b63afc-0a84-4768-8d44-8528095cc71b','SKU_CREATED','sku','fcd5c9db-393f-4234-9e81-1f8582525e39',NULL,'{"sku_code": "SKU-TEST-LIVE-001", "price_cents": 2500, "stock_quantity": 50}','testclient','2026-11-05 05:53:32.092055');
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
INSERT INTO "disputes" VALUES('disp_991823-3810-4491-aa10','PP-D-991204','ord_91823-3891-44af-811c-99a012e84120','UNDER_REVIEW','MERCHANDISE_OR_SERVICE_NOT_RECEIVED',34500,'USD','PENDING','Digital API key logs and login telemetry verified delivery.','2026-11-04 08:36:36.504672','2026-11-04 08:36:36.504672');
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
INSERT INTO "orders" VALUES('ord_91823-3891-44af-811c-99a012e84120','88b63afc-0a84-4768-8d44-8528095cc71b','8MN92184KL381920B','COMPLETED','USD',34500,'Enterprise API Subscription - Tier 2','CUST-ORG-9102','finance@acmecorp.io','CAP-789218390','2026-11-04 08:36:36.495285','2026-11-04 08:36:36.495285');
INSERT INTO "orders" VALUES('ord_77182-1204-43cb-9801-11b023f76101','db862531-b7e1-4525-a516-2fb4955b303c','4RT81092MN192834C','COMPLETED','USD',125000,'Hardware POS Terminal Gateway Batch','CUST-ORG-8841','treasury@hyperstream.tech','CAP-443910281','2026-11-04 08:36:36.495285','2026-11-04 08:36:36.495285');
INSERT INTO "orders" VALUES('ord_66192-8921-41bb-a202-33c948d88219','88b63afc-0a84-4768-8d44-8528095cc71b','9PP72019QQ991820D','FAILED','USD',8900,'Developer Seat License Add-on','CUST-ORG-7719','devops@nexustrack.co',NULL,'2026-11-04 08:36:36.495285','2026-11-04 08:36:36.495285');
INSERT INTO "orders" VALUES('ord_55291-0912-42aa-b881-22c091a99021','db862531-b7e1-4525-a516-2fb4955b303c','2KL88192EU771920A','COMPLETED','EUR',24190,'European Dedicated Ingress Node','CUST-ORG-5512','billing@strato-cloud.de','CAP-992019482','2026-11-04 08:36:36.495285','2026-11-04 08:36:36.495285');
INSERT INTO "orders" VALUES('ord_44102-8812-45ff-a102-77d012e88124','88b63afc-0a84-4768-8d44-8528095cc71b','5IN99102IN449102B','COMPLETED','INR',1240500,'Subcontinent Cloud Gateway Connect','CUST-ORG-4410','payments@indicpay.in','CAP-112094819','2026-11-04 08:36:36.495285','2026-11-04 08:36:36.495285');
INSERT INTO "orders" VALUES('ord_33190-7721-41ee-99aa-88f012b77190','db862531-b7e1-4525-a516-2fb4955b303c','7US44192US991820Z','PENDING','USD',54000,'GPU Cluster Ops Reserve Hold','CUST-ORG-3310','procurement@lumina-ai.com',NULL,'2026-11-04 08:36:36.495285','2026-11-04 08:36:36.495285');
CREATE TABLE payouts (
	id VARCHAR(36) NOT NULL, 
	user_id VARCHAR(36), 
	payout_batch_id VARCHAR(100), 
	payout_item_id VARCHAR(100), 
	recipient_email VARCHAR(255) NOT NULL, 
	recipient_name VARCHAR(100), 
	amount_cents INTEGER NOT NULL, 
	currency VARCHAR(3) NOT NULL, 
	status VARCHAR(30) NOT NULL, 
	note VARCHAR(255), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
INSERT INTO "payouts" VALUES('98ce9b43-826b-4504-805c-c0602d389c81','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-CC3AC179','ITEM-91EAFEF266BC','seller.alpha@partner.net','Alpha Marketplace Seller LLC',45000,'USD','SUCCESS','Monthly net seller commission settlement','2026-11-04 09:35:32.857167','2026-11-04 09:35:32.857167');
INSERT INTO "payouts" VALUES('dd95622e-8cd1-42f9-8cd1-2dff08b68d28','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-2F94AFF7','ITEM-2D1DDC4DC238','contractor.dev@cloudops.org','CloudOps Contractor Services',120000,'USD','SUCCESS','Infrastructure engineering milestone invoice','2026-11-04 09:35:32.872532','2026-11-04 09:35:32.872532');
INSERT INTO "payouts" VALUES('c0728818-f951-4fc0-8a85-eb2ef13872fa','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-033E40E3','ITEM-78CA53AC4B87','affiliate.network@growthpay.io','GrowthPay Affiliate Partner',18500,'USD','SUCCESS','Q4 affiliate referral bonus','2026-11-04 09:35:32.878798','2026-11-04 09:35:32.878798');
INSERT INTO "payouts" VALUES('pay_91820-4412-88aa-b120','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-ALPHA01','ITEM-ALPHA-9102','seller.alpha@partner.net','Alpha Marketplace Seller LLC',45000,'USD','SUCCESS','Monthly net seller commission settlement','2026-11-04 09:36:56.155117','2026-11-04 09:36:56.155117');
INSERT INTO "payouts" VALUES('pay_88192-3310-99bb-c340','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-CLOUDOPS02','ITEM-CLOUDOPS-8812','contractor.dev@cloudops.org','CloudOps Contractor Services',120000,'USD','SUCCESS','Infrastructure engineering milestone invoice','2026-11-04 09:36:56.155117','2026-11-04 09:36:56.155117');
INSERT INTO "payouts" VALUES('pay_77102-2201-11cc-d560','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-GROWTH03','ITEM-GROWTH-7719','affiliate.network@growthpay.io','GrowthPay Affiliate Partner',18500,'USD','SUCCESS','Q4 affiliate referral bonus','2026-11-04 09:36:56.155117','2026-11-04 09:36:56.155117');
INSERT INTO "payouts" VALUES('fa2b4b08-d20b-4d50-bbc2-dca252e7b660','88b63afc-0a84-4768-8d44-8528095cc71b','BATCH-2026-2D2C928D','ITEM-09FE9BC0BB8E','vendor@enterprise-cloud.io','Enterprise Cloud Vendor',85000,'USD','SUCCESS','Server capacity payout','2026-11-04 09:38:55.816948','2026-11-04 09:38:55.816948');
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
INSERT INTO "pending_actions" VALUES('pact_77182-3819-44cb-a912','HIGH_VALUE_REFUND','Refund','ref_99182-3819-44cb-a912','{"refund_id": "ref_99182-3819-44cb-a912", "order_id": "ord_77182-1204-43cb-9801-11b023f76101", "amount_cents": 125000, "currency": "USD", "reason": "Customer cancelled enterprise annual plan within 7-day trial."}','PENDING','db862531-b7e1-4525-a516-2fb4955b303c',NULL,NULL,'2026-11-04 08:36:36.510675','2026-11-04 08:36:36.510675');
INSERT INTO "pending_actions" VALUES('pact_88291-1029-41aa-8812','DISPUTE_AUTO_ACCEPT','Dispute','disp_991823-3810-4491-aa10','{"dispute_id": "disp_991823-3810-4491-aa10", "amount_cents": 4500, "currency": "USD", "reason": "Defective digital SKU asset download failure verified by telemetry."}','PENDING','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'2026-11-04 08:36:36.510675','2026-11-04 08:36:36.510675');
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
INSERT INTO "refunds" VALUES('ref_99182-3819-44cb-a912','ord_77182-1204-43cb-9801-11b023f76101','REF-992019283',125000,'USD','PENDING','Customer cancelled enterprise annual plan within 7-day trial.','db862531-b7e1-4525-a516-2fb4955b303c','2026-11-04 08:36:36.499999','2026-11-04 08:36:36.499999');
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
INSERT INTO "skus" VALUES('fcd5c9db-393f-4234-9e81-1f8582525e39','SKU-TEST-LIVE-001','Test Live Product','Live verification SKU item',2500,'USD',50,1,'2026-11-05 05:53:32.078923','2026-11-05 05:53:32.078923');
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
INSERT INTO "users" VALUES('88b63afc-0a84-4768-8d44-8528095cc71b','admin@payops.ai','$2b$12$AEBIDKxAob2ZZ15iLBqfTOBFjLNJDAqwvi8m74GPUqmj.jhURI.O.','Alex Vance (Admin)',1,'d772c918-063a-47df-86dc-1d6fc8d0a4c4','2026-11-03 07:59:19.518993','2026-11-05 05:51:37.741674');
INSERT INTO "users" VALUES('db862531-b7e1-4525-a516-2fb4955b303c','operator@payops.ai','$2b$12$mD8rFgG.CXniqDiMkSkvKuwMb/LbHk4/4smEw6yGVosgNW89htiA6','Sarah Jenkins (Operator)',1,'d8074c1a-890e-460d-b42f-a259bde4dd22','2026-11-04 08:33:34.053070','2026-11-04 09:36:56.136832');
INSERT INTO "users" VALUES('b3614405-a384-4f1c-b3d6-59df744d2443','auditor@payops.ai','$2b$12$mqd151xQUksQmz8meOcRB.BpjVSPai/99QJf06sLJzFTl4yjzvC7a','Marcus Brody (Auditor)',1,'4556722f-8599-4255-a1d9-8b5169787e25','2026-11-04 08:33:34.269103','2026-11-04 09:36:56.136832');
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
CREATE INDEX ix_payouts_status ON payouts (status);
CREATE UNIQUE INDEX ix_payouts_payout_item_id ON payouts (payout_item_id);
CREATE INDEX ix_payouts_user_id ON payouts (user_id);
CREATE INDEX ix_payouts_recipient_email ON payouts (recipient_email);
CREATE INDEX ix_payouts_created_at ON payouts (created_at);
CREATE UNIQUE INDEX ix_payouts_payout_batch_id ON payouts (payout_batch_id);
COMMIT;
