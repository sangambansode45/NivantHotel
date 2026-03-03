const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

exports.createItem = async (req, res) => {
    try {
        const { name, price, type, status } = req.body;
        
        console.log('Creating item with data:', { name, price, type, status });
        console.log('File:', req.file);

        if (!name || !price || !type) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Handle image path
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
            console.log('Image saved at:', imagePath);
        }

        const itemData = {
            name,
            price: parseFloat(price),
            type,
            image: imagePath,
            status: status || 'available'
        };

        const result = await Item.create(itemData);

        res.status(201).json({ 
            message: 'Item created successfully', 
            itemId: result.insertId,
            image: imagePath
        });
    } catch (error) {
        console.error('Error creating item:', error);
        
        // If there was an error and file was uploaded, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.findAll();
        
        // Ensure image URLs are correct
        const itemsWithFullImageUrl = items.map(item => ({
            ...item,
            image: item.image ? item.image : null
        }));
        
        res.json(itemsWithFullImageUrl);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Ensure image URL is correct
        item.image = item.image ? item.image : null;
        
        res.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { name, price, type, status } = req.body;
        
        console.log('Updating item:', req.params.id);
        console.log('Update data:', { name, price, type, status });
        console.log('File:', req.file);

        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Handle image update
        let imagePath = item.image; // Keep old image by default
        
        if (req.file) {
            // New image uploaded
            imagePath = `/uploads/${req.file.filename}`;
            
            // Delete old image if it exists
            if (item.image) {
                const oldImagePath = path.join(__dirname, '../', item.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }
            }
        }

        await Item.update(req.params.id, {
            name,
            price: parseFloat(price),
            type,
            image: imagePath,
            status
        });

        res.json({ 
            message: 'Item updated successfully',
            image: imagePath
        });
    } catch (error) {
        console.error('Error updating item:', error);
        
        // If there was an error and new file was uploaded, delete it
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Delete image file if it exists
        if (item.image) {
            const imagePath = path.join(__dirname, '../', item.image);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting image:', err);
                });
            }
        }

        await Item.delete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};