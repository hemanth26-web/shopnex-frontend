import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import "./Products.css";

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

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await api.get("/products", { params });
        setProducts(data.products);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, sort, page, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const applyPriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set("minPrice", minPrice);
    else newParams.delete("minPrice");
    if (maxPrice) newParams.set("maxPrice", maxPrice);
    else newParams.delete("maxPrice");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const goToPage = (p) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", p);
    setSearchParams(newParams);
  };

  return (
    <div className="container products-page">
      <aside className="products-filters">
        <h3>Category</h3>
        <ul>
          <li>
            <button
              className={!category ? "active" : ""}
              onClick={() => updateParam("category", "")}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                className={category === cat ? "active" : ""}
                onClick={() => updateParam("category", cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>

        <h3>Price Range (₹)</h3>
        <div className="price-filter">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <button className="btn btn-outline price-apply-btn" onClick={applyPriceFilter}>
          Apply
        </button>
      </aside>

      <div className="products-main">
        <div className="products-toolbar">
          <p>{keyword ? `Results for "${keyword}"` : "All Products"}</p>
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
            <option value="">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="no-results">
            <p>No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === page ? "active" : ""}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
