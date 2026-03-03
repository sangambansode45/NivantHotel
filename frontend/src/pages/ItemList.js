import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchItems, deleteItem } from '../services/api';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const response = await fetchItems();
            setItems(response.data);
        } catch (err) {
            setError('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem(id);
                loadItems();
            } catch (err) {
                setError('Failed to delete item');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Menu Items</h1>
                <Link
                    to="/items/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Item
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                        {item.image && (
                            <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold">{item.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded ${
                                    item.type === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.type}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mb-2">₹{item.price}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                                item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {item.status}
                            </span>
                            
                            <div className="flex justify-end space-x-2 mt-4">
                                <Link
                                    to={`/items/edit/${item.id}`}
                                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No items in the menu yet</p>
                    <Link
                        to="/items/new"
                        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                    >
                        Add Your First Item
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ItemList;