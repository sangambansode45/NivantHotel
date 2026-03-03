const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    
    try {
        // First connect without specifying database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'yourpassword'
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS restaurant_pos');
        console.log('Database "restaurant_pos" created or already exists');

        // Switch to the database
        await connection.execute('USE restaurant_pos');

        // Create admin table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Admin table created');

        // Create items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                type ENUM('veg', 'nonveg') NOT NULL,
                image VARCHAR(255),
                status ENUM('available', 'unavailable') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Items table created');

        // Create orders table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_number VARCHAR(20) UNIQUE NOT NULL,
                customer_name VARCHAR(100) DEFAULT 'Walk-in Customer',
                status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
                subtotal DECIMAL(10,2) NOT NULL,
                discount DECIMAL(10,2) DEFAULT 0.00,
                total_amount DECIMAL(10,2) NOT NULL,
                payment_status ENUM('pending', 'paid') DEFAULT 'pending',
                bill_generated BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Orders table created');

        // Create order_items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT,
                item_id INT,
                item_name VARCHAR(100),
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id)
            )
        `);
        console.log('Order items table created');

        // Check if admin exists
        const [admins] = await connection.execute('SELECT * FROM admin WHERE username = ?', ['admin']);
        
        if (admins.length === 0) {
            // Create admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.execute(
                'INSERT INTO admin (username, password) VALUES (?, ?)',
                ['admin', hashedPassword]
            );
            console.log('Admin user created with username: admin, password: admin123');
        } else {
            console.log('Admin user already exists');
        }

        console.log('\n✅ Database initialization completed successfully!');
        console.log('You can now start your backend server with: npm run dev');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();