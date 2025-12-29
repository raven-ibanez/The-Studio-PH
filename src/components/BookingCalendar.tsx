
import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay, addDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
// import { supabase } from '../lib/supabase'; // Will be uncommented once lib is ready or passed as prop

interface BlockedSlot {
  date: Date;
  start_time: string | null;
  end_time: string | null;
}

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
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<number>(minDuration);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // Mock data for now - will be replaced with Supabase fetch
  const blockedDates: Date[] = []; 
  
  useEffect(() => {
    // Generate times from 9 AM to 9 PM
    const times = [];
    for (let i = 9; i <= 21; i++) {
        times.push(`${i < 10 ? '0' : ''}${i}:00`);
        times.push(`${i < 10 ? '0' : ''}${i}:30`);
    }
    setAvailableTimes(times);
  }, [selectedDate]);

  useEffect(() => {
      onTimeSelect(startTime, duration);
  }, [startTime, duration, onTimeSelect]);


  return (
    <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex-1">
        <h3 className="text-lg font-medium mb-4">Select Date</h3>
        <style>{`
          .rdp-day_selected:not([disabled]) { 
            font-weight: bold; 
            border: 2px solid #D4AF37;
            background-color: #FFF8E7;
            color: #D4AF37;
          }
          .rdp-day_selected:hover:not([disabled]) { 
            border-color: #D4AF37;
            background-color: #FFF8E7;
            color: #D4AF37;
          }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: #f7f7f7;
          }
        `}</style>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          disabled={[{ before: new Date() }, ...blockedDates]}
          modifiersClassNames={{
            selected: 'my-selected',
          }}
        />
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Select Time & Duration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <select 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border"
              >
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
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
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
                <p>Date: {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}</p>
                <p>Time: {startTime}</p>
                <p>Duration: {duration} hours</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
