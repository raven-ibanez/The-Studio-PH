

import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay } from 'date-fns';
// import { supabase } from '../lib/supabase'; // Will be uncommented once lib is ready or passed as prop

import { useBookings } from '../hooks/useBookings';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Booking } from '../types';
import { formatTo12Hour } from '../utils/time';

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string, duration: number) => void;
  selectedDate: Date | undefined;
  minDuration: number;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onDateSelect,
  onTimeSelect,
  selectedDate,
  minDuration
}) => {
  const { siteSettings } = useSiteSettings();
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<number>(minDuration);
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([]);

  // Update startTime when siteSettings loads
  useEffect(() => {
    if (siteSettings?.opening_time) {
      setStartTime(siteSettings.opening_time);
    }
  }, [siteSettings]);

  const { bookings } = useBookings();

  // Derived state for calendar modifiers
  const bookedDates = bookings
    .filter(b => b.status === 'confirmed')
    .map(b => new Date(b.booking_date));

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    // Filter bookings for the selected date
    const dayBookings = bookings.filter(b =>
      b.status === 'confirmed' &&
      isSameDay(new Date(b.booking_date), selectedDate)
    );

    // Generate times based on settings
    const startHour = siteSettings ? parseInt(siteSettings.opening_time.split(':')[0]) : 9;
    const endHour = siteSettings ? parseInt(siteSettings.closing_time.split(':')[0]) : 21;

    const slots = [];
    for (let i = startHour; i <= endHour; i++) {
      const hour = i;

      const timeString = `${hour < 10 ? '0' : ''}${hour}:00`;

      // Check availability
      slots.push({
        time: timeString,
        available: isTimeSlotAvailable(timeString, dayBookings)
      });

      if (i !== endHour) {
        const timeStringHalf = `${hour < 10 ? '0' : ''}${hour}:30`;
        slots.push({
          time: timeStringHalf,
          available: isTimeSlotAvailable(timeStringHalf, dayBookings)
        });
      }
    }
    setTimeSlots(slots);
  }, [selectedDate, bookings, siteSettings]);

  const isTimeSlotAvailable = (time: string, dayBookings: Booking[]) => {
    // Convert time to minutes for easier comparison
    const [h, m] = time.split(':').map(Number);
    const timeInMinutes = h * 60 + m;

    // Check if this time falls within any booking
    return !dayBookings.some(booking => {
      const [bh, bm] = booking.start_time.split(':').map(Number);
      const bookingStart = bh * 60 + bm;
      const bookingEnd = bookingStart + (booking.duration_hours * 60);

      // If the slot start time is >= booking start AND < booking end, it's occupied
      return timeInMinutes >= bookingStart && timeInMinutes < bookingEnd;
    });
  };

  useEffect(() => {
    onTimeSelect(startTime, duration);
  }, [startTime, duration, onTimeSelect]);


  return (
    <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex-1">
        <h3 className="text-lg font-medium mb-4">Select Date</h3>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          disabled={[{ before: new Date() }]}
          modifiers={{
            hasBooking: bookedDates
          }}
          modifiersStyles={{
            hasBooking: { fontWeight: 'bold', textDecoration: 'underline' }
          }}
          modifiersClassNames={{
            selected: '!bg-[#D4AF37] !text-white hover:!bg-[#D4AF37] hover:!text-white',
          }}
        />
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Select Time & Duration</h3>
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border"
                >
                  {timeSlots.length > 0 ? (
                    timeSlots.map(slot => (
                      <option key={slot.time} value={slot.time} disabled={!slot.available}>
                        {formatTo12Hour(slot.time)}{!slot.available ? ' (Booked)' : ''}
                      </option>
                    ))
                  ) : (
                    <option disabled>No available times</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(hrs => (
                    <option key={hrs} value={hrs}>{hrs} Hours</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Please select a date first.</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Date: {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}</p>
            <p>
              Time: {
                timeSlots.find(s => s.time === startTime)?.available
                  ? formatTo12Hour(startTime)
                  : <span className="text-red-500 font-medium">Selected time unavailable</span>
              }
            </p>
            <p>Duration: {duration} hours</p>
            {/* Warning if selected duration overlaps next booking could go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
