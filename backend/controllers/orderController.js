const Order = require('../models/Order');
const Item = require('../models/Item');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { customer_name, items, discount } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const itemDetails = await Item.findById(item.item_id);
            
            if (!itemDetails) {
                return res.status(404).json({ message: `Item with ID ${item.item_id} not found` });
            }

            const itemPrice = parseFloat(itemDetails.price);
            const itemQuantity = parseInt(item.quantity);
            const itemSubtotal = itemPrice * itemQuantity;
            subtotal += itemSubtotal;

            orderItems.push({
                item_id: item.item_id,
                item_name: itemDetails.name,
                quantity: itemQuantity,
                price: itemPrice,
                subtotal: itemSubtotal
            });
        }

        const discountValue = parseFloat(discount) || 0;
        const total_amount = subtotal - discountValue;

        const result = await Order.create(
            { 
                customer_name: customer_name || 'Walk-in Customer', 
                subtotal, 
                discount: discountValue, 
                total_amount 
            },
            orderItems
        );

        res.status(201).json({
            message: 'Order created successfully',
            orderId: result.orderId,
            orderNumber: result.orderNumber
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single order by ID
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.bill_generated) {
            return res.status(400).json({ message: 'Cannot update status after bill is generated' });
        }

        await Order.updateStatus(req.params.id, status);
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Generate bill for order
exports.generateBill = async (req, res) => {
    try {
        const { discount } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.bill_generated) {
            return res.status(400).json({ message: 'Bill already generated' });
        }

        await Order.generateBill(req.params.id, discount || 0);
        
        const updatedOrder = await Order.findById(req.params.id);
        
        res.json({ 
            message: 'Bill generated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error generating bill:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pending orders
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.getPendingOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update entire order - THIS WAS PROBABLY MISSING
exports.updateOrder = async (req, res) => {
    try {
        const { items, discount } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.bill_generated) {
            return res.status(400).json({ message: 'Cannot update order after bill is generated' });
        }

        if (order.status === 'completed' || order.status === 'cancelled') {
            return res.status(400).json({ message: `Cannot update ${order.status} order` });
        }

        // Calculate new totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const itemDetails = await Item.findById(item.item_id);
            if (!itemDetails) {
                return res.status(404).json({ message: `Item with ID ${item.item_id} not found` });
            }

            const itemSubtotal = itemDetails.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                item_id: item.item_id,
                item_name: itemDetails.name,
                quantity: item.quantity,
                price: itemDetails.price,
                subtotal: itemSubtotal
            });
        }

        const total_amount = subtotal - (discount || 0);

        await Order.updateOrder(req.params.id, orderItems, subtotal, total_amount);

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};