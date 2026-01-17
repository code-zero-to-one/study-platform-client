import PaymentPageContent from '@/components/contents/payment-page-content';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: PaymentPageProps) {
  const { id } = await params;

  return <PaymentPageContent id={id} />;
}
