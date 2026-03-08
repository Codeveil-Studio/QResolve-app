import React from 'react';

export default function Loading() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #0a0f0d 0%, #0f1613 50%, #0a0f0d 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            fontFamily: "'DM Sans', sans-serif",
        }}>
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(52, 211, 153, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(52, 211, 153, 0.2)', boxShadow: '0 0 30px rgba(52, 211, 153, 0.1)' }} />
                    <div style={{ position: 'absolute', inset: '-2px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#34d399', borderRightColor: 'rgba(52, 211, 153, 0.3)', animation: 'loaderSpin 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)', animation: 'glowPulse 2s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 2, animation: 'floatAndPulse 2.5s ease-in-out infinite', filter: 'drop-shadow(0 0 16px rgba(52, 211, 153, 0.4))' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: '#34d399', display: 'grid', placeItems: 'center' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0f0d" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="16" y="16" width="3" height="3" rx="0.5" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem', fontFamily: "'Fraunces', Georgia, serif" }}>
                        <span style={{ color: '#34d399' }}>Q</span><span style={{ color: '#e8efe9' }}>Resolve</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        {[0, 1, 2].map((i) => (
                            <span key={i} style={{ display: 'block', width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                        ))}
                    </div>
                </div>
            </div>
            <style>{`
        @keyframes loaderSpin { to { transform: rotate(360deg); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes floatAndPulse { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-6px) scale(1.04); } }
        @keyframes dotPulse { 0%, 100% { opacity: 0.25; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>
        </div>
    );
}
