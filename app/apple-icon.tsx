import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width:          180,
        height:         180,
        borderRadius:   40,
        background:     'linear-gradient(135deg, #2dd4bf, #0d9488)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          color:      'white',
          fontSize:   110,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: 'sans-serif',
          marginTop:  4,
        }}
      >
        A
      </div>
    </div>,
    { width: 180, height: 180 }
  );
}
