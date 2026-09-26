import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Tax & Business Invoice Generator',
  description: 'Create, customize, and export professional GST and tax invoices in standard tabular format with PDF export, email sending, and WhatsApp delivery.',
  openGraph: {
    title: 'Tax & Business Invoice Generator',
    description: 'Create, customize, and export professional GST and tax invoices in standard tabular format with PDF export, email sending, and WhatsApp delivery.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tax & Business Invoice Generator',
    description: 'Create, customize, and export professional GST and tax invoices in standard tabular format with PDF export, email sending, and WhatsApp delivery.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
