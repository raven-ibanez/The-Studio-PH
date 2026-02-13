import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Lock, Settings, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';
import { useBookings } from '../hooks/useBookings';
import { formatTo12Hour } from '../utils/time';

const SettingsTab = () => {
  const { siteSettings, updateSiteSettings, loading } = useSiteSettings();
  const { uploadImage, uploading, uploadProgress } = useImageUpload();
  const [formData, setFormData] = useState({
    site_logo: '',
    gcash_qr_image: '',
    site_name: '',
    opening_time: '09:00',
    closing_time: '21:00',
    messenger_id: ''
  });

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        site_logo: siteSettings.site_logo || '',
        gcash_qr_image: siteSettings.gcash_qr_image || '',
        site_name: siteSettings.site_name || '',
        opening_time: siteSettings.opening_time || '09:00',
        closing_time: siteSettings.closing_time || '21:00',
        messenger_id: siteSettings.messenger_id || ''
      });
    }
  }, [siteSettings]);

  const handleSave = async () => {
    try {
      await updateSiteSettings(formData);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: 'site_logo' | 'gcash_qr_image') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, [field]: url }));
      } catch (error) {
        alert('Failed to upload image');
      }
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Content Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="mb-6 border-b pb-6">
            <label className="block text-sm font-medium mb-1">Site Logo</label>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'site_logo')}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100
                "
                disabled={uploading}
              />
            </div>
            {formData.site_logo && (
              <div className="mt-2 mb-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={formData.site_logo}
                  alt="Logo Preview"
                  className="h-16 object-contain border rounded bg-gray-50"
                />
              </div>
            )}
            <label className="block text-xs font-medium text-gray-500 mb-1">Or enter Logo URL</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="https://..."
              value={formData.site_logo}
              onChange={(e) => setFormData({ ...formData, site_logo: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Policy Text</label>
          <textarea
            className="w-full border rounded-md p-2 h-24"
            defaultValue="Half Downpayment or full for reservation and non refundable"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hourly Rate (₱)</label>
            <input type="number" className="w-full border rounded-md p-2" defaultValue="1000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Hours</label>
            <input type="number" className="w-full border rounded-md p-2" defaultValue="2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opening Time</label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.opening_time}
              onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
            >
              {[...Array(24)].map((_, i) => {
                const t = `${i < 10 ? '0' : ''}${i}:00`;
                return <option key={t} value={t}>{formatTo12Hour(t)}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Closing Time</label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.closing_time}
              onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
            >
              {[...Array(24)].map((_, i) => {
                const t = `${i < 10 ? '0' : ''}${i}:00`;
                return <option key={t} value={t}>{formatTo12Hour(t)}</option>;
              })}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Messenger Settings</h3>
          <div className="mb-6 border-b pb-6">
            <label className="block text-sm font-medium mb-1">Messenger Page ID</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="e.g., 61587699944343"
              value={formData.messenger_id}
              onChange={(e) => setFormData({ ...formData, messenger_id: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Your Facebook Page ID or username for Messenger links (m.me/your-id)</p>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
          <div>
            <label className="block text-sm font-medium mb-1">GCash QR Code Image</label>

            {/* File Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'gcash_qr_image')}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100
                "
                disabled={uploading}
              />
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            <label className="block text-xs font-medium text-gray-500 mb-1">Or enter Image URL</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="https://..."
              value={formData.gcash_qr_image}
              onChange={(e) => setFormData({ ...formData, gcash_qr_image: e.target.value })}
            />
            {formData.gcash_qr_image && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={formData.gcash_qr_image}
                  alt="QR Preview"
                  className="w-48 h-48 object-contain border rounded-lg bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('beracah_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'blocked' | 'settings'>('bookings');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Hooks
  const { bookings, addBooking, updateBookingStatus, deleteBooking } = useBookings();
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  // Manual Booking Form State
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    customer_email: '',
    booking_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    duration_hours: 2,
    total_price: 2000,
    status: 'confirmed' as const,
    reservation_type: 'walk-in' as ('online' | 'walk-in'),
    notes: 'Manual Entry'
  });

  // Derived state for calendar modifiers
  const bookedDates = bookings
    .filter(b => b.status === 'confirmed')
    .map(b => new Date(b.booking_date));

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBooking({
        ...newBooking,
        customer_email: newBooking.customer_email || 'manual@admin.com',
        payment_status: 'paid'
      });
      setShowAddBooking(false);
      alert('Booking added successfully!');
      // Reset form
      setNewBooking({
        customer_name: '',
        customer_email: '',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        duration_hours: 2,
        total_price: 2000,
        status: 'confirmed',
        reservation_type: 'walk-in',
        notes: 'Manual Entry'
      });
    } catch (error) {
      alert('Failed to add booking');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'TheStudioPH@Admin!2025') {
      setIsAuthenticated(true);
      localStorage.setItem('beracah_admin_auth', 'true');
    } else {
      alert('Invalid Password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('beracah_admin_auth');
  };



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Studio Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4"
              placeholder="Enter password"
            />
            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-full shadow-lg"
      >
        {isSidebarOpen ? <XCircle /> : <CalendarIcon />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-6 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <h1 className="text-xl font-bold mb-8">Studio Admin</h1>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'bookings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <CalendarIcon className="w-5 h-5" /> Both Bookings & Calendar
          </button>
          <button
            onClick={() => { setActiveTab('blocked'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'blocked' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Lock className="w-5 h-5" /> Block Dates
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5" /> Content Settings
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 mt-auto px-4">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bookings Dashboard</h2>
              <button
                onClick={() => setShowAddBooking(!showAddBooking)}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                {showAddBooking ? 'Cancel' : 'Add Confirmed Booking'}
              </button>
            </div>

            {showAddBooking && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200 animate-fade-in">
                <h3 className="font-semibold mb-4">New Reservation</h3>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name</label>
                    <input
                      required
                      type="text"
                      className="w-full border rounded-md p-2"
                      value={newBooking.customer_name}
                      onChange={e => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      required
                      type="date"
                      className="w-full border rounded-md p-2"
                      value={newBooking.booking_date}
                      onChange={e => setNewBooking({ ...newBooking, booking_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newBooking.start_time}
                      onChange={e => setNewBooking({ ...newBooking, start_time: e.target.value })}
                    >
                      {[...Array(13)].map((_, i) => {
                        const h = i + 9;
                        const t = `${h < 10 ? '0' : ''}${h}:00`;
                        return <option key={t} value={t}>{formatTo12Hour(t)}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border rounded-md p-2"
                      value={newBooking.duration_hours}
                      onChange={e => setNewBooking({ ...newBooking, duration_hours: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reservation Type</label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newBooking.reservation_type}
                      onChange={e => setNewBooking({ ...newBooking, reservation_type: e.target.value as 'online' | 'walk-in' })}
                    >
                      <option value="walk-in">Walk-in</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    {/* Placeholder for layout alignment if needed */}
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 w-full md:w-auto">
                      Save Reservation
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar View */}
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-1">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasBooking: bookedDates,
                    blocked: blockedDates
                  }}
                  modifiersStyles={{
                    hasBooking: { fontWeight: 'bold', border: '2px solid black' },
                    blocked: { textDecoration: 'line-through', color: 'red' }
                  }}
                />
              </div>

              {/* Bookings List */}
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                <h3 className="font-semibold mb-4">
                  Bookings for {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'All Dates'}
                </h3>
                {bookings.filter(b => !selectedDate || isSameDay(new Date(b.booking_date), selectedDate)).length === 0 ? (
                  <p className="text-gray-500">No bookings for this date.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings
                      .filter(b => !selectedDate || isSameDay(new Date(b.booking_date), selectedDate))
                      .map(booking => (
                        <div key={booking.id} className="border p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{formatTo12Hour(booking.start_time.slice(0, 5))} - {booking.duration_hours} hrs</p>
                              <span className="text-xs text-gray-500">({booking.booking_date})</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${booking.reservation_type === 'online'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                                }`}>
                                {booking.reservation_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{booking.customer_name}</p>
                            <p className="text-sm font-medium">₱{booking.total_price.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="p-2 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-5 h-5" /></button>
                                <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="p-2 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-5 h-5" /></button>
                              </>
                            )}
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {booking.status}
                              </span>
                              <button onClick={() => deleteBooking(booking.id)} className="text-gray-400 hover:text-red-500 ml-2">
                                <LogOut className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blocked' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Blocked Dates</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
              <p className="mb-4 text-gray-600">Select dates to block/unblock from the calendar.</p>
              <style>{`
                        .rdp-day_selected { background-color: #ef4444 !important; border: none; }
                        .rdp-day_selected:hover { background-color: #dc2626 !important; }
                    `}</style>
              <DayPicker
                mode="multiple"
                selected={blockedDates}
                onSelect={(dates) => setBlockedDates(dates || [])}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

// Helper for date comparison
function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export default AdminDashboard;