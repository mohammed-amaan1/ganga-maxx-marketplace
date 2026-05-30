import React, { useState } from 'react';
import { ShoppingCart, Check, Tag } from 'lucide-react';

export default function ProductGrid({ catalog, onAddToCart }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [addedItemMap, setAddedItemMap] = useState({});

  const categories = ['All', 'Chemicals', 'Tools', 'Supplies'];

  const filteredCatalog = activeFilter === 'All'
    ? catalog
    : catalog.filter(item => item.category === activeFilter);

  const handleAddToCart = (productId) => {
    onAddToCart(productId, 1);
    setAddedItemMap(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [productId]: false }));
    }, 1500);
  };

  return (
    <div className="catalog-wrapper">
      <div className="catalog-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {filteredCatalog.map(product => (
          <div key={product.id} className="product-card">
            <div>
              <span className="prod-category">{product.category}</span>
              <h4 className="prod-name">{product.name}</h4>
              <span className="prod-brand">Brand: {product.brand}</span>
              <p className="prod-usage">{product.usage}</p>
              
              <div className="prod-discount-alert">
                <Tag size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                <span>{product.bulkDiscount}</span>
              </div>
            </div>

            <div className="prod-footer">
              <div className="prod-price-box">
                <span className="prod-price">₹{product.price}</span>
                <span className="prod-size">per {product.unitSize}</span>
              </div>
              
              <button
                className="add-cart-btn"
                title="Add to Quotation Cart"
                onClick={() => handleAddToCart(product.id)}
              >
                {addedItemMap[product.id] ? <Check size={16} /> : <ShoppingCart size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
