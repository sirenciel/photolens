
import { UserRole, Permission } from '../types';

const allPermissions = Object.values(Permission);

const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.Owner]: allPermissions,
    [UserRole.Admin]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOOKINGS_ALL,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_CLIENTS,
        Permission.MANAGE_CLIENTS,
        Permission.VIEW_INVOICES,
        Permission.MANAGE_INVOICES,
        Permission.MANAGE_EXPENSES,
        Permission.VIEW_EDITING_ALL,
        Permission.MANAGE_EDITING,
        Permission.VIEW_REPORTS,
        Permission.VIEW_STAFF,
        Permission.MANAGE_STAFF,
        Permission.VIEW_SETTINGS,
        Permission.MANAGE_SETTINGS,
    ],
    [UserRole.Photographer]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOOKINGS_SELF,
        Permission.VIEW_CLIENTS, // Can view clients associated with their bookings
        Permission.VIEW_EDITING_ALL, // Can see editing jobs for context, but not manage
    ],
    [UserRole.Editor]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_EDITING_SELF, // Can only see jobs assigned to them
        Permission.MANAGE_EDITING, // Can update status, etc.
    ],
    [UserRole.Finance]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_INVOICES,
        Permission.MANAGE_INVOICES,
        Permission.MANAGE_EXPENSES,
        Permission.VIEW_REPORTS,
    ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
    return rolePermissions[role]?.includes(permission) || false;
};

// A mapping of page names to the permission required to view them
export const PAGE_PERMISSIONS: { [pageName: string]: Permission } = {
    'Dashboard': Permission.VIEW_DASHBOARD,
    'Bookings': Permission.VIEW_BOOKINGS_ALL, // This is tricky, VIEW_BOOKINGS_SELF is a data filter, not a page block
    'Clients': Permission.VIEW_CLIENTS,
    'Invoices': Permission.VIEW_INVOICES,
    'Expenses': Permission.MANAGE_EXPENSES,
    'Editing': Permission.VIEW_EDITING_ALL,
    'Reports': Permission.VIEW_REPORTS,
    'Staff': Permission.VIEW_STAFF,
    'Settings': Permission.VIEW_SETTINGS,
};

// For the sidebar, we simplify: if you have any booking view permission, show the tab.
PAGE_PERMISSIONS['Bookings'] = Permission.VIEW_BOOKINGS_SELF;
// Similarly for editing jobs
PAGE_PERMISSIONS['Editing'] = Permission.VIEW_EDITING_SELF;