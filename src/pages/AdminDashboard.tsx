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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
        <div className="flex h-screen bg-background text-foreground qresolve-theme font-sans">
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
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 outline-none",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md">
                            <ShieldAlert className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold text-foreground font-serif tracking-tight">Admin Portal</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto p-1 hover:bg-muted rounded-md lg:hidden text-muted-foreground"
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
                                        isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 relative z-10 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
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
                    <div className="border-t border-border p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-3 px-2 py-2 hover:bg-muted transition-colors rounded-lg outline-none">
                                    <Avatar className="h-9 w-9 border border-border">
                                        <AvatarImage src={profile?.avatar_url || undefined} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {getInitials(profile?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            System Admin
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-card border-border text-foreground">
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-muted focus:bg-muted focus:text-red-300 cursor-pointer font-medium">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden bg-background">
                {/* Mobile header */}
                <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8 shrink-0">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden mr-3 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold font-serif tracking-tight text-foreground hidden sm:block capitalize">
                            {activeTab} Management
                        </h1>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wide uppercase text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-11 shadow-sm"
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
        { title: 'Total Users', value: stats.users, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Organizations', value: stats.organizations, icon: Building2, color: 'text-accent', bg: 'bg-accent/10' },
        { title: 'Total Assets', value: stats.assets, icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
        { title: 'Reported Issues', value: stats.issues, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
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
                        <Card className="border-border bg-card shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                                ) : (
                                    <div className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="border-border bg-card shadow-md mt-8 col-span-4">
                <CardHeader>
                    <CardTitle className="text-foreground font-serif">System Status Log</CardTitle>
                    <CardDescription className="text-muted-foreground">Recent automated system events and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 py-3 border-b border-border text-sm">
                            <div className="bg-accent/10 text-accent p-2 rounded-full"><Activity className="w-4 h-4" /></div>
                            <div className="flex-1 font-medium text-foreground">Database automated backup completed</div>
                            <div className="text-muted-foreground font-medium">10 mins ago</div>
                        </div>
                        <div className="flex items-center gap-4 py-3 border-b border-border text-sm">
                            <div className="bg-primary/10 text-primary p-2 rounded-full"><Users className="w-4 h-4" /></div>
                            <div className="flex-1 font-medium text-foreground">New organization signed up</div>
                            <div className="text-muted-foreground font-medium">1 hr ago</div>
                        </div>
                        <div className="flex items-center gap-4 py-3 text-sm">
                            <div className="bg-accent/10 text-accent p-2 rounded-full"><Activity className="w-4 h-4" /></div>
                            <div className="flex-1 font-medium text-foreground">System performance OK</div>
                            <div className="text-muted-foreground font-medium">2 hrs ago</div>
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

            <Card className="border-border bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-foreground font-serif">Platform Users</CardTitle>
                    <CardDescription className="text-muted-foreground">A complete list of registered users across all organizations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-muted-foreground">Loading data...</div> : (
                        <div className="rounded-lg border border-border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                    <tr>
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Email</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Joined</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-5 py-4 font-medium text-foreground">{item.full_name || 'No Name'}</td>
                                            <td className="px-5 py-4 text-muted-foreground">{item.email}</td>
                                            <td className="px-5 py-4">
                                                {item.is_banned ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                                        Banned
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground text-right">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {item.is_banned ? (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 border-accent/50 text-accent hover:bg-accent/10 hover:text-accent"
                                                            onClick={() => setConfirmDialog({ open: true, type: 'unban', user: item })}
                                                            disabled={actionLoading === item.id}
                                                        >
                                                            Unban
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 border-warning/50 text-warning hover:bg-warning/10 hover:text-warning"
                                                            onClick={() => setConfirmDialog({ open: true, type: 'ban', user: item })}
                                                            disabled={actionLoading === item.id}
                                                        >
                                                            Ban
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                                        <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No users found.</td></tr>
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
                            className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-full ${
                                        confirmDialog.type === 'delete' ? 'bg-destructive/10 text-destructive' : 
                                        confirmDialog.type === 'ban' ? 'bg-warning/10 text-warning' : 
                                        'bg-accent/10 text-accent'
                                    }`}>
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground capitalize font-serif">
                                            {confirmDialog.type} User
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            Are you sure you want to {confirmDialog.type} <strong>{confirmDialog.user?.full_name}</strong>?
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-muted-foreground/70 text-sm mb-6">
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
                                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        className={`${
                                            confirmDialog.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : 
                                            confirmDialog.type === 'ban' ? 'bg-warning hover:bg-warning/90' : 
                                            'bg-accent hover:bg-accent/90'
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

            <Card className="border-border bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-foreground font-serif">Organizations</CardTitle>
                    <CardDescription className="text-muted-foreground">Companies and teams using the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-muted-foreground">Loading data...</div> : (
                        <div className="rounded-lg border border-border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                    <tr>
                                        <th className="px-5 py-3">Organization Name</th>
                                        <th className="px-5 py-3">Owner Name</th>
                                        <th className="px-5 py-3">Owner ID</th>
                                        <th className="px-5 py-3 text-right">Created At</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-5 py-4 font-medium text-foreground flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-md">
                                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                {item.name}
                                            </td>
                                            <td className="px-5 py-4 text-foreground/80">
                                                {item.owner_profile?.full_name || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{item.owner_id}</td>
                                            <td className="px-5 py-4 text-muted-foreground text-right">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => setConfirmDialog({ open: true, org: item })}
                                                    disabled={actionLoading === item.id}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No organizations found.</td></tr>
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
                            className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground font-serif">Delete Organization</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Delete <strong>{confirmDialog.org?.name}</strong> and all its assets?
                                        </p>
                                    </div>
                                </div>

                                <p className="text-muted-foreground/70 text-sm mb-6">
                                    This action is permanent and cannot be undone.
                                </p>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirmDialog({ open: false, org: null })}
                                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-destructive hover:bg-destructive/90 text-white"
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
                    <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                        <DialogHeader>
                            <DialogTitle className="font-serif">{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {editingCategory ? 'Update the category name.' : 'Create a new category for asset types.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-foreground">Category Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., IT Equipment"
                                    required
                                    className="mt-1.5 bg-background border-border text-foreground focus-visible:ring-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">
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

            <Card className="border-border bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-foreground font-serif">All Categories</CardTitle>
                    <CardDescription className="text-muted-foreground">Manage categories used for asset types across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-muted-foreground">Loading data...</div> : (
                        <div className="rounded-lg border border-border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                    <tr>
                                        <th className="px-5 py-3">Category Name</th>
                                        <th className="px-5 py-3 text-right">Created At</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-5 py-4 font-medium text-foreground">{category.name}</td>
                                            <td className="px-5 py-4 text-muted-foreground text-right whitespace-nowrap">
                                                {new Date(category.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
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
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-muted"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCategories.length === 0 && (
                                        <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No categories found.</td></tr>
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

            <Card className="border-border bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-foreground font-serif">Global Assets</CardTitle>
                    <CardDescription className="text-muted-foreground">Every asset registered across the system. Click on a card for details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-muted-foreground">Loading data...</div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => {
                                        setSelectedAsset(item);
                                        setDetailsOpen(true);
                                    }}
                                    className="border border-border rounded-xl p-5 bg-muted/20 shadow-sm flex flex-col gap-3 hover:border-accent/50 hover:bg-muted/40 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">{item.name}</div>
                                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider shrink-0 border ${
                                            item.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' : 
                                            'bg-muted text-muted-foreground border-border'
                                        }`}>
                                            {item.status}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-muted-foreground/60" />
                                            <span className="truncate">{item.organization?.name || 'Unknown Org'}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 text-muted-foreground/60" />
                                            <span className="truncate">{item.location || 'No location'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3 h-3" />
                                            <span className="truncate max-w-[100px]">{item.creator?.full_name || 'Unknown'}</span>
                                        </div>
                                        <span className="font-mono opacity-50">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12 border border-border border-dashed rounded-xl">No assets match your search.</div>}
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
    const [issueToDelete, setIssueToDelete] = useState<IssueWithAsset | null>(null);
    const { toast } = useToast();

    const fetchIssues = async () => {
        const { data } = await supabase
            .from('issues')
            .select('*, asset:assets(name)')
            .order('created_at', { ascending: false });
        setItems((data as IssueWithAsset[]) || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleDelete = async () => {
        if (!issueToDelete) return;
        const { error } = await supabase.from('issues').delete().eq('id', issueToDelete.id);
        if (error) {
            toast({ variant: 'destructive', title: 'Failed to delete issue', description: error.message });
        } else {
            toast({ title: 'Issue deleted' });
            fetchIssues();
        }
        setIssueToDelete(null);
    };

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            (i.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    return (
        <div className="space-y-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search issues by title or description..." />

            <Card className="border-border bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-foreground font-serif">Global Issues Log</CardTitle>
                    <CardDescription className="text-muted-foreground">Tickets and issues from all organizations, showing related assets.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="text-sm text-muted-foreground">Loading data...</div> : (
                        <div className="rounded-lg border border-border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                    <tr>
                                        <th className="px-5 py-3">Issue Detail</th>
                                        <th className="px-5 py-3">Asset</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Priority</th>
                                        <th className="px-5 py-3 text-right">Date</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-foreground line-clamp-1 max-w-[250px]">{item.title}</div>
                                                <div className="text-xs text-muted-foreground/60 font-mono mt-1.5 truncate max-w-[200px]" title={item.org_id}>Org: {item.org_id}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-foreground/80 bg-muted/50 inline-flex px-2 py-1 rounded max-w-[200px] truncate border border-border/30">
                                                    <Package className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                                    {item.asset?.name || 'Unknown Asset'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider shrink-0 ${item.status === 'open' ? 'bg-warning/10 text-warning border border-warning/20' :
                                                        item.status === 'resolved' ? 'bg-accent/10 text-accent border border-accent/20' :
                                                            'bg-muted text-muted-foreground border border-border'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider shrink-0 ${item.priority === 'critical' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                                                        item.priority === 'high' ? 'bg-warning/10 text-warning border border-warning/20' :
                                                            'bg-primary/10 text-primary border border-primary/20'
                                                    }`}>
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground text-right whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setIssueToDelete(item)}
                                                    title="Delete issue"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No issues found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!issueToDelete} onOpenChange={(open) => !open && setIssueToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-medium text-foreground">"{issueToDelete?.title}"</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --------------------------------------------------------------------------
// SETTINGS TAB
// --------------------------------------------------------------------------
function AdminSettingsTab() {
    return (
        <Card className="border-border bg-card shadow-md max-w-2xl">
            <CardHeader>
                <CardTitle className="text-foreground font-serif">System Settings</CardTitle>
                <CardDescription className="text-muted-foreground">Global configurations for the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 border-b border-border pb-5">
                    <h4 className="font-semibold text-foreground">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">Prevent users from logging in during scheduled database updates.</p>
                    <Button variant="outline" className="mt-3 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">Enable Maintenance Mode</Button>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Admin Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive an email when a new organization is created.</p>
                    <Button variant="secondary" className="mt-3 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors" disabled>Notifications Configured Locally</Button>
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
        provider:providers(provider_name, category, sub_locality, contact_info)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching claims',
        description: error.message
      });
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
      const { error: providerError, count } = await supabase
        .from('providers')
        .update({ 
          owner_id: claim.user_id,
          is_verified: true 
        })
        .eq('id', claim.provider_id)
        .select();

      if (providerError) throw providerError;
      
      // If no rows were updated, it's likely an RLS issue or wrong ID
      if (!count && count !== null) {
        console.warn('Provider update affected 0 rows. Check RLS policies or Provider ID.');
      }

      // 2. Auto-sync Organization Name
      // Find the user's owned organization and rename it to the business name
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('org_id')
        .eq('user_id', claim.user_id)
        .eq('role', 'owner')
        .maybeSingle();

      if (membership) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({ name: claim.provider?.provider_name || 'My Business' })
          .eq('id', membership.org_id);
        
        if (orgError) {
          console.error('Failed to sync organization name:', orgError);
          // We don't throw here as the main provider ownership was successful
        }
      }

      // 3. Update claim status
      const { error: claimError } = await supabase
        .from('profile_claims')
        .update({ status: 'approved' })
        .eq('id', claim.id);

      if (claimError) throw claimError;

      toast({
        title: 'Claim approved',
        description: `Ownership of ${claim.provider?.provider_name} has been assigned and organization renamed.`,
      });
      await fetchClaims();
    } catch (error: any) {
      console.error('Approval flow error:', error);
      toast({
        variant: 'destructive',
        title: 'Approval failed',
        description: error.message || 'An unexpected error occurred during approval.',
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

      <Card className="border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground font-serif">Profile Claim Requests</CardTitle>
          <CardDescription className="text-muted-foreground">Review and approve requests from service providers to claim their directory listings.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading data...</div> : (
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="px-5 py-3">Business Profile</th>
                    <th className="px-5 py-3">Requester Details</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Submitted</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{item.provider?.provider_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.provider?.category} • {item.provider?.location}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground/80">{item.full_name}</div>
                        <div className="text-xs text-muted-foreground">{item.business_email}</div>
                        <div className="text-xs text-muted-foreground">{item.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider shrink-0 ${
                          item.status === 'pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                          item.status === 'approved' ? 'bg-accent/10 text-accent border border-accent/20' :
                          'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-right whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-accent/50 text-accent hover:bg-accent/10"
                              onClick={() => handleApprove(item)}
                              disabled={actionLoading === item.id}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading === item.id}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {item.status !== 'pending' && (
                          <span className="text-xs text-muted-foreground italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No claim requests found.</td></tr>
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
