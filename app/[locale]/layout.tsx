import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from '@/lib/i18n';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import '../globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  // Force locale to be consistent
  const finalLocale = locale || defaultLocale;

  return (
    <html lang={finalLocale} className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        <NextIntlClientProvider locale={finalLocale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

