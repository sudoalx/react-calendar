import { useDispatch, useSelector } from 'react-redux';
import { calendarApi } from '../api';
import { clearErrorMessage, onChecking, onLogin, onLogout } from '../store';

export const useAuthStore = () => {
    const { status, user, errorMessage } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const handleApiError = (error) => {
        console.error('API Error:', error);

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response Data:', error.response.data);
            console.error('Status Code:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No Response Received. Request details:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error Setting Up the Request:', error.message);
        }

        dispatch(onLogout('An error occurred. Please try again.'));
        setTimeout(() => {
            dispatch(clearErrorMessage());
        }, 10);
    };

    const startLogin = async ({ email, password }) => {
        dispatch(onChecking());
        try {
            const { data } = await calendarApi.post('/auth', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch(onLogin({ name: data.name, uid: data.uid }));
        } catch (error) {
            handleApiError(error);
        }
    };

    const startRegister = async ({ email, password, name }) => {
        dispatch(onChecking());
        try {
            const { data } = await calendarApi.post('/auth/new', { email, password, name });
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch(onLogin({ name: data.name, uid: data.uid }));
        } catch (error) {
            handleApiError(error);
        }
    };

    const checkAuthToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) return dispatch(onLogout());

        try {
            const { data } = await calendarApi.get('auth/renew');
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch(onLogin({ name: data.name, uid: data.uid }));
        } catch (error) {
            handleApiError(error);
        }
    };

    const startLogout = () => {
        localStorage.clear();
        dispatch(onLogout());
    };

    return {
        errorMessage,
        status,
        user,
        checkAuthToken,
        startLogin,
        startLogout,
        startRegister,
    };
};
