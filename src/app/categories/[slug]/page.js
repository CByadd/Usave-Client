"use client";
import { useParams } from 'next/navigation';
import CategoryPage from '../../components/category/CategoryPage';

export default function DynamicCategoryPage() {
  const params = useParams();
  const categorySlug = params?.slug || '';
  
  // Convert slug to label (e.g., "kitchen" -> "Kitchen")
  const categoryLabel = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return <CategoryPage categoryName={categorySlug} categoryLabel={categoryLabel} />;
}

