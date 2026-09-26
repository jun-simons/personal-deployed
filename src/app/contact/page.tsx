// src/app/contact/page.tsx
import type { Metadata } from 'next'
import ContactView from '@/components/contact-view'

export const metadata: Metadata = {
  title: 'contact',
}

export default function ContactPage() {
  return <ContactView />
}
