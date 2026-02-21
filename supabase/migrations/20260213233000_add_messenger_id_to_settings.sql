-- Add messenger_id to site_settings
INSERT INTO site_settings (id, value, type, description)
VALUES ('messenger_id', 'thestudiophofficial', 'text', 'Facebook Messenger Page ID or Username')
ON CONFLICT (id) DO NOTHING;
