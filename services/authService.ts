import { AuthChangeEvent, AuthSession } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { staffService } from './dataService';
import { StaffMember, UserRole } from '../types';

export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface SignUpResult {
    session: AuthSession | null;
    staff: StaffMember | null;
    needsEmailConfirmation: boolean;
}

type AuthStateChangeCallback = (event: AuthChangeEvent, session: AuthSession | null) => void;

type AuthStateSubscription = {
    data: {
        subscription: {
            unsubscribe: () => void;
        };
    };
};

export const authService = {
    async signIn(payload: SignInPayload): Promise<AuthSession | null> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password
        });

        if (error) {
            throw error;
        }

        if (data.user?.email) {
            const metadata = data.user.user_metadata ?? {};
            const preferredRole = metadata.role && Object.values(UserRole).includes(metadata.role)
                ? metadata.role as UserRole
                : UserRole.Owner;
            const displayName = metadata.full_name
                || metadata.name
                || data.user.email?.split('@')[0]
                || 'User';

            const existingStaff = await staffService.findByEmail(data.user.email);

            if (!existingStaff) {
                await staffService.create({
                    name: displayName,
                    email: data.user.email,
                    avatarUrl: metadata.avatar_url ?? '',
                    role: preferredRole,
                    status: 'Active'
                });
            } else {
                const updates: Partial<StaffMember> = {
                    lastLogin: new Date()
                };

                if (existingStaff.status !== 'Active') {
                    updates.status = 'Active';
                }

                await staffService.update(existingStaff.id, updates);
            }
        }

        return data.session ?? null;
    },

    async signUp(payload: SignUpPayload): Promise<SignUpResult> {
        const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                data: {
                    full_name: payload.name,
                    role: payload.role,
                    avatar_url: payload.avatarUrl ?? ''
                }
            }
        });

        if (error) {
            throw error;
        }

        let staffRecord: StaffMember | null = null;

        if (data.session) {
            staffRecord = await staffService.findByEmail(payload.email);

            if (!staffRecord) {
                staffRecord = await staffService.create({
                    name: payload.name,
                    email: payload.email,
                    avatarUrl: payload.avatarUrl ?? '',
                    role: payload.role,
                    status: 'Active'
                });
            }
        }

        const needsEmailConfirmation = !data.session;

        return {
            session: data.session ?? null,
            staff: staffRecord,
            needsEmailConfirmation
        };
    },

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    },

    async getSession(): Promise<AuthSession | null> {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            throw error;
        }
        return data.session ?? null;
    },

    onAuthStateChange(callback: AuthStateChangeCallback): AuthStateSubscription {
        return supabase.auth.onAuthStateChange(callback);
    }
};
