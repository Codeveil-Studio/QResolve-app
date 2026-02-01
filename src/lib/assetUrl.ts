
import { Asset } from "./supabase-types";

export const generateReportUrl = (asset: Asset) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    name: asset.name,
    location: asset.location || '',
    orgId: asset.org_id,
  });
  
  return `${baseUrl}/report/${asset.id}?${params.toString()}`;
};

export const getAssetDataFromUrl = (searchParams: URLSearchParams) => {
  return {
    name: searchParams.get('name') || 'Unknown Asset',
    location: searchParams.get('location') || 'Unknown Location',
    orgId: searchParams.get('orgId') || '',
  };
};
