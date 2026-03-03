import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, fetchItems } from '../services/api';
import { ShoppingCartIcon, CubeIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalItems: 0,
        pendingOrders: 0,
        todayRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [ordersRes, itemsRes] = await Promise.all([
                fetchOrders(),
                fetchItems()
            ]);

            const orders = ordersRes.data;
            const items = itemsRes.data;

            // Calculate today's revenue
            const today = new Date().toDateString();
            const todayOrders = orders.filter(order => 
                new Date(order.created_at).toDateString() === today && 
                order.payment_status === 'paid'
            );
            const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

            setStats({
                totalOrders: orders.length,
                totalItems: items.length,
                pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
                todayRevenue
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-3">
                            <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-3">
                            <CubeIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500">Menu Items</p>
                            <p className="text-2xl font-bold">{stats.totalItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-yellow-100 rounded-full p-3">
                            <ClockIcon className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500">Pending Orders</p>
                            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 rounded-full p-3">
                            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500">Today's Revenue</p>
                            <p className="text-2xl font-bold">₹{stats.todayRevenue}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link to="/orders/new" className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700">
                    <h3 className="text-xl font-bold mb-2">New Order</h3>
                    <p>Create a new order for customer</p>
                </Link>
                <Link to="/orders" className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700">
                    <h3 className="text-xl font-bold mb-2">View Orders</h3>
                    <p>Manage and track all orders</p>
                </Link>
                <Link to="/items/new" className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700">
                    <h3 className="text-xl font-bold mb-2">Add Item</h3>
                    <p>Add new item to menu</p>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-bold">Recent Orders</h2>
                </div>
                <div className="p-6">
                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500">No orders yet</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <p className="font-semibold">{order.order_number}</p>
                                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{order.total_amount}</p>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;