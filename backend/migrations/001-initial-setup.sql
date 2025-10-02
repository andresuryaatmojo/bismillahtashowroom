-- Migration: 001-initial-setup.sql
-- Description: Initial database setup for Mobilindo Showroom
-- Created: 2024
-- Database: PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    "fullName" VARCHAR(255),
    "phoneNumber" VARCHAR(50),
    "address" TEXT,
    "profilePicture" VARCHAR(255),
    "isVerified" BOOLEAN DEFAULT false,
    "verificationToken" VARCHAR(255),
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpires" TIMESTAMP WITH TIME ZONE,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cars table
CREATE TABLE IF NOT EXISTS "Cars" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sellerId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "mileage" INTEGER,
    "fuelType" VARCHAR(50),
    "transmission" VARCHAR(50),
    "bodyType" VARCHAR(50),
    "color" VARCHAR(50),
    "engineCapacity" VARCHAR(50),
    "description" TEXT,
    "condition" VARCHAR(50) DEFAULT 'used',
    "location" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'inactive')),
    "isNegotiable" BOOLEAN DEFAULT true,
    "viewCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Car Images table
CREATE TABLE IF NOT EXISTS "CarImages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "carId" UUID NOT NULL REFERENCES "Cars"("id") ON DELETE CASCADE,
    "imageUrl" VARCHAR(500) NOT NULL,
    "isPrimary" BOOLEAN DEFAULT false,
    "caption" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS "Transactions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "buyerId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "sellerId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "carId" UUID NOT NULL REFERENCES "Cars"("id") ON DELETE CASCADE,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    "paymentMethod" VARCHAR(100),
    "paymentStatus" VARCHAR(50) DEFAULT 'pending',
    "transactionDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS "Wishlists" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "carId" UUID NOT NULL REFERENCES "Cars"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("userId", "carId")
);

-- Test Drives table
CREATE TABLE IF NOT EXISTS "TestDrives" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "carId" UUID NOT NULL REFERENCES "Cars"("id") ON DELETE CASCADE,
    "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    "notes" TEXT,
    "feedback" TEXT,
    "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS "Reviews" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "carId" UUID NOT NULL REFERENCES "Cars"("id") ON DELETE CASCADE,
    "transactionId" UUID REFERENCES "Transactions"("id") ON DELETE SET NULL,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "isVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS "Chats" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "senderId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "receiverId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "carId" UUID REFERENCES "Cars"("id") ON DELETE SET NULL,
    "message" TEXT NOT NULL,
    "messageType" VARCHAR(50) DEFAULT 'text' CHECK (messageType IN ('text', 'image', 'file')),
    "attachmentUrl" VARCHAR(255),
    "isRead" BOOLEAN DEFAULT false,
    "readAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_cars_seller" ON "Cars"("sellerId");
CREATE INDEX IF NOT EXISTS "idx_cars_brand_model" ON "Cars"("brand", "model");
CREATE INDEX IF NOT EXISTS "idx_cars_price" ON "Cars"("price");
CREATE INDEX IF NOT EXISTS "idx_cars_year" ON "Cars"("year");
CREATE INDEX IF NOT EXISTS "idx_cars_status" ON "Cars"("status");
CREATE INDEX IF NOT EXISTS "idx_transactions_buyer" ON "Transactions"("buyerId");
CREATE INDEX IF NOT EXISTS "idx_transactions_seller" ON "Transactions"("sellerId");
CREATE INDEX IF NOT EXISTS "idx_transactions_car" ON "Transactions"("carId");
CREATE INDEX IF NOT EXISTS "idx_chats_sender_receiver" ON "Chats"("senderId", "receiverId");
CREATE INDEX IF NOT EXISTS "idx_reviews_car" ON "Reviews"("carId");
CREATE INDEX IF NOT EXISTS "idx_testdrives_user_car" ON "TestDrives"("userId", "carId");

-- Insert default admin user (password: admin123)
INSERT INTO "Users" (
    "id", 
    "username", 
    "email", 
    "password", 
    "role", 
    "fullName", 
    "isVerified", 
    "isActive"
) VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@mobilindo.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
    'admin',
    'Administrator',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE "Users" IS 'Table for storing user information';
COMMENT ON TABLE "Cars" IS 'Table for storing car listings';
COMMENT ON TABLE "CarImages" IS 'Table for storing car images';
COMMENT ON TABLE "Transactions" IS 'Table for storing transaction records';
COMMENT ON TABLE "Wishlists" IS 'Table for storing user wishlists';
COMMENT ON TABLE "TestDrives" IS 'Table for storing test drive appointments';
COMMENT ON TABLE "Reviews" IS 'Table for storing car reviews and ratings';
COMMENT ON TABLE "Chats" IS 'Table for storing chat messages between users';