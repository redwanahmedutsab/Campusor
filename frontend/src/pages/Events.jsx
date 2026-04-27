import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getEvents} from '../api/eventsAPI';
import EventCard from '../components/EventCard';
import useAuth from '../hooks/useAuth';

const CATEGORIES = ['academic', 'cultural', 'sports', 'tech', 'social', 'workshop', 'career', 'other'];

const Events = () => {
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({category: '', is_free: '', upcoming: 'true', search: ''});

    useEffect(() => {
        setLoading(true);
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
        getEvents(params)
            .then(({data}) => setEvents(data.results || data))
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, [filters]);

    const Skeleton = () => (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200"/>
            <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"/>
                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                <div className="h-3 bg-gray-200 rounded w-1/2"/>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">🎉 Events</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Discover what's happening on campus</p>
                        </div>
                        {isAuthenticated && (
                            <button onClick={() => navigate('/post?type=event')}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
                                + Create Event
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <input type="text" placeholder="Search events..." value={filters.search}
                               onChange={e => setFilters(p => ({...p, search: e.target.value}))}
                               className="px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-40"/>

                        <button onClick={() => setFilters(p => ({...p, upcoming: p.upcoming === 'true' ? '' : 'true'}))}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                                    filters.upcoming === 'true' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-700'
                                }`}>
                            Upcoming
                        </button>

                        <button onClick={() => setFilters(p => ({...p, is_free: p.is_free === 'true' ? '' : 'true'}))}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                                    filters.is_free === 'true' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-300 text-gray-700'
                                }`}>
                            Free Only
                        </button>

                        {CATEGORIES.map(cat => (
                            <button key={cat}
                                    onClick={() => setFilters(p => ({...p, category: p.category === cat ? '' : cat}))}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border capitalize transition-colors ${
                                        filters.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-600'
                                    }`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i}/>)}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🎉</div>
                        <p className="font-semibold">No events found</p>
                        <p className="text-sm mt-1">Check back later or create one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {events.map(e => <EventCard key={e.id} event={e}/>)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
