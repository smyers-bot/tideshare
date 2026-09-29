import { ImageResponse } from 'next/og';

export const alt = 'List your gear on TideShare — earn money in Charleston, SC';
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
          background: 'linear-gradient(160deg, #0F1F2E 0%, #0077B6 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 90, fontWeight: 800, color: '#fff', letterSpacing: '-2px' }}>
          tide<span style={{ color: '#E9C46A' }}>share</span>
        </div>
        <div style={{ display: 'flex', fontSize: 38, color: '#fff', marginTop: 24, fontWeight: 700, textAlign: 'center' }}>
          Your gear earns money while you're not using it.
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.75)', marginTop: 18 }}>
          Free to list · Takes a minute · You keep 85%
        </div>
      </div>
    ),
    { ...size }
  );
}
