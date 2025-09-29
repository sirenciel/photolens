// Temporary shim: mock data removed in favor of real Supabase data.
// Keeping empty exports to avoid import errors while we migrate callers.
export const mockEditingJobs = [] as any[];
export const mockActivities = [] as any[];
export const mockRevenueData = [] as any[];
export const mockPandLData = [] as any[];
export const mockSessionRevenue = [] as any[];
export const mockEditingStatuses = [] as any[];
export const mockSettings = {
  companyProfile: { name: '', address: '', email: '', logoUrl: '' },
  invoiceSettings: { prefix: 'INV', defaultDueDays: 14, footerNotes: '' },
  automatedReminders: { enabled: true, frequencyDays: 7 },
};
export const mockStaff = [] as any[];
export const mockClients = [] as any[];
export const mockSessionTypes = [] as any[];
export const mockPaymentAccounts = [] as any[];
export const mockBookings = [] as any[];
export const mockExpenses = [] as any[];import { UserRole, Booking, Invoice, Activity, RevenueData, Client, EditingJob, Expense, PandLData, SessionRevenue, StaffMember, SessionCategory, EditingStatus, PaymentAccount, AppSettings } from '../types';

export const mockStaff: StaffMember[] = [
    { id: 'S001', name: 'Alex Wolfe', email: 'alex.wolfe@lensledger.com', avatarUrl: 'https://picsum.photos/seed/user-alex/100/100', role: UserRole.Owner, status: 'Active', lastLogin: new Date() },
    { id: 'S002', name: 'Jane Doe', email: 'jane.doe@lensledger.com', avatarUrl: 'https://picsum.photos/seed/user-jane/100/100', role: UserRole.Admin, status: 'Active', lastLogin: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 'S003', name: 'John Smith', email: 'john.smith@lensledger.com', avatarUrl: 'https://picsum.photos/seed/user-john/100/100', role: UserRole.Photographer, status: 'Active', lastLogin: new Date(new Date().setHours(new Date().getHours() - 3)) },
    { id: 'S004', name: 'Carlos Ray', email: 'carlos.ray@lensledger.com', avatarUrl: 'https://picsum.photos/seed/user-carlos/100/100', role: UserRole.Editor, status: 'Active', lastLogin: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: 'S005', name: 'Samantha Bee', email: 'samantha.b@lensledger.com', avatarUrl: 'https://picsum.photos/seed/user-samantha/100/100', role: UserRole.Finance, status: 'Invited', lastLogin: new Date('2023-01-01') },
    { id: 'S006', name: 'Mike Ross', email: 'mike.ross@lensledger.com', avatarUrl: 'https://picsum.photos/seed/user-mike/100/100', role: UserRole.Photographer, status: 'Inactive', lastLogin: new Date(new Date().setDate(new Date().getDate() - 30)) },
];

