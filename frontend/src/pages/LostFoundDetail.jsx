// src/pages/LostFoundDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLostFoundById, markResolved, deleteItem } from '../api/lostFoundAPI';
import useAuth from '../hooks/useAuth';

const LostFoundDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [item,    setItem]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState('');

  useEffect(() => {
    getLostFoundById(id)
      .then(({ data }) => setItem(data))
      .catch(() => navigate('/lost-found'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleResolve = async () => {
    if (!window.confirm('Mark this item as resolved?')) return;
    await markResolved(id);
    setItem(p => ({ ...p, status: 'resolved' }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    await deleteItem(id);
    navigate('/lost-found');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );
  if (!item) return null;

  const isLost   = item.item_type === 'lost';
  const typeStyle = isLost
    ? { bg: 'from-red-500 to-rose-600',   badge: 'bg-red-100 text-red-700',   icon: '🔍', verb: 'Lost' }
    : { bg: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700', icon: '✋', verb: 'Found' };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/lost-found')} className="hover:text-indigo-600">Lost & Found</button>
          <span>›</span>
          <span className="text-gray-900 truncate max-w-xs">{item.title}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Image ── */}
          <div className="md:col-span-1">
            <div className={`relative rounded-2xl overflow-hidden h-64 bg-gradient-to-br ${typeStyle.bg}`}>
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl opacity-30">
                  {typeStyle.icon}
                </div>
              )}
              {item.status === 'resolved' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-green-500 text-white font-black px-5 py-2 rounded-full text-base">RESOLVED ✓</span>
                </div>
              )}
            </div>

            {/* Status + type badges */}
            <div className="flex gap-2 mt-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${typeStyle.badge}`}>
                {typeStyle.icon} {typeStyle.verb}
              </span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                item.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          {/* ── Details ── */}
          <div className="md:col-span-2 space-y-4">

            <div>
              <h1 className="text-2xl font-black text-gray-900">{item.title}</h1>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                Category: {item.category?.replace('_', ' ')}
              </p>
            </div>

            {/* Info grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                  {isLost ? 'Lost at' : 'Found at'}
                </p>
                <p className="text-sm font-semibold text-gray-900">📍 {item.location}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  📅 {new Date(item.date_occurred).toLocaleDateString('en-BD', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Posted by</p>
                <p className="text-sm font-semibold text-gray-900">👤 {item.posted_by_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Posted on</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(item.created_at).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>

            {/* Contact */}
            {(item.contact_name || item.contact_email || item.contact_phone) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Contact</h3>

                {!isAuthenticated ? (
                  <p className="text-xs text-gray-500 text-center py-2">
                    <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold">Login</button> to see contact info
                  </p>
                ) : (
                  <div className="space-y-2">
                    {item.contact_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>👤</span> {item.contact_name}
                      </div>
                    )}
                    {item.contact_email && (
                      <button onClick={() => handleCopy(item.contact_email, 'email')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl text-sm transition-colors">
                        <span className="flex items-center gap-2 text-gray-700">
                          <span>✉️</span> {item.contact_email}
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold">
                          {copied === 'email' ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                    )}
                    {item.contact_phone && (
                      <a href={`tel:${item.contact_phone}`}
                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-sm text-green-700 font-semibold transition-colors">
                        <span>📞</span> {item.contact_phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Owner actions */}
            {item.is_owner && (
              <div className="flex gap-3">
                {item.status === 'open' && (
                  <button onClick={handleResolve}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                    ✓ Mark Resolved
                  </button>
                )}
                <button onClick={handleDelete}
                  className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl text-sm transition-colors">
                  🗑 Delete Post
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFoundDetail;
