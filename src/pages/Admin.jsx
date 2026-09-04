import { useEffect, useState } from "react";
import api from "../utils/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import "./Admin.css";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  category: "Electronics",
  brand: "",
  images: "",
  stock: "",
  featured: false,
};

const categories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Books",
  "Beauty",
  "Sports",
  "Toys",
  "Grocery",
];

const Admin = () => {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProduct);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get("/products?limit=100"),
        api.get("/orders"),
      ]);
      setProducts(productsRes.data.products);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        images: form.images.split(",").map((url) => url.trim()).filter(Boolean),
      });
      toast.success("Product created");
      setForm(emptyProduct);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Order status updated");
      fetchData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container admin-page">
      <h1>Admin Dashboard</h1>

      <div className="profile-tabs">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
          Products ({products.length})
        </button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
          Orders ({orders.length})
        </button>
      </div>

      {tab === "products" && (
        <div className="admin-grid">
          <form className="card admin-form" onSubmit={handleCreateProduct}>
            <h3>Add New Product</h3>
            <input
              className="input-field"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <textarea
              className="input-field"
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <div className="admin-form-row">
              <input
                className="input-field"
                type="number"
                placeholder="Price (₹)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                className="input-field"
                type="number"
                placeholder="MRP (₹)"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-row">
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                className="input-field"
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <input
              className="input-field"
              placeholder="Image URLs (comma separated)"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              required
            />
            <input
              className="input-field"
              type="number"
              placeholder="Stock quantity"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Show in featured section
            </label>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Product"}
            </button>
          </form>

          <div className="admin-product-list">
            {products.map((p) => (
              <div className="admin-product-row card" key={p._id}>
                <img src={p.images[0]} alt={p.name} />
                <div className="admin-product-info">
                  <p className="item-name">{p.name}</p>
                  <p className="muted">₹{p.price} · Stock: {p.stock} · {p.category}</p>
                </div>
                <button className="address-delete-btn" onClick={() => handleDeleteProduct(p._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <div className="card admin-order-row" key={order._id}>
              <div>
                <p className="item-name">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="muted">{order.user?.name} ({order.user?.email})</p>
                <p className="muted">₹{order.totalPrice.toLocaleString("en-IN")} · {order.orderItems.length} items</p>
              </div>
              <select
                className="input-field"
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
