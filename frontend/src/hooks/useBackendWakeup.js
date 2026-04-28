import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const HEALTH_ENDPOINT = `${API_URL}/health/`;
const POLL_INTERVAL_MS = 5000;   // check every 5s once waking
const INITIAL_TIMEOUT_MS = 2000; // wait 2s before first check (let page settle)
const SESSION_KEY = 'campusor_backend_awake';

/**
 * Checks if the backend is alive on first visit.
 * Returns: { status: 'checking' | 'waking' | 'awake', elapsedSeconds }
 *
 * - 'checking'  : very first probe, no toast yet
 * - 'waking'    : backend didn't respond quickly, show warning toast
 * - 'awake'     : backend responded 200, show success toast briefly
 */
export function useBackendWakeup() {
    const [status, setStatus] = useState('checking');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const startRef = useRef(null);
    const timerRef = useRef(null);
    const pollRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        // If already confirmed awake in this browser session, skip entirely
        if (sessionStorage.getItem(SESSION_KEY) === 'true') {
            setStatus('awake');
            return;
        }

        const pingBackend = async () => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(HEALTH_ENDPOINT, {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                clearTimeout(timeout);
                if (res.ok && mountedRef.current) {
                    clearInterval(pollRef.current);
                    clearInterval(timerRef.current);
                    sessionStorage.setItem(SESSION_KEY, 'true');
                    setStatus('awake');
                }
            } catch {
                // still waking — keep polling
            }
        };

        const startPolling = () => {
            if (!mountedRef.current) return;
            startRef.current = Date.now();

            // Elapsed-seconds ticker
            timerRef.current = setInterval(() => {
                if (!mountedRef.current) return;
                setElapsedSeconds(Math.floor((Date.now() - startRef.current) / 1000));
            }, 1000);

            pingBackend();
            pollRef.current = setInterval(pingBackend, POLL_INTERVAL_MS);
        };

        // First quick probe — if backend replies fast, user never sees the toast
        const quickCheck = async () => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), INITIAL_TIMEOUT_MS);
                const res = await fetch(HEALTH_ENDPOINT, {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                clearTimeout(timeout);
                if (res.ok && mountedRef.current) {
                    sessionStorage.setItem(SESSION_KEY, 'true');
                    setStatus('awake');
                    return;
                }
            } catch {
                // fall through to waking state
            }
            if (mountedRef.current) {
                setStatus('waking');
                startPolling();
            }
        };

        quickCheck();

        return () => {
            mountedRef.current = false;
            clearInterval(pollRef.current);
            clearInterval(timerRef.current);
        };
    }, []);

    return { status, elapsedSeconds };
}
