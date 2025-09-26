import React, { useState, useEffect } from 'react';
import { SettingsPageProps, SessionCategory, SessionPackage, Permission, EditingStatus, PaymentAccount, AppSettings } from '../../types';
import SessionCategoryCard from './SessionCategoryCard';
import Modal from '../shared/Modal';
import SessionCategoryForm from './SessionCategoryForm';
import SessionPackageForm from './SessionPackageForm';
import { hasPermission } from '../../services/permissions';

const colorOptions: EditingStatus['color'][] = ['yellow', 'blue', 'purple', 'green', 'slate'];

const EditingStatusForm: React.FC<{ 
    status?: EditingStatus | null;
    onSave: (status: Omit<EditingStatus, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ status, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState<EditingStatus['color']>('slate');

    useEffect(() => {
        if (status) {
            setName(status.name);
            setColor(status.color);
        } else {
            setName('');
            setColor('slate');
        }
    }, [status]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: status?.id, name, color });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="status-name" className="block text-sm font-medium text-slate-300">Status Name</label>
                <input
                    type="text"
                    id="status-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Retouching, Awaiting Payment"
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <div>
                 <label htmlFor="status-color" className="block text-sm font-medium text-slate-300">Color</label>
                 <div className="mt-2 flex space-x-2">
                    {colorOptions.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full bg-${c}-500 transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''}`}></button>
                    ))}
                 </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">Save Status</button>
            </div>
        </form>
    );
};

const accountTypeOptions: PaymentAccount['type'][] = ['Bank', 'Cash', 'Digital Wallet', 'Other'];

const PaymentAccountForm: React.FC<{
    account?: PaymentAccount | null;
    onSave: (account: Omit<PaymentAccount, 'id'> & { id?: string }) => void;
    onCancel: () => void;
}> = ({ account, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<PaymentAccount['type']>('Bank');
    const [details, setDetails] = useState('');

    useEffect(() => {
        if (account) {
            setName(account.name);
            setType(account.type);
            setDetails(account.details || '');
        } else {
            setName('');
            setType('Bank');
            setDetails('');
        }
    }, [account]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: account?.id, name, type, details });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="account-name" className="block text-sm font-medium text-slate-300">Account Name</label>
                <input
                    type="text"
                    id="account-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., BCA Utama, Kas Tunai Studio"
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
             <div>
                <label htmlFor="account-type" className="block text-sm font-medium text-slate-300">Account Type</label>
                <select
                    id="account-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as PaymentAccount['type'])}
                    required
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {accountTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="account-details" className="block text-sm font-medium text-slate-300">Details (Optional)</label>
                <input
                    type="text"
                    id="account-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g., No. Rekening 123-456-7890"
                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">Save Account</button>
            </div>
        </form>
    );
};

const AutomationSettings: React.FC<{ settings: AppSettings, onSave: (settings: AppSettings) => void }> = ({ settings, onSave }) => {
    const [enabled, setEnabled] = useState(settings.automatedReminders.enabled);
    const [frequency, setFrequency] = useState(settings.automatedReminders.frequencyDays);

    const handleSave = () => {
        onSave({
            ...settings,
            automatedReminders: {
                enabled,
                frequencyDays: frequency
            }
        });
        // In a real app, you might want a more subtle confirmation
        alert('Automation settings saved!');
    };
    
    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Automation Settings</h2>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-md bg-slate-900/50">
                    <div>
                        <label htmlFor="enable-reminders" className="font-medium text-slate-200">Automated Invoice Reminders</label>
                        <p className="text-sm text-slate-400">Automatically send reminders for overdue invoices.</p>
                    </div>
                     <label htmlFor="enable-reminders" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="enable-reminders" className="sr-only" checked={enabled} onChange={() => setEnabled(!enabled)} />
                            <div className="block bg-slate-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${enabled ? 'transform translate-x-full bg-cyan-400' : ''}`}></div>
                        </div>
                    </label>
                </div>

                <div className={`transition-opacity ${enabled ? 'opacity-100' : 'opacity-50'}`}>
                    <label htmlFor="reminder-frequency" className="block text-sm font-medium text-slate-300">Reminder Frequency</label>
                     <div className="flex items-center space-x-2 mt-1">
                        <span className="text-slate-400">Send reminder every</span>
                        <input
                            type="number"
                            id="reminder-frequency"
                            value={frequency}
                            onChange={(e) => setFrequency(parseInt(e.target.value, 10) || 1)}
                            min="1"
                            disabled={!enabled}
                            className="w-20 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed"
                        />
                         <span className="text-slate-400">day(s) for an overdue invoice.</span>
                    </div>
                </div>

                 <div className="flex justify-end pt-4 border-t border-slate-700">
                    <button onClick={handleSave} className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">
                        Save Automation Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

