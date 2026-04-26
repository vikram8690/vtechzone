-- ============================================
-- vTechZone Database Setup Script
-- SQL Server
-- ============================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'vtechzone')
BEGIN
    CREATE DATABASE vtechzone;
END
GO

USE vtechzone;
GO

-- ============================================
-- TABLE: users
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- TABLE: messages
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='messages' AND xtype='U')
BEGIN
    CREATE TABLE messages (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- TABLE: services
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='services' AND xtype='U')
BEGIN
    CREATE TABLE services (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        image VARCHAR(500),
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- TABLE: projects
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='projects' AND xtype='U')
BEGIN
    CREATE TABLE projects (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        technology VARCHAR(200) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- ============================================
-- SEED: Default Admin User
-- Password: Admin@123 (bcrypt hashed)
-- ============================================
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@vtechzone.in')
BEGIN
    INSERT INTO users (name, email, password, role)
    VALUES (
        'Admin',
        'admin@vtechzone.in',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/PSLwx1y',
        'admin'
    );
END
GO

-- ============================================
-- SEED: Sample Services
-- ============================================
IF NOT EXISTS (SELECT * FROM services WHERE title = 'Laptop Repair')
BEGIN
    INSERT INTO services (title, description, image) VALUES
    ('Laptop Repair', 'Expert laptop repair services including screen replacement, motherboard repair, keyboard fix, charging port repair, and all software issues. We use genuine parts and provide 30-day warranty on repairs.', 'laptop-repair'),
    ('Computer Hardware', 'Buy, upgrade, or replace computer hardware components. We deal in CPUs, RAM, Hard Disks, SSDs, Graphics Cards, Motherboards, Power Supplies, and complete PC builds at affordable prices.', 'computer-hardware'),
    ('Software Development', 'Custom software solutions including websites, web applications, mobile apps, desktop software, and database management systems. Built with modern technologies and best practices.', 'software-dev'),
    ('Student Projects', 'Complete project assistance for BCA, MCA, B.Tech, and other IT courses. We help with project ideas, development, documentation, and presentation. Get your dream project done!', 'student-projects');
END
GO

-- ============================================
-- SEED: Sample Projects
-- ============================================
IF NOT EXISTS (SELECT * FROM projects WHERE title = 'Hospital Management System')
BEGIN
    INSERT INTO projects (title, technology, description) VALUES
    ('Hospital Management System', 'PHP, MySQL, Bootstrap', 'A complete hospital management system with patient records, doctor scheduling, billing, and pharmacy management. Built for BCA final year project.'),
    ('E-Commerce Website', 'Node.js, React, MongoDB', 'Full-featured online shopping platform with product catalog, cart, payment gateway integration, and admin panel. MCA semester project.'),
    ('Attendance Management System', 'Python, Django, SQLite', 'Smart attendance system with facial recognition support, automated reports, and email notifications for institutions.'),
    ('Library Management System', 'Java, MySQL, Swing', 'Complete library management with book catalog, member management, issue/return tracking, and fine calculation. B.Tech project.'),
    ('Online Voting System', 'PHP, MySQL, JavaScript', 'Secure online voting platform with OTP verification, real-time result tracking, and admin management. Final year project.'),
    ('Inventory Management', 'ASP.NET, SQL Server', 'Business inventory tracking system with stock alerts, purchase orders, sales reports, and barcode support.');
END
GO

PRINT '✅ vTechZone Database setup complete!';
PRINT 'Admin Login: admin@vtechzone.in / Admin@123';
GO
