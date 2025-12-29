import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

export const useBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('booking_date', { ascending: false })
                .order('start_time', { ascending: true });

            if (error) throw error;

            setBookings(data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const addBooking = async (booking: Omit<Booking, 'id' | 'created_at'>) => {
        try {
            setError(null);
            const { data, error } = await supabase
                .from('bookings')
                .insert([booking])
                .select()
                .single();

            if (error) throw error;

            setBookings((prev) => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error adding booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to add booking');
            throw err;
        }
    };

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        try {
            setError(null);
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status } : b))
            );
        } catch (err) {
            console.error('Error updating booking status:', err);
            setError(err instanceof Error ? err.message : 'Failed to update booking status');
            throw err;
        }
    };

    const deleteBooking = async (id: string) => {
        try {
            setError(null);
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setBookings((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            console.error('Error deleting booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete booking');
            throw err;
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return {
        bookings,
        loading,
        error,
        addBooking,
        updateBookingStatus,
        deleteBooking,
        refreshBookings: fetchBookings
    };
};
