import {Link} from 'react-router-dom';

const CATEGORY_COLORS = {
    academic: 'bg-blue-100 text-blue-700',
    cultural: 'bg-purple-100 text-purple-700',
    sports: 'bg-green-100 text-green-700',
    tech: 'bg-cyan-100 text-cyan-700',
    social: 'bg-pink-100 text-pink-700',
    workshop: 'bg-orange-100 text-orange-700',
    career: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-600',
};

const EventCard = ({event}) => {
    const date = new Date(event.start_datetime);
    const dateStr = date.toLocaleDateString('en-BD', {month: 'short', day: 'numeric'});
    const timeStr = date.toLocaleTimeString('en-BD', {hour: '2-digit', minute: '2-digit'});

    return (
        <Link to={`/events/${event.id}`} className="group block">
            <div
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
                    {event.banner_image ? (
                        <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🎉</div>
                    )}
                    <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-1.5 text-center shadow">
                        <div
                            className="text-xs font-bold text-indigo-600 uppercase">{date.toLocaleString('en', {month: 'short'})}</div>
                        <div className="text-lg font-black text-gray-900 leading-none">{date.getDate()}</div>
                    </div>
                    {event.is_free ? (
                        <span
                            className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">FREE</span>
                    ) : (
                        <span
                            className="absolute top-3 right-3 bg-white text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full shadow">
              ৳{event.ticket_price}
            </span>
                    )}
                </div>

                <div className="p-4">
          <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other}`}>
            {event.category}
          </span>
                    <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{event.title}</h3>
                    <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            🕐 {dateStr} at {timeStr}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            📍 {event.location}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">👥 {event.attendee_count} going</span>
                        {event.user_rsvp === 'going' && (
                            <span className="text-xs font-semibold text-green-600">✓ You're going</span>
                        )}
                        {event.is_full && event.user_rsvp !== 'going' && (
                            <span className="text-xs font-semibold text-red-500">Full</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;


export const LostFoundCard = ({item}) => {
    const {Link} = require('react-router-dom');
    const typeStyle = item.item_type === 'lost'
        ? 'bg-red-100 text-red-700'
        : 'bg-green-100 text-green-700';

    return (
        <Link to={`/lost-found/${item.id}`} className="group block">
            <div
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="relative h-44 bg-gray-100">
                    {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover"/>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                            {item.item_type === 'lost' ? '🔍' : '✋'}
                        </div>
                    )}
                    <span
                        className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full uppercase ${typeStyle}`}>
            {item.item_type}
          </span>
                    {item.status === 'resolved' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span
                                className="bg-green-500 text-white font-bold px-4 py-1.5 rounded-full text-sm">RESOLVED</span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">📍 {item.location}</span>
                        <span className="text-xs text-gray-400">
              {new Date(item.date_occurred).toLocaleDateString('en-BD', {month: 'short', day: 'numeric'})}
            </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
