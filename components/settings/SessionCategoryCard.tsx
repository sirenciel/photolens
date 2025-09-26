import React from 'react';
import { SessionCategory, SessionPackage } from '../../types';

interface SessionCategoryCardProps {
    category: SessionCategory;
    canManage: boolean;
    getPackageUsageCount: (packageId: string) => number;
    onEditCategory: (category: SessionCategory) => void;
    onDeleteCategory: (categoryId: string) => void;
    onAddPackage: (categoryId: string) => void;
    onEditPackage: (categoryId: string, pkg: SessionPackage) => void;
    onDeletePackage: (categoryId: string, packageId: string) => void;
}

const SessionCategoryCard: React.FC<SessionCategoryCardProps> = ({ 
    category, 
    canManage,
    getPackageUsageCount,
    onEditCategory,
    onDeleteCategory,
    onAddPackage,
    onEditPackage,
    onDeletePackage
}) => {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="p-4 flex justify-between items-center border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">{category.name}</h3>
                {canManage && (
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => onAddPackage(category.id)}
                            className="text-sm py-1 px-3 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white transition-colors">
                            + Add Package
                        </button>
                        <button onClick={() => onEditCategory(category)} className="p-1 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                        <button onClick={() => onDeleteCategory(category.id)} className="p-1 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    </div>
                )}
            </div>
            
            <div className="p-4">
                {category.packages.length > 0 ? (
                    <ul className="space-y-2">
                        {category.packages.map(pkg => {
                           const usageCount = getPackageUsageCount(pkg.id);
                           return (
                            <li key={pkg.id} className="flex justify-between items-center p-2 rounded-md bg-slate-800">
                                <div>
                                    <span className="font-semibold text-slate-200">{pkg.name}</span>
                                     {usageCount > 0 && <span className="ml-2 text-xs font-mono bg-slate-700 text-slate-300 rounded-full px-2 py-0.5">{usageCount} active</span>}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-slate-300 font-mono">{formatCurrency(pkg.price)}</span>
                                    {canManage && (
                                        <>
                                            <button onClick={() => onEditPackage(category.id, pkg)} className="p-1 text-slate-500 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => onDeletePackage(category.id, pkg.id)} className="p-1 text-slate-500 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </>
                                    )}
                                </div>
                            </li>
                           )
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 text-sm py-4">No packages in this category yet. Click "+ Add Package" to get started.</p>
                )}
            </div>
        </div>
    );
};

export default SessionCategoryCard;