import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IDLE_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes
const THROTTLE_TIME = 500; // Only reset once every 500ms

const IdleLogout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = useRef(null);
    const lastResetRef = useRef(Date.now());

    const resetTimeout = () => {
        const now = Date.now();
        // Performance Optimization: Throttle the reset so it doesn't fire 
        // excessively on every single pixel of mouse movement or scroll.
        if (now - lastResetRef.current < THROTTLE_TIME) {
            return;
        }
        
        lastResetRef.current = now;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            const user = localStorage.getItem('medhealthinvestuser');
            if (user) {
                logoutUser();
            }
        }, IDLE_TIME_LIMIT);
    };

    const logoutUser = () => {
        // 1. Clear local storage
        localStorage.removeItem('medhealthinvestuser');
        
        // 2. Clear session storage
        sessionStorage.clear();
        
        // 3. Dispatch global event for the Modal
        window.dispatchEvent(new CustomEvent('session_expired', { detail: { reason: 'inactivity' } }));
    };

    useEffect(() => {
        // List of events to listen for
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Start the timer if user is logged in
        const user = localStorage.getItem('medhealthinvestuser');
        if (user && location.pathname !== '/session-expired') {
            resetTimeout();
            
            // Add listeners
            events.forEach(event => {
                window.addEventListener(event, resetTimeout);
            });
        }

        return () => {
            // Cleanup
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimeout);
            });
        };
    }, [location.pathname]); // Re-run when route changes

    return null; // This component doesn't render anything
};

export default IdleLogout;
