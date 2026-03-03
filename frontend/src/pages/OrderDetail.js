import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrders, generateBill } from '../services/api';
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [discount, setDiscount] = useState(0);
    const [generatingBill, setGeneratingBill] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            const response = await fetchOrders();
            const foundOrder = response.data.find(o => o.id === parseInt(id));
            if (foundOrder) {
                setOrder(foundOrder);
                setDiscount(foundOrder.discount || 0);
            }
        } catch (err) {
            setError('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBill = async () => {
        setGeneratingBill(true);
        try {
            await generateBill(id, discount);
            loadOrder();
        } catch (err) {
            setError('Failed to generate bill');
        } finally {
            setGeneratingBill(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'preparing': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!order) return <div className="text-center py-12">Order not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Orders
            </button>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                                <p className="text-gray-600">{order.customer_name}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-2">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4">Order Items</h2>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Item</th>
                                    <th className="px-4 py-2 text-center">Quantity</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map(item => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-2">{item.item_name}</td>
                                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right">₹{item.price}</td>
                                        <td className="px-4 py-2 text-right">₹{item.subtotal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Bill Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold">₹{order.subtotal}</span>
                            </div>
                            
                            {!order.bill_generated ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Discount:</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 border rounded text-right"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            ) : (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount:</span>
                                    <span className="font-semibold">₹{order.discount}</span>
                                </div>
                            )}

                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span>₹{order.bill_generated ? order.total_amount : order.subtotal - discount}</span>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className={`px-2 py-1 rounded text-sm ${
                                    order.payment_status === 'paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {order.payment_status}
                                </span>
                            </div>

                            {order.bill_generated && (
                                <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-center">
                                    Bill Generated on {new Date(order.updated_at).toLocaleString()}
                                </div>
                            )}
                        </div>

                        {!order.bill_generated && order.status !== 'cancelled' && (
                            <button
                                onClick={handleGenerateBill}
                                disabled={generatingBill}
                                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-green-300 mb-3"
                            >
                                {generatingBill ? 'Generating...' : 'Generate Bill'}
                            </button>
                        )}

                        <button
                            onClick={handlePrint}
                            className="w-full bg-gray-600 text-white py-3 rounded hover:bg-gray-700 flex items-center justify-center"
                        >
                            <PrinterIcon className="h-5 w-5 mr-2" />
                            Print Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;