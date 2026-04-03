// src/pages/MarketplaceDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, markSold, deleteProduct } from '../api/marketplaceAPI';
import useAuth from '../hooks/useAuth';

const CONDITION_LABELS = {
  new: { label: 'Brand New', color: 'bg-green-100 text-green-700' },
  like_new: { label: 'Like New', color: 'bg-blue-100 text-blue-700' },
  good: { label: 'Good', color: 'bg-yellow-100 text-yellow-700' },
  fair: { label: 'Fair', color: 'bg-orange-100 text-orange-700' },
  for_parts: { label: 'For Parts', color: 'bg-red-100 text-red-700' },
};

const MarketplaceDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeImg,  setActiveImg]  = useState(0);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    getProductById(id)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/marketplace'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(p);

  const handleCopyContact = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleMarkSold = async () => {
    if (!window.confirm('Mark this item as sold?')) return;
    await markSold(id);
    setProduct(p => ({ ...p, status: 'sold' }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    await deleteProduct(id);
    navigate('/marketplace');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (!product) return null;

  const images    = product.images || [];
  const condition = CONDITION_LABELS[product.condition] || { label: product.condition, color: 'bg-gray-100 text-gray-600' };
  const isOwner   = product.is_owner;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/marketplace')} className="hover:text-indigo-600">Marketplace</button>
          <span>›</span>
          <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── Left: Images ── */}
          <div>
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden h-80 md:h-96">
              {images.length > 0 ? (
                <img src={images[activeImg]?.image} alt={product.title}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
              )}
              {product.status === 'sold' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-black text-xl px-6 py-2 rounded-full">SOLD</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImg === i ? 'border-indigo-500' : 'border-gray-200'
                    }`}>
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="space-y-5">

            {/* Title & price */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl font-black text-gray-900">{product.title}</h1>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${condition.color}`}>
                  {condition.label}
                </span>
              </div>
              <div className="text-3xl font-black text-indigo-600">
                {product.is_free ? '🎁 Free' : formatPrice(product.price)}
              </div>
              {product.category_name && (
                <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.category_name}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📍</span><span>{product.location}</span>
              </div>
            )}

            {/* Seller card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Seller</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  {product.seller_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.seller_name}</p>
                  {product.seller_dept && (
                    <p className="text-xs text-gray-500">{product.seller_dept}</p>
                  )}
                </div>
              </div>

              {!isOwner && isAuthenticated && (
                <div className="space-y-2">
                  {product.seller_email && (
                    <button
                      onClick={() => handleCopyContact(product.seller_email)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-sm transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>✉️</span>
                        <span className="text-gray-700">{product.seller_email}</span>
                      </span>
                      <span className="text-xs text-indigo-600 font-semibold">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  )}
                  {product.seller_phone && (
                    <a href={`tel:${product.seller_phone}`}
                      className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-sm text-green-700 font-semibold transition-colors">
                      <span>📞</span> {product.seller_phone}
                    </a>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold">Login</button> to see contact info
                </p>
              )}
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-3">
                {product.status === 'active' && (
                  <button onClick={handleMarkSold}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                    ✓ Mark as Sold
                  </button>
                )}
                <button onClick={handleDelete}
                  className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl text-sm transition-colors">
                  🗑 Delete Listing
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
              <span>👁 {product.views_count} views</span>
              <span>📅 {new Date(product.created_at).toLocaleDateString('en-BD', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetail;
