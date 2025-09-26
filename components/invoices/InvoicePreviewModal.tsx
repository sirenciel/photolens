import React from 'react';
import { Invoice, Client, PaymentAccount, AppSettings } from '../../types';
import Modal from '../shared/Modal';
import { WhatsAppIcon } from '../../constants';

interface InvoicePreviewModalProps {
    invoice: Invoice;
    client: Client;
    type: 'invoice' | 'receipt';
    onClose: () => void;
    paymentAccounts: PaymentAccount[];
    appSettings: AppSettings;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, client, type, onClose, paymentAccounts, appSettings }) => {
    const title = type === 'invoice' ? 'Invoice' : 'Kuitansi';

    const handlePrint = () => {
        window.print();
    };

    const handleSendWhatsApp = () => {
        if (!client || !client.phone) {
            alert(`Client ${client?.name || 'Unknown'} does not have a valid phone number.`);
            return;
        }
        
        let phoneNumber = client.phone.replace(/[^0-9]/g, '');
        if (phoneNumber.startsWith('0')) {
            phoneNumber = '62' + phoneNumber.substring(1);
        } else if (!phoneNumber.startsWith('62')) {
            phoneNumber = '62' + phoneNumber;
        }

        const invoiceLink = `https://lensledger.app/view/${type}/${invoice.id}`;
        let message = '';
        if (type === 'invoice') {
            message = `Halo ${client.name},\n\nBerikut adalah invoice Anda ${invoice.id} sejumlah ${formatCurrency(invoice.amount)}.\nMohon lakukan pembayaran sebelum ${formatDate(invoice.dueDate)}.\n\nLihat invoice: ${invoiceLink}\n\nTerima kasih,\n${appSettings.companyProfile.name}`;
        } else {
            message = `Halo ${client.name},\n\nTerima kasih atas pembayaran Anda. Berikut adalah kuitansi untuk invoice ${invoice.id}.\n\nLihat kuitansi: ${invoiceLink}\n\nTerima kasih,\n${appSettings.companyProfile.name}`;
        }
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    
    const issueDate = invoice.issueDate ? invoice.issueDate : new Date();

    const getStatusInfo = () => {
        switch (invoice.status) {
            case 'Paid': return { text: 'Lunas', color: 'text-green-400', bg: 'bg-green-500/10' };
            case 'Overdue': return { text: 'Jatuh Tempo', color: 'text-red-400', bg: 'bg-red-500/10' };
            case 'Sent': return { text: 'Terkirim', color: 'text-blue-400', bg: 'bg-blue-500/10' };
            default: return { text: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/10' };
        }
    };
    const statusInfo = getStatusInfo();

    const getAccountName = (accountId: string) => {
        const account = paymentAccounts.find(acc => acc.id === accountId);
        return account ? `${account.name} (${account.type})` : 'Unknown Account';
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
             <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Inter:wght@400;600;700&display=swap');
                .font-serif { font-family: 'Merriweather', serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-area, #printable-area * {
                    visibility: visible;
                  }
                  #printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    font-size: 12px;
                  }
                   .no-print {
                    display: none !important;
                  }
                }
                `}
            </style>
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-full max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center no-print">
                    <h2 className="text-lg font-bold text-white">Pratinjau {title}</h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={handleSendWhatsApp} className="flex items-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm">
                            <WhatsAppIcon className="h-4 w-4 mr-2" />
                            Kirim via WhatsApp
                         </button>
                         <button onClick={handlePrint} className="flex items-center py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                            Cetak
                         </button>
                         <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                
                <div id="printable-area" className="flex-grow overflow-y-auto bg-white text-slate-800 p-10 font-sans relative">
                    {type === 'receipt' && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <p className="font-serif text-9xl font-bold text-green-500/10 transform -rotate-12 select-none">LUNAS</p>
                        </div>
                    )}
                    <div className="relative z-10">
                        {/* Header */}
                        <header className="flex justify-between items-start pb-8 border-b-2 border-slate-100">
                            <div>
                                <div className="flex items-center">
                                    {appSettings.companyProfile.logoUrl ? (
                                        <img src={appSettings.companyProfile.logoUrl} alt="Company Logo" className="w-16 h-16 mr-4 object-contain" />
                                    ) : (
                                        <svg className="w-8 h-8 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    )}
                                    <h1 className="text-2xl font-bold text-slate-900">{appSettings.companyProfile.name}</h1>
                                </div>
                                <p className="text-slate-500 mt-1 whitespace-pre-line">{appSettings.companyProfile.address}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-serif text-4xl font-bold text-slate-800 uppercase">{title}</h2>
                                <p className="text-slate-500 font-mono mt-1">{invoice.id}</p>
                            </div>
                        </header>

                        {/* Details */}
                        <section className="grid grid-cols-2 gap-8 my-8">
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Ditagihkan Kepada</h3>
                                <p className="font-bold text-slate-800 mt-1">{invoice.clientName}</p>
                                <p className="text-slate-600">{client.email}</p>
                                <p className="text-slate-600">{client.phone}</p>
                            </div>
                            <div className="text-right">
                                <dl className="grid grid-cols-2 gap-x-4">
                                    <dt className="font-semibold text-slate-500">Tanggal Terbit:</dt>
                                    <dd className="text-slate-700">{formatDate(issueDate)}</dd>
                                    <dt className="font-semibold text-slate-500">Jatuh Tempo:</dt>
                                    <dd className="text-slate-700">{formatDate(invoice.dueDate)}</dd>
                                    {type === 'receipt' && <>
                                        <dt className="font-semibold text-slate-500">Tanggal Lunas:</dt>
                                        <dd className="text-slate-700">{formatDate(invoice.payments?.[invoice.payments.length - 1]?.date || new Date())}</dd>
                                    </>}
                                </dl>
                            </div>
                        </section>

                        {/* Items Table */}
                        <section>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold uppercase text-slate-600">Deskripsi</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-slate-600 text-center">Jumlah</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-slate-600 text-right">Harga Satuan</th>
                                        <th className="p-3 text-sm font-semibold uppercase text-slate-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map(item => (
                                        <tr key={item.id} className="border-b border-slate-100">
                                            <td className="p-3 font-medium text-slate-800">{item.description}</td>
                                            <td className="p-3 text-slate-600 text-center">{item.quantity}</td>
                                            <td className="p-3 text-slate-600 text-right">{formatCurrency(item.price)}</td>
                                            <td className="p-3 text-slate-800 font-semibold text-right">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        
                        {/* Payment History */}
                        {invoice.payments && invoice.payments.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Riwayat Pembayaran</h3>
                                <table className="w-full text-left mt-2">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold uppercase text-slate-600">Tanggal</th>
                                            <th className="p-3 text-sm font-semibold uppercase text-slate-600">Jumlah</th>
                                            <th className="p-3 text-sm font-semibold uppercase text-slate-600">Akun</th>
                                            <th className="p-3 text-sm font-semibold uppercase text-slate-600">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.payments.map(payment => (
                                            <tr key={payment.id} className="border-b border-slate-100">
                                                <td className="p-3 text-slate-600">{formatDate(payment.date)}</td>
                                                <td className="p-3 text-slate-800 font-semibold">{formatCurrency(payment.amount)}</td>
                                                <td className="p-3 text-slate-600">{getAccountName(payment.accountId)}</td>
                                                <td className="p-3 text-slate-600">{payment.methodNotes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}


                        {/* Totals */}
                        <section className="flex justify-end mt-8">
                            <div className="w-full max-w-sm">
                                <div className="flex justify-between py-2 text-slate-800 font-bold border-t border-slate-200 mt-2 pt-2">
                                    <span>Total Tagihan</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>

                                {invoice.amountPaid > 0 && type === 'invoice' && (
                                    <div className="flex justify-between py-2 text-slate-600">
                                        <span>Sudah Dibayar</span>
                                        <span className="text-green-600">- {formatCurrency(invoice.amountPaid)}</span>
                                    </div>
                                )}
                                
                                <div className={`flex justify-between py-3 font-bold border-t-2 border-slate-300 mt-2 pt-2 ${type === 'invoice' ? 'text-slate-800' : 'text-green-600'}`}>
                                    <span>{type === 'invoice' ? 'Sisa Tagihan' : 'Total Dibayar'}</span>
                                    <span>{formatCurrency(type === 'invoice' ? Math.max(0, total - invoice.amountPaid) : invoice.amountPaid)}</span>
                                </div>

                                <div className={`mt-4 p-3 rounded-lg text-center ${statusInfo.bg}`}>
                                    <span className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.text}</span>
                                </div>
                            </div>
                        </section>

                        {/* Footer */}
                        <footer className="text-center text-sm text-slate-500 pt-10 mt-10 border-t border-slate-100">
                             {type === 'invoice' && invoice.status !== 'Paid' 
                                ? <p className="mt-1 whitespace-pre-line">{appSettings.invoiceSettings.footerNotes}</p>
                                : <p>Terima kasih telah menggunakan jasa kami!</p>
                             }
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewModal;