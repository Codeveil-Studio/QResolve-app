
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Asset } from '@/lib/supabase-types';

interface AssetQRPDFTemplateProps {
  asset: Asset;
  qrUrl: string;
}

export const AssetQRPDFTemplate = React.forwardRef<HTMLDivElement, AssetQRPDFTemplateProps>(
  ({ asset, qrUrl }, ref) => {
    return (
      <div
        ref={ref}
        id={`qr-template-${asset.id}`}
        className="bg-white p-8 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center"
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto', // Center it if container is larger
          pageBreakInside: 'avoid'
        }}
      >
        <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">Scan to Report Issue</h1>
            <p className="text-sm text-gray-500">Use your mobile device</p>
        </div>

        <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm mb-6">
             <QRCodeSVG 
                value={qrUrl} 
                size={250} 
                level="H" 
                includeMargin={true} 
            />
        </div>
        
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
            {asset.location && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                    <span className="font-semibold">Location:</span>
                    <span>{asset.location}</span>
                </div>
            )}
             <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-2">
                <span className="font-mono">{asset.serial_number}</span>
            </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 w-full">
             <p className="text-xs text-gray-400 font-mono">ID: {asset.id}</p>
             <p className="text-xs text-gray-400 mt-1">Powered by QResolve</p>
        </div>
      </div>
    );
  }
);

AssetQRPDFTemplate.displayName = 'AssetQRPDFTemplate';
