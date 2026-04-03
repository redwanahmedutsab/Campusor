// src/pages/EventDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, rsvpEvent, deleteEvent } from '../api/eventsAPI';
import useAuth from '../hooks/useAuth';

const CATEGORY_COLORS = {
  academic: 'bg-blue-100 text-blue-700',
  cultural: 'bg-purple-100 text-purple-700',
  sports:   'bg-green-100 text-green-700',
  tech:     'bg-cyan-100 text-cyan-700',
  social:   'bg-pink-100 text-pink-700',
  workshop: 'bg-orange-100 text-orange-700',
  career:   'bg-yellow-100 text-yellow-700',
  other:    'bg-gray-100 text-gray-600',
};

const EventDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event,      setEvent]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    getEventById(id)
      .then(({ data }) => setEvent(data))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleRSVP = async (status) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setRsvpLoading(true);
    try {
      const { data } = await rsvpEvent(id, status);
      setEvent(prev => ({
        ...prev,
        user_rsvp:      data.status === 'not_going' ? null : data.status,
        attendee_count: data.attendee_count,
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update RSVP.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    await deleteEvent(id);
    navigate('/events');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );
  if (!event) return null;

  const startDate = new Date(event.start_datetime);
  const endDate   = event.end_datetime ? new Date(event.end_datetime) : null;
  const isOwner   = user?.full_name === event.organizer_name || user?.username === event.organizer_name;
  const isPast    = startDate < new Date();
  const catColor  = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;

  const tags = event.tags ? event.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/events')} className="hover:text-indigo-600">Events</button>
          <span>›</span>
          <span className="text-gray-900 truncate max-w-xs">{event.title}</span>
        </div>

        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden h-56 md:h-72 mb-6 bg-gradient-to-br from-indigo-500 to-purple-600">
          {event.banner_image ? (
            <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">🎉</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${catColor}`}>
              {event.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2">{event.title}</h1>
          </div>
          {isPast && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
              Past Event
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Main content ── */}
          <div className="md:col-span-2 space-y-5">

            {/* Details grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {startDate.toLocaleDateString('en-BD', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {startDate.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                  {endDate && ` — ${endDate.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">📍 {event.location}</p>
              </div>
              {event.venue && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Venue</p>
                  <p className="text-sm font-semibold text-gray-900">🏛 {event.venue}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Entry</p>
                <p className="text-sm font-semibold text-gray-900">
                  {event.is_free ? '🆓 Free' : `৳${event.ticket_price}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Attendees</p>
                <p className="text-sm font-semibold text-gray-900">
                  👥 {event.attendee_count} going
                  {event.max_attendees && ` / ${event.max_attendees} max`}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">About this event</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* RSVP card */}
            {!isOwner && !isPast && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-1">Are you going?</h3>
                <p className="text-xs text-gray-500 mb-4">
                  {event.attendee_count} {event.attendee_count === 1 ? 'person' : 'people'} going
                  {event.max_attendees && ` · ${event.max_attendees - event.attendee_count} spots left`}
                </p>

                {event.is_full && event.user_rsvp !== 'going' ? (
                  <div className="text-center py-3 bg-red-50 rounded-xl text-sm text-red-600 font-semibold">
                    Event is full
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleRSVP(event.user_rsvp === 'going' ? 'not_going' : 'going')}
                      disabled={rsvpLoading}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        event.user_rsvp === 'going'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      } disabled:opacity-60`}
                    >
                      {rsvpLoading ? '...' : event.user_rsvp === 'going' ? '✓ Going (click to cancel)' : '+ I\'m Going'}
                    </button>
                    {event.user_rsvp !== 'going' && (
                      <button
                        onClick={() => handleRSVP('maybe')}
                        disabled={rsvpLoading}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                          event.user_rsvp === 'maybe'
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        } disabled:opacity-60`}
                      >
                        {event.user_rsvp === 'maybe' ? '✓ Maybe' : 'Maybe'}
                      </button>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="text-xs text-center text-gray-500 mt-3">
                    <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold">Login</button> to RSVP
                  </p>
                )}
              </div>
            )}

            {/* Organizer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Organized by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center">
                  {event.organizer_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{event.organizer_name}</p>
                  <p className="text-xs text-gray-500">Organizer</p>
                </div>
              </div>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Manage Event</h3>
                <button onClick={handleDelete}
                  className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  🗑 Delete Event
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
