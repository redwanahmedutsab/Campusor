import {Link} from 'react-router-dom';

const LostFoundCard = ({item}) => {
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
                    <div className="mt-2">
                        <span className="text-xs text-gray-400">By {item.posted_by_name}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default LostFoundCard;
