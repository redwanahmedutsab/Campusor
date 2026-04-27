import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {getLostFoundItems} from '../api/lostFoundAPI';
import LostFoundCard from '../components/LostFoundCard';
import useAuth from '../hooks/useAuth';

const LostFound = () => {
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({item_type: '', category: '', status: 'open', search: ''});

    useEffect(() => {
        setLoading(true);
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
        getLostFoundItems(params)
            .then(({data}) => setItems(data.results || data))
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, [filters]);

    const Skeleton = () => (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-44 bg-gray-200"/>
            <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                <div className="h-3 bg-gray-200 rounded w-full"/>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">🔍 Lost & Found</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Help reunite items with their owners</p>
                        </div>
                        {isAuthenticated && (
                            <button onClick={() => navigate('/post?type=lostfound')}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
                                + Post Item
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <input type="text" placeholder="Search items..." value={filters.search}
                               onChange={e => setFilters(p => ({...p, search: e.target.value}))}
                               className="px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-40"/>

                        {['', 'lost', 'found'].map(type => (
                            <button key={type || 'all'}
                                    onClick={() => setFilters(p => ({...p, item_type: type}))}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border capitalize transition-colors ${
                                        filters.item_type === type
                                            ? type === 'lost' ? 'bg-red-500 text-white border-red-500'
                                                : type === 'found' ? 'bg-green-600 text-white border-green-600'
                                                    : 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white border-gray-300 text-gray-600'
                                    }`}>
                                {type || 'All'}
                            </button>
                        ))}

                        <button onClick={() => setFilters(p => ({...p, status: p.status === 'open' ? '' : 'open'}))}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                                    filters.status === 'open' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-gray-300 text-gray-600'
                                }`}>
                            Open Only
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i}/>)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="font-semibold">Nothing found</p>
                        <p className="text-sm mt-1">Be the first to post a lost or found item</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map(item => <LostFoundCard key={item.id} item={item}/>)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LostFound;
