import {useNavigate} from 'react-router-dom';

const features = [
    {
        icon: '🛍️',
        title: 'Marketplace',
        desc: 'Buy and sell textbooks, electronics, and more between students.',
        path: '/marketplace'
    },
    {
        icon: '🎉',
        title: 'Events',
        desc: 'Discover and RSVP to campus events, workshops, and activities.',
        path: '/events'
    },
    {
        icon: '🔍',
        title: 'Lost & Found',
        desc: 'Post lost items or report found ones to reunite with their owners.',
        path: '/lost-found'
    },
];

const stats = [
    {value: '500+', label: 'Active Students'},
    {value: '1,200+', label: 'Items Listed'},
    {value: '300+', label: 'Events Hosted'},
    {value: '98%', label: 'Items Reunited'},
];

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">

            <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
                <div className="max-w-5xl mx-auto px-6 py-24 text-center">
                    <div
                        className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
                        🎓 Your University Hub
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
                        Everything you need<br/>
                        <span className="text-indigo-400">on campus</span>
                    </h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto mb-10">
                        Campusor connects students to buy, sell, discover events, and find lost items — all in one
                        place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
                        >
                            Get Started Free
                        </button>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
                        >
                            Browse Marketplace
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-indigo-600">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map(s => (
                            <div key={s.label} className="text-center text-white">
                                <div className="text-3xl font-black">{s.value}</div>
                                <div className="text-indigo-200 text-sm mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-gray-900 mb-3">Everything in one platform</h2>
                    <p className="text-gray-500">Built specifically for university students</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map(f => (
                        <button
                            key={f.title}
                            onClick={() => navigate(f.path)}
                            className="text-left bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-all group"
                        >
                            <div className="text-4xl mb-4">{f.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-3xl font-black mb-4">Ready to join your campus community?</h2>
                    <p className="text-slate-400 mb-8">Sign up for free and connect with students at your
                        university.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-base transition-colors"
                    >
                        Create Free Account
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Landing;
