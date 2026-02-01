
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { IssuePriority } from "@/lib/supabase-types";

interface ReportIssueFormProps {
  assetId: string;
  orgId: string;
  onSuccess: () => void;
}

export function ReportIssueForm({ assetId, orgId, onSuccess }: ReportIssueFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as IssuePriority,
  });

  const getUUID = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const { error } = await supabase.from('issues').insert({
            asset_id: assetId,
            org_id: orgId,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: 'open',
            reported_by: getUUID(),
        });
        
        if (error) throw error;
        
        toast({ title: "Issue reported successfully", description: "Thank you for your report." });
        onSuccess();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error reporting issue.";
        console.error(error);
        toast({ variant: "destructive", title: "Error reporting issue", description: message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Issue Type / Title</Label>
        <Input 
            id="title" 
            placeholder="e.g. Broken Screen, Leaking Pipe" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
        />
      </div>
      
      <div>
        <Label htmlFor="priority">Urgency</Label>
        <Select 
            value={formData.priority} 
            onValueChange={(val) => setFormData({...formData, priority: val as IssuePriority})}
        >
            <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="low">Low - Minor issue</SelectItem>
                <SelectItem value="medium">Medium - Needs attention</SelectItem>
                <SelectItem value="high">High - Urgent</SelectItem>
                <SelectItem value="critical">Critical - Immediate Safety Hazard</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
            id="description" 
            placeholder="Please describe the issue in detail..." 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Report
      </Button>
    </form>
  );
}
