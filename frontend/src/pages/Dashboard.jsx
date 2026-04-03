// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getMyProducts, markSold, deleteProduct } from '../api/marketplaceAPI';
import { getMyEvents, getMyRSVPs } from '../api/eventsAPI';
import { getMyItems, markResolved } from '../api/lostFoundAPI';

const TABS = [
  { key: 'listings',  label: 'My Listings',  icon: '🛍️' },
  { key: 'events',    label: 'My Events',    icon: '🎉' },
  { key: 'attending', label: 'Attending',    icon: '✅' },
  { key: 'lostfound', label: 'Lost & Found', icon: '🔍' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('listings');
  const [products, setProducts] = useState([]);
  const [events,   setEvents]   = useState([]);
  const [rsvps,    setRsvps]    = useState([]);
  const [lfItems,  setLfItems]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getMyProducts(), getMyEvents(), getMyRSVPs(), getMyItems()
    ]).then(([p, e, r, lf]) => {
      if (p.status  === 'fulfilled') setProducts(p.value.data?.results || p.value.data || []);
      if (e.status  === 'fulfilled') setEvents(e.value.data?.results   || e.value.data || []);
      if (r.status  === 'fulfilled') setRsvps(r.value.data?.results    || r.value.data || []);
      if (lf.status === 'fulfilled') setLfItems(lf.value.data?.results || lf.value.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(p);

  const statsCards = [
    { label: 'Listings',  value: products.length, icon: '🛍️', color: 'text-indigo-600' },
    { label: 'Events',    value: events.length,   icon: '🎉', color: 'text-purple-600' },
    { label: 'Attending', value: rsvps.length,    icon: '✅', color: 'text-green-600'  },
    { label: 'LF Posts',  value: lfItems.length,  icon: '🔍', color: 'text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white text-xl font-black flex items-center justify-center overflow-hidden shrink-0">
            {user?.profile_picture
              ? <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
              : `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`
            }
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900">{user?.full_name || user?.username}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.department && <p className="text-gray-400 text-xs mt-0.5">{user.department} · {user.university}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/post')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">
              + Post
            </button>
            <button onClick={logout}
              className="border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsCards.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}
          </div>
        ) : (

          /* Listings tab */
          tab === 'listings' && (
            products.length === 0 ? (
              <EmptyState icon="🛍️" text="No listings yet" sub="Post your first item to get started" action={() => navigate('/post?type=product')} actionLabel="Sell Item" />
            ) : (
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-16 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.primary_image
                        ? <img src={p.primary_image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate cursor-pointer hover:text-indigo-600"
                         onClick={() => navigate(`/marketplace/${p.id}`)}>{p.title}</p>
                      <p className="text-sm text-gray-500">{p.is_free ? 'Free' : formatPrice(p.price)}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'active' ? 'bg-green-100 text-green-700' :
                        p.status === 'sold'   ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>{p.status}</span>
                    </div>
                    <div className="flex gap-2">
                      {p.status === 'active' && (
                        <button onClick={() => markSold(p.id).then(() => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'sold' } : x)))}
                          className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">
                          Mark Sold
                        </button>
                      )}
                      <button onClick={() => deleteProduct(p.id).then(() => setProducts(prev => prev.filter(x => x.id !== p.id)))}
                        className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )
        )}

        {/* Events tab */}
        {!loading && tab === 'events' && (
          events.length === 0 ? (
            <EmptyState icon="🎉" text="No events organized" sub="Create your first campus event" action={() => navigate('/post?type=event')} actionLabel="Create Event" />
          ) : (
            <div className="space-y-3">
              {events.map(e => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm"
                     onClick={() => navigate(`/events/${e.id}`)}>
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl shrink-0">🎉</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500">{new Date(e.start_datetime).toLocaleDateString()} · {e.location}</p>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">👥 {e.attendee_count} going</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Attending tab */}
        {!loading && tab === 'attending' && (
          rsvps.length === 0 ? (
            <EmptyState icon="✅" text="Not attending any events" sub="Browse and RSVP to campus events" action={() => navigate('/events')} actionLabel="Browse Events" />
          ) : (
            <div className="space-y-3">
              {rsvps.map(e => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm"
                     onClick={() => navigate(`/events/${e.id}`)}>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl shrink-0">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500">{new Date(e.start_datetime).toLocaleDateString()} · {e.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Lost & Found tab */}
        {!loading && tab === 'lostfound' && (
          lfItems.length === 0 ? (
            <EmptyState icon="🔍" text="No posts yet" sub="Report a lost or found item" action={() => navigate('/post?type=lostfound')} actionLabel="Post Item" />
          ) : (
            <div className="space-y-3">
              {lfItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    item.item_type === 'lost' ? 'bg-red-100' : 'bg-green-100'}`}>
                    {item.item_type === 'lost' ? '🔍' : '✋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.location} · {item.date_occurred}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{item.status}</span>
                  </div>
                  {item.status === 'open' && (
                    <button onClick={() => markResolved(item.id).then(() =>
                      setLfItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'resolved' } : x))
                    )} className="text-xs border border-green-200 px-3 py-1.5 rounded-lg text-green-700 hover:bg-green-50">
                      Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
};

const EmptyState = ({ icon, text, sub, action, actionLabel }) => (
  <div className="text-center py-16 text-gray-400">
    <div className="text-5xl mb-3">{icon}</div>
    <p className="font-semibold text-gray-600">{text}</p>
    <p className="text-sm mt-1 mb-5">{sub}</p>
    <button onClick={action}
      className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
      {actionLabel}
    </button>
  </div>
);

export default Dashboard;