export const mockClients: Client[] = [
    { id: 'C001', name: 'Olivia Chen', email: 'olivia.chen@example.com', phone: '555-0101', avatarUrl: 'https://picsum.photos/seed/client-olivia/100/100', joinDate: new Date('2023-01-15'), totalBookings: 2, totalSpent: 7000, notes: 'Prefers morning light for shoots. Allergic to peanuts - ensure catering is safe.' },
    { id: 'C002', name: 'Benjamin Carter', email: 'ben.carter@example.com', phone: '555-0102', avatarUrl: 'https://picsum.photos/seed/client-ben/100/100', joinDate: new Date('2023-02-20'), totalBookings: 1, totalSpent: 750, notes: 'Very specific about headshot angles. Likes the left side of his face more.' },
    { id: 'C003', name: 'Sophia Rodriguez', email: 'sophia.r@example.com', phone: '555-0103', avatarUrl: 'https://picsum.photos/seed/client-sophia/100/100', joinDate: new Date('2023-03-10'), totalBookings: 1, totalSpent: 1500 },
    { id: 'C004', name: 'Liam Goldberg', email: 'liam.goldberg@example.com', phone: '555-0104', avatarUrl: 'https://picsum.photos/seed/client-liam/100/100', joinDate: new Date('2023-04-05'), totalBookings: 1, totalSpent: 1200 },
    { id: 'C005', name: 'Ava Nguyen', email: 'ava.nguyen@example.com', phone: '555-0105', avatarUrl: 'https://picsum.photos/seed/client-ava/100/100', joinDate: new Date('2022-11-12'), totalBookings: 3, totalSpent: 2850 },
    { id: 'C006', name: 'Noah Martinez', email: 'noah.m@example.com', phone: '555-0106', avatarUrl: 'https://picsum.photos/seed/client-noah/100/100', joinDate: new Date('2022-10-01'), totalBookings: 2, totalSpent: 4200, notes: 'Follow up for their anniversary shoot next year.' },
    { id: 'C007', name: 'Isabella Kim', email: 'isabella.kim@example.com', phone: '555-0107', avatarUrl: 'https://picsum.photos/seed/client-isabella/100/100', joinDate: new Date('2023-05-21'), totalBookings: 1, totalSpent: 950 },
    { id: 'C008', name: 'Ethan Williams', email: 'ethan.w@example.com', phone: '555-0108', avatarUrl: 'https://picsum.photos/seed/client-ethan/100/100', joinDate: new Date('2022-09-18'), totalBookings: 4, totalSpent: 8300 },
];

export const mockSessionTypes: SessionCategory[] = [
    {
        id: 'SC001', name: 'Wedding', packages: [
            { id: 'SP001', name: 'Simply', price: 3500, inclusions: ['4 Hours Coverage', '1 Photographer', '150 Edited Photos', 'Online Gallery'] },
            { id: 'SP002', name: 'Silver', price: 5000, inclusions: ['8 Hours Coverage', '2 Photographers', '300 Edited Photos', 'Engagement Session', 'Online Gallery'] },
            { id: 'SP003', name: 'Gold', price: 7500, inclusions: ['Full Day Coverage', '2 Photographers', '500+ Edited Photos', 'Engagement Session', '12x12 Album', 'Online Gallery'] },
        ]
    },
    {
        id: 'SC002', name: 'Foto Wisuda', packages: [
            { id: 'SP004', name: 'Paket Simply', price: 500, inclusions: ['1 Hour Session', '10 Edited Photos'] },
            { id: 'SP005', name: 'Paket Bronze', price: 850, inclusions: ['2 Hour Session', '20 Edited Photos', '1 Canvas Print (16x20)'] },
        ]
    },
    {
        id: 'SC003', name: 'Pas Foto', packages: [
            { id: 'SP006', name: 'Setengah Badan', price: 150, inclusions: ['15 Minute Session', '3 Edited Photos'] },
            { id: 'SP007', name: 'Full Body', price: 250, inclusions: ['30 Minute Session', '5 Edited Photos'] },
        ]
    },
     {
        id: 'SC004', name: 'Portrait', packages: [
            { id: 'SP008', name: 'Headshot Session', price: 750, inclusions: ['1 Hour Studio Session', '3 Outfits', '5 Retouched Images'] },
            { id: 'SP009', name: 'Family Portraits', price: 1200, inclusions: ['1.5 Hour Outdoor Session', 'Up to 6 people', '40 Edited Photos', 'Online Gallery'] },
        ]
    },
];

export const mockPaymentAccounts: PaymentAccount[] = [
    { id: 'PA001', name: 'BCA Utama', type: 'Bank', details: '123-456-7890' },
    { id: 'PA002', name: 'Kas Tunai Studio', type: 'Cash', details: 'Laci kasir fisik' },
    { id: 'PA003', name: 'GoPay Bisnis', type: 'Digital Wallet' },
];

