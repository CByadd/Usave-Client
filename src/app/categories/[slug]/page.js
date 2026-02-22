import CategoryPage from '../../components/category/CategoryPage';

export async function generateMetadata({ params }) {
  const { slug } = params;

  // Convert slug to label (e.g., "kitchen" -> "Kitchen")
  const categoryLabel = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `${categoryLabel} Furniture | Usave - Duffy's Furniture Commercial`;
  const description = `Discover premium ${categoryLabel.toLowerCase()} furniture at Usave Cairns. High-quality commercial solutions for Far North Queensland.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function DynamicCategoryPage({ params }) {
  const categorySlug = params?.slug || '';

  // Convert slug to label (e.g., "kitchen" -> "Kitchen")
  const categoryLabel = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return <CategoryPage categoryName={categorySlug} categoryLabel={categoryLabel} />;
}




