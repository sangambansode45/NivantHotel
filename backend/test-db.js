const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        console.log('✅ Successfully connected to MySQL!');
        
        // Try to create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS restaurant_pos');
        console.log('✅ Database created/verified');
        
        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();