const CompanyProfileSettings: React.FC<{ settings: AppSettings, onSave: (settings: AppSettings) => void }> = ({ settings, onSave }) => {
    const [profile, setProfile] = useState(settings.companyProfile);

    useEffect(() => {
        setProfile(settings.companyProfile);
    }, [settings.companyProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave({ ...settings, companyProfile: profile });
        alert('Company profile updated!');
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Company Profile</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="company-name" className="block text-sm font-medium text-slate-300">Company Name</label>
                    <input type="text" name="name" id="company-name" value={profile.name} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="company-address" className="block text-sm font-medium text-slate-300">Address</label>
                    <textarea name="address" id="company-address" value={profile.address} onChange={handleChange} rows={3} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="company-email" className="block text-sm font-medium text-slate-300">Contact Email</label>
                    <input type="email" name="email" id="company-email" value={profile.email} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="company-logoUrl" className="block text-sm font-medium text-slate-300">Logo URL</label>
                    <input type="text" name="logoUrl" id="company-logoUrl" value={profile.logoUrl} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                 <div className="flex justify-end pt-4 border-t border-slate-700">
                    <button onClick={handleSave} className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">Save Profile</button>
                </div>
            </div>
        </div>
    );
};

const InvoiceSettings: React.FC<{ settings: AppSettings, onSave: (settings: AppSettings) => void }> = ({ settings, onSave }) => {
    const [invoiceSettings, setInvoiceSettings] = useState(settings.invoiceSettings);
     
    useEffect(() => {
        setInvoiceSettings(settings.invoiceSettings);
    }, [settings.invoiceSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInvoiceSettings(prev => ({
            ...prev,
            [name]: name === 'defaultDueDays' ? parseInt(value, 10) : value,
        }));
    };
    
    const handleSave = () => {
        onSave({ ...settings, invoiceSettings });
        alert('Invoice settings updated!');
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Invoice Settings</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="invoice-prefix" className="block text-sm font-medium text-slate-300">Invoice Prefix</label>
                    <input type="text" name="prefix" id="invoice-prefix" value={invoiceSettings.prefix} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="invoice-dueDays" className="block text-sm font-medium text-slate-300">Default Due Days</label>
                    <input type="number" name="defaultDueDays" id="invoice-dueDays" value={invoiceSettings.defaultDueDays} onChange={handleChange} min="0" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="invoice-footer" className="block text-sm font-medium text-slate-300">Footer Notes</label>
                    <textarea name="footerNotes" id="invoice-footer" value={invoiceSettings.footerNotes} onChange={handleChange} rows={4} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                 <div className="flex justify-end pt-4 border-t border-slate-700">
                    <button onClick={handleSave} className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors">Save Invoice Settings</button>
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    sessionCategories, 
    editingStatuses,
    paymentAccounts,
    appSettings,
    bookings,
    editingJobs,
    currentUser,
    onSaveCategory, 
    onDeleteCategory,
    onSavePackage,
    onDeletePackage,
    onSaveStatus,
    onDeleteStatus,
    onSavePaymentAccount,
    onDeletePaymentAccount,
    onSaveSettings
}) => {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SessionCategory | null>(null);

    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<SessionPackage | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<EditingStatus | null>(null);
    
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);

    const canManageSettings = hasPermission(currentUser.role, Permission.MANAGE_SETTINGS);

    // Category Handlers
    const handleAddNewCategory = () => { setEditingCategory(null); setIsCategoryModalOpen(true); };
    const handleEditCategory = (category: SessionCategory) => { setEditingCategory(category); setIsCategoryModalOpen(true); };
    const handleSaveCategory = (categoryData: Omit<SessionCategory, 'packages'> & { id?: string }) => { onSaveCategory(categoryData); setIsCategoryModalOpen(false); };
    const handleDeleteCategory = (categoryId: string) => { if (window.confirm('Are you sure you want to delete this entire category and all its packages?')) { onDeleteCategory(categoryId); } };

    // Package Handlers
    const handleAddNewPackage = (categoryId: string) => { setActiveCategoryId(categoryId); setEditingPackage(null); setIsPackageModalOpen(true); };
    const handleEditPackage = (categoryId: string, pkg: SessionPackage) => { setActiveCategoryId(categoryId); setEditingPackage(pkg); setIsPackageModalOpen(true); };
    const handleSavePackage = (packageData: Omit<SessionPackage, 'id'> & { id?: string }) => { if (activeCategoryId) { onSavePackage(activeCategoryId, packageData); } setIsPackageModalOpen(false); };
    const handleDeletePackage = (categoryId: string, packageId: string) => { if (window.confirm('Are you sure you want to delete this package?')) { onDeletePackage(categoryId, packageId); } };

    // Status Handlers
    const handleAddNewStatus = () => { setEditingStatus(null); setIsStatusModalOpen(true); };
    const handleEditStatus = (status: EditingStatus) => { setEditingStatus(status); setIsStatusModalOpen(true); };
    const handleSaveStatus = (statusData: Omit<EditingStatus, 'id'> & { id?: string }) => { onSaveStatus(statusData); setIsStatusModalOpen(false); };
    const handleDeleteStatus = (statusId: string) => { if (window.confirm('Are you sure you want to delete this status?')) { onDeleteStatus(statusId); } };

    // Account Handlers
    const handleAddNewAccount = () => { setEditingAccount(null); setIsAccountModalOpen(true); };
    const handleEditAccount = (account: PaymentAccount) => { setEditingAccount(account); setIsAccountModalOpen(true); };
    const handleSaveAccount = (accountData: Omit<PaymentAccount, 'id'> & { id?: string }) => { onSavePaymentAccount(accountData); setIsAccountModalOpen(false); };
    const handleDeleteAccount = (accountId: string) => { if (window.confirm('Are you sure you want to delete this payment account?')) { onDeletePaymentAccount(accountId); } };

    const statusColorClass = (color: EditingStatus['color']) => `bg-${color}-500/20 text-${color}-300 border-${color}-500/30`;
    
    const getPackageUsageCount = (packageId: string) => bookings.filter(b => b.sessionPackageId === packageId).length;
    const getStatusUsageCount = (statusId: string) => editingJobs.filter(job => job.statusId === statusId).length;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-slate-100">Settings</h1></div>
            
             {canManageSettings && (
                <div className="space-y-8">
                    <CompanyProfileSettings settings={appSettings} onSave={onSaveSettings} />
                    <InvoiceSettings settings={appSettings} onSave={onSaveSettings} />
                    <AutomationSettings settings={appSettings} onSave={onSaveSettings} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="bg-slate-800 rounded-xl p-6 shadow-lg xl:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Manage Session Types</h2>
                        {canManageSettings && <button onClick={handleAddNewCategory} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>New Category</button>}
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {sessionCategories.map(category => <SessionCategoryCard key={category.id} category={category} canManage={canManageSettings} getPackageUsageCount={getPackageUsageCount} onEditCategory={handleEditCategory} onDeleteCategory={handleDeleteCategory} onAddPackage={handleAddNewPackage} onEditPackage={handleEditPackage} onDeletePackage={handleDeletePackage} />)}
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 shadow-lg xl:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Manage Editing Statuses</h2>
                        {canManageSettings && <button onClick={handleAddNewStatus} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>New Status</button>}
                    </div>
                    <div className="space-y-2">
                        {editingStatuses.map(status => (
                            <div key={status.id} className="flex justify-between items-center p-3 rounded-md bg-slate-900/50">
                                <div className="flex items-center space-x-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border ${statusColorClass(status.color)}`}>{status.name}</span>
                                    <span className="text-xs font-mono bg-slate-700 text-slate-300 rounded-full px-2 py-0.5">{getStatusUsageCount(status.id)} active</span>
                                </div>
                                {canManageSettings && (
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditStatus(status)} className="p-1 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                        <button onClick={() => handleDeleteStatus(status.id)} className="p-1 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                 <div className="bg-slate-800 rounded-xl p-6 shadow-lg xl:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Manage Payment Accounts</h2>
                        {canManageSettings && <button onClick={handleAddNewAccount} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>New Account</button>}
                    </div>
                    <div className="space-y-2">
                        {paymentAccounts.map(account => (
                            <div key={account.id} className="flex justify-between items-center p-3 rounded-md bg-slate-900/50">
                               <div>
                                   <p className="font-semibold text-white">{account.name}</p>
                                   <p className="text-xs text-slate-400">{account.type} {account.details && `- ${account.details}`}</p>
                               </div>
                                {canManageSettings && (
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditAccount(account)} className="p-1 text-slate-400 hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                        <button onClick={() => handleDeleteAccount(account.id)} className="p-1 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isCategoryModalOpen && canManageSettings && <Modal title={editingCategory ? "Edit Category" : "Add New Category"} onClose={() => setIsCategoryModalOpen(false)}><SessionCategoryForm category={editingCategory} onSave={handleSaveCategory} onCancel={() => setIsCategoryModalOpen(false)} /></Modal>}
            {isPackageModalOpen && canManageSettings && <Modal title={editingPackage ? "Edit Package" : "Add New Package"} onClose={() => setIsPackageModalOpen(false)}><SessionPackageForm pkg={editingPackage} onSave={handleSavePackage} onCancel={() => setIsPackageModalOpen(false)} /></Modal>}
            {isStatusModalOpen && canManageSettings && <Modal title={editingStatus ? "Edit Status" : "Add New Status"} onClose={() => setIsStatusModalOpen(false)}><EditingStatusForm status={editingStatus} onSave={handleSaveStatus} onCancel={() => setIsStatusModalOpen(false)} /></Modal>}
            {isAccountModalOpen && canManageSettings && <Modal title={editingAccount ? "Edit Payment Account" : "Add New Payment Account"} onClose={() => setIsAccountModalOpen(false)}><PaymentAccountForm account={editingAccount} onSave={handleSaveAccount} onCancel={() => setIsAccountModalOpen(false)} /></Modal>}
        </div>
    );
};

export default SettingsPage;