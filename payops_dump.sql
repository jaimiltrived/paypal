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
INSERT INTO "audit_logs" VALUES('17d638d0-3884-49bf-8c8e-5cd4aaf1f740','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 05:56:00.160011');
INSERT INTO "audit_logs" VALUES('a67472bf-052b-4f1b-a142-ef6938db4e26','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 06:11:30.728133');
INSERT INTO "audit_logs" VALUES('1150504b-8109-4a53-9b08-eb96ab7f48e7','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 06:11:44.421383');
INSERT INTO "audit_logs" VALUES('e265ec57-0d42-4d81-a860-cd9d67c2731c','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_FAILED','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:13:28.687002');
INSERT INTO "audit_logs" VALUES('e923225e-e575-4b06-9a23-7f7a278dc6f2','db862531-b7e1-4525-a516-2fb4955b303c','LOGIN_SUCCESS','user','db862531-b7e1-4525-a516-2fb4955b303c',NULL,NULL,'127.0.0.1','2026-11-05 06:13:35.128079');
INSERT INTO "audit_logs" VALUES('beec4577-4dbe-4528-98fa-181f6603bfb5','db862531-b7e1-4525-a516-2fb4955b303c','PAYOUT_DISBURSED','payout','2c057d1e-63f9-4cda-8618-c9766f3e3223',NULL,'{"batch_id": "BATCH-2026-F7143007", "recipient_email": "jtrivedi635@rku.ac.in", "amount_cents": 50000, "currency": "USD", "status": "SUCCESS"}','127.0.0.1','2026-11-05 06:14:23.662293');
INSERT INTO "audit_logs" VALUES('a7af0eff-3eb0-46c1-a9c5-d3cfe24f13a6','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 06:21:18.247227');
INSERT INTO "audit_logs" VALUES('2859aa99-44e2-41b1-a192-c69c87f84a89','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:24:11.415007');
INSERT INTO "audit_logs" VALUES('11d20691-fb2b-46b3-952f-b9b862661cca','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:24:44.002867');
INSERT INTO "audit_logs" VALUES('8bcfc082-573c-4011-9e82-b4dc0b5fdf24','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_FAILED','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:26:09.253103');
INSERT INTO "audit_logs" VALUES('1e21820c-5e0c-4347-9c86-93dec686a985','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_FAILED','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:26:14.885440');
INSERT INTO "audit_logs" VALUES('9c9af8d4-2cf3-488e-a349-3249e922b5eb','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_FAILED','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:26:23.273079');
INSERT INTO "audit_logs" VALUES('a9262a15-2e3f-4a92-a2c9-90468df9afe0','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,NULL,'2026-11-05 06:28:13.785945');
INSERT INTO "audit_logs" VALUES('095f3177-ffe9-436c-b73c-cd4890de2616','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,NULL,'2026-11-05 06:28:14.385786');
INSERT INTO "audit_logs" VALUES('9b55a0e7-80b8-413e-9c27-b7920c18767f','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:28:52.368886');
INSERT INTO "audit_logs" VALUES('1580fd72-0c81-4a12-b0d1-d3679a8fb488','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:28:52.999509');
INSERT INTO "audit_logs" VALUES('d7688ea7-e4f6-453c-b832-2e58ad0db4d6','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:31:55.631717');
INSERT INTO "audit_logs" VALUES('97aefec2-ab07-46c9-938a-cdc2e2d76690','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:31:55.991663');
INSERT INTO "audit_logs" VALUES('82e4d01f-4b2d-48d2-ace1-77869210de4d','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:32:14.079280');
INSERT INTO "audit_logs" VALUES('ef1cd1c2-44fe-4717-8661-7c12cf300d42','db862531-b7e1-4525-a516-2fb4955b303c','LOGIN_SUCCESS','user','db862531-b7e1-4525-a516-2fb4955b303c',NULL,NULL,'127.0.0.1','2026-11-05 06:32:14.417166');
INSERT INTO "audit_logs" VALUES('94e81a02-95e8-4a29-b330-e268eb8de6a0','b3614405-a384-4f1c-b3d6-59df744d2443','LOGIN_SUCCESS','user','b3614405-a384-4f1c-b3d6-59df744d2443',NULL,NULL,'127.0.0.1','2026-11-05 06:32:14.752576');
INSERT INTO "audit_logs" VALUES('63a35484-2ddf-41ed-b4a6-14ab90025fd1','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:32:37.091089');
INSERT INTO "audit_logs" VALUES('d90105ad-d05d-4fbe-b34c-4d6c0a99c1c9','88b63afc-0a84-4768-8d44-8528095cc71b','INVOICE_CREATED','invoice','c313fdb0-0e06-4d97-8b94-c06f0e425481',NULL,'{"invoice_number": "INV-2026-00001", "total_amount_cents": 21525, "status": "DRAFT"}','127.0.0.1','2026-11-05 06:33:47.424107');
INSERT INTO "audit_logs" VALUES('a6b5eeed-48a0-4212-8f14-e0a363a720ca','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 06:40:33.859889');
INSERT INTO "audit_logs" VALUES('0ce5aa53-74aa-4d8f-8cdc-efc89e905405','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','8d75de3f-975e-4752-a445-5a1c86ba3525',NULL,'{"paypal_order_id": "5OD47C1F095949457", "amount_cents": 4900, "currency": "USD", "status": "CREATED"}','testclient','2026-11-05 06:40:33.921033');
INSERT INTO "audit_logs" VALUES('63c30ecb-5158-4f7b-94ae-39a866c29e46','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CAPTURED','order','8d75de3f-975e-4752-a445-5a1c86ba3525','{"status": "CREATED"}','{"status": "COMPLETED", "capture_id": "2C0B71F84C113C4FF", "payer_email": "sandbox-buyer@payops.ai"}','testclient','2026-11-05 06:40:33.956814');
INSERT INTO "audit_logs" VALUES('62133969-7eed-43fc-b678-05a07eb7b04f','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 06:49:41.456129');
INSERT INTO "audit_logs" VALUES('1ca41e06-5605-4b64-a1b6-feee5191b6c9','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','1fa85b57-d8ad-4adf-9c7d-c4901d53d672',NULL,'{"paypal_order_id": "5OEA069914DCB14D7", "amount_cents": 4988, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 06:50:10.280763');
INSERT INTO "audit_logs" VALUES('b2d759ae-a285-45f6-a9f7-77b1cd2f8bcd','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CAPTURED','order','1fa85b57-d8ad-4adf-9c7d-c4901d53d672','{"status": "CREATED"}','{"status": "COMPLETED", "capture_id": "2CBAAA72BD6AB5424", "payer_email": "sandbox-buyer@payops.ai"}','127.0.0.1','2026-11-05 06:50:23.277529');
INSERT INTO "audit_logs" VALUES('6b6ae288-a51b-4fce-b816-18f3b8698514','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','6200c67f-7059-41de-a52e-68dfb5ca881d',NULL,'{"paypal_order_id": "5O7162F82BB3A04AB", "amount_cents": 4988, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 06:51:34.497612');
INSERT INTO "audit_logs" VALUES('0262e678-b422-46b1-9d6a-ce6110b30936','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 07:13:35.706110');
INSERT INTO "audit_logs" VALUES('49123625-adad-4e18-98b9-cf7e3e926af4','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','e73b0053-d54b-4bea-a7d5-f26b362c57f4',NULL,'{"paypal_order_id": "19F27790TB6658255", "amount_cents": 4900, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 07:13:38.645507');
INSERT INTO "audit_logs" VALUES('23f780f3-33c1-4c2c-9427-6018cf53fa19','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','48222ae4-e983-4420-a58e-7f2d6e7f6a88',NULL,'{"paypal_order_id": "2XE32613WJ291383W", "amount_cents": 4900, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 07:14:46.121474');
INSERT INTO "audit_logs" VALUES('33f3c66f-824c-47ab-9d57-26a621ea6fe0','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','0192aa1c-8295-4c4b-9c4a-0079478a7767',NULL,'{"paypal_order_id": "28P3219052816501T", "amount_cents": 49900, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 07:19:33.907365');
INSERT INTO "audit_logs" VALUES('98511a9c-4945-4dd4-9552-b491b31dac56','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 07:20:11.027189');
INSERT INTO "audit_logs" VALUES('d09ea16f-6909-4932-8600-7cf1c27c9cb4','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'127.0.0.1','2026-11-05 07:24:27.161702');
INSERT INTO "audit_logs" VALUES('dece99e5-b30e-4ead-93de-970073f6d254','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','f83af40c-d5b2-4556-b6ed-49f715ef5522',NULL,'{"paypal_order_id": "36J14697R71948240", "amount_cents": 4900, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 07:24:29.740494');
INSERT INTO "audit_logs" VALUES('e51832d1-acc4-4b86-bcb8-8032d8f0326a','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CAPTURED','order','f83af40c-d5b2-4556-b6ed-49f715ef5522','{"status": "CREATED"}','{"status": "COMPLETED", "capture_id": "2C9EA2CF2EDF3B49B", "payer_email": "sandbox-buyer@payops.ai"}','127.0.0.1','2026-11-05 07:24:30.844351');
INSERT INTO "audit_logs" VALUES('2330b47f-431a-47f9-8bb0-011339ee7daa','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','1502eaf5-3c98-42bd-a264-3251b10fcb4f',NULL,'{"paypal_order_id": "45V08013F6969642S", "amount_cents": 4900, "currency": "USD", "status": "CREATED"}','127.0.0.1','2026-11-05 07:25:09.765908');
INSERT INTO "audit_logs" VALUES('b5bc9c5d-bf9f-4f92-b8cd-05bab6e76e0a','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CAPTURED','order','1502eaf5-3c98-42bd-a264-3251b10fcb4f','{"status": "CREATED"}','{"status": "COMPLETED", "capture_id": "2C649CC9EE8C26445", "payer_email": "sandbox-buyer@payops.ai"}','127.0.0.1','2026-11-05 07:25:25.700050');
INSERT INTO "audit_logs" VALUES('5b1e361c-782a-40a3-a9bc-5e84450f7478','88b63afc-0a84-4768-8d44-8528095cc71b','LOGIN_SUCCESS','user','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,NULL,'testclient','2026-11-05 07:27:14.264789');
INSERT INTO "audit_logs" VALUES('9e02500d-b277-4c2c-95a7-1caf97ed577f','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CREATED','order','0b84bd4d-1ec9-48cf-bf7c-d8f2aedc55be',NULL,'{"paypal_order_id": "51X30506UG084594C", "amount_cents": 3500, "currency": "USD", "status": "CREATED"}','testclient','2026-11-05 07:27:16.368373');
INSERT INTO "audit_logs" VALUES('012ede55-9c90-43e6-afd4-02ef4d70be98','88b63afc-0a84-4768-8d44-8528095cc71b','ORDER_CAPTURED','order','0b84bd4d-1ec9-48cf-bf7c-d8f2aedc55be','{"status": "CREATED"}','{"status": "COMPLETED", "capture_id": "2C912BC142FAAE4A5", "payer_email": "sandbox-buyer@payops.ai"}','testclient','2026-11-05 07:27:17.841887');
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
INSERT INTO "invoices" VALUES('c313fdb0-0e06-4d97-8b94-c06f0e425481','INV-2026-00001','88b63afc-0a84-4768-8d44-8528095cc71b',NULL,'DRAFT','USD',21525,NULL,NULL,'{"items": [{"sku_id": null, "name": "Amazon EC2 Compute Linux (t4g.xlarge, 720 hrs)", "quantity": 1, "unit_price_cents": 1540, "line_total_cents": 1540}, {"sku_id": null, "name": "Amazon Relational Database Service (Multi-AZ Postgres)", "quantity": 1, "unit_price_cents": 14250, "line_total_cents": 14250}, {"sku_id": null, "name": "Amazon S3 Standard Storage (1.2 TB)", "quantity": 1, "unit_price_cents": 2760, "line_total_cents": 2760}, {"sku_id": null, "name": "CloudFront Global Data Transfer Out (350 GB)", "quantity": 1, "unit_price_cents": 2975, "line_total_cents": 2975}], "notes": "AI Extracted from Amazon Web Services Inc.. Invoice Ref: AWS-2026-98124"}','2026-11-05 06:33:47.405595','2026-11-05 06:33:47.405595');
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
INSERT INTO "orders" VALUES('8d75de3f-975e-4752-a445-5a1c86ba3525','88b63afc-0a84-4768-8d44-8528095cc71b','5OD47C1F095949457','COMPLETED','USD',4900,'PayOps Pro Subscription',NULL,'sandbox-buyer@payops.ai','2C0B71F84C113C4FF','2026-11-05 06:40:33.896601','2026-11-05 06:40:33.946491');
INSERT INTO "orders" VALUES('1fa85b57-d8ad-4adf-9c7d-c4901d53d672','88b63afc-0a84-4768-8d44-8528095cc71b','5OEA069914DCB14D7','COMPLETED','USD',4988,'PayOps Pro Monthly Subscription',NULL,'sandbox-buyer@payops.ai','2CBAAA72BD6AB5424','2026-11-05 06:50:10.225347','2026-11-05 06:50:23.255097');
INSERT INTO "orders" VALUES('6200c67f-7059-41de-a52e-68dfb5ca881d','88b63afc-0a84-4768-8d44-8528095cc71b','5O7162F82BB3A04AB','CREATED','USD',4988,'PayOps Pro Monthly Subscription',NULL,NULL,NULL,'2026-11-05 06:51:34.455878','2026-11-05 06:51:34.472890');
INSERT INTO "orders" VALUES('e73b0053-d54b-4bea-a7d5-f26b362c57f4','88b63afc-0a84-4768-8d44-8528095cc71b','19F27790TB6658255','CREATED','USD',4900,'PayOps Pro Live Order',NULL,NULL,NULL,'2026-11-05 07:13:37.172898','2026-11-05 07:13:38.629545');
INSERT INTO "orders" VALUES('48222ae4-e983-4420-a58e-7f2d6e7f6a88','88b63afc-0a84-4768-8d44-8528095cc71b','2XE32613WJ291383W','CREATED','USD',4900,'PayOps Pro Monthly Subscription',NULL,NULL,NULL,'2026-11-05 07:14:44.399097','2026-11-05 07:14:46.098299');
INSERT INTO "orders" VALUES('0192aa1c-8295-4c4b-9c4a-0079478a7767','88b63afc-0a84-4768-8d44-8528095cc71b','28P3219052816501T','CREATED','USD',49900,'PayOps Enterprise Annual License',NULL,NULL,NULL,'2026-11-05 07:19:32.251297','2026-11-05 07:19:33.880089');
INSERT INTO "orders" VALUES('f83af40c-d5b2-4556-b6ed-49f715ef5522','88b63afc-0a84-4768-8d44-8528095cc71b','36J14697R71948240','COMPLETED','USD',4900,'Full Stack Payment Test',NULL,'sandbox-buyer@payops.ai','2C9EA2CF2EDF3B49B','2026-11-05 07:24:27.204809','2026-11-05 07:24:30.827541');
INSERT INTO "orders" VALUES('1502eaf5-3c98-42bd-a264-3251b10fcb4f','88b63afc-0a84-4768-8d44-8528095cc71b','45V08013F6969642S','COMPLETED','USD',4900,'PayOps Pro Monthly Subscription',NULL,'sandbox-buyer@payops.ai','2C649CC9EE8C26445','2026-11-05 07:25:08.080306','2026-11-05 07:25:25.682851');
INSERT INTO "orders" VALUES('0b84bd4d-1ec9-48cf-bf7c-d8f2aedc55be','88b63afc-0a84-4768-8d44-8528095cc71b','51X30506UG084594C','COMPLETED','USD',3500,'Full Refund Test',NULL,'sandbox-buyer@payops.ai','2C912BC142FAAE4A5','2026-11-05 07:27:14.302813','2026-11-05 07:27:17.827024');
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
INSERT INTO "payouts" VALUES('2c057d1e-63f9-4cda-8618-c9766f3e3223','db862531-b7e1-4525-a516-2fb4955b303c','BATCH-2026-F7143007','ITEM-D9DE24DB9870','jtrivedi635@rku.ac.in','llc ',50000,'USD','SUCCESS','msmqksaskamsk','2026-11-05 06:14:23.633655','2026-11-05 06:14:23.633655');
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
INSERT INTO "users" VALUES('88b63afc-0a84-4768-8d44-8528095cc71b','admin@payops.ai','$2b$12$VrDWOng9.LD4XsT9vXi/..YmfkMfm50fBTgfGmPpTddB.C5WCyvjG','Alex Vance (Admin)',1,'d772c918-063a-47df-86dc-1d6fc8d0a4c4','2026-11-03 07:59:19.518993','2026-11-05 06:31:55.613711');
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
