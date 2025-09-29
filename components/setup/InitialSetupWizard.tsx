import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

interface InitialSetupWizardProps {
  onComplete: () => void;
}

const InitialSetupWizard: React.FC<InitialSetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  
  // Form data
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    avatarUrl: 'https://picsum.photos/seed/admin/100/100'
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    email: '',
    phone: ''
  });

  const tryAutomaticSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Try to create admin user
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .insert({
          name: adminData.name,
          email: adminData.email,
          avatar_url: adminData.avatarUrl,
          role: 'Owner',
          status: 'Active',
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (staffError) throw staffError;

      // Step 2: Create company settings
      const { error: settingsError } = await supabase
        .from('app_settings')
        .insert({
          company_name: companyData.name,
          company_address: companyData.address,
          company_email: companyData.email,
          invoice_prefix: 'INV',
          default_due_days: 14,
          footer_notes: `Thank you for choosing ${companyData.name}!`,
          automated_reminders_enabled: true,
          reminder_frequency_days: 7
        });

      if (settingsError) throw settingsError;

      // Step 3: Create session categories
      const { data: categories, error: catError } = await supabase
        .from('session_categories')
        .insert([
          { name: 'Wedding' },
          { name: 'Portrait' },
          { name: 'Corporate' }
        ])
        .select();

      if (catError) throw catError;

      // Step 4: Create session packages
      if (categories && categories.length > 0) {
        const { error: pkgError } = await supabase
          .from('session_packages')
          .insert([
            {
              session_category_id: categories[0].id,
              name: 'Wedding Basic',
              price: 2500,
              inclusions: ['4 Hours Coverage', '1 Photographer', '100 Edited Photos']
            },
            {
              session_category_id: categories[1].id,
              name: 'Portrait Session',
              price: 750,
              inclusions: ['1 Hour Studio Session', '15 Edited Photos']
            },
            {
              session_category_id: categories[2].id,
              name: 'Corporate Headshots',
              price: 1200,
              inclusions: ['2 Hour Session', '25 Edited Photos']
            }
          ]);

        if (pkgError) throw pkgError;
      }

      // Step 5: Create payment accounts
      const { error: payError } = await supabase
        .from('payment_accounts')
        .insert([
          { name: 'Main Business Account', type: 'Bank', details: 'Primary business checking' },
          { name: 'Cash Register', type: 'Cash', details: 'Studio cash payments' },
          { name: 'PayPal Business', type: 'Digital Wallet', details: 'Online payments' }
        ]);

      if (payError) throw payError;

      // Success!
      onComplete();
      
    } catch (err: any) {
      console.error('Setup error:', err);
      if (err.code === '42501' || err.message.includes('row-level security')) {
        setError('Automatic setup blocked by security policies. Please use manual setup below.');
        setShowManualInstructions(true);
      } else {
        setError(err.message || 'Setup failed. Please try manual setup.');
        setShowManualInstructions(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminData.name || !adminData.email || !companyData.name || !companyData.email) {
      setError('Please fill in all required fields');
      return;
    }

    tryAutomaticSetup();
  };

  const manualSteps = [
    {
      table: 'staff_members',
      title: '1. Create Admin User',
      data: {
        name: adminData.name || 'Your Name',
        email: adminData.email || 'admin@yourbusiness.com',
        avatar_url: 'https://picsum.photos/100',
        role: 'Owner',
        status: 'Active',
        last_login: 'current timestamp'
      }
    },
    {
      table: 'app_settings',
      title: '2. Company Settings',
      data: {
        company_name: companyData.name || 'Your Business Name',
        company_address: companyData.address || 'Your Business Address',
        company_email: companyData.email || 'contact@yourbusiness.com',
        invoice_prefix: 'INV',
        default_due_days: 14
      }
    },
    {
      table: 'session_categories',
      title: '3. Session Categories',
      data: [
        { name: 'Wedding' },
        { name: 'Portrait' },
        { name: 'Corporate' }
      ]
    },
    {
      table: 'payment_accounts',
      title: '4. Payment Accounts',
      data: [
        { name: 'Main Account', type: 'Bank', details: 'Business checking' },
        { name: 'Cash Register', type: 'Cash', details: 'Studio cash' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to PhotoLens!
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your photography business management system
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {!showManualInstructions ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Setup</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Admin User Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Administrator Account</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={adminData.name}
                        onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="admin@yourcompany.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Company Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Business Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Photography Studio"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Email *
                      </label>
                      <input
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contact@yourcompany.com"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Address
                      </label>
                      <input
                        type="text"
                        value={companyData.address}
                        onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Studio Street, City, State"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Setup Error</h4>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Setting up...
                      </div>
                    ) : (
                      'Try Automatic Setup'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowManualInstructions(true)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Manual Setup
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  We'll create your admin account, company settings, and essential business data
                </p>
              </form>
            </>
          ) : (
            <>
              {/* Manual Instructions */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Manual Setup Required</h2>
                  <p className="text-gray-600">
                    Please add this data manually in your Supabase dashboard:
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900">Instructions:</h4>
                      <ol className="text-sm text-blue-800 mt-1 space-y-1">
                        <li>1. Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                        <li>2. Go to Table Editor</li>
                        <li>3. For each table below, click "Insert" → "Insert row"</li>
                        <li>4. Copy and paste the data shown</li>
                        <li>5. Click "Save" for each row</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {manualSteps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Table: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{step.table}</code>
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {typeof step.data === 'object' && Array.isArray(step.data) 
                          ? step.data.map((item, i) => `Row ${i + 1}:\n${JSON.stringify(item, null, 2)}`).join('\n\n')
                          : JSON.stringify(step.data, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                ))}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowManualInstructions(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    ← Back to Form
                  </button>
                  
                  <button
                    onClick={onComplete}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
                  >
                    I've Added the Data - Continue to App
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitialSetupWizard;