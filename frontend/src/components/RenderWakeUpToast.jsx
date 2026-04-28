import {useEffect, useState, useRef} from 'react';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const HEALTH_ENDPOINT = `${BACKEND_URL}/auth/`;
const CHECK_INTERVAL_MS = 10000;
const MAX_WAIT_SECONDS = 90;

const RenderWakeUpToast = () => {
    const [visible, setVisible] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(MAX_WAIT_SECONDS);
    const [dots, setDots] = useState('');
    const intervalRef = useRef(null);
    const countdownRef = useRef(null);
    const dotsRef = useRef(null);
    const dismissed = useRef(false);

    const checkBackend = async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(HEALTH_ENDPOINT, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (res.status < 500 || res.status === 405) {
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const isUp = await checkBackend();
            if (!mounted) return;

            if (isUp) {
                setVisible(false);
                return;
            }

            setVisible(true);
            setSecondsLeft(MAX_WAIT_SECONDS);

            countdownRef.current = setInterval(() => {
                if (!mounted) return;
                setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            dotsRef.current = setInterval(() => {
                if (!mounted) return;
                setDots(d => (d.length >= 3 ? '' : d + '.'));
            }, 500);

            intervalRef.current = setInterval(async () => {
                if (!mounted) return;
                const up = await checkBackend();
                if (up && !dismissed.current) {
                    dismissed.current = true;
                    setVisible(false);
                    clearInterval(intervalRef.current);
                    clearInterval(countdownRef.current);
                    clearInterval(dotsRef.current);
                }
            }, CHECK_INTERVAL_MS);
        };

        init();

        return () => {
            mounted = false;
            clearInterval(intervalRef.current);
            clearInterval(countdownRef.current);
            clearInterval(dotsRef.current);
        };
    }, []);

    if (!visible) return null;

    const progress = ((MAX_WAIT_SECONDS - secondsLeft) / MAX_WAIT_SECONDS) * 100;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
                 style={{backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)'}}>

                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                     style={{animation: 'slideUp 0.4s ease-out'}}>

                    <div className="h-1 bg-gray-100 w-full">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                            style={{width: `${progress}%`}}
                        />
                    </div>

                    <div className="px-6 pt-6 pb-5">
                        <div className="flex items-start gap-4">
                            <div
                                className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                                🌐
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-gray-900 font-bold text-base leading-snug">
                                    Backend is waking up{dots}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                    The server is hosted on <span className="font-semibold text-indigo-600">Render's free tier</span> and
                                    spins down when idle.
                                    Please wait while it starts up — this usually takes under a minute.
                                </p>
                            </div>
                        </div>

                        <div
                            className="mt-5 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                            <div className="flex-shrink-0">
                                {/* Spinner */}
                                <div style={{
                                    width: 20, height: 20,
                                    border: '2.5px solid #c7d2fe',
                                    borderTopColor: '#4f46e5',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }}/>
                            </div>
                            <p className="text-indigo-700 text-sm font-medium">
                                Estimated wait:&nbsp;
                                <span className="font-bold tabular-nums">
                                    {secondsLeft}s
                                </span>
                                &nbsp;— Login & Sign Up will be available once ready.
                            </p>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            This toast will disappear automatically once the server is online.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default RenderWakeUpToast;