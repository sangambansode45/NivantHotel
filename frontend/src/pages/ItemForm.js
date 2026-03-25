import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createItem,
  updateItem,
  fetchItemById,
} from "../services/api";

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    type: "veg",
    status: "available",
    image: null,
  });

  useEffect(() => {
    if (id) loadItem();
  }, [id]);

  // ✅ FIXED: using fetchItemById + Cloudinary
  const loadItem = async () => {
    try {
      const res = await fetchItemById(id);
      const item = res.data;

      setFormData({
        name: item.name,
        price: item.price,
        type: item.type,
        status: item.status,
        image: null,
      });

      if (item.image) {
        setImagePreview(item.image); // ✅ Cloudinary URL
      }
    } catch (err) {
      setError("Failed to load item");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });

      if (file) {
        setImagePreview(URL.createObjectURL(file)); // ✅ preview
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("status", formData.status);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (id) {
        await updateItem(id, formDataToSend);
      } else {
        await createItem(formDataToSend);
      }

      setSuccess("Item saved successfully!");

      setTimeout(() => {
        navigate("/items");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {id ? "Edit Item" : "Add New Item"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6"
        encType="multipart/form-data"
      >
        {/* NAME */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Item Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* PRICE */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* TYPE */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
        </div>

        {/* STATUS */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* IMAGE */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Item Image</label>

          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded border"
              />
            </div>
          )}

          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className="w-full"
          />

          {id && (
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to keep existing image
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading
              ? "Saving..."
              : id
              ? "Update Item"
              : "Create Item"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/items")}
            className="flex-1 bg-gray-300 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;