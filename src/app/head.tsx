// src/app/head.tsx
export default function Head() {
    return (
      <>
        <title>Jun Simons</title>
        <meta name="description" content="Jun's Personal Website" />
  
        {/* Primary favicon */}
        <link
          rel="icon"
          href="/owl.png"
          type="image/png"
          sizes="32x32"
        />
  
        {/* Optional Apple touch icon */}
        <link
          rel="apple-touch-icon"
          href="/owl.png"
          sizes="180x180"
        />
  
        {/* If you want multiple resolutions */}
        <link
          rel="icon"
          href="/owl.png"
          type="image/png"
          sizes="16x16"
        />
      </>
    )
  }
  