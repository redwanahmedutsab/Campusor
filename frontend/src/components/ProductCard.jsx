// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';

const CONDITION_COLORS = {
  new:       'bg-green-100 text-green-700',
  like_new:  'bg-blue-100 text-blue-700',
  good:      'bg-yellow-100 text-yellow-700',
  fair:      'bg-orange-100 text-orange-700',
  for_parts: 'bg-red-100 text-red-700',
};

const ProductCard = ({ product }) => {
  const formatPrice = (p) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(p);

  return (
    <Link to={`/marketplace/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {product.primary_image ? (
            <img src={product.primary_image} alt={product.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white font-bold px-4 py-1.5 rounded-full text-sm">SOLD</span>
            </div>
          )}
          {product.is_free && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">FREE</span>
          )}
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full ${CONDITION_COLORS[product.condition] || 'bg-gray-100 text-gray-600'}`}>
            {product.condition?.replace('_', ' ')}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-semibold text-gray-900 truncate">{product.title}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-lg font-bold text-indigo-600">
              {product.is_free ? 'Free' : formatPrice(product.price)}
            </span>
            {product.category_icon && (
              <span className="text-lg">{product.category_icon}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 truncate">{product.seller_name}</span>
            {product.location && (
              <span className="text-xs text-gray-400">📍 {product.location}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