export const mockBookings: Booking[] = [
    { id: 'B001', clientId: 'C001', clientName: 'Olivia Chen', clientAvatarUrl: 'https://picsum.photos/seed/client-olivia/100/100', sessionCategoryId: 'SC001', sessionPackageId: 'SP001', sessionType: 'Wedding - Simply', photographerId: 'S003', photographer: 'John Smith', date: new Date(new Date().setDate(new Date().getDate() + 2)), status: 'Confirmed', invoiceId: 'INV004', notes: 'Client requested mostly candid shots. Minimal posing.', location: 'Grand Ballroom, 123 Main St, Anytown' },
    { id: 'B002', clientId: 'C002', clientName: 'Benjamin Carter', clientAvatarUrl: 'https://picsum.photos/seed/client-ben/100/100', sessionCategoryId: 'SC004', sessionPackageId: 'SP008', sessionType: 'Portrait - Headshot Session', photographerId: 'S006', photographer: 'Mike Ross', date: new Date(new Date().setDate(new Date().getDate() + 3)), status: 'Confirmed', invoiceId: 'INV005', photoSelections: [{ name: 'BC_Headshot_003_retouch.tiff', edited: false }], location: 'LensLedger Studio A' },
    { id: 'B003', clientId: 'C003', clientName: 'Sophia Rodriguez', clientAvatarUrl: 'https://picsum.photos/seed/client-sophia/100/100', sessionCategoryId: 'SC002', sessionPackageId: 'SP005', sessionType: 'Foto Wisuda - Paket Bronze', photographerId: 'S001', photographer: 'Alex Wolfe', date: new Date(new Date().setDate(new Date().getDate() + 5)), status: 'Pending', invoiceId: '-', location: 'City University Campus' },
    { id: 'B004', clientId: 'C004', clientName: 'Liam Goldberg', clientAvatarUrl: 'https://picsum.photos/seed/client-liam/100/100', sessionCategoryId: 'SC004', sessionPackageId: 'SP009', sessionType: 'Portrait - Family Portraits', photographerId: 'S003', photographer: 'John Smith', date: new Date(new Date().setDate(new Date().getDate() + 7)), status: 'Confirmed', invoiceId: 'INV006', notes: 'Location is at their home, please confirm address on the day of. They have a large dog, friendly but just a heads up.', location: '456 Oak Avenue, Suburbia' },
    { id: 'B005', clientId: 'C005', clientName: 'Ava Nguyen', clientAvatarUrl: 'https://picsum.photos/seed/client-ava/100/100', sessionCategoryId: 'SC001', sessionPackageId: 'SP002', sessionType: 'Wedding - Silver', photographerId: 'S002', photographer: 'Jane Doe', date: new Date(new Date().setDate(new Date().getDate() - 10)), status: 'Completed', invoiceId: 'INV002', photoSelections: [], location: 'The Botanical Gardens' },
    { id: 'B006', clientId: 'C006', clientName: 'Noah Martinez', clientAvatarUrl: 'https://picsum.photos/seed/client-noah/100/100', sessionCategoryId: 'SC001', sessionPackageId: 'SP003', sessionType: 'Wedding - Gold', photographerId: 'S001', photographer: 'Alex Wolfe', date: new Date(new Date().setDate(new Date().getDate() - 25)), status: 'Completed', invoiceId: 'INV003', location: 'Seaside Resort & Spa' },
    { id: 'B007', clientId: 'C007', clientName: 'Isabella Kim', clientAvatarUrl: 'https://picsum.photos/seed/client-isabella/100/100', sessionCategoryId: 'SC003', sessionPackageId: 'SP006', sessionType: 'Pas Foto - Setengah Badan', photographerId: 'S003', photographer: 'John Smith', date: new Date(new Date().setDate(new Date().getDate() + 1)), status: 'Cancelled', invoiceId: '-', location: 'LensLedger Studio B' },
    { id: 'B008', clientId: 'C008', clientName: 'Ethan Williams', clientAvatarUrl: 'https://picsum.photos/seed/client-ethan/100/100', sessionCategoryId: 'SC004', sessionPackageId: 'SP008', sessionType: 'Portrait - Headshot Session', photographerId: 'S003', photographer: 'John Smith', date: new Date(new Date().setDate(new Date().getDate() - 40)), status: 'Completed', invoiceId: 'INV001', photoSelections: [{ name: 'IMG_4021.jpg', edited: true }, { name: 'IMG_4025.jpg', edited: true }, { name: 'IMG_4130.jpg', edited: false }], location: 'Client\'s Office, Downtown' },
];


