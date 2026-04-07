import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Camera,
  Check,
  X,
} from 'lucide-react';
import { getAssetDataFromUrl } from '@/lib/assetUrl';
import { IssuePriority, Asset } from '@/lib/supabase-types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatTicketId() {
  const ts = Date.now().toString(36).toUpperCase();
  return `TKT-${ts.slice(-6)}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Priority / Fault configuration ─────────────────────────────────────────

interface PriorityConfig {
  value: IssuePriority;
  label: string;
  description: string;
}

const PRIORITY_OPTIONS: PriorityConfig[] = [
  { value: 'critical', label: 'Critical', description: 'Safety hazard'    },
  { value: 'high',     label: 'High',     description: 'Major failure'     },
  { value: 'medium',   label: 'Medium',   description: 'Functional issue'  },
  { value: 'low',      label: 'Low',      description: 'Cosmetic / minor'  },
];


// ─── Inline style tokens ─────────────────────────────────────────────────────
// We use inline styles for tokens that must exactly match the demo palette,
// and Tailwind classes where the app's CSS variables align.

const S = {
  bg: '#0a0f0d',
  surface: '#0f1613',
  surface2: '#131c18',
  surface3: '#1a2521',
  border: '#243530',
  borderLight: '#2d4038',
  text: '#e8efe9',
  text2: '#8fa89a',
  text3: '#5c7a6b',
  text4: '#3d5548',
  accent: '#34d399',
  accentGlow: 'rgba(52,211,153,0.12)',
  accentGlowStrong: 'rgba(52,211,153,0.25)',
  accentDim: '#2bb885',
  red: '#F43F5E',
  amber: '#F59E0B',
} as const;

// ─── Asset type ──────────────────────────────────────────────────────────────

type AssetData = Pick<Asset, 'id' | 'name' | 'location' | 'org_id' | 'serial_number'> & {
  issue_types?: string[];
  asset_type?: { name: string; category: { name: string } };
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function TopBar({
  onBack,
  title,
  step,
}: {
  onBack?: () => void;
  title: string;
  step: string;
}) {
  return (
    <div
      style={{ background: S.bg }}
      className="sticky top-0 z-10 flex items-center justify-between py-4"
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: S.surface2,
          border: `1px solid ${S.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onBack ? 'pointer' : 'default',
          opacity: onBack ? 1 : 0,
          transition: 'opacity 0.15s',
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={18} style={{ color: S.text2 }} />
      </button>

      <span style={{ fontSize: 15, fontWeight: 600, color: S.text }}>{title}</span>

      <span
        style={{
          fontSize: 12,
          color: S.text3,
          fontFamily: 'monospace',
          minWidth: 32,
          textAlign: 'right',
        }}
      >
        {step}
      </span>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      style={{
        height: 3,
        background: S.surface3,
        borderRadius: 2,
        marginBottom: 24,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${S.accent}, ${S.accent})`,
          borderRadius: 2,
          transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}

function AssetCard({ asset, urlData }: { asset: AssetData | null; urlData: { name: string; location: string; orgId: string } }) {
  const name = asset?.name || urlData.name;
  const location = asset?.location || urlData.location;
  const assetType = asset?.asset_type?.name;
  const category = asset?.asset_type?.category?.name;
  const serialNumber = asset?.serial_number;
  const org = asset?.org_id ? '—' : '—'; // org name not fetched directly

  const metaItems = [
    { label: 'Location', value: location || 'Unknown' },
    { label: 'Asset Type', value: assetType || '—' },
    { label: 'Category', value: category || '—' },
    { label: 'Serial No.', value: serialNumber || '—' },
  ];

  return (
    <div
      style={{
        background: S.surface,
        border: `1px solid ${S.border}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent top stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${S.accent}, ${S.accentDim})`,
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: S.accentGlow,
          border: `1px solid ${S.accentDim}`,
          color: S.accent,
          fontSize: 10,
          fontWeight: 600,
          fontFamily: 'monospace',
          padding: '4px 10px',
          borderRadius: 100,
          marginBottom: 14,
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            background: S.accent,
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'ri-blink 1.5s infinite',
          }}
        />
        Asset Identified
      </div>

      {/* Asset name + ID */}
      <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, lineHeight: 1.3, color: S.text }}>
        {name}
      </div>
      {asset?.id && (
        <div
          style={{
            fontSize: 12,
            fontFamily: 'monospace',
            color: S.text3,
            marginBottom: 16,
            letterSpacing: '0.5px',
          }}
        >
          ID: {String(asset.id).slice(0, 8).toUpperCase()}
        </div>
      )}

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {metaItems.map((item) => (
          <div
            key={item.label}
            style={{
              background: S.surface2,
              borderRadius: 8,
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: S.text4,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 3,
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ReportIssue() {
  const { assetId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Multi-step state
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority | null>(null);
  const [selectedIssueTags, setSelectedIssueTags] = useState<string[]>([]);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Success state
  const [success, setSuccess] = useState(false);
  const [ticketId] = useState(() => formatTicketId());
  const [submittedAt] = useState(() => new Date());

  // Optimistic data from URL
  const urlData = getAssetDataFromUrl(searchParams);

  // ── Blink animation injection ──
  useEffect(() => {
    const styleId = 'ri-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes ri-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ri-success-pop { from{transform:scale(0);opacity:0} 50%{transform:scale(1.15)} to{transform:scale(1);opacity:1} }
        @keyframes ri-screen-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ── Load asset ──
  useEffect(() => {
    async function loadAsset() {
      if (!assetId) {
        if (urlData.orgId) {
          setAsset({
            id: '' as Asset['id'],
            name: urlData.name,
            location: urlData.location,
            org_id: urlData.orgId,
            serial_number: null,
            issue_types: [],
          });
        }
        return;
      }
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('assets')
          .select(`
            id, name, location, org_id, serial_number, issue_types,
            asset_type:asset_types (
              name,
              category:categories (name)
            )
          `)
          .eq('id', assetId)
          .single();

        if (fetchError) {
          console.error('Error fetching asset:', fetchError);
          if (urlData.orgId) {
            setAsset({
              id: assetId as Asset['id'],
              name: urlData.name,
              location: urlData.location,
              org_id: urlData.orgId,
              serial_number: null,
              issue_types: [],
            });
            setError(null);
          } else {
            const directoryUrl =
              window.location.hostname === 'localhost'
                ? 'http://localhost:3000'
                : 'https://qresolve.com';

            toast({
              title: 'Unmapped Asset',
              description: "This QR code isn't linked to a specific asset yet. Redirecting you to our directory...",
            });

            setTimeout(() => {
              window.location.href = `${directoryUrl}?reason=unmapped_qr`;
            }, 2000);

            setError('Unmapped QR code. Redirecting you to the directory...');
          }
        } else {
          setAsset(data as AssetData);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (assetId && urlData.orgId) {
          setAsset({
            id: assetId as Asset['id'],
            name: urlData.name,
            location: urlData.location,
            org_id: urlData.orgId,
            serial_number: null,
            issue_types: [],
          });
          setError(null);
        } else {
          const directoryUrl =
            window.location.hostname === 'localhost'
              ? 'http://localhost:3000'
              : 'https://qresolve.com';
          window.location.href = directoryUrl;
        }
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [assetId, urlData.location, urlData.name, urlData.orgId]);

  // ── Issue tag select (single-select only) ──
  const toggleIssueTag = (tag: string) => {
    setSelectedIssueTags((prev) => (prev[0] === tag ? [] : [tag]));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const orgId = asset?.org_id || urlData.orgId;
    const finalAssetId = asset?.id || (assetId as string | undefined);

    if (!orgId || !finalAssetId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing asset information. Please scan the code again.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const generatedTitle =
        selectedIssueTags.length > 0
          ? selectedIssueTags.join(', ')
          : priority
          ? `${priority.charAt(0).toUpperCase() + priority.slice(1)} issue`
          : 'Issue Report';

      // Generate the ID client-side so we don't need .select().single() after insert.
      // The RETURNING clause in Supabase is subject to SELECT (USING) policies — anon users
      // have no SELECT policy on issues, so reading back the new row would fail with RLS error.
      const newIssueId = getUUID();

      // Upload photo BEFORE inserting so the URL is available in the initial INSERT.
      // This avoids a follow-up UPDATE (which anon users also cannot do due to RLS).
      let photoUrl: string | null = null;
      if (photoFile) {
        try {
          const ext = photoFile.name.split('.').pop() ?? 'jpg';
          const storagePath = `${orgId}/${newIssueId}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('issue-photos')
            .upload(storagePath, photoFile, { upsert: false });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('issue-photos')
              .getPublicUrl(storagePath);
            photoUrl = publicUrlData?.publicUrl ?? null;
          }
        } catch {
          console.warn('Photo upload failed; issue will be submitted without photo.');
        }
      }

      // Build structured JSON description so Issues page can display fields cleanly
      const structuredDescription = JSON.stringify({
        note: description.trim() || null,
        issue_type: selectedIssueTags[0] ?? (priority ? `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority` : null),
        reporter_name: reporterName.trim() || null,
        reporter_contact: reporterContact.trim() || null,
        photo_url: photoUrl,
      });

      const { error: submitError } = await supabase
        .from('issues')
        .insert({
          id: newIssueId,
          org_id: orgId,
          asset_id: finalAssetId,
          title: generatedTitle,
          description: structuredDescription,
          priority: priority ?? 'medium',
          status: 'open',
          reported_by: getUUID(),
          issue_tags: selectedIssueTags,
        });

      if (submitError) throw submitError;

      setSuccess(true);
    } catch (err: unknown) {
      let message = 'Failed to submit report.';
      if (err instanceof Error) {
        message = err.message || message;
      } else if (err && typeof err === 'object') {
        const anyErr = err as { message?: string; details?: string; hint?: string };
        if (anyErr.message) message = anyErr.message;
        else if (anyErr.details) message = anyErr.details;
        else if (anyErr.hint) message = anyErr.hint;
      }
      console.error('Issue submit error:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to submit report',
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Determine fault cards to show ──
  // If the asset has custom issue_types, use those as tags.
  // Otherwise fall back to the 4 priority cards.
  const hasIssueTags = !!(asset?.issue_types && asset.issue_types.length > 0);

  // For the "selected fault" summary on step 2
  const selectedFaultLabel =
    selectedIssueTags.length > 0
      ? selectedIssueTags[0]
      : priority
      ? PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? 'Issue'
      : 'Issue';

  // Continue is allowed when either a tag or priority is selected
  const canContinue = hasIssueTags ? selectedIssueTags.length > 0 : priority !== null;

  // ── Wrapper styles ──
  const pageStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: S.bg,
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: S.text,
    overflowX: 'hidden',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 440,
    margin: '0 auto',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 22px 36px',
  };

  // ─── Error screen ──────────────────────────────────────────────────────────

  if (error && !asset) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <TopBar title="Report an Issue" step="" />
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 16,
            }}
          >
            <AlertTriangle size={48} style={{ color: S.amber }} />
            <p style={{ color: S.text2, fontSize: 15, maxWidth: 300 }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success screen ────────────────────────────────────────────────────────

  if (success) {
    const assetName = asset?.name || urlData.name;
    const location = asset?.location || urlData.location;

    return (
      <div style={pageStyle}>
        <div
          style={{
            ...containerStyle,
            justifyContent: 'flex-start',
            animation: 'ri-screen-in 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Success hero */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              paddingTop: 48,
              paddingBottom: 24,
            }}
          >
            {/* Check circle */}
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: S.accentGlow,
                border: `2px solid ${S.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                animation: 'ri-success-pop 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <CheckCircle2 size={34} style={{ color: S.accent }} />
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Issue Reported</div>
            <div
              style={{
                fontSize: 14,
                color: S.text2,
                marginBottom: 28,
                lineHeight: 1.5,
                maxWidth: 300,
              }}
            >
              Your report has been received. The maintenance team has been notified.
            </div>

            {/* Timer / timestamp bar */}
            <div
              style={{
                width: '100%',
                background: S.surface2,
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
              }}
            >
              <Clock size={18} style={{ color: S.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: S.text2, flex: 1 }}>Reported at</span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  color: S.accent,
                }}
              >
                {formatTime(submittedAt)}
              </span>
            </div>

            {/* Ticket card */}
            <div
              style={{
                width: '100%',
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: 16,
                padding: 20,
                textAlign: 'left',
                marginBottom: 20,
              }}
            >
              {/* Ticket header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    color: S.accent,
                  }}
                >
                  {ticketId}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: 'rgba(245,158,11,0.10)',
                    color: S.amber,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Open
                </span>
              </div>

              {/* Ticket rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Asset', value: assetName },
                  { label: 'Location', value: location || 'Unknown' },
                  { label: 'Issue', value: selectedFaultLabel },
                  { label: 'Reporter', value: 'Anonymous (no login required)' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, color: S.text3 }}>{row.label}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: S.text,
                        textAlign: 'right',
                        maxWidth: '60%',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: S.border, margin: '14px 0' }} />

              {/* Audit trail */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: S.text4,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: 10,
                }}
              >
                Audit Trail
              </div>
              {[
                { color: S.accent, text: 'Report created — submitted via QR code' },
                { color: S.amber, text: 'Ticket dispatched — routing to maintenance team' },
                { color: S.text3, text: 'Awaiting technician acknowledgement…' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '5px 0' }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: item.color,
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: S.text2, lineHeight: 1.4 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Report another button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '14px',
                background: S.surface2,
                color: S.text2,
                border: `1px solid ${S.border}`,
                borderRadius: 12,
                fontFamily: "'DM Sans', -apple-system, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
            >
              <RotateCcw size={16} />
              Report Another Issue
            </button>
          </div>

          {/* Watermark */}
          <div
            style={{
              textAlign: 'center',
              paddingTop: 20,
              fontSize: 12,
              color: S.text4,
            }}
          >
            Powered by{' '}
            <a
              href="https://qresolve.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: S.accent, textDecoration: 'none', fontWeight: 600 }}
            >
              Relay by QResolve
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <TopBar title="Report an Issue" step="1 / 2" />
          <ProgressBar percent={50} />
          {/* Skeleton asset card */}
          <div
            style={{
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            {[100, 160, 80, 'grid'].map((w, i) =>
              w === 'grid' ? (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[0, 1, 2, 3].map((j) => (
                    <div
                      key={j}
                      style={{
                        height: 52,
                        borderRadius: 8,
                        background: S.surface3,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    height: i === 0 ? 20 : i === 1 ? 28 : 16,
                    width: `${w}px`,
                    borderRadius: 6,
                    background: S.surface3,
                    marginBottom: 12,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 1: Asset + Fault selection ──────────────────────────────────────

  if (step === 1) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...containerStyle,
            animation: 'ri-screen-in 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <TopBar title="Report an Issue" step="1 / 2" />
          <ProgressBar percent={50} />

          <AssetCard asset={asset} urlData={urlData} />

          {/* Section label */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: S.text3,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: 14,
            }}
          >
            What's the issue?
          </div>

          {/* Fault / tag grid */}
          {hasIssueTags ? (
            /* Custom issue tags from asset */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 24,
              }}
            >
              {[...asset!.issue_types!.filter(t => t !== 'Others'), 'Others'].map((tag) => {
                const selected = selectedIssueTags.includes(tag);
                const isOthers = tag === 'Others';
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleIssueTag(tag)}
                    style={{
                      background: selected ? S.accentGlow : S.surface,
                      border: `1.5px solid ${selected ? S.accent : S.border}`,
                      borderRadius: 12,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s',
                      fontFamily: "'DM Sans', -apple-system, sans-serif",
                    }}
                  >
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isOthers ? S.text3 : S.text,
                      lineHeight: 1.3,
                      flex: 1,
                    }}>
                      {tag}
                    </span>
                    {selected && (
                      <span
                        style={{
                          flexShrink: 0,
                          width: 20,
                          height: 20,
                          background: S.accent,
                          color: S.bg,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Priority cards (fallback when no custom tags) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 24,
              }}
            >
              {[...PRIORITY_OPTIONS, { value: 'others' as IssuePriority, label: 'Others', description: 'Something else' }].map((opt) => {
                const selected = priority === opt.value;
                const isOthers = opt.value === 'others';
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    style={{
                      background: selected ? S.accentGlow : S.surface,
                      border: `1.5px solid ${selected ? S.accent : S.border}`,
                      borderRadius: 12,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s',
                      fontFamily: "'DM Sans', -apple-system, sans-serif",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isOthers ? S.text3 : S.text }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 11, color: S.text3, marginTop: 2 }}>
                        {opt.description}
                      </div>
                    </div>
                    {selected && (
                      <span
                        style={{
                          flexShrink: 0,
                          width: 20,
                          height: 20,
                          background: S.accent,
                          color: S.bg,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Continue button */}
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep(2)}
            style={{
              width: '100%',
              padding: 16,
              background: canContinue ? S.accent : S.surface3,
              color: canContinue ? S.bg : S.text4,
              border: 'none',
              borderRadius: 12,
              fontFamily: "'DM Sans', -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              marginTop: 'auto',
            }}
          >
            Continue
          </button>

          {/* Watermark */}
          <div style={{ textAlign: 'center', paddingTop: 16, fontSize: 12, color: S.text4 }}>
            Powered by{' '}
            <a
              href="https://qresolve.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: S.accent, textDecoration: 'none', fontWeight: 600 }}
            >
              Relay by QResolve
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Details + Submit ──────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      <div
        style={{
          ...containerStyle,
          animation: 'ri-screen-in 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <TopBar
          title="Add Details"
          step="2 / 2"
          onBack={() => setStep(1)}
        />
        <ProgressBar percent={100} />

        {/* Summary mini card */}
        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            borderRadius: 16,
            padding: '14px 18px',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${S.accent}, ${S.accentDim})`,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: S.text3, marginBottom: 4 }}>Reporting</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{selectedFaultLabel}</div>
            </div>
            {asset?.id && (
              <div style={{ fontSize: 12, color: S.text3, fontFamily: 'monospace' }}>
                {String(asset.id).slice(0, 8).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Photo upload section label */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: S.text3,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 14,
          }}
        >
          Attach a Photo
        </div>

        {/* Photo upload widget */}
        <label
          htmlFor="ri-photo-input"
          style={{
            display: 'block',
            background: photoError
              ? 'rgba(244,63,94,0.08)'
              : photoFile
              ? S.accentGlow
              : S.surface,
            border: `2px ${photoError || photoFile ? 'solid' : 'dashed'} ${
              photoError ? S.red : photoFile ? S.accent : S.border
            }`,
            borderRadius: 16,
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 16,
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* Hidden file input */}
          <input
            ref={photoInputRef}
            id="ri-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > 5 * 1024 * 1024) {
                setPhotoError('Image must be under 5 MB. Please choose a smaller file.');
                setPhotoFile(null);
                // Reset input so the same file can be re-selected after retry
                if (photoInputRef.current) {
                  photoInputRef.current.value = '';
                }
              } else {
                setPhotoError(null);
                setPhotoFile(file);
              }
            }}
          />

          {/* Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              color: photoError ? S.red : photoFile ? S.accent : S.text3,
              transition: 'color 0.2s',
            }}
          >
            {photoError ? (
              <X size={28} />
            ) : photoFile ? (
              <Check size={28} />
            ) : (
              <Camera size={28} />
            )}
          </div>

          {/* Primary text */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: photoError ? S.red : S.text,
              marginBottom: 4,
            }}
          >
            {photoError
              ? photoError
              : photoFile
              ? 'Photo attached'
              : 'Tap to attach a photo'}
          </div>

          {/* Hint / secondary text */}
          <div
            style={{
              fontSize: 12,
              color: photoError ? S.red : S.text3,
              opacity: photoError ? 0.8 : 1,
            }}
          >
            {photoError
              ? 'Tap to re-upload'
              : photoFile
              ? `${photoFile.name} — ${(photoFile.size / 1024 / 1024).toFixed(1)} MB`
              : 'Helps the maintenance team diagnose faster'}
          </div>
        </label>

        {/* Additional notes */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: S.text3,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 14,
          }}
        >
          Additional Notes{' '}
          <span style={{ color: S.text4, textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>
            (optional)
          </span>
        </div>

        <textarea
          rows={4}
          placeholder="Describe the issue in more detail — what happened, when, any relevant context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            background: S.surface,
            border: `1.5px solid ${S.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            color: S.text,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            marginBottom: 24,
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = S.accent; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = S.border; }}
        />

        {/* Reporter info */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: S.text3,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 14,
          }}
        >
          Your Details{' '}
          <span style={{ color: S.text4, textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>
            (optional)
          </span>
        </div>

        <input
          type="text"
          placeholder="Your name"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          style={{
            width: '100%',
            background: S.surface,
            border: `1.5px solid ${S.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            color: S.text,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            fontSize: 14,
            outline: 'none',
            marginBottom: 10,
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = S.accent; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = S.border; }}
        />

        <input
          type="email"
          placeholder="Email or phone (so we can follow up)"
          value={reporterContact}
          onChange={(e) => setReporterContact(e.target.value)}
          style={{
            width: '100%',
            background: S.surface,
            border: `1.5px solid ${S.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            color: S.text,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            fontSize: 14,
            outline: 'none',
            marginBottom: 24,
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = S.accent; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = S.border; }}
        />

        {/* Submit button */}
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: 16,
            background: submitting ? S.surface3 : S.accent,
            color: submitting ? S.text4 : S.bg,
            border: 'none',
            borderRadius: 12,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 'auto',
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Submitting…
            </>
          ) : (
            'Submit Report'
          )}
        </button>

        {/* Watermark */}
        <div style={{ textAlign: 'center', paddingTop: 16, fontSize: 12, color: S.text4 }}>
          Powered by{' '}
          <a
            href="https://qresolve.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: S.accent, textDecoration: 'none', fontWeight: 600 }}
          >
            Relay by QResolve
          </a>
        </div>
      </div>
    </div>
  );
}
