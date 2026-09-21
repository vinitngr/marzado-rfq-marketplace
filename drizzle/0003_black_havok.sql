CREATE INDEX "category_idx" ON "rfqs" USING btree ("category_id");--> statement-breakpoint
INSERT INTO "categories" ("id", "name", "slug", "description") VALUES
	('00000000-0000-4000-8000-000000000001', 'Electronics', 'electronics', 'Devices, components, and technology equipment.'),
	('00000000-0000-4000-8000-000000000002', 'Packaging', 'packaging', 'Boxes, labels, wrapping, and shipping materials.'),
	('00000000-0000-4000-8000-000000000003', 'Office Supplies', 'office-supplies', 'Furniture, stationery, and workplace essentials.'),
	('00000000-0000-4000-8000-000000000004', 'Industrial', 'industrial', 'Machinery, tools, parts, and production supplies.'),
	('00000000-0000-4000-8000-000000000005', 'Food & Beverage', 'food-beverage', 'Ingredients, packaged goods, and hospitality supplies.'),
	('00000000-0000-4000-8000-000000000006', 'Services', 'services', 'Professional, logistics, maintenance, and other services.')
ON CONFLICT ("slug") DO NOTHING;