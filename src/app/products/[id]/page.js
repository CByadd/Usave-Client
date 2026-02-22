import ProductDetailPageClient from './ProductDetailPageClient';
import productService from '../../services/api/productService';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const response = await productService.getProductById(id);
    const product = response?.data?.product;

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    const title = `${product.title} | Usave - Duffy's Furniture Commercial`;
    const description = product.description?.substring(0, 160) || `Buy ${product.title} at Usave. Premium commercial furniture in Cairns.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.image ? [product.image] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.image ? [product.image] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product Details | Usave',
    };
  }
}

export default function ProductDetailPage() {
  return <ProductDetailPageClient />;
}
