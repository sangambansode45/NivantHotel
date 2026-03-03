import React from 'react';

const ItemCard = ({ item, onSelect, isSelected }) => {
    return (
        <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
            onClick={() => onSelect(item)}
        >
            {item.image && (
                <img 
                    src={`http://localhost:5000${item.image}`} 
                    alt={item.name}
                    className="w-full h-32 object-cover rounded mb-2"
                />
            )}
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-gray-600">₹{item.price}</p>
            <span className={`text-xs px-2 py-1 rounded ${
                item.type === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {item.type}
            </span>
            <span className={`ml-2 text-xs px-2 py-1 rounded ${
                item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
                {item.status}
            </span>
        </div>
    );
};

export default ItemCard;