export const mockInvoices: Invoice[] = [
    { id: 'INV001', bookingId: 'B008', clientId: 'C008', clientName: 'Ethan Williams', clientAvatarUrl: 'https://picsum.photos/seed/client-ethan/100/100', items: [{id: 'item1', description: 'Corporate Headshots Package', quantity: 1, price: 2500}], amount: 2500, amountPaid: 1000, issueDate: new Date(new Date().setDate(new Date().getDate() - 35)), dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), status: 'Overdue', payments: [
        { id: 'PAY002', date: new Date(new Date().setDate(new Date().getDate() - 20)), amount: 1000, accountId: 'PA001', recordedBy: 'Samantha Bee', methodNotes: 'Client paid 1st installment' }
    ], lastReminderSent: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: 'INV002', bookingId: 'B005', clientId: 'C005', clientName: 'Ava Nguyen', clientAvatarUrl: 'https://picsum.photos/seed/client-ava/100/100', items: [{id: 'item1', description: 'Event Coverage (4 hours)', quantity: 1, price: 850}], amount: 850, amountPaid: 850, issueDate: new Date(new Date().setDate(new Date().getDate() - 10)), dueDate: new Date(new Date().setDate(new Date().getDate() - 10)), status: 'Paid', payments: [
        { id: 'PAY001', date: new Date(new Date().setDate(new Date().getDate() - 10)), amount: 850, accountId: 'PA003', recordedBy: 'Samantha Bee' }
    ], lastReminderSent: null },
    { id: 'INV003', bookingId: 'B006', clientId: 'C006', clientName: 'Noah Martinez', clientAvatarUrl: 'https://picsum.photos/seed/client-noah/100/100', items: [{id: 'item1', description: 'Full-Day Wedding Package', quantity: 1, price: 4000}, {id: 'item2', description: 'Additional Photographer', quantity: 1, price: 200}], amount: 4200, amountPaid: 4200, issueDate: new Date(new Date().setDate(new Date().getDate() - 24)), dueDate: new Date(new Date().setDate(new Date().getDate() - 20)), status: 'Paid', payments: [
        { id: 'PAY003', date: new Date(new Date().setDate(new Date().getDate() - 22)), amount: 4200, accountId: 'PA001', recordedBy: 'Samantha Bee' }
    ], lastReminderSent: null },
    { id: 'INV004', bookingId: 'B001', clientId: 'C001', clientName: 'Olivia Chen', clientAvatarUrl: 'https://picsum.photos/seed/client-olivia/100/100', items: [{id: 'item1', description: 'Wedding Photography', quantity: 1, price: 3500}], amount: 3500, amountPaid: 0, issueDate: new Date(new Date().setDate(new Date().getDate() - 1)), dueDate: new Date(new Date().setDate(new Date().getDate() + 15)), status: 'Sent', lastReminderSent: null },
    { id: 'INV005', bookingId: 'B002', clientId: 'C002', clientName: 'Benjamin Carter', clientAvatarUrl: 'https://picsum.photos/seed/client-ben/100/100', items: [{id: 'item1', description: 'Portrait Session', quantity: 1, price: 750}], amount: 750, amountPaid: 0, issueDate: new Date(new Date().setDate(new Date().getDate() - 0)), dueDate: new Date(new Date().setDate(new Date().getDate() + 18)), status: 'Sent', lastReminderSent: null },
    { id: 'INV006', bookingId: 'B004', clientId: 'C004', clientName: 'Liam Goldberg', clientAvatarUrl: 'https://picsum.photos/seed/client-liam/100/100', items: [{id: 'item1', description: 'Family Portraits', quantity: 1, price: 1000}, {id: 'item2', description: 'Canvas Print 24x36', quantity: 1, price: 200}], amount: 1200, amountPaid: 0, issueDate: new Date(new Date().setDate(new Date().getDate() - 0)), dueDate: new Date(new Date().setDate(new Date().getDate() + 22)), status: 'Sent', lastReminderSent: null },
];

