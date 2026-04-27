import {useState, useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {getProducts, getCategories} from '../api/marketplaceAPI';
import ProductCard from '../components/ProductCard';
import useAuth from '../hooks/useAuth';

const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'for_parts'];

const Marketplace = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {isAuthenticated} = useAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: '',
        condition: '',
        is_free: '',
        ordering: '-created_at',
    });

    useEffect(() => {
        getCategories().then(({data}) => setCategories(data)).catch(() => {
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
        getProducts(params)
            .then(({data}) => {
                setProducts(data.results || data);
                setCount(data.count || (data.results || data).length);
            })
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, [filters]);

    const handleFilter = (key, value) =>
        setFilters(p => ({...p, [key]: value}));

    const Skeleton = () => (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"/>
            <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                <div className="h-4 bg-gray-200 rounded w-1/2"/>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">🛍️ Marketplace</h1>
                            <p className="text-gray-500 text-sm mt-0.5">{count} items available</p>
                        </div>
                        {isAuthenticated && (
                            <button onClick={() => navigate('/post?type=product')}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
                                + Sell Item
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={filters.search}
                            onChange={e => handleFilter('search', e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">

                    <aside className="hidden md:block w-56 shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-20">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-sm text-gray-900">Filters</span>
                                <button onClick={() => setFilters({
                                    search: '',
                                    category: '',
                                    condition: '',
                                    is_free: '',
                                    ordering: '-created_at'
                                })}
                                        className="text-xs text-indigo-600 font-semibold hover:underline">Clear
                                </button>
                            </div>

                            <label className="flex items-center gap-2 mb-4 cursor-pointer">
                                <input type="checkbox" checked={filters.is_free === 'true'}
                                       onChange={e => handleFilter('is_free', e.target.checked ? 'true' : '')}
                                       className="rounded accent-indigo-600"/>
                                <span className="text-sm text-gray-700 font-medium">Free items only</span>
                            </label>

                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</p>
                                {categories.map(cat => (
                                    <button key={cat.id}
                                            onClick={() => handleFilter('category', filters.category === cat.id ? '' : cat.id)}
                                            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                                                filters.category === cat.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                                            }`}>
                                        <span>{cat.icon}</span> {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Condition</p>
                                {CONDITIONS.map(c => (
                                    <button key={c}
                                            onClick={() => handleFilter('condition', filters.condition === c ? '' : c)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 capitalize transition-colors ${
                                                filters.condition === c ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                                            }`}>
                                        {c.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">{count} results</span>
                            <select value={filters.ordering}
                                    onChange={e => handleFilter('ordering', e.target.value)}
                                    className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="-created_at">Newest First</option>
                                <option value="price">Price: Low → High</option>
                                <option value="-price">Price: High → Low</option>
                                <option value="-views_count">Most Viewed</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i}/>)}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <div className="text-5xl mb-3">📦</div>
                                <p className="font-semibold">No items found</p>
                                <p className="text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map(p => <ProductCard key={p.id} product={p}/>)}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
