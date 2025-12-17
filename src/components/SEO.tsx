interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
}

export default function SEO({ title, description, name = 'Grifi', type = 'website' }: SEOProps) {
  // In Next.js App Router, use export const metadata = { ... } in the page file instead.
  // This component is kept for compatibility but does not render anything.
  return null;
}
