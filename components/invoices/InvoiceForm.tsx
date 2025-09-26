
import React, { useState, useEffect } from 'react';
import { InvoiceFormProps, InvoiceItem, SessionCategory } from '../../types';

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, bookings, clients, sessionTypes, onSave, onCancel }) => {
    const [bookingId, setBookingId] = useState('');
    const [clientId, setClientId] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<'Paid' | 'Overdue' | 'Sent'>('Sent');
    
    useEffect(() => {
        if (invoice) {
            setBookingId(invoice.bookingId);
            setClientId(invoice.clientId);
            setItems(invoice.items.map(item => ({...item}))); // Create a copy
            setDueDate(new Date(invoice.dueDate).toISOString().split('T')[0]);
            setStatus(invoice.status);
        } else {
            resetForm();
        }
    }, [invoice]);
    
    const resetForm = () => {
        setBookingId('');
        setClientId('');
        setItems([{ id: `item-${Date.now()}`, description: '', quantity: 1, price: 0 }]);
        setDueDate('');
        setStatus('Sent');
    };

    const handleBookingChange = (selectedBookingId: string) => {
        const selectedBooking = bookings.find(b => b.id === selectedBookingId);
        if (selectedBooking) {
            setBookingId(selectedBooking.id);
            setClientId(selectedBooking.clientId);
            
            // Find the session package price
            let packagePrice = 0;
            const category = sessionTypes.find(st => st.id === selectedBooking.sessionCategoryId);
            const pkg = category?.packages.find(p => p.id === selectedBooking.sessionPackageId);
            if (pkg) {
                packagePrice = pkg.price;
            }

            // Auto-fill first item with booking info and price
            setItems([{
                id: `item-${Date.now()}`,
                description: selectedBooking.sessionType,
                quantity: 1,
                price: packagePrice
            }]);
        }
    };

    const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        const newItems = [...items];
        const itemToUpdate = { ...newItems[index] };
        
        if (field === 'quantity' || field === 'price') {
             itemToUpdate[field] = parseFloat(value as string) || 0;
        } else {
             itemToUpdate[field] = value as string;
        }

        newItems[index] = itemToUpdate;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { id: `item-${Date.now()}`, description: '', quantity: 1, price: 0 }]);
    };
    
    const removeItem = (index: number) => {
        if (items.length > 1) { // Prevent removing the last item
            setItems(items.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId || !clientId) {
            alert('Please select a booking.');
            return;
        }
        await onSave({
            id: invoice?.id,
            bookingId,
            clientId,
            items,
            dueDate: new Date(dueDate),
            status,
        });
    };

    const clientForBooking = clients.find(c => c.id === clientId);
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="booking" className="block text-sm font-medium text-slate-300">Booking</label>
                <select
                    id="booking"
                    value={bookingId}
                    onChange={(e) => handleBookingChange(e.target.value)}
                    required
                    disabled={!!invoice} // Disable if editing
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-800 disabled:text-slate-400"
                >
                    <option value="" disabled>Select an uninvoiced booking</option>
                    {(invoice ? bookings.filter(b => b.id === invoice.bookingId) : bookings).map(b => (
                        <option key={b.id} value={b.id}>
                            {b.clientName} - {b.sessionType} ({new Date(b.date).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>
            
            {clientForBooking && (
                 <div className="bg-slate-900/50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-slate-400">Client Information</label>
                    <div className="flex items-center mt-2">
                        <img src={clientForBooking.avatarUrl} alt={clientForBooking.name} className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="font-semibold text-white">{clientForBooking.name}</p>
                            <p className="text-sm text-slate-300">{clientForBooking.email}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Items Section */}
            <div>
                 <label className="block text-sm font-medium text-slate-300">Items</label>
                 <div className="space-y-3 mt-2">
                    {items.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                required
                                className="col-span-6 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                            />
                             <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                required
                                min="1"
                                className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                            />
                            <div className="col-span-3 relative">
                               <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">$</span>
                               <input
                                  type="number"
                                  placeholder="Price"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                  required
                                  step="0.01"
                                  min="0"
                                  className="w-full pl-7 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                               />
                            </div>
                            <button 
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={items.length <= 1}
                                className="col-span-1 text-slate-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={addItem}
                        className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        + Add Item
                    </button>
                 </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                    <span className="text-slate-400">Total Amount</span>
                    <p className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300">Due Date</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        required
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Save Invoice
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;
