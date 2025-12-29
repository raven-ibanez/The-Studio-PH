
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Lock, Settings, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';

const SettingsTab = () => {
  const { siteSettings, updateSiteSettings, loading } = useSiteSettings();
  const { uploadImage, uploading, uploadProgress } = useImageUpload();
  const [formData, setFormData] = useState({
    gcash_qr_image: '',
    site_name: ''
  });

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        gcash_qr_image: siteSettings.gcash_qr_image || '',
        site_name: siteSettings.site_name || ''
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, gcash_qr_image: url }));
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
                onChange={handleImageSelect}
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


  // Mock Data
  const [bookings, setBookings] = useState([
    { id: '1', date: new Date(), time: '10:00', duration: 2, name: 'John Doe', status: 'confirmed', total: 2000 },
    { id: '2', date: new Date(), time: '14:00', duration: 3, name: 'Jane Smith', status: 'pending', total: 3000 }
  ]);

  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ClickEats@Admin!2025') {
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

  const toggleBlockDate = (date: Date) => {
    // Check if date is already blocked
    const isBlocked = blockedDates.some(d => d.toDateString() === date.toDateString());
    if (isBlocked) {
      setBlockedDates(blockedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      setBlockedDates([...blockedDates, date]);
    }
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
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">Studio Admin</h1>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'bookings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <CalendarIcon className="w-5 h-5" /> Both Bookings & Calendar
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'blocked' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Lock className="w-5 h-5" /> Block Dates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
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
            <h2 className="text-2xl font-bold mb-6">Bookings Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar View */}
              <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-1">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasBooking: bookings.map(b => b.date),
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
                {bookings.filter(b => !selectedDate || isSameDay(new Date(b.date), selectedDate)).length === 0 ? (
                  <p className="text-gray-500">No bookings for this date.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings
                      .filter(b => !selectedDate || isSameDay(new Date(b.date), selectedDate))
                      .map(booking => (
                        <div key={booking.id} className="border p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-bold">{booking.time} - {booking.duration} hours</p>
                            <p className="text-sm text-gray-600">{booking.name}</p>
                            <p className="text-sm font-medium">₱{booking.total.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-5 h-5" /></button>
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-5 h-5" /></button>
                              </>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {booking.status}
                            </span>
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