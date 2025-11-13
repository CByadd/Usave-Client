import { apiService } from "./apiClient";

const titleCase = (value = "") =>
  value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();

class ProductService {
  async getAllProducts(filters = {}) {
    try {
      return await apiService.products.getAll(filters);
    } catch (error) {
      console.error("Failed to fetch products", error);
      return {
        success: false,
        data: {
          products: [],
          total: 0,
          page: filters.page || 1,
          limit: filters.limit || 12,
          totalPages: 0,
        },
        error: error?.message || "Failed to fetch products",
      };
    }
  }

  async getProductById(id) {
    try {
      return await apiService.products.getById(id);
    } catch (error) {
      console.error("Failed to fetch product", error);
      throw error;
    }
  }

  async searchProducts(query, filters = {}) {
    try {
      return await apiService.products.search(query, filters);
    } catch (error) {
      console.error("Failed to search products", error);
      return {
        success: false,
        data: {
          products: [],
          total: 0,
          query,
        },
        error: error?.message || "Failed to search products",
      };
    }
  }

  async getFeaturedProducts(limit = 8) {
    try {
      const response = await apiService.products.getAll({ limit, isFeatured: true });
      if (response?.success && Array.isArray(response.data?.products) && response.data.products.length > 0) {
        return response;
      }

      // Fallback: fetch and filter client-side if API does not support isFeatured
      const fallbackResponse = await apiService.products.getAll({ limit: limit * 2 });
      if (fallbackResponse?.success) {
        const featured = (fallbackResponse.data?.products || []).filter((product) => product.isFeatured);
        return {
          success: true,
          data: {
            products: featured.slice(0, limit),
          },
        };
      }

      return fallbackResponse;
    } catch (error) {
      console.error("Failed to fetch featured products", error);
      return {
        success: false,
        data: { products: [] },
        error: error?.message || "Failed to fetch featured products",
      };
    }
  }

  async getProductsByCategory(category, filters = {}) {
    return this.getAllProducts({ ...filters, category });
  }

  async getCategories(limit = 200) {
    try {
      const response = await apiService.products.getAll({ limit });
      if (!response?.success) {
        return response;
      }

      const products = response.data?.products || [];
      const map = new Map();

      products.forEach((product) => {
        const slug = (product.category || "uncategorized").toLowerCase();
        const entry = map.get(slug) || {
          id: slug,
          name: titleCase(slug),
          count: 0,
          image: product.image || product.images?.[0] || "",
        };

        entry.count += 1;
        if (!entry.image && (product.image || product.images?.length)) {
          entry.image = product.image || product.images[0];
        }

        map.set(slug, entry);
      });

      return {
        success: true,
        data: Array.from(map.values()),
      };
    } catch (error) {
      console.error("Failed to fetch categories", error);
      return {
        success: false,
        data: [],
        error: error?.message || "Failed to fetch categories",
      };
    }
  }

  async getSearchSuggestions(query, limit = 10) {
    try {
      return await apiService.products.getSuggestions(query, limit);
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
      return {
        success: false,
        data: {
          suggestions: [],
          query,
        },
        error: error?.message || "Failed to fetch suggestions",
      };
    }
  }

  async getRelatedProducts(productId, limit = 4) {
    try {
      const productResponse = await this.getProductById(productId);
      const category = productResponse?.data?.product?.category;
      if (!category) {
        return { success: true, data: [] };
      }

      const relatedResponse = await apiService.products.getAll({ category, limit: limit + 1 });
      if (!relatedResponse?.success) {
        return relatedResponse;
      }

      const related = (relatedResponse.data?.products || []).filter(
        (product) => `${product.id}` !== `${productId}`
      );

      return {
        success: true,
        data: related.slice(0, limit),
      };
    } catch (error) {
      console.error("Failed to fetch related products", error);
      return { success: false, data: [], error: error?.message || "Failed to fetch related products" };
    }
  }

  async updateProductStock(productId, quantity) {
    try {
      // Placeholder – depends on backend support
      console.warn("updateProductStock is not implemented on the API");
      return { success: true, data: null };
    } catch (error) {
      console.error("Failed to update product stock", error);
      return { success: false, data: null, error: error?.message || "Failed to update stock" };
    }
  }
}

export default new ProductService();


