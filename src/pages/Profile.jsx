import { useState } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiTrash2, FiPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./Profile.css";

const Profile = () => {
  const { user, updateUserInStorage } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false,
  });
  const [addingAddress, setAddingAddress] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUserInStorage(data.user);
      toast.success("Profile updated successfully");
      setForm({ ...form, password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      const { data } = await api.post("/auth/address", newAddress);
      updateUserInStorage({ ...user, addresses: data.addresses });
      toast.success("Address added");
      setNewAddress({
        label: "Home",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        isDefault: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`);
      updateUserInStorage({ ...user, addresses: data.addresses });
      toast.success("Address removed");
    } catch {
      toast.error("Failed to remove address");
    }
  };

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          Profile Details
        </button>
        <button
          className={activeTab === "addresses" ? "active" : ""}
          onClick={() => setActiveTab("addresses")}
        >
          Addresses
        </button>
      </div>

      {activeTab === "details" && (
        <form className="profile-form card" onSubmit={handleProfileUpdate}>
          <div className="form-row">
            <label><FiUser size={14} /> Full Name</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <label><FiMail size={14} /> Email</label>
            <input type="email" className="input-field" value={user.email} disabled />
          </div>

          <div className="form-row">
            <label><FiPhone size={14} /> Phone Number</label>
            <input
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Add a phone number"
            />
          </div>

          <div className="form-row">
            <label><FiLock size={14} /> New Password</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {activeTab === "addresses" && (
        <div className="addresses-section">
          {user.addresses?.length > 0 && (
            <div className="address-list">
              {user.addresses.map((addr) => (
                <div className="address-card card" key={addr._id}>
                  <div className="address-card-header">
                    <span className="address-label">
                      <FiMapPin size={14} /> {addr.label}
                    </span>
                    {addr.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  <p>
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="muted">Phone: {addr.phone}</p>
                  <button
                    className="address-delete-btn"
                    onClick={() => handleDeleteAddress(addr._id)}
                  >
                    <FiTrash2 size={14} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <form className="profile-form card" onSubmit={handleAddAddress}>
            <h3><FiPlus size={16} /> Add New Address</h3>

            <div className="form-row">
              <label>Label</label>
              <input
                type="text"
                className="input-field"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                placeholder="Home, Work, etc."
              />
            </div>

            <div className="form-row">
              <label>Street Address</label>
              <input
                type="text"
                className="input-field"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                required
              />
            </div>

            <div className="form-row-grid">
              <div className="form-row">
                <label>City</label>
                <input
                  type="text"
                  className="input-field"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>State</label>
                <input
                  type="text"
                  className="input-field"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-row">
                <label>Pincode</label>
                <input
                  type="text"
                  className="input-field"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
              />
              Set as default address
            </label>

            <button type="submit" className="btn btn-secondary" disabled={addingAddress}>
              {addingAddress ? "Adding..." : "Add Address"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
