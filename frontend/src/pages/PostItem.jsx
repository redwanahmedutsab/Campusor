// src/pages/PostItem.jsx
// Single page that handles posting a product, event, or lost/found item
// Type determined by ?type= query param

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createProduct, getCategories } from '../api/marketplaceAPI';
import { createEvent } from '../api/eventsAPI';
import { createItem } from '../api/lostFoundAPI';

const PostItem = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const type            = searchParams.get('type') || 'product';

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [previews,   setPreviews]   = useState([]);

  useEffect(() => {
    if (type === 'product') getCategories().then(({ data }) => setCategories(data)).catch(() => {});
  }, [type]);

  // ── Product form ──────────────────────────────────────
  const [product, setProduct] = useState({
    title: '', description: '', price: '', is_free: false,
    condition: 'good', category: '', location: '',
  });

  // ── Event form ────────────────────────────────────────
  const [event, setEvent] = useState({
    title: '', description: '', category: 'other',
    start_datetime: '', end_datetime: '', location: '',
    venue: '', max_attendees: '', is_free: true, ticket_price: '',
    tags: '',
  });

  // ── Lost & Found form ─────────────────────────────────
  const [lf, setLf] = useState({
    item_type: 'lost', title: '', description: '',
    category: 'other', location: '', date_occurred: '',
    contact_name: '', contact_email: '', contact_phone: '',
  });

  const [images, setImages] = useState([]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      if (type === 'product') {
        const fd = new FormData();
        Object.entries(product).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
        images.forEach(img => fd.append('uploaded_images', img));
        const { data } = await createProduct(fd);
        navigate(`/marketplace/${data.id}`);

      } else if (type === 'event') {
        const fd = new FormData();
        Object.entries(event).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
        if (images[0]) fd.append('banner_image', images[0]);
        const { data } = await createEvent(fd);
        navigate(`/events/${data.id}`);

      } else if (type === 'lostfound') {
        const fd = new FormData();
        Object.entries(lf).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
        if (images[0]) fd.append('image', images[0]);
        const { data } = await createItem(fd);
        navigate(`/lost-found/${data.id}`);
      }
    } catch (err) {
      setErrors(err.response?.data || { error: 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";
  const labelClass = "block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5";
  const fieldErr   = (name) => errors[name] && (
    <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p>
  );

  const TYPE_CONFIG = {
    product:   { label: 'Sell an Item',      icon: '🛍️', color: 'indigo' },
    event:     { label: 'Create an Event',   icon: '🎉', color: 'purple' },
    lostfound: { label: 'Post Lost & Found', icon: '🔍', color: 'yellow' },
  };
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.product;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* Type selector */}
        <div className="flex gap-3 mb-6 justify-center">
          {Object.entries(TYPE_CONFIG).map(([t, c]) => (
            <button key={t}
              onClick={() => navigate(`/post?type=${t}`)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                type === t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
              }`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-xl font-black text-gray-900 mb-6">{cfg.icon} {cfg.label}</h1>

          {errors.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              {errors.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── PRODUCT FORM ── */}
            {type === 'product' && (
              <>
                <div><label className={labelClass}>Title *</label>
                  <input required value={product.title} onChange={e => setProduct(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="What are you selling?" />
                  {fieldErr('title')}
                </div>
                <div><label className={labelClass}>Description *</label>
                  <textarea required rows={4} value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))} className={inputClass} placeholder="Describe the item, its condition, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price (BDT) *</label>
                    <input type="number" required={!product.is_free} disabled={product.is_free} value={product.price}
                      onChange={e => setProduct(p => ({ ...p, price: e.target.value }))} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Condition</label>
                    <select value={product.condition} onChange={e => setProduct(p => ({ ...p, condition: e.target.value }))} className={inputClass}>
                      {['new','like_new','good','fair','for_parts'].map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={product.is_free} onChange={e => setProduct(p => ({ ...p, is_free: e.target.checked, price: '' }))} className="rounded accent-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">This item is free</span>
                </label>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={product.category} onChange={e => setProduct(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Location / Where to meet</label>
                  <input value={product.location} onChange={e => setProduct(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="e.g. Main campus, Library" />
                </div>
                <div><label className={labelClass}>Photos (first = cover)</label>
                  <input type="file" accept="image/*" multiple onChange={handleImages} className="text-sm text-gray-500" />
                  {previews.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {previews.map((src, i) => <img key={i} src={src} alt="" className="w-16 h-16 rounded-xl object-cover" />)}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── EVENT FORM ── */}
            {type === 'event' && (
              <>
                <div><label className={labelClass}>Event Title *</label>
                  <input required value={event.title} onChange={e => setEvent(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="What's the event?" />
                </div>
                <div><label className={labelClass}>Description *</label>
                  <textarea required rows={4} value={event.description} onChange={e => setEvent(p => ({ ...p, description: e.target.value }))} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Category</label>
                    <select value={event.category} onChange={e => setEvent(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                      {['academic','cultural','sports','tech','social','workshop','career','other'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Max Attendees</label>
                    <input type="number" value={event.max_attendees} onChange={e => setEvent(p => ({ ...p, max_attendees: e.target.value }))} className={inputClass} placeholder="Leave blank for unlimited" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Start Date & Time *</label>
                    <input type="datetime-local" required value={event.start_datetime} onChange={e => setEvent(p => ({ ...p, start_datetime: e.target.value }))} className={inputClass} />
                  </div>
                  <div><label className={labelClass}>End Date & Time</label>
                    <input type="datetime-local" value={event.end_datetime} onChange={e => setEvent(p => ({ ...p, end_datetime: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Location *</label>
                    <input required value={event.location} onChange={e => setEvent(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Campus / City" />
                  </div>
                  <div><label className={labelClass}>Venue</label>
                    <input value={event.venue} onChange={e => setEvent(p => ({ ...p, venue: e.target.value }))} className={inputClass} placeholder="e.g. Auditorium, Room 301" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={event.is_free} onChange={e => setEvent(p => ({ ...p, is_free: e.target.checked }))} className="rounded accent-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Free event</span>
                </label>
                {!event.is_free && (
                  <div><label className={labelClass}>Ticket Price (BDT)</label>
                    <input type="number" value={event.ticket_price} onChange={e => setEvent(p => ({ ...p, ticket_price: e.target.value }))} className={inputClass} />
                  </div>
                )}
                <div><label className={labelClass}>Banner Image</label>
                  <input type="file" accept="image/*" onChange={handleImages} className="text-sm text-gray-500" />
                </div>
                <div><label className={labelClass}>Tags (comma-separated)</label>
                  <input value={event.tags} onChange={e => setEvent(p => ({ ...p, tags: e.target.value }))} className={inputClass} placeholder="hackathon, coding, awards" />
                </div>
              </>
            )}

            {/* ── LOST & FOUND FORM ── */}
            {type === 'lostfound' && (
              <>
                <div>
                  <label className={labelClass}>Type *</label>
                  <div className="flex gap-3">
                    {['lost','found'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setLf(p => ({ ...p, item_type: t }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                          lf.item_type === t
                            ? t === 'lost' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600'
                        }`}>
                        {t === 'lost' ? '🔍' : '✋'} I {t} something
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className={labelClass}>Item Name *</label>
                  <input required value={lf.title} onChange={e => setLf(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="e.g. Blue backpack, Student ID" />
                </div>
                <div><label className={labelClass}>Description *</label>
                  <textarea required rows={3} value={lf.description} onChange={e => setLf(p => ({ ...p, description: e.target.value }))} className={inputClass} placeholder="Describe the item in detail..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Category</label>
                    <select value={lf.category} onChange={e => setLf(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                      {['electronics','clothing','books','id_card','keys','bag','wallet','other'].map(c => <option key={c} value={c} className="capitalize">{c.replace('_',' ')}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Date *</label>
                    <input type="date" required value={lf.date_occurred} onChange={e => setLf(p => ({ ...p, date_occurred: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div><label className={labelClass}>Location *</label>
                  <input required value={lf.location} onChange={e => setLf(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Where was it lost/found?" />
                </div>
                <div><label className={labelClass}>Photo</label>
                  <input type="file" accept="image/*" onChange={handleImages} className="text-sm text-gray-500" />
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Contact Info (optional)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><input placeholder="Your name" value={lf.contact_name} onChange={e => setLf(p => ({ ...p, contact_name: e.target.value }))} className={inputClass} /></div>
                    <div><input placeholder="Phone number" value={lf.contact_phone} onChange={e => setLf(p => ({ ...p, contact_phone: e.target.value }))} className={inputClass} /></div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-base mt-2">
              {submitting ? 'Posting...' : `Post ${cfg.label.split(' ').slice(-1)[0]}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
