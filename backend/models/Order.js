const db = require('./db');

class Order {
    async create(orderData, items) {
        console.log('Order.create called with:', { orderData, items });
        
        let connection;
        try {
            // Get a connection from the pool
            connection = await db.getConnection();
            console.log('Got database connection');

            await connection.beginTransaction();
            console.log('Transaction started');

            // Generate order number
            const orderNumber = 'ORD' + Date.now();
            console.log('Generated order number:', orderNumber);

            // Insert order
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (order_number, customer_name, status, subtotal, discount, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    orderNumber, 
                    orderData.customer_name, 
                    'pending', 
                    orderData.subtotal, 
                    orderData.discount || 0, 
                    orderData.total_amount
                ]
            );

            const orderId = orderResult.insertId;
            console.log('Order inserted with ID:', orderId);

            // Insert order items
            for (const [index, item] of items.entries()) {
                console.log(`Inserting item ${index + 1}:`, item);
                
                const [itemResult] = await connection.execute(
                    'INSERT INTO order_items (order_id, item_id, item_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        orderId, 
                        item.item_id, 
                        item.item_name, 
                        item.quantity, 
                        item.price, 
                        item.subtotal
                    ]
                );
                
                console.log(`Item ${index + 1} inserted with ID:`, itemResult.insertId);
            }

            await connection.commit();
            console.log('Transaction committed successfully');

            return { orderId, orderNumber };
        } catch (error) {
            console.error('Error in Order.create:', error);
            if (connection) {
                await connection.rollback();
                console.log('Transaction rolled back');
            }
            throw error;
        } finally {
            if (connection) {
                connection.release();
                console.log('Database connection released');
            }
        }
    }

    async findAll() {
        try {
            console.log('Fetching all orders');
            const sql = 'SELECT * FROM orders ORDER BY created_at DESC';
            const orders = await db.query(sql);
            
            for (const order of orders) {
                order.items = await this.getOrderItems(order.id);
            }
            
            console.log(`Found ${orders.length} orders`);
            return orders;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            console.log('Fetching order by ID:', id);
            const sql = 'SELECT * FROM orders WHERE id = ?';
            const orders = await db.query(sql, [id]);
            
            if (orders.length > 0) {
                const order = orders[0];
                order.items = await this.getOrderItems(id);
                return order;
            }
            
            return null;
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    async getOrderItems(orderId) {
        try {
            console.log('Fetching items for order:', orderId);
            const sql = 'SELECT * FROM order_items WHERE order_id = ?';
            return await db.query(sql, [orderId]);
        } catch (error) {
            console.error('Error in getOrderItems:', error);
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            console.log('Updating order status:', { id, status });
            const sql = 'UPDATE orders SET status = ? WHERE id = ?';
            return await db.query(sql, [status, id]);
        } catch (error) {
            console.error('Error in updateStatus:', error);
            throw error;
        }
    }

    async generateBill(id, discount = 0) {
        try {
            console.log('Generating bill for order:', id);
            const order = await this.findById(id);
            if (!order) throw new Error('Order not found');

            const subtotal = order.subtotal;
            const total_amount = subtotal - discount;

            const sql = 'UPDATE orders SET discount = ?, total_amount = ?, payment_status = ?, bill_generated = ? WHERE id = ?';
            return await db.query(sql, [discount, total_amount, 'paid', true, id]);
        } catch (error) {
            console.error('Error in generateBill:', error);
            throw error;
        }
    }

    async getPendingOrders() {
        try {
            console.log('Fetching pending orders');
            const sql = "SELECT * FROM orders WHERE status IN ('pending', 'preparing') ORDER BY created_at ASC";
            const orders = await db.query(sql);
            
            for (const order of orders) {
                order.items = await this.getOrderItems(order.id);
            }
            
            return orders;
        } catch (error) {
            console.error('Error in getPendingOrders:', error);
            throw error;
        }
    }

    async updateStatus(id, status) {
        let connection;
        try {
            console.log('Order.updateStatus called with:', { id, status });
            
            connection = await db.getConnection();
            
            // Validate status
            const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid status: ${status}`);
            }
    
            const sql = 'UPDATE orders SET status = ? WHERE id = ?';
            const [result] = await connection.execute(sql, [status, id]);
            
            console.log('Update result:', result);
            
            if (result.affectedRows === 0) {
                throw new Error('No order found with ID: ' + id);
            }
            
            return result;
        } catch (error) {
            console.error('Error in Order.updateStatus:', error);
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = new Order();