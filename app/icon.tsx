import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const size        = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Browser tab favicon — auto-detected by Next.js.
 * Renders the AethLife "A" mark on a teal background.
 * ImageResponse uses Satori (HTML/CSS, not React DOM).
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width:          32,
        height:         32,
        borderRadius:   8,
        background:     'linear-gradient(135deg, #2dd4bf, #0d9488)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      {/* Clean "A" letterform using divs (Satori doesn't render SVG paths reliably) */}
      <div
        style={{
          color:      'white',
          fontSize:   20,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: 'sans-serif',
          marginTop:  1,
        }}
      >
        A
      </div>
    </div>,
    { width: 32, height: 32 }
  );
}
