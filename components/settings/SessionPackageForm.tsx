
import React, { useState, useEffect } from 'react';
import { SessionPackageFormProps } from '../../types';

const SessionPackageForm: React.FC<SessionPackageFormProps> = ({ pkg, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number | ''>('');

    useEffect(() => {
        if (pkg) {
            setName(pkg.name);
            setPrice(pkg.price);
        } else {
            setName('');
            setPrice('');
        }
    }, [pkg]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (price === '') return;
        onSave({ id: pkg?.id, name, price });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="package-name" className="block text-sm font-medium text-slate-300">Package Name</label>
                <input
                    type="text"
                    id="package-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Silver Package, Full Body"
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <div>
                <label htmlFor="package-price" className="block text-sm font-medium text-slate-300">Default Price</label>
                <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-400 sm:text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        id="package-price"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || '')}
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="block w-full pl-7 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
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
                    Save Package
                </button>
            </div>
        </form>
    );
};

export default SessionPackageForm;
