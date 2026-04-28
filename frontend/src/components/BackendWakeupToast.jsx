import { useEffect, useState } from 'react';
import { useBackendWakeup } from '../hooks/useBackendWakeup';

/**
 * Shows a persistent bottom-right toast while the Render backend is waking up.
 * Disappears automatically a few seconds after the backend comes alive.
 */
const BackendWakeupToast = () => {
    const { status, elapsedSeconds } = useBackendWakeup();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    // Show toast once we know backend is waking (not if it was already alive)
    useEffect(() => {
        if (status === 'waking') setVisible(true);
    }, [status]);

    // Auto-hide 4 s after becoming awake
    useEffect(() => {
        if (status === 'awake' && visible) {
            const t = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [status, visible]);

    if (!visible || dismissed) return null;

    const isAwake = status === 'awake';

    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                fixed bottom-5 right-5 z-50
                max-w-sm w-[calc(100vw-2.5rem)] sm:w-96
                rounded-2xl shadow-2xl border
                transition-all duration-500
                ${isAwake
                    ? 'bg-emerald-950 border-emerald-700/60'
                    : 'bg-slate-900 border-slate-700/60'}
            `}
        >
            {/* Progress bar at top */}
            {!isAwake && (
                <div className="h-1 rounded-t-2xl overflow-hidden bg-slate-700">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-1000"
                        style={{
                            /* ~60s expected wake time; clamp at 95% so it never "finishes" early */
                            width: `${Math.min(95, (elapsedSeconds / 60) * 100)}%`,
                        }}
                    />
                </div>
            )}

            <div className="p-4 flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0">
                    {isAwake ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-lg">
                            ✓
                        </span>
                    ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-lg animate-spin-slow">
                            ⚙
                        </span>
                    )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    {isAwake ? (
                        <>
                            <p className="text-emerald-400 font-bold text-sm">Backend is ready!</p>
                            <p className="text-emerald-200/70 text-xs mt-0.5">
                                You're all set — sign in, sign up, and browse freely.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-white font-bold text-sm">Waking up the backend…</p>
                            <p className="text-slate-300/80 text-xs mt-0.5 leading-relaxed">
                                The server runs on Render's free tier and sleeps when idle.
                                It usually takes <span className="text-indigo-300 font-semibold">~1 minute</span> to wake up.
                            </p>
                            <p className="text-slate-400 text-xs mt-2">
                                You can browse, but sign in &amp; sign up will be available once it's ready.
                                {elapsedSeconds > 0 && (
                                    <span className="ml-1 text-slate-500">({elapsedSeconds}s elapsed)</span>
                                )}
                            </p>
                        </>
                    )}
                </div>

                {/* Dismiss button */}
                <button
                    onClick={() => setDismissed(true)}
                    className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none mt-0.5"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default BackendWakeupToast;
