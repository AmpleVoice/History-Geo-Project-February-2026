import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'خريطة المقاومات الشعبية الجزائرية (1830-1954)',
  description:
    'تطبيق تفاعلي يوثق الثورات والانتفاضات والمقاومات الشعبية الجزائرية ضد الاستعمار الفرنسي',
  keywords: [
    'الجزائر',
    'تاريخ',
    'مقاومة',
    'ثورة',
    'استعمار',
    'فرنسا',
    'خريطة',
    'تفاعلية',
  ],
  authors: [{ name: 'Algerian History Map Project' }],
  openGraph: {
    title: 'خريطة المقاومات الشعبية الجزائرية',
    description: 'استكشف تاريخ المقاومة الشعبية الجزائرية على خريطة تفاعلية',
    type: 'website',
    locale: 'ar_DZ',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-neutral-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
