import productService from './services/api/productService';

export default async function sitemap() {
    const baseUrl = 'https://duffysfurniturecommercial.com.au';

    // Define static routes
    const staticRoutes = [
        '',
        '/products',
        '/contact',
        '/cart',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1 : 0.8,
    }));

    // Fetch dynamic products
    let productRoutes = [];
    try {
        const response = await productService.getAllProducts({ limit: 1000 });
        const products = response?.data?.products || [];
        productRoutes = products.map((product) => ({
            url: `${baseUrl}/products/${product.id}`,
            lastModified: new Date(product.updatedAt || new Date()),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    // Fetch dynamic categories
    let categoryRoutes = [];
    try {
        const response = await productService.getCategories();
        const categories = response?.data || [];
        categoryRoutes = categories.map((category) => ({
            url: `${baseUrl}/categories/${category.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Error fetching categories for sitemap:', error);
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
