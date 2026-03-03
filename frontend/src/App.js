import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/ItemList';
import ItemForm from './pages/ItemForm';
import OrderList from './pages/OrderList';
import OrderForm from './pages/OrderForm';
import OrderDetail from './pages/OrderDetail';

const AppContent = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            {user && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/items"
                    element={
                        <ProtectedRoute>
                            <ItemList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/items/new"
                    element={
                        <ProtectedRoute>
                            <ItemForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/items/edit/:id"
                    element={
                        <ProtectedRoute>
                            <ItemForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <OrderList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders/new"
                    element={
                        <ProtectedRoute>
                            <OrderForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders/:id"
                    element={
                        <ProtectedRoute>
                            <OrderDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders/edit/:id"
                    element={
                        <ProtectedRoute>
                            <OrderForm />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;