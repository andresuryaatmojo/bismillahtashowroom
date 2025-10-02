-- Mobilindo Showroom Database Schema
-- Script untuk membuat tabel-tabel di Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    profile_picture VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    price DECIMAL(15,2) NOT NULL CHECK (price > 0),
    condition VARCHAR(10) NOT NULL CHECK (condition IN ('new', 'used')),
    mileage INTEGER CHECK (mileage >= 0),
    color VARCHAR(50) NOT NULL,
    transmission VARCHAR(20) NOT NULL CHECK (transmission IN ('manual', 'automatic', 'cvt')),
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    engine_capacity INTEGER CHECK (engine_capacity > 0),
    description TEXT,
    features JSONB,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('available', 'sold', 'pending', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car Images table
CREATE TABLE IF NOT EXISTS car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- Test Drives table
CREATE TABLE IF NOT EXISTS test_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    payment_method VARCHAR(50),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_seller_id ON cars(seller_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON cars(brand, model);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_location ON cars(location);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at);

CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_car_images_primary ON car_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_car_id ON wishlists(car_id);

CREATE INDEX IF NOT EXISTS idx_test_drives_user_id ON test_drives(user_id);
CREATE INDEX IF NOT EXISTS idx_test_drives_car_id ON test_drives(car_id);
CREATE INDEX IF NOT EXISTS idx_test_drives_date ON test_drives(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_car_id ON transactions(car_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON reviews(car_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_chats_sender_id ON chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_chats_receiver_id ON chats(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chats_car_id ON chats(car_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_car_images_updated_at BEFORE UPDATE ON car_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_drives_updated_at BEFORE UPDATE ON test_drives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Cars are publicly readable but only owners can modify
CREATE POLICY "Cars are publicly readable" ON cars FOR SELECT USING (true);
CREATE POLICY "Users can insert own cars" ON cars FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);
CREATE POLICY "Users can update own cars" ON cars FOR UPDATE USING (auth.uid()::text = seller_id::text);
CREATE POLICY "Users can delete own cars" ON cars FOR DELETE USING (auth.uid()::text = seller_id::text);

-- Car images follow car permissions
CREATE POLICY "Car images are publicly readable" ON car_images FOR SELECT USING (true);
CREATE POLICY "Car owners can manage images" ON car_images FOR ALL USING (
    EXISTS (SELECT 1 FROM cars WHERE cars.id = car_images.car_id AND cars.seller_id::text = auth.uid()::text)
);

-- Wishlists are private to users
CREATE POLICY "Users can manage own wishlists" ON wishlists FOR ALL USING (auth.uid()::text = user_id::text);

-- Test drives are visible to involved parties
CREATE POLICY "Test drives visible to involved parties" ON test_drives FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (SELECT 1 FROM cars WHERE cars.id = test_drives.car_id AND cars.seller_id::text = auth.uid()::text)
);

-- Transactions are visible to involved parties
CREATE POLICY "Transactions visible to involved parties" ON transactions FOR SELECT USING (
    auth.uid()::text = buyer_id::text OR auth.uid()::text = seller_id::text
);

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id::text);

-- Chats are private to participants
CREATE POLICY "Chats visible to participants" ON chats FOR SELECT USING (
    auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text
);
CREATE POLICY "Users can send chats" ON chats FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);