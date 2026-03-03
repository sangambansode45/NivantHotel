const db = require('./db');

class Item {
    async create(itemData) {
        const { name, price, type, image, status } = itemData;
        const sql = 'INSERT INTO items (name, price, type, image, status) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, price, type, image, status || 'available']);
        return result;
    }

    async findAll() {
        const sql = 'SELECT * FROM items ORDER BY created_at DESC';
        return await db.query(sql);
    }

    async findById(id) {
        const sql = 'SELECT * FROM items WHERE id = ?';
        const results = await db.query(sql, [id]);
        return results[0];
    }

    async update(id, itemData) {
        const { name, price, type, image, status } = itemData;
        
        let sql = 'UPDATE items SET name = ?, price = ?, type = ?, status = ?';
        const params = [name, price, type, status];
        
        if (image) {
            sql += ', image = ?';
            params.push(image);
        }
        
        sql += ' WHERE id = ?';
        params.push(id);
        
        return await db.query(sql, params);
    }

    async delete(id) {
        const sql = 'DELETE FROM items WHERE id = ?';
        return await db.query(sql, [id]);
    }

    async findByStatus(status) {
        const sql = 'SELECT * FROM items WHERE status = ?';
        return await db.query(sql, [status]);
    }
}

module.exports = new Item();