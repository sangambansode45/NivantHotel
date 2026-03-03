import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchItems, createOrder, updateOrder, fetchOrders } from '../services/api';
import ItemCard from '../components/ItemCard';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

const OrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('Walk-in Customer');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    useEffect(() => {
        loadItems();
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadItems = async () => {
        try {
            const response = await fetchItems();
            // Ensure prices are numbers
            const itemsWithNumberPrices = response.data.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0
            }));
            setItems(itemsWithNumberPrices.filter(item => item.status === 'available'));
        } catch (err) {
            setError('Failed to load items');
        }
    };

    const loadOrder = async () => {
        try {
            const response = await fetchOrders();
            const foundOrder = response.data.find(o => o.id === parseInt(id));
            if (foundOrder) {
                setOrder(foundOrder);
                setCustomerName(foundOrder.customer_name);
                setDiscount(parseFloat(foundOrder.discount) || 0);
                
                // Load cart from order items with proper number conversion
                const cartItems = foundOrder.items.map(item => ({
                    item_id: item.item_id,
                    name: item.item_name,
                    price: parseFloat(item.price) || 0,
                    quantity: parseInt(item.quantity) || 1,
                    subtotal: parseFloat(item.subtotal) || 0
                }));
                setCart(cartItems);
            }
        } catch (err) {
            setError('Failed to load order');
        }
    };

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.item_id === item.id);
        
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.item_id === item.id
                    ? { 
                        ...cartItem, 
                        quantity: cartItem.quantity + 1, 
                        subtotal: (cartItem.quantity + 1) * cartItem.price 
                      }
                    : cartItem
            ));
        } else {
            setCart([...cart, {
                item_id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                subtotal: item.price
            }]);
        }
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            setCart(cart.map(item =>
                item.item_id === itemId
                    ? { 
                        ...item, 
                        quantity: newQuantity, 
                        subtotal: newQuantity * item.price 
                      }
                    : item
            ));
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.item_id !== itemId));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => {
            const itemSubtotal = typeof item.subtotal === 'number' ? item.subtotal : parseFloat(item.subtotal) || 0;
            return sum + itemSubtotal;
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discountValue = typeof discount === 'number' ? discount : parseFloat(discount) || 0;
        return subtotal - discountValue;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            setError('Please add at least one item to the order');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const subtotal = calculateSubtotal();
            const total = calculateTotal();

            const orderData = {
                customer_name: customerName,
                items: cart.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity
                })),
                discount: parseFloat(discount) || 0,
                subtotal: subtotal,
                total_amount: total
            };

            if (id) {
                await updateOrder(id, orderData);
            } else {
                await createOrder(orderData);
            }

            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">
                {id ? 'Edit Order' : 'New Order'}
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items Grid */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Menu Items</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {items.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onSelect={addToCart}
                                isSelected={cart.some(cartItem => cartItem.item_id === item.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Cart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Current Order</h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Customer Name</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Walk-in Customer"
                        />
                    </div>

                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No items added</p>
                    ) : (
                        <div className="space-y-4 mb-4">
                            {cart.map(item => (
                                <div key={item.item_id} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                                            className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                                        >
                                            <MinusIcon className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                                            className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.item_id)}
                                            className="bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Discount:</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-20 px-2 py-1 border rounded text-right"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || cart.length === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Processing...' : (id ? 'Update Order' : 'Create Order')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;