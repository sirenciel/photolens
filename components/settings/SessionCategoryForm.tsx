
import React, { useState, useEffect } from 'react';
import { SessionCategoryFormProps } from '../../types';

const SessionCategoryForm: React.FC<SessionCategoryFormProps> = ({ category, onSave, onCancel }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name);
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({ id: category?.id, name });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-slate-300">Category Name</label>
                <input
                    type="text"
                    id="category-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Wedding, Portrait, etc."
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
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
                    Save Category
                </button>
            </div>
        </form>
    );
};

export default SessionCategoryForm;
