import { Helmet } from 'react-helmet-async';

export function SEO() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Dubai Mortgage Calculator",
    "description": "Free Dubai mortgage calculator. Calculate monthly payments, DLD fees, agent commission, and total costs for property purchase in Dubai, UAE.",
    "url": "https://dubai-mortgage-calculator.com",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "AED"
    },
    "featureList": [
      "Monthly payment calculation",
      "DLD fee calculation (4%)",
      "Real estate agent fee calculation (2%)",
      "Bank arrangement fee calculation",
      "Total upfront costs breakdown",
      "Loan amortization details"
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Dubai Mortgage Calculator | Calculate Property Loan Payments & Fees</title>
      <meta name="title" content="Dubai Mortgage Calculator | Calculate Property Loan Payments & Fees" />
      <meta name="description" content="Calculate Dubai mortgage payments, DLD fees, agent commission, and total costs. Free calculator for property buyers in Dubai, UAE. Instant results with detailed cost breakdown." />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Dubai Mortgage Calculator | Property Loan Calculator UAE" />
      <meta property="og:description" content="Calculate Dubai mortgage payments, property fees, and total costs. Free calculator with DLD fees, agent commission, and detailed cost breakdown for Dubai real estate." />
      <meta property="og:image" content="/mortgage-calculator-preview.jpg" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content="Dubai Mortgage Calculator | UAE Property Costs" />
      <meta property="twitter:description" content="Calculate Dubai property mortgage payments, DLD fees, agent fees, and total costs. Free calculator with instant results and detailed breakdown." />
      <meta property="twitter:image" content="/mortgage-calculator-preview.jpg" />

      {/* Keywords */}
      <meta name="keywords" content="dubai mortgage calculator, uae property calculator, dld fee calculator dubai, dubai real estate fees, dubai property cost calculator, dubai home loan calculator, dubai property purchase calculator, dubai mortgage payment calculator, uae mortgage calculator, dubai property fees calculator" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Dubai Mortgage Calculator" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Canonical URL */}
      <link rel="canonical" href="https://dubai-mortgage-calculator.com" />
    </Helmet>
  );
} 