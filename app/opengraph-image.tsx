import { ImageResponse } from 'next/og';

export const alt = 'TideShare — Rent Beach & Outdoor Gear in Charleston SC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #0077B6 0%, #0096C7 50%, #00B4D8 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: '#fff', letterSpacing: '-2px' }}>
          tide<span style={{ color: '#E9C46A' }}>share</span>
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: 'rgba(255,255,255,0.92)', marginTop: 20, fontWeight: 600 }}>
          Rent Beach &amp; Outdoor Gear in Charleston, SC
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 16 }}>
          Surfboards · Kayaks · Paddleboards · Bikes · Golf Clubs
        </div>
      </div>
    ),
    { ...size }
  );
}
