import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import BookingCalendar from './components/BookingCalendar';
import BookingForm from './components/BookingForm';
import { MessageCircle } from 'lucide-react';
import { formatTo12Hour } from './utils/time';
import { useSiteSettings } from './hooks/useSiteSettings';

function BookingPage() {
  const { siteSettings } = useSiteSettings();
  const [step, setStep] = useState<'calendar' | 'details'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState<{ start: string; duration: number }>({ start: '09:00', duration: 2 });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (start: string, duration: number) => {
    setBookingTime({ start, duration });
  };

  const handleProceed = () => {
    if (selectedDate && bookingTime) {
      setStep('details');
    }
  };

  const handleBookingSubmit = async (data: any) => {
    // Format the message for Messenger
    const message = `
New Booking Request:
Name: ${data.name}
Date: ${selectedDate?.toLocaleDateString()}
Time: ${formatTo12Hour(bookingTime.start)} (${bookingTime.duration} hours)
Phone: ${data.phone}
Email: ${data.email}
Notes: ${data.notes || 'None'}
Total: ₱${data.totalPrice.toLocaleString()}
Payment Method: ${data.paymentMethod.toUpperCase()}
Reference No: ${data.referenceNumber || 'N/A'}
    `.trim();

    // Encode the message for the URL (Messenger doesn't support pre-filled messages via m.me links well, but sometimes it works on mobile or we can just copy it)
    // For now, we'll just redirect to the page.
    // Ideally, we could use the Facebook Messenger SDK or just a simple link.
    // Since m.me doesn't officially support ?text= anymore for pages reliably, we will alert the user or just open the chat.

    // We can try to copy the details to clipboard so the user can paste it.
    try {
      await navigator.clipboard.writeText(message);
      alert('Booking details copied to clipboard! Redirecting to Messenger...');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Redirecting to Messenger...');
    }

    // Redirect to Messenger with pre-filled text
    // Note: The ?text= parameter is not consistently supported across all devices/platforms for m.me links,
    // but we include it as a best-effort attempt. The clipboard copy serves as a reliable fallback.
    const encodedMessage = encodeURIComponent(message);
    const messengerId = siteSettings?.messenger_id || 'WebNegosyoOfficial';
    window.open(`https://m.me/${messengerId}?text=${encodedMessage}`, '_blank');

    // Reset or reload
    // window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {step === 'calendar' ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-serif mb-4">Book Your Session</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your preferred date and time. Our studio offers professional equipment,
              makeup room, and a creative atmosphere.
            </p>
          </div>

          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            minDuration={2}
          />

          <div className="flex justify-end mt-8">
            <button
              onClick={handleProceed}
              disabled={!selectedDate}
              className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue to Details
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setStep('calendar')}
            className="mb-6 text-gray-600 hover:text-black flex items-center gap-2"
          >
            ← Back to Calendar
          </button>
          <div className="max-w-2xl mx-auto">
            <BookingForm
              selectedDate={selectedDate!}
              startTime={bookingTime.start}
              duration={bookingTime.duration}
              pricePerHour={1000}
              onSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MainApp() {
  const { siteSettings } = useSiteSettings();
  return (
    <div className="min-h-screen bg-cream-50 font-inter text-gray-900">
      <Header onMenuClick={() => { }} />

      {/* Hero Section */}
      <div className="relative bg-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif">The Studio PH</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Professional photography studio rental for your creative needs.
          </p>
          <div className="pt-8">
            <Link
              to="/book"
              className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors inline-block"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">1</div>
            <h3 className="text-xl font-bold mb-2">Professional Equipment</h3>
            <p className="text-gray-600">High-end lighting and backdrops included in your rental.</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">2</div>
            <h3 className="text-xl font-bold mb-2">Makeup Room</h3>
            <p className="text-gray-600">Private area for styling and preparation included.</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">3</div>
            <h3 className="text-xl font-bold mb-2">Flexible Hours</h3>
            <p className="text-gray-600">Book for as long as you need, starting from 2 hours.</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={`https://m.me/${siteSettings?.messenger_id || 'WebNegosyoOfficial'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden md:inline font-medium">Chat with us</span>
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/book" element={
          <div className="min-h-screen bg-cream-50 font-inter">
            <Header onMenuClick={() => { }} />
            <BookingPage />
          </div>
        } />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;