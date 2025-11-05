"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, Filter, Eye, EyeOff, Star, X } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '../lib/auth';
import OptimizedImage from '../components/shared/OptimizedImage';
import { apiService } from '../services/api/apiClient';
import { showAlert, setLoading } from '../lib/ui';

const AdminDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    setUser(currentUser);
    
    if (!authenticated || (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login');
    }
  }, [router]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    image: '',
    images: [],
    originalPrice: '',
    discountedPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    material: '',
    color: '',
    weight: '',
    warranty: '',
    features: [],
    badge: '',
    badgeColor: '',
    isFeatured: false,
    tags: [],
    stockQuantity: '',
    inStock: true
  });

  const categories = [
    'living', 'dining', 'bedroom', 'kitchen', 'electronics'
  ];

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
      loadProducts();
    }
  }, [isAuthenticated, user, currentPage, searchTerm, selectedCategory, showInStockOnly]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(showInStockOnly && { inStock: 'true' })
      };

      const response = await apiService.admin.products.getAll(params);
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateProductForm = () => {
    if (!productForm.title.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Product title is required',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (!productForm.description.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Product description is required',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (!productForm.category) {
      showAlert({
        title: 'Validation Error',
        message: 'Product category is required',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (!productForm.originalPrice || parseFloat(productForm.originalPrice) <= 0) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid original price',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (!productForm.discountedPrice || parseFloat(productForm.discountedPrice) <= 0) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid discounted price',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (parseFloat(productForm.discountedPrice) > parseFloat(productForm.originalPrice)) {
      showAlert({
        title: 'Validation Error',
        message: 'Discounted price cannot be greater than original price',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (!productForm.stockQuantity || parseInt(productForm.stockQuantity) < 0) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid stock quantity',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    if (!productForm.image.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Product image URL is required',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    // Validate URL format
    try {
      new URL(productForm.image);
    } catch {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid image URL',
        type: 'error',
        confirmText: 'OK',
      });
      return false;
    }
    return true;
  };

  const handleCreateProduct = async () => {
    if (!validateProductForm()) {
      return;
    }

    setIsCreating(true);
    setLoading(true, 'Creating product...');
    try {
      // Prepare product data
      const productData = {
        ...productForm,
        originalPrice: parseFloat(productForm.originalPrice),
        discountedPrice: parseFloat(productForm.discountedPrice),
        stockQuantity: parseInt(productForm.stockQuantity),
        weight: productForm.weight ? parseFloat(productForm.weight) : null
      };

      const response = await apiService.admin.products.create(productData);
      if (response.success) {
        setShowProductForm(false);
        resetForm();
        loadProducts();
        showAlert({
          title: 'Success',
          message: 'Product created successfully',
          type: 'success',
          confirmText: 'OK',
        });
      } else {
        showAlert({
          title: 'Error',
          message: response.message || 'Failed to create product',
          type: 'error',
          confirmText: 'OK',
        });
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to create product. Please try again.',
        type: 'error',
        confirmText: 'OK',
      });
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    if (!validateProductForm()) {
      return;
    }

    setIsCreating(true);
    setLoading(true, 'Updating product...');
    try {
      // Prepare product data
      const productData = {
        ...productForm,
        originalPrice: parseFloat(productForm.originalPrice),
        discountedPrice: parseFloat(productForm.discountedPrice),
        stockQuantity: parseInt(productForm.stockQuantity),
        weight: productForm.weight ? parseFloat(productForm.weight) : null
      };

      const response = await apiService.admin.products.update(editingProduct.id, productData);
      if (response.success) {
        setEditingProduct(null);
        setShowProductForm(false);
        resetForm();
        loadProducts();
        showAlert({
          title: 'Success',
          message: 'Product updated successfully',
          type: 'success',
          confirmText: 'OK',
        });
      } else {
        showAlert({
          title: 'Error',
          message: response.message || 'Failed to update product',
          type: 'error',
          confirmText: 'OK',
        });
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to update product. Please try again.',
        type: 'error',
        confirmText: 'OK',
      });
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    showAlert({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'error',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setLoading(true, 'Deleting product...');
        try {
          const response = await apiService.admin.products.delete(productId);
          if (response.success) {
            loadProducts();
            showAlert({
              title: 'Success',
              message: 'Product deleted successfully',
              type: 'success',
              confirmText: 'OK',
            });
          } else {
            showAlert({
              title: 'Error',
              message: response.message || 'Failed to delete product',
              type: 'error',
              confirmText: 'OK',
            });
          }
        } catch (error) {
          console.error('Failed to delete product:', error);
          showAlert({
            title: 'Error',
            message: error.message || 'Failed to delete product',
            type: 'error',
            confirmText: 'OK',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      image: product.image,
      images: product.images || [],
      originalPrice: product.originalPrice.toString(),
      discountedPrice: product.discountedPrice.toString(),
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      material: product.material,
      color: product.color,
      weight: product.weight?.toString() || '',
      warranty: product.warranty,
      features: product.features || [],
      badge: product.badge,
      badgeColor: product.badgeColor,
      isFeatured: product.isFeatured,
      tags: product.tags || [],
      stockQuantity: product.stockQuantity.toString(),
      inStock: product.inStock
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      image: '',
      images: [],
      originalPrice: '',
      discountedPrice: '',
      category: '',
      subcategory: '',
      brand: '',
      material: '',
      color: '',
      weight: '',
      warranty: '',
      features: [],
      badge: '',
      badgeColor: '',
      isFeatured: false,
      tags: [],
      stockQuantity: '',
      inStock: true
    });
  };

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setProductForm(prev => ({ ...prev, [field]: array }));
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage products and orders</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="bg-[#0B4866] text-white px-4 py-2 rounded-lg hover:bg-[#094058] flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="inStockOnly" className="text-sm text-gray-700">In Stock Only</label>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadProducts}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <Filter size={20} />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <OptimizedImage
                            src={product.image}
                            alt={product.title}
                            width={50}
                            height={50}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">${product.discountedPrice}</div>
                          {product.originalPrice > product.discountedPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ${product.originalPrice}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {product.isFeatured && (
                            <Star className="text-yellow-500" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-[#0B4866] hover:text-[#094058]"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {editingProduct ? 'Edit Product' : 'Create Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        value={productForm.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                      <input
                        type="text"
                        value={productForm.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pricing & Inventory</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Original Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.discountedPrice}
                        onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                      <input
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="url"
                        value={productForm.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={productForm.tags.join(', ')}
                        onChange={(e) => handleArrayInputChange('tags', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4866] focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={productForm.isFeatured}
                        onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                        Featured Product
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                    disabled={isCreating}
                    className="px-4 py-2 bg-[#0B4866] text-white rounded-lg hover:bg-[#094058] disabled:opacity-50"
                  >
                    {isCreating ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
