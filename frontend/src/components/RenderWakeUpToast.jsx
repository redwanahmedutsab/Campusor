import {useEffect, useState, useRef} from 'react';

// ─── Config ────────────────────────────────────────────────────────────────────
// Reads from your Vercel env var REACT_APP_API_URL
// Make sure this is set in Vercel → Project Settings → Environment Variables
const BACKEND_URL = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

// We hit the health endpoint directly
const HEALTH_ENDPOINT = `${BACKEND_URL}/health/`;

const CHECK_INTERVAL_MS = 8000;   // poll every 8s after first failure
const FETCH_TIMEOUT_MS = 6000;   // abort fetch after 6s (Render cold = slow)
const MAX_WAIT_SECONDS = 90;

// ─── Health check ──────────────────────────────────────────────────────────────
// Returns true only when backend explicitly responds with 200 on /api/health/
// Anything else (network error, CORS block, 5xx, timeout) = still sleeping
const checkBackend = async () => {
    if (!BACKEND_URL) {
        // REACT_APP_API_URL not set → can't check → assume sleeping
        console.warn('[RenderWakeUp] REACT_APP_API_URL is not set!');
        return false;
    }

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch(HEALTH_ENDPOINT, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(tid);
        console.log('[RenderWakeUp] health status:', res.status);

        // 200 = healthy. 405 = endpoint exists but method not allowed (also alive).
        return res.status === 200 || res.status === 405;

    } catch (err) {
        console.log('[RenderWakeUp] health check failed:', err.message);
        return false;
    }
};

// ─── Component ─────────────────────────────────────────────────────────────────
const RenderWakeUpToast = () => {
    // null = still checking, false = up (hide), true = sleeping (show)
    const [sleeping, setSleeping] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(MAX_WAIT_SECONDS);
    const [dots, setDots] = useState('');

    const intervalRef = useRef(null);
    const countdownRef = useRef(null);
    const dotsRef = useRef(null);
    const resolvedRef = useRef(false);

    const stopAll = () => {
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        clearInterval(dotsRef.current);
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const isUp = await checkBackend();
            if (!mounted) return;

            if (isUp) {
                setSleeping(false);
                return;
            }

            // Server sleeping — show toast
            setSleeping(true);

            // Animated dots
            dotsRef.current = setInterval(() => {
                if (!mounted) return;
                setDots(d => (d.length >= 3 ? '' : d + '.'));
            }, 500);

            // Countdown
            countdownRef.current = setInterval(() => {
                if (!mounted) return;
                setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            // Poll until alive
            intervalRef.current = setInterval(async () => {
                if (!mounted || resolvedRef.current) return;
                const up = await checkBackend();
                if (up) {
                    resolvedRef.current = true;
                    setSleeping(false);
                    stopAll();
                }
            }, CHECK_INTERVAL_MS);
        };

        init();

        return () => {
            mounted = false;
            stopAll();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Still doing initial check or server is up → render nothing
    if (sleeping === null || sleeping === false) return null;

    const progress = Math.min(
        ((MAX_WAIT_SECONDS - secondsLeft) / MAX_WAIT_SECONDS) * 100,
        100
    );

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)'}}
            >
                <div
                    className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    style={{animation: 'rwu-slideUp 0.4s ease-out'}}
                >
                    {/* Progress bar */}
                    <div className="h-1 bg-gray-100 w-full">
                        <div
                            className="h-full bg-indigo-500"
                            style={{width: `${progress}%`, transition: 'width 1s linear'}}
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
                                    The server is on{' '}
                                    <span className="font-semibold text-indigo-600">Render's free tier</span>{' '}
                                    and spins down when idle. It usually takes under a minute to start.
                                </p>
                            </div>
                        </div>

                        <div
                            className="mt-5 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                            <div style={{
                                flexShrink: 0, width: 20, height: 20,
                                border: '2.5px solid #c7d2fe', borderTopColor: '#4f46e5',
                                borderRadius: '50%', animation: 'rwu-spin 0.8s linear infinite',
                            }}/>
                            <p className="text-indigo-700 text-sm font-medium">
                                Estimated wait:&nbsp;
                                <span className="font-bold tabular-nums">{secondsLeft}s</span>
                                &nbsp;— Login &amp; Sign Up will work once ready.
                            </p>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            This message disappears automatically when the server is online.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes rwu-slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
                @keyframes rwu-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default RenderWakeUpToast;