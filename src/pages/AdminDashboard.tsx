import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    LayoutDashboard,
    Users,
    Building2,
    Package,
    AlertCircle,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Activity,
    ShieldAlert,
    Search,
    User,
    Tags,
    Trash2,
    Edit,
    Plus,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Asset, Issue, Organization, Profile } from '@/lib/supabase-types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type OwnerProfile = Pick<Profile, 'user_id' | 'full_name' | 'email'>;
type OrganizationWithOwner = Organization & { owner_profile: OwnerProfile | null };
type IssueWithAsset = Issue & { asset?: { name: string } | null };
interface Category {
    id: string;
    name: string;
    created_at: string;
}

const TABS = {
    OVERVIEW: 'overview',
    USERS: 'users',
    ORGANIZATIONS: 'organizations',
    CATEGORIES: 'categories',
    ASSETS: 'assets',
    ISSUES: 'issues',
    CLAIMS: 'claims',
    SETTINGS: 'settings'
};

const navItems = [
    { id: TABS.OVERVIEW, label: 'Overview', icon: LayoutDashboard },
    { id: TABS.USERS, label: 'Users', icon: Users },
    { id: TABS.ORGANIZATIONS, label: 'Organizations', icon: Building2 },
    { id: TABS.CATEGORIES, label: 'Categories', icon: Tags },
    { id: TABS.ASSETS, label: 'Assets', icon: Package },
    { id: TABS.ISSUES, label: 'Issues', icon: AlertCircle },
    { id: TABS.CLAIMS, label: 'Claim Requests', icon: ShieldCheck },
    { id: TABS.SETTINGS, label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const renderContent = () => {
        switch (activeTab) {
            case TABS.OVERVIEW: return <AdminOverviewTab />;
            case TABS.USERS: return <AdminUsersTab />;
            case TABS.ORGANIZATIONS: return <AdminOrganizationsTab />;
            case TABS.CATEGORIES: return <AdminCategoriesTab />;
            case TABS.ASSETS: return <AdminAssetsTab />;
            case TABS.ISSUES: return <AdminIssuesTab />;
            case TABS.CLAIMS: return <AdminClaimsTab />;
            case TABS.SETTINGS: return <AdminSettingsTab />;
            default: return <AdminOverviewTab />;
        }
    };

    return (
        <div className="flex h-screen bg-[#020817] text-slate-50">
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-[#050b18] border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 outline-none",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md">
                            <ShieldAlert className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">Admin Portal</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto p-1 hover:bg-slate-800 rounded-md lg:hidden text-slate-400"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-6">
                        {navItems.map((item) => {
                            const isActive = activeTab === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative overflow-hidden group",
                                        isActive ? "text-primary-foreground" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 relative z-10 transition-colors", isActive ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-100")} />
                                    <span className="font-semibold relative z-10 text-sm tracking-wide">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="adminActiveNav"
                                            className="absolute inset-0 bg-primary z-0 rounded-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-slate-800 p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-3 px-2 py-2 hover:bg-slate-800 transition-colors rounded-lg outline-none">
                                    <Avatar className="h-9 w-9 border border-slate-700">
                                        <AvatarImage src={profile?.avatar_url || undefined} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {getInitials(profile?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-sm font-semibold text-slate-200 truncate">
                                            System Admin
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0f172a] border-slate-800 text-slate-200">
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-slate-800 focus:bg-slate-800 focus:text-red-300 cursor-pointer font-medium">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden bg-[#020817]">
                {/* Mobile header */}
                <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-[#020817] px-4 lg:px-8 shrink-0">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden mr-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold tracking-tight text-slate-100 hidden sm:block capitalize">
                            {activeTab} Management
                        </h1>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wide uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
                        <Activity className="h-3.5 w-3.5" />
                        System Live
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------
// SHARED SEARCH INPUT COMPONENT
// --------------------------------------------------------------------------
function SearchBar({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) {
    return (
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 bg-[#0f172a] border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-primary h-11"
            />
        </div>
    );
}


// --------------------------------------------------------------------------
// OVERVIEW TAB
// --------------------------------------------------------------------------
function AdminOverviewTab() {
    const [stats, setStats] = useState({ users: 0, organizations: 0, assets: 0, issues: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPlatformStats() {
            try {
                const [
                    { count: usersCount },
                    { count: orgsCount },
                    { count: assetsCount },
                    { count: issuesCount },
                ] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('organizations').select('*', { count: 'exact', head: true }),
                    supabase.from('assets').select('*', { count: 'exact', head: true }),
                    supabase.from('issues').select('*', { count: 'exact', head: true }),
                ]);

                setStats({
                    users: usersCount || 0,
                    organizations: orgsCount || 0,
                    assets: assetsCount || 0,
                    issues: issuesCount || 0,
                });
            } catch (error) {
                console.error('Error loading stats', error);
            } finally {
                setLoading(false);
            }
        }
        loadPlatformStats();
    }, []);

    const statCards = [
        { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: 'Organizations', value: stats.organizations, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { title: 'Total Assets', value: stats.assets, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { title: 'Reported Issues', value: stats.issues, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                        <Card className="border-slate-800 bg-[#0f172a] shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-8 w-16 bg-slate-800 animate-pulse rounded" />
                                ) : (
                                    <div className="text-3xl font-bold text-slate-100">{stat.value.toLocaleString()}</div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="border-slate-800 bg-[#0f172a] shadow-md mt-8 col-span-4">
                <CardHeader>
                    <CardTitle className="text-slate-100">System Status Log</CardTitle>
                    <CardDescription className="text-slate-400">Recent automated system events and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 py-3 border-b border-slate-800 text-sm">
                            <div className="bg-emerald-400/10 text-emerald-400 p-2 rounded-full"><Activity className="w-4 h-4" /></div>
                            <div className="flex-1 font-medium text-slate-300">Database automated backup completed</div>
                            <div className="text-slate-500 font-medium">10 mins ago</div>
                        </div>
                        <div className="flex items-center gap-4 py-3 border-b border-slate-800 text-sm">
                            <div className="bg-blue-400/10 text-blue-400 p-2 rounded-full"><Users className="w-4 h-4" /></div>
                            <div className="flex-1 font-medium text-slate-300">New organization signed up</div>
                            <div className="text-slate-500 font-medium">1 hr ago</div>
                        </div>
                        <div className="flex items-center gap-4 py-3 text-sm">
                            <div className="bg-emerald-400/10 text-emerald-400 p-2 rounded-full"><Activity className="w-4 h-4" /></div>
                            <div className="flex-1 font-medium text-slate-300">System performance OK</div>
                            <div className="text-slate-500 font-medium">2 hrs ago</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --------------------------------------------------------------------------
// USERS TAB
// --------------------------------------------------------------------------
function AdminUsersTab() {
    const [items, setItems] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: 'ban' | 'unban' | 'delete';
        user: Profile | null;
    }>({ open: false, type: 'ban', user: null });

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setItems((data as Profile[]) || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            (i.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const handleAction = async () => {
        const { type, user } = confirmDialog;
        if (!user) return;

        setActionLoading(user.id);
        setConfirmDialog({ ...confirmDialog, open: false });

        try {
            if (type === 'ban' || type === 'unban') {
                const isBanned = type === 'ban';
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_banned: isBanned })
                    .eq('id', user.id);
                
                if (error) throw error;
            } else if (type === 'delete') {
                const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: user.user_id });
                if (error) throw error;
            }

            await fetchUsers();
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed. See console for details.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search users by name or email..." />

            <Card className="border-slate-800 bg-[#0f172a] shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-100">Platform Users</CardTitle>
                    <CardDescription className="text-slate-400">A complete list of registered users across all organizations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-slate-500">Loading data...</div> : (
                        <div className="rounded-lg border border-slate-800 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#1e293b] text-slate-400 font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Email</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Joined</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-200">{item.full_name || 'No Name'}</td>
                                            <td className="px-5 py-4 text-slate-400">{item.email}</td>
                                            <td className="px-5 py-4">
                                                {item.is_banned ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
                                                        Banned
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 text-right">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {item.is_banned ? (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 border-emerald-800 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300"
                                                            onClick={() => setConfirmDialog({ open: true, type: 'unban', user: item })}
                                                            disabled={actionLoading === item.id}
                                                        >
                                                            Unban
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 border-amber-800 text-amber-400 hover:bg-amber-900/20 hover:text-amber-300"
                                                            onClick={() => setConfirmDialog({ open: true, type: 'ban', user: item })}
                                                            disabled={actionLoading === item.id}
                                                        >
                                                            Ban
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 border-red-900 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                                                        onClick={() => setConfirmDialog({ open: true, type: 'delete', user: item })}
                                                        disabled={actionLoading === item.id}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {confirmDialog.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-full ${
                                        confirmDialog.type === 'delete' ? 'bg-red-900/20 text-red-400' : 
                                        confirmDialog.type === 'ban' ? 'bg-amber-900/20 text-amber-400' : 
                                        'bg-emerald-900/20 text-emerald-400'
                                    }`}>
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-100 capitalize">
                                            {confirmDialog.type} User
                                        </h3>
                                        <p className="text-slate-400 text-sm">
                                            Are you sure you want to {confirmDialog.type} <strong>{confirmDialog.user?.full_name}</strong>?
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-slate-500 text-sm mb-6">
                                    {confirmDialog.type === 'delete' 
                                        ? "This action is permanent and cannot be undone. All user data will be removed."
                                        : confirmDialog.type === 'ban'
                                        ? "The user will be immediately logged out and unable to sign in."
                                        : "The user will regain access to the platform."
                                    }
                                </p>

                                <div className="flex justify-end gap-3">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                                        className="text-slate-400 hover:text-slate-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        className={`${
                                            confirmDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 
                                            confirmDialog.type === 'ban' ? 'bg-amber-600 hover:bg-amber-700' : 
                                            'bg-emerald-600 hover:bg-emerald-700'
                                        } text-white`}
                                        onClick={handleAction}
                                    >
                                        Confirm {confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1)}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --------------------------------------------------------------------------
// ORGANIZATIONS TAB
// --------------------------------------------------------------------------
function AdminOrganizationsTab() {
    const [items, setItems] = useState<OrganizationWithOwner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; org: OrganizationWithOwner | null }>({ open: false, org: null });

    const fetchOrganizations = async () => {
        const { data: orgs } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
        const orgList = (orgs as Organization[]) || [];

        const ownerIds = Array.from(new Set(orgList.map((o) => o.owner_id).filter(Boolean)));
        let ownerProfiles: OwnerProfile[] = [];
        if (ownerIds.length > 0) {
            const { data } = await supabase
                .from('profiles')
                .select('user_id, full_name, email')
                .in('user_id', ownerIds);
            ownerProfiles = (data as OwnerProfile[]) || [];
        }

        const ownerByUserId = new Map(ownerProfiles.map(p => [p.user_id, p]));
        setItems(orgList.map((o) => ({
            ...o,
            owner_profile: ownerByUserId.get(o.owner_id) || null,
        })));
        setLoading(false);
    };

    useEffect(() => {
        const fetch = async () => {
            await fetchOrganizations();
        };
        fetch();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(i => (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [items, searchQuery]);

    const handleDelete = async () => {
        if (!confirmDialog.org) return;
        setActionLoading(confirmDialog.org.id);
        setConfirmDialog({ open: false, org: null });
        try {
            const { error } = await supabase.rpc('delete_organization_by_admin', { target_org_id: confirmDialog.org.id });
            if (error) throw error;
            await fetchOrganizations();
        } catch (error) {
            console.error('Failed to delete organization:', error);
            alert('Failed to delete organization. See console for details.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search organizations by name..." />

            <Card className="border-slate-800 bg-[#0f172a] shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-100">Organizations</CardTitle>
                    <CardDescription className="text-slate-400">Companies and teams using the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-slate-500">Loading data...</div> : (
                        <div className="rounded-lg border border-slate-800 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#1e293b] text-slate-400 font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Organization Name</th>
                                        <th className="px-5 py-3">Owner Name</th>
                                        <th className="px-5 py-3">Owner ID</th>
                                        <th className="px-5 py-3 text-right">Created At</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-200 flex items-center gap-3">
                                                <div className="p-2 bg-slate-800 rounded-md">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                </div>
                                                {item.name}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {item.owner_profile?.full_name || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 font-mono">{item.owner_id}</td>
                                            <td className="px-5 py-4 text-slate-400 text-right">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-red-900 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                                                    onClick={() => setConfirmDialog({ open: true, org: item })}
                                                    disabled={actionLoading === item.id}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No organizations found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AnimatePresence>
                {confirmDialog.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-red-900/20 text-red-400">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-100">Delete Organization</h3>
                                        <p className="text-slate-400 text-sm">
                                            Delete <strong>{confirmDialog.org?.name}</strong> and all its assets?
                                        </p>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm mb-6">
                                    This action is permanent and cannot be undone.
                                </p>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirmDialog({ open: false, org: null })}
                                        className="text-slate-400 hover:text-slate-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleDelete}
                                    >
                                        Confirm Delete
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { AdminAssetDetailsDialog } from '@/components/admin/AdminAssetDetailsDialog';


// --------------------------------------------------------------------------
// CATEGORIES TAB
// --------------------------------------------------------------------------
function AdminCategoriesTab() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            setCategories(data || []);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load categories',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update({ name: formData.name })
                    .eq('id', editingCategory.id);
                if (error) throw error;
                toast({ title: 'Category updated successfully' });
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert({ name: formData.name });
                if (error) throw error;
                toast({ title: 'Category created successfully' });
            }
            setDialogOpen(false);
            setFormData({ name: '' });
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            toast({ title: 'Category deleted successfully' });
            fetchCategories();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete category',
            });
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="w-full sm:w-72">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search categories..." />
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        setEditingCategory(null);
                        setFormData({ name: '' });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-[#1e293b] border-slate-800 text-slate-200">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                {editingCategory ? 'Update the category name.' : 'Create a new category for asset types.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-slate-200">Category Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., IT Equipment"
                                    required
                                    className="mt-1.5 bg-[#0f172a] border-slate-700 text-slate-200"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90">
                                    {editingCategory ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-slate-800 bg-[#0f172a] shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-100">All Categories</CardTitle>
                    <CardDescription className="text-slate-400">Manage categories used for asset types across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-slate-500">Loading data...</div> : (
                        <div className="rounded-lg border border-slate-800 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#1e293b] text-slate-400 font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Category Name</th>
                                        <th className="px-5 py-3 text-right">Created At</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-200">{category.name}</td>
                                            <td className="px-5 py-4 text-slate-400 text-right whitespace-nowrap">
                                                {new Date(category.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                                                        onClick={() => {
                                                            setEditingCategory(category);
                                                            setFormData({ name: category.name });
                                                            setDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCategories.length === 0 && (
                                        <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-500">No categories found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// --------------------------------------------------------------------------
// ASSETS TAB
// --------------------------------------------------------------------------
function AdminAssetsTab() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const fetchAssets = async () => {
        setLoading(true);
        // Fetch assets with organization and creator details
        // Note: PostgREST embedded resources used for joins
        const { data, error } = await supabase
            .from('assets')
            .select(`
                *,
                organization:organizations(name),
                creator:profiles!assets_created_by_fkey(full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching assets:', error);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.organization?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const handleDeleteAsset = async (asset: any) => {
        try {
            const { error } = await supabase.rpc('delete_asset_by_admin', { target_asset_id: asset.id });
            if (error) throw error;
            await fetchAssets();
        } catch (error) {
            console.error('Failed to delete asset:', error);
            alert('Failed to delete asset. See console for details.');
        }
    };

    return (
        <div className="space-y-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search assets by name, location, or organization..." />

            <Card className="border-slate-800 bg-[#0f172a] shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-100">Global Assets</CardTitle>
                    <CardDescription className="text-slate-400">Every asset registered across the system. Click on a card for details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-slate-500">Loading data...</div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => {
                                        setSelectedAsset(item);
                                        setDetailsOpen(true);
                                    }}
                                    className="border border-slate-800 rounded-xl p-5 bg-[#1e293b]/50 shadow-sm flex flex-col gap-3 hover:border-slate-600 hover:bg-[#1e293b]/80 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="font-semibold text-slate-200 line-clamp-1 group-hover:text-emerald-400 transition-colors">{item.name}</div>
                                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider shrink-0 border ${
                                            item.status === 'active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 
                                            'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                            {item.status}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="truncate">{item.organization?.name || 'Unknown Org'}</span>
                                        </div>
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="truncate">{item.location || 'No location'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3 h-3" />
                                            <span className="truncate max-w-[100px]">{item.creator?.full_name || 'Unknown'}</span>
                                        </div>
                                        <span className="font-mono opacity-50">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-slate-500 py-12 border border-slate-800 border-dashed rounded-xl">No assets match your search.</div>}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AdminAssetDetailsDialog 
                asset={selectedAsset}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onDelete={handleDeleteAsset}
            />
        </div>
    );
}

// --------------------------------------------------------------------------
// ISSUES TAB
// --------------------------------------------------------------------------
function AdminIssuesTab() {
    const [items, setItems] = useState<IssueWithAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const { data, error } = await supabase
                .from('issues')
                .select('*, asset:assets(name)')
                .order('created_at', { ascending: false });

            setItems((data as IssueWithAsset[]) || []);
            setLoading(false);
        };
        fetch();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            (i.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    return (
        <div className="space-y-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search issues by title or description..." />

            <Card className="border-slate-800 bg-[#0f172a] shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-100">Global Issues Log</CardTitle>
                    <CardDescription className="text-slate-400">Tickets and issues from all organizations, showing related assets.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-slate-500">Loading data...</div> : (
                        <div className="rounded-lg border border-slate-800 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#1e293b] text-slate-400 font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Issue Detail</th>
                                        <th className="px-5 py-3">Asset</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Priority</th>
                                        <th className="px-5 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-200 line-clamp-1 max-w-[250px]">{item.title}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-1.5 truncate max-w-[200px]" title={item.org_id}>Org: {item.org_id}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-300 bg-slate-800/50 inline-flex px-2 py-1 rounded max-w-[200px] truncate">
                                                    <Package className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                                    {item.asset?.name || 'Unknown Asset'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider shrink-0 ${item.status === 'open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            'bg-slate-800 text-slate-300 border border-slate-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider shrink-0 ${item.priority === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        item.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    }`}>
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 text-right whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No issues found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// --------------------------------------------------------------------------
// SETTINGS TAB
// --------------------------------------------------------------------------
function AdminSettingsTab() {
    return (
        <Card className="border-slate-800 bg-[#0f172a] shadow-md max-w-2xl">
            <CardHeader>
                <CardTitle className="text-slate-100">System Settings</CardTitle>
                <CardDescription className="text-slate-400">Global configurations for the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 border-b border-slate-800 pb-5">
                    <h4 className="font-semibold text-slate-200">Maintenance Mode</h4>
                    <p className="text-sm text-slate-500">Prevent users from logging in during scheduled database updates.</p>
                    <Button variant="outline" className="mt-3 text-red-400 border-red-900 bg-red-950/20 hover:bg-red-900/40 hover:text-red-300">Enable Maintenance Mode</Button>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-slate-200">Admin Email Notifications</h4>
                    <p className="text-sm text-slate-500">Receive an email when a new organization is created.</p>
                    <Button variant="secondary" className="mt-3 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors" disabled>Notifications Configured Locally</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// --------------------------------------------------------------------------
// CLAIMS TAB
// --------------------------------------------------------------------------
function AdminClaimsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClaims = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profile_claims')
      .select(`
        *,
        provider:providers(provider_name, category, location),
        user_profile:profiles!profile_claims_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleApprove = async (claim: any) => {
    setActionLoading(claim.id);
    try {
      // 1. Update providers table
      const { error: providerError } = await supabase
        .from('providers')
        .update({ owner_id: claim.user_id })
        .eq('id', claim.provider_id);

      if (providerError) throw providerError;

      // 2. Update claim status
      const { error: claimError } = await supabase
        .from('profile_claims')
        .update({ status: 'approved' })
        .eq('id', claim.id);

      if (claimError) throw claimError;

      toast({
        title: 'Claim approved',
        description: `Ownership of ${claim.provider?.provider_name} has been assigned to ${claim.user_profile?.full_name}.`,
      });
      await fetchClaims();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Approval failed',
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (claimId: string) => {
    setActionLoading(claimId);
    try {
      const { error } = await supabase
        .from('profile_claims')
        .update({ status: 'rejected' })
        .eq('id', claimId);

      if (error) throw error;

      toast({
        title: 'Claim rejected',
        description: 'The claim request has been marked as rejected.',
      });
      await fetchClaims();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Rejection failed',
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(i =>
      (i.provider?.provider_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.user_profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.business_email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search claims by provider or user..." />

      <Card className="border-slate-800 bg-[#0f172a] shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-100">Profile Claim Requests</CardTitle>
          <CardDescription className="text-slate-400">Review and approve requests from service providers to claim their directory listings.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-slate-500">Loading data...</div> : (
            <div className="rounded-lg border border-slate-800 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#1e293b] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Business Profile</th>
                    <th className="px-5 py-3">Requester Details</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Submitted</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200">{item.provider?.provider_name}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.provider?.category} • {item.provider?.location}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-300">{item.full_name}</div>
                        <div className="text-xs text-slate-500">{item.business_email}</div>
                        <div className="text-xs text-slate-500">{item.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider shrink-0 ${
                          item.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-right whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-emerald-800 text-emerald-400 hover:bg-emerald-900/20"
                              onClick={() => handleApprove(item)}
                              disabled={actionLoading === item.id}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-red-800 text-red-400 hover:bg-red-900/20"
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading === item.id}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {item.status !== 'pending' && (
                          <span className="text-xs text-slate-500 italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No claim requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