export const mockActivities: Activity[] = [
    { id: 'A001', user: 'Jane Doe', userAvatarUrl: 'https://picsum.photos/seed/user-jane/100/100', action: 'updated editing job for', target: 'Olivia Chen Wedding', timestamp: new Date(new Date().setHours(new Date().getHours() - 1)) },
    { id: 'A002', user: 'Alex Wolfe', userAvatarUrl: 'https://picsum.photos/seed/user-alex/100/100', action: 'confirmed booking for', target: 'Benjamin Carter', timestamp: new Date(new Date().setHours(new Date().getHours() - 3)) },
    { id: 'A003', user: 'Samantha Bee', userAvatarUrl: 'https://picsum.photos/seed/user-samantha/100/100', action: 'marked invoice INV003 as', target: 'Paid', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 'A004', user: 'John Smith', userAvatarUrl: 'https://picsum.photos/seed/user-john/100/100', action: 'added a note to', target: 'Liam Goldberg Booking', timestamp: new Date(new Date().setDate(new Date().getDate() - 2)) },
];

export const mockRevenueData: RevenueData[] = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 },
    { month: 'Jul', revenue: 7200 },
];

export const mockEditingStatuses: EditingStatus[] = [
    { id: 'status-0', name: 'Awaiting Selection', color: 'slate' },
    { id: 'status-1', name: 'Ready for Edit', color: 'yellow' },
    { id: 'status-2', name: 'In Progress', color: 'blue' },
    { id: 'status-3', name: 'Client Review', color: 'purple' },
    { id: 'status-4', name: 'Completed', color: 'green' },
];

