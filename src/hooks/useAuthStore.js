import { useDispatch, useSelector } from 'react-redux';
import { calendarApi } from '../api';
import { clearErrorMessage, onChecking, onLogin, onLogout, onLogoutCalendar } from '../store';

export const useAuthStore = () => {
    const { status, user, errorMessage } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const handleApiError = (error) => {
        console.error('API Error:', error);

        let errorMessageToShow = 'An error occurred. Please try again.';

        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Status Code:', error.response.status);
            console.error('Headers:', error.response.headers);

            if (error.response.data && error.response.data.msg) {
                errorMessageToShow = error.response.data.msg;
            }
        } else if (error.request) {
            console.error('No Response Received. Request details:', error.request);
        } else {
            console.error('Error Setting Up the Request:', error.message);
        }

        dispatch(onLogout(errorMessageToShow));
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
        dispatch(onLogoutCalendar());
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
