import type { Metadata, Viewport } from 'next'
import './globals.css'
import { displayFont, monoLight, monoRegular } from './fonts'
import Konami from '@/components/easter-eggs/konami'
import IdleOwl from '@/components/easter-eggs/owl'
import Navbar from '@/components/navbar'
import ThemeSync from '@/components/theme-sync'
import { IntroProvider } from '@/components/providers/intro'
import { SoundProvider } from '@/components/providers/sound'

export const metadata: Metadata = {
  metadataBase: new URL('https://junsimons.com'),
  title: {
    default: 'Jun Simons',
    template: '%s · Jun Simons',
  },
  description:
    'Jun Simons: machine learning, systems, and open source, plus music, photography, and generative art.',
  icons: {
    icon: '/owl.png',
    apple: '/owl.png',
  },
  openGraph: {
    title: 'Jun Simons',
    description: 'Projects, writing, and art by Jun Simons.',
    url: '/',
    siteName: 'Jun Simons',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#e1dfdd',
}

// Set the color theme before first paint so /art never flashes light.
const themeScript = `document.documentElement.dataset.theme=location.pathname.startsWith('/art')?'dark':'light'`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${monoLight.variable} ${monoRegular.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-[100svh] font-monoreg">
        <SoundProvider>
          <IntroProvider>
            <ThemeSync />
            <Navbar />
            {children}
            <Konami />
            <IdleOwl />
          </IntroProvider>
        </SoundProvider>
      </body>
    </html>
  )
}
