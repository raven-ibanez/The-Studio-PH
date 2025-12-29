
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
// import Big from 'big.js';

interface BookingFormProps {
    selectedDate: Date;
    startTime: string;
    duration: number;
    pricePerHour: number;
    onSubmit: (data: any) => Promise<void>;
}

const BookingForm: React.FC<BookingFormProps> = ({
    selectedDate,
    startTime,
    duration,
    pricePerHour,
    onSubmit
}) => {
    const { siteSettings } = useSiteSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank-transfer'>('gcash');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Price Calculation: First 2 hours = 2000 (min), succeeding = 1000/hr
    // Actually the requirements say: "1k per hour and the minimum is 2 hours"
    // So 2 hours = 2000. 3 hours = 3000.
    const totalPrice = duration * pricePerHour;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                totalPrice,
                paymentMethod,
                referenceNumber
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Complete Your Reservation</h3>

            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-md">
                <p className="text-red-800 text-sm font-medium">
                    Note: Half Downpayment or full payment required for reservation. Non-refundable.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests / Notes</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black h-24"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                {/* Payment Section */}
                <div className="border-t pt-4 mt-6">
                    <h4 className="font-semibold mb-4">Payment Method</h4>
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('gcash')}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${paymentMethod === 'gcash'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            GCash
                        </button>
                        {/* Add more methods here if needed */}
                    </div>

                    {paymentMethod === 'gcash' && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
                            <p className="font-medium mb-2">Scan to Pay</p>
                            {siteSettings?.gcash_qr_image ? (
                                <img
                                    src={siteSettings.gcash_qr_image}
                                    alt="GCash QR Code"
                                    className="mx-auto w-48 h-48 object-contain bg-white p-2 rounded shadow-sm mb-2"
                                />
                            ) : (
                                <div className="mx-auto w-48 h-48 bg-gray-200 flex items-center justify-center rounded mb-2 text-gray-500 text-sm">
                                    No QR Code Uploaded
                                </div>
                            )}
                            <p className="text-sm text-gray-600 mb-4">
                                Please scan the QR code using your GCash app.
                            </p>

                            <label className="block text-left text-sm font-medium text-gray-700 mb-1">
                                Reference Number / Transaction ID
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Enter the GCash Ref No."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                                value={referenceNumber}
                                onChange={e => setReferenceNumber(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between items-center text-lg font-semibold mb-6">
                        <span>Total Price</span>
                        <span>₱ {totalPrice.toLocaleString()}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Confirm Booking'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;
