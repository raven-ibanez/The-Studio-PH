-- Migration to add reservation_type to bookings table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'reservation_type') THEN
        ALTER TABLE bookings ADD COLUMN reservation_type text DEFAULT 'online';
    END IF;
END $$;

-- Update existing bookings to 'online' if they are null (though default 'online' should handle new ones)
UPDATE bookings SET reservation_type = 'online' WHERE reservation_type IS NULL;