export const mockEditingJobs: EditingJob[] = [
    { id: 'M001', bookingId: 'B005', clientId: 'C005', clientName: 'Ava Nguyen', editorId: 'S004', editorName: 'Carlos Ray', editorAvatarUrl: 'https://picsum.photos/seed/user-carlos/100/100', statusId: 'status-4', uploadDate: new Date(new Date().setDate(new Date().getDate() - 9)), driveFolderUrl: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZaB2CdE', photographerNotes: 'Client was very happy with the ceremony shots. Focus on the candid moments between the couple during the reception.', priority: 'Normal', revisionCount: 0, revisionNotes: [] },
    { id: 'M002', bookingId: 'B006', clientId: 'C006', clientName: 'Noah Martinez', editorId: 'S004', editorName: 'Carlos Ray', editorAvatarUrl: 'https://picsum.photos/seed/user-carlos/100/100', statusId: 'status-4', uploadDate: new Date(new Date().setDate(new Date().getDate() - 24)), priority: 'Normal' },
    { id: 'M003', bookingId: 'B001', clientId: 'C001', clientName: 'Olivia Chen', editorId: 'S002', editorName: 'Jane Doe', editorAvatarUrl: 'https://picsum.photos/seed/user-jane/100/100', statusId: 'status-3', uploadDate: new Date(new Date().setDate(new Date().getDate() - 1)), driveFolderUrl: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZaB2CdE', priority: 'High', revisionCount: 1, revisionNotes: [{ note: "Client wants the ceremony photos to be brighter.", date: new Date(new Date().setDate(new Date().getDate() - 2)) }] },
    { id: 'M004', bookingId: 'B002', clientId: 'C002', clientName: 'Benjamin Carter', editorId: 'S004', editorName: 'Carlos Ray', editorAvatarUrl: 'https://picsum.photos/seed/user-carlos/100/100', statusId: 'status-2', uploadDate: new Date(new Date().setDate(new Date().getDate() - 2)), priority: 'Urgent' },
    { id: 'M005', bookingId: 'B004', clientId: 'C004', clientName: 'Liam Goldberg', editorId: null, editorName: 'Unassigned', editorAvatarUrl: 'https://picsum.photos/seed/user-unassigned/100/100', statusId: 'status-0', uploadDate: new Date(new Date().setDate(new Date().getDate() - 0)), priority: 'Normal' },
    { id: 'M006', bookingId: 'B004', clientId: 'C004', clientName: 'Liam Goldberg', editorId: null, editorName: 'Unassigned', editorAvatarUrl: 'https://picsum.photos/seed/user-unassigned/100/100', statusId: 'status-0', uploadDate: new Date(new Date().setDate(new Date().getDate() - 0)), priority: 'Normal' },
    { id: 'M007', bookingId: 'B008', clientId: 'C008', clientName: 'Ethan Williams', editorId: 'S002', editorName: 'Jane Doe', editorAvatarUrl: 'https://picsum.photos/seed/user-jane/100/100', statusId: 'status-4', uploadDate: new Date(new Date().setDate(new Date().getDate() - 38)), driveFolderUrl: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZaB2CdE', photographerNotes: 'Lighting was a bit harsh in the afternoon. Please check highlights on files IMG_4500 through IMG_4550. Client wants a clean, corporate look.', priority: 'Normal' },
];

export const mockExpenses: Expense[] = [
    { id: 'a3f1c2e4-1234-5678-9abc-def012345678', category: 'Software', description: 'Adobe Creative Cloud', amount: 59.99, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), accountId: 'b1e2d3c4-2345-6789-abcd-ef0123456789'},
    { id: 'b2e3f4a5-2345-6789-abcd-ef0123456789', category: 'Studio', description: 'Studio Rent', amount: 1500, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), accountId: 'b1e2d3c4-2345-6789-abcd-ef0123456789'},
    { id: 'c3f4a5b6-3456-789a-bcde-f0123456789a', category: 'Marketing', description: 'Facebook Ads', amount: 250, date: new Date(new Date().setMonth(new Date().getMonth() - 2)), accountId: 'b1e2d3c4-2345-6789-abcd-ef0123456789'},
    { id: 'd4a5b6c7-4567-89ab-cdef-0123456789ab', category: 'Gear', description: 'New Lens Filter for B006', amount: 120, date: new Date(new Date().setDate(new Date().getDate() - 25)), accountId: 'e5b6c7d8-5678-9abc-def0-123456789abc', bookingId: 'B006' },
    { id: 'e5b6c7d8-5678-9abc-def0-123456789abc', category: 'Travel', description: 'Gas for client shoot B008', amount: 40, date: new Date(new Date().setDate(new Date().getDate() - 40)), accountId: 'e5b6c7d8-5678-9abc-def0-123456789abc', bookingId: 'B008' },
    { id: 'f6c7d8e9-6789-abcd-ef01-23456789abcd', category: 'Gear', description: 'Memory Cards', amount: 85, date: new Date(new Date().setDate(new Date().getDate() - 5)), accountId: 'e5b6c7d8-5678-9abc-def0-123456789abc'},

];

export const mockPandLData: PandLData[] = [
    { month: 'Mar', revenue: 5000, expenses: 1800 },
    { month: 'Apr', revenue: 4500, expenses: 1950 },
    { month: 'May', revenue: 6000, expenses: 2100 },
    { month: 'Jun', revenue: 5500, expenses: 1920 },
    { month: 'Jul', revenue: 7200, expenses: 2350 },
];

export const mockSessionRevenue: SessionRevenue[] = [
    { name: 'Wedding', value: 45000, id: 'SC001' },
    { name: 'Foto Wisuda', value: 18500, id: 'SC002' },
    { name: 'Pas Foto', value: 22000, id: 'SC003' },
    { name: 'Portrait', value: 12000, id: 'SC004' },
];

export const mockSettings: AppSettings = {
    companyProfile: {
        name: "LensLedger Studios",
        address: "123 Photography Lane, Suite 101\nCreativity City, CA 90210",
        email: "contact@lensledger.com",
        logoUrl: "" 
    },
    invoiceSettings: {
        prefix: "INV",
        defaultDueDays: 14,
        footerNotes: "Terima kasih telah menggunakan jasa kami!\nMohon lakukan pembayaran sebelum tanggal jatuh tempo ke Rekening Bank ABC 123-456-7890 a.n. LensLedger Studios."
    },
    automatedReminders: {
        enabled: true,
        frequencyDays: 7,
    },
};
