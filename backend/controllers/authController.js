const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('========== LOGIN ATTEMPT ==========');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Request body:', req.body);

        // Get admin from database
        console.log('Querying database for user:', username);
        const admins = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
        
        console.log('Database result:', admins);
        
        if (admins.length === 0) {
            console.log('User not found in database');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const admin = admins[0];
        console.log('User found:', { id: admin.id, username: admin.username, passwordHash: admin.password });

        // Compare passwords
        console.log('Comparing passwords...');
        console.log('Input password:', password);
        console.log('Stored hash:', admin.password);
        
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Login successful, token generated');
        console.log('====================================');
        
        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('========== LOGIN ERROR ==========');
        console.error('Error details:', error);
        console.error('==================================');
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.verify = async (req, res) => {
    try {
        res.json({ valid: true });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
};