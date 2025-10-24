import { redirect } from 'next/navigation';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to dashboard or login based on auth status
  // The middleware will handle this, but we redirect to dashboard by default
  redirect(`/${locale}/dashboard`);
}

