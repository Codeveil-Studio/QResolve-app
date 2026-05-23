import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Organization, OrganizationMembership, Profile } from '@/lib/supabase-types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  membership: OrganizationMembership | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, isAdminLogin?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string) => Promise<{ error: Error | null; organization?: Organization }>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data as Profile | null;
  }, []);

  const fetchOrganization = useCallback(async (userId: string) => {
    // First get membership
    const { data: membershipData } = await supabase
      .from('organization_memberships')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (membershipData) {
      setMembership(membershipData as OrganizationMembership);

      // Then get organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membershipData.org_id)
        .single();

      return orgData as Organization | null;
    }
    return null;
  }, []);

  const refreshOrganization = useCallback(async () => {
    if (user) {
      const org = await fetchOrganization(user.id);
      setOrganization(org);
    }
  }, [user, fetchOrganization]);

  useEffect(() => {
    // Loads/refreshes the user's profile, organization, and admin status.
    // Pulled into a named helper so we can call it from both the initial
    // session check and the SIGNED_IN event (but NOT TOKEN_REFRESHED — see below).
    const hydrateUserContext = async (userId: string) => {
      const userProfile = await fetchProfile(userId);
      setProfile(userProfile);

      const org = await fetchOrganization(userId);
      setOrganization(org);

      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      setIsAdmin(!!adminData);

      setLoading(false);
    };

    // Set up auth state listener.
    //
    // IMPORTANT: only refetch profile/org/admin on actual sign-in or sign-out
    // events — NOT on TOKEN_REFRESHED (which Supabase fires when the JWT rotates
    // every ~1hr AND every time the tab regains focus). Refetching on those
    // events causes any child component with useEffect([organization]) to
    // re-run and flash its loading skeleton on tab switch, which is jarring UX.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT' || !session?.user) {
        setProfile(null);
        setOrganization(null);
        setMembership(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        // Defer with setTimeout to avoid race conditions with React 18 batching
        setTimeout(() => hydrateUserContext(session.user.id), 0);
      }
      // TOKEN_REFRESHED, PASSWORD_RECOVERY, etc. → leave profile/org/admin as-is.
    });

    // Note: we don't call supabase.auth.getSession() separately — the listener
    // above fires INITIAL_SESSION on mount with the existing session (if any),
    // so hydrateUserContext is called exactly once on load.

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchOrganization]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        data: { full_name: fullName }
      }
    });

    if (error) return { error };

    // Create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        email: email
      });
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string, isAdminLogin: boolean = false) => {
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    if (data.user) {
      // 2. Check if the user is banned
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      if (profileData?.is_banned) {
        await supabase.auth.signOut();
        return { error: new Error('Your account has been banned by the administrator. Please contact support.') };
      }

      // 3. Check if the user is an admin
      // We check if the user's ID exists in the 'admins' table
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      const isUserAdmin = !!adminData;

      // 4. Validate login type
      if (isAdminLogin) {
        // Trying to login as Admin
        if (!isUserAdmin) {
          // User is NOT an admin
          await supabase.auth.signOut();
          return { error: new Error('Unauthorized: Admin access required.') };
        }
        // Success: User is admin and logging in as admin
        setIsAdmin(true);
      } else {
        // Trying to login as User
        if (isUserAdmin) {
          // User IS an admin, but trying to login as normal user
          await supabase.auth.signOut();
          return { error: new Error('You are an Admin. Please use the Admin Login tab.') };
        }
        // Success: User is not admin
      }

      setUser(data.user);
      setSession(data.session);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganization(null);
    setMembership(null);
  };

  const createOrganization = async (name: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (orgError) return { error: orgError };

    // Create membership as owner
    const { error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        org_id: orgData.id,
        user_id: user.id,
        role: 'owner'
      });

    if (membershipError) return { error: membershipError };

    // Create subscription (trial)
    await supabase
      .from('subscriptions')
      .insert({
        org_id: orgData.id,
        status: 'trialing'
      });

    setOrganization(orgData as Organization);
    await refreshOrganization();

    return { error: null, organization: orgData as Organization };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      organization,
      membership,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
      createOrganization,
      refreshOrganization
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
