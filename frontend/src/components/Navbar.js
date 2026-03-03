import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, CubeIcon, ShoppingCartIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 text-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <HomeIcon className="h-6 w-6" />
                            <span className="font-bold">Restaurant POS</span>
                        </Link>
                        <Link to="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded flex items-center">
                            <ChartBarIcon className="h-5 w-5 mr-1" />
                            Dashboard
                        </Link>
                        <Link to="/orders" className="hover:bg-gray-700 px-3 py-2 rounded flex items-center">
                            <ShoppingCartIcon className="h-5 w-5 mr-1" />
                            Orders
                        </Link>
                        <Link to="/items" className="hover:bg-gray-700 px-3 py-2 rounded flex items-center">
                            <CubeIcon className="h-5 w-5 mr-1" />
                            Items
                        </Link>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;