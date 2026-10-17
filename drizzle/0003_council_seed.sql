-- Council members previously hard-coded on the council page (sample data; edit or replace with the real council).
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order, council_since, council_statement, bio) VALUES ('C01', 'الشيخ عبد العزيز بن فهد', 'male', 'alive', 'الرياض', 'رئيس المجلس', 1, '٢٠٢٢', 'نعتز بجمعتنا ونسعى لرفعة العائلة وتلاحمها في ظل قيمنا الأصيلة، إن هذا المجلس هو المظلة التي تجمع شتات الأفكار لتصيغ منها مستقبلاً مشرقاً لأجيالنا القادمة.', E'رئيس مجلس العائلة، وشخصية قيادية بارزة ساهمت في تأسيس العديد من المبادرات الخيرية والاجتماعية.\nيتميز بحكمته ورؤيته المستقبلية التي ساهمت في جمع شمل العائلة وتوحيد كلمتها.') ON CONFLICT (serial_number) DO NOTHING;
--> statement-breakpoint
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order, council_since, bio) VALUES ('C02', 'سعادة الأستاذ منصور', 'male', 'alive', 'المنطقة الوسطى (الرياض)', 'نائب رئيس المجلس', 2, '١٤٤١ هـ', E'نائب رئيس المجلس، يمتلك خبرة إدارية واسعة في القطاع الحكومي والخاص.\nيشرف على تنفيذ المبادرات الاستراتيجية للمجلس ومتابعة لجان العمل.') ON CONFLICT (serial_number) DO NOTHING;
--> statement-breakpoint
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order, council_since, bio) VALUES ('C03', 'المهندس خالد', 'male', 'alive', 'المنطقة الغربية (جدة)', 'أمين الصندوق', 3, '١٤٤٢ هـ', E'أمين صندوق العائلة، مهندس مالي ذو خبرة في إدارة المحافظ الاستثمارية.\nيعمل على تنمية موارد الصندوق العائلي وضمان استدامته المالية.') ON CONFLICT (serial_number) DO NOTHING;
--> statement-breakpoint
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order, council_since, bio) VALUES ('C04', 'الدكتور محمد', 'male', 'alive', 'المنطقة الشرقية (الدمام)', 'أمين السر العام', 4, '١٤٤٣ هـ', E'أمين سر المجلس، أكاديمي وباحث في مجال التاريخ والآداب.\nيتولى توثيق اجتماعات المجلس وحفظ سجلات العائلة التاريخية.') ON CONFLICT (serial_number) DO NOTHING;
--> statement-breakpoint
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order) VALUES ('C05', 'الأستاذ فهد', 'male', 'alive', 'منطقة حائل', 'ممثل فرع الشمال', 5) ON CONFLICT (serial_number) DO NOTHING;
--> statement-breakpoint
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order) VALUES ('C06', 'الشيخ سلطان', 'male', 'alive', 'منطقة عسير (أبها)', 'ممثل فرع الجنوب', 6) ON CONFLICT (serial_number) DO NOTHING;
--> statement-breakpoint
INSERT INTO members (serial_number, full_name, gender, status, location, council_role, council_order) VALUES ('C07', 'الأستاذ إبراهيم', 'male', 'alive', 'منطقة القصيم (بريدة)', 'ممثل فرع القصيم', 7) ON CONFLICT (serial_number) DO NOTHING;
