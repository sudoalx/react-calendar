import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { calendarApi } from '../api';
import { convertEventsToDateEvents } from '../helpers';
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent } from '../store';


export const useCalendarStore = () => {

    const dispatch = useDispatch();
    const { events, activeEvent } = useSelector(state => state.calendar);

    const setActiveEvent = (calendarEvent) => {
        dispatch(onSetActiveEvent(calendarEvent))
    }

    const startSavingEvent = async (calendarEvent) => {
        try {
            if (calendarEvent.id) {
                // Updating
                await calendarApi.put(`/events/${calendarEvent.id}`, calendarEvent);
                dispatch(onUpdateEvent({ ...calendarEvent, user }));
                return;
            }

            // Creating
            const { data } = await calendarApi.post('/events', calendarEvent);
            dispatch(onAddNewEvent({ ...calendarEvent, id: data.evento.id, user }));

        } catch (error) {
            console.log(error);
            Swal.fire('Error saving event', error.response.data.msg, 'error');
        }
    }

    const startDeletingEvent = async () => {
        try {
            await calendarApi.delete(`/events/${activeEvent.id}`);
            dispatch(onDeleteEvent());
        } catch (error) {
            console.log(error);
            Swal.fire('Error deleting event', error.response.data.msg, 'error');
        }
    }

    const startLoadingEvents = async () => {
        try {
            const { data } = await calendarApi.get('/events');
            const events = convertEventsToDateEvents(data.events);
            dispatch(onLoadEvents(events));


        } catch (error) {
            console.log('Error loading events')
            console.log(error)
        }
    }



    return {
        //* Properties
        activeEvent,
        events,
        hasEventSelected: !!activeEvent,

        //* Methods
        startDeletingEvent,
        setActiveEvent,
        startSavingEvent,
    }
}
