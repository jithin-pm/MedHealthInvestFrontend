import axios from 'axios';
import { BASE_URL } from './baseUrl';
import { showAlert } from '../Utils/alert';

const instance = axios.create({
    baseURL: BASE_URL,
    // IMPORTANT: Let browser send the HttpOnly cookies (like refreshToken) automatically
    withCredentials: true,
});

let isRefreshing = false;
let isLoggingOut = false; // Add flag to prevent multiple alerts
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// Helper to decide the right refresh endpoint
const getRefreshUrl = () => {
    return `${BASE_URL}/api/auth/refresh`;
};

// Helper to get auth data
const getAuthData = () => {
    try {
        const data = localStorage.getItem('medhealthinvestuser');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

const saveAccessToken = (token) => {
    try {
        const data = localStorage.getItem('medhealthinvestuser');
        if (data) {
            const parsed = JSON.parse(data);
            parsed.accessToken = token;
            localStorage.setItem('medhealthinvestuser', JSON.stringify(parsed));
        }
    } catch (e) {
        console.error("Failed to save refreshed token", e);
    }
};

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const auth = getAuthData();
        if (auth && auth.accessToken) {
            config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handles "Try -> 401 Error -> Refresh -> Retry" logic
instance.interceptors.response.use(
    (response) => response, // 1. Try: Request was successful
    async (error) => {
        const originalRequest = error.config;

        // 2. 401 Error: Authorization failed (Token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Prevent infinite loops by marking this request as a retry
            originalRequest._retry = true;

            if (isRefreshing) {
                // If a refresh is already in progress, queue this request
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        resolve(instance(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                // 3. Refresh: Call the refresh token endpoint
                const response = await axios.post(getRefreshUrl(), {}, { withCredentials: true });
                const newToken = response.data?.data?.accessToken;

                if (newToken) {
                    // 4. Retry: Save new token and retry the original request
                    saveAccessToken(newToken);
                    onRefreshed(newToken);
                    isRefreshing = false;

                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                forceLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function forceLogout() {
    if (isLoggingOut) return;
    isLoggingOut = true;

    // 1. Clear both local and session storage
    localStorage.removeItem('medhealthinvestuser');
    sessionStorage.clear();
    
    // 2. Dispatch event for the Modal to pick up
    window.dispatchEvent(new CustomEvent('session_expired', { detail: { reason: 'expired' } }));
    
    isLoggingOut = false;
}

export default instance;
