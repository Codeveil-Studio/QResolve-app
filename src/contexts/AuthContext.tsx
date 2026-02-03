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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Use setTimeout to prevent potential race conditions
        setTimeout(async () => {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          
          const org = await fetchOrganization(session.user.id);
          setOrganization(org);
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setOrganization(null);
        setMembership(null);
        setLoading(false);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
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
