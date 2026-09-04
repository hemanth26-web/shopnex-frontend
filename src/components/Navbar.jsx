import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiSearch, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          Shop<span>Nex</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <FiSearch size={18} />
          </button>
        </form>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart">
            <FiShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-user-menu">
              <button className="navbar-user-btn">
                <FiUser size={20} />
                <span>{user.name.split(" ")[0]}</span>
              </button>
              <div className="navbar-dropdown">
                <Link to="/profile">My Profile</Link>
                <Link to="/orders">My Orders</Link>
                {user.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary navbar-login-btn">
              Login
            </Link>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </form>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Cart ({cartCount})
          </Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
