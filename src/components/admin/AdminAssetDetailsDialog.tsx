
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Asset } from '@/lib/supabase-types';
import { Package, MapPin, Building2, User, Calendar, Tag, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminAssetDetailsDialogProps {
  asset: (Asset & { 
    organization?: { name: string }; 
    creator?: { full_name: string; email: string } 
  }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (asset: Asset) => void;
}

export function AdminAssetDetailsDialog({
  asset,
  open,
  onOpenChange,
  onDelete,
}: AdminAssetDetailsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-[#0f172a] border-slate-800 text-slate-200">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                {asset.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Asset Details & Management
              </DialogDescription>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${
              asset.status === 'active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' :
              asset.status === 'maintenance' ? 'bg-amber-900/30 text-amber-400 border-amber-900/50' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {asset.status}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          {asset.description && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <p className="text-sm text-slate-300 italic">"{asset.description}"</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium uppercase flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Location
              </span>
              <p className="text-sm font-medium text-slate-200 truncate">
                {asset.location || 'Not specified'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium uppercase flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Type
              </span>
              <p className="text-sm font-medium text-slate-200 truncate">
                {asset.type || 'Generic Asset'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium uppercase flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> Organization
              </span>
              <p className="text-sm font-medium text-slate-200 truncate">
                {asset.organization?.name || 'Unknown Org'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {asset.org_id}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium uppercase flex items-center gap-1.5">
                <User className="h-3 w-3" /> Created By
              </span>
              <p className="text-sm font-medium text-slate-200 truncate">
                {asset.creator?.full_name || 'Unknown User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {asset.creator?.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium uppercase flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Added On
              </span>
              <p className="text-sm font-medium text-slate-200">
                {format(new Date(asset.created_at), 'MMM d, yyyy')}
              </p>
            </div>

            {asset.serial_number && (
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Serial Number
                </span>
                <p className="text-sm font-medium text-slate-200 font-mono">
                  {asset.serial_number}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:justify-between gap-3 border-t border-slate-800 pt-4 mt-2">
          {!showDeleteConfirm ? (
            <div className="flex w-full justify-between items-center">
               <div className="text-xs text-slate-500">
                  Asset ID: <span className="font-mono">{asset.id.slice(0, 8)}...</span>
               </div>
               <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                >
                  Delete Asset
                </Button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-red-950/30 border border-red-900/50 rounded-lg p-3"
            >
              <div className="flex items-center gap-3 mb-3 text-red-400">
                <ShieldAlert className="h-5 w-5" />
                <p className="text-sm font-medium">Permanently delete this asset?</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    onDelete(asset);
                    setShowDeleteConfirm(false);
                    onOpenChange(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Delete
                </Button>
              </div>
            </motion.div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
