"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Search, 
  Lock, 
  Unlock, 
  Upload, 
  Edit2, 
  Eye,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  FileSpreadsheet,
  Info,
  Trash2,
  Plus,
  XCircle,
  Filter,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Grid3x3,
  List,
  MoreVertical,
  Copy,
  ExternalLink,
  RefreshCw,
  Calendar,
  DollarSign,
  ShoppingBag,
  Tag,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2
} from "lucide-react";
import { productsAPI, adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Loading from '@/components/Loading';
import { formatIRRShort } from '@/lib/currency';
import Link from 'next/link';

interface Product {
  id: number;
  name_en: string;
  slug: string;
  category?: { name_en: string; slug: string };
  product_type: string;
  base_price_usd: string;
  base_price_iqd: string;
  price_usd?: string;
  price_iqd?: string;
  is_locked: boolean;
  is_active: boolean;
  available_codes: number;
  total_codes: number;
  thumbnail_url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface CodeEntry {
  code: string;
  pin: string;
  value: number;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'price' | 'created' | 'codes';
type SortOrder = 'asc' | 'desc';

export default function AdminProductsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'file'>('manual');
  const [creating, setCreating] = useState(false);
  const [uploadCodes, setUploadCodes] = useState('');
  const [codeEntries, setCodeEntries] = useState<CodeEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{id?: number; name_en: string; slug: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<{created: number; updated: number; skipped: number; errors: number} | null>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadProducts();
    loadCategories();
  }, [user, router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.list();
      const productsList = response.data.results || response.data || [];
      setAllProducts(productsList);
      setProducts(productsList);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      const cats = response.data || [];
      // Ensure categories have IDs
      setCategories(cats.map((cat: any) => ({
        id: cat.id,
        name_en: cat.name_en,
        slug: cat.slug
      })));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSeedSampleProducts = async () => {
    if (!confirm('This will add sample gift card products to your catalog. Continue?')) {
      return;
    }

    try {
      setSyncing(true);
      setError('');
      setSuccess('');
      setSyncStats(null);

      const response = await adminAPI.seedSampleProducts();

      if (response.data.success) {
        setSuccess('Sample products added successfully!');
        // Reload products after seeding
        setTimeout(() => {
          loadProducts();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to seed products:', err);
      setError(err.response?.data?.error || 'Failed to seed sample products.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category?.slug === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.product_type === typeFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(p => p.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.is_active);
    } else if (statusFilter === 'locked') {
      filtered = filtered.filter(p => p.is_locked);
    } else if (statusFilter === 'unlocked') {
      filtered = filtered.filter(p => !p.is_locked);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'name':
          aVal = a.name_en.toLowerCase();
          bVal = b.name_en.toLowerCase();
          break;
        case 'price':
          aVal = parseFloat(a.price_usd || a.base_price_usd);
          bVal = parseFloat(b.price_usd || b.base_price_usd);
          break;
        case 'created':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
        case 'codes':
          aVal = a.available_codes || 0;
          bVal = b.available_codes || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setProducts(filtered);
  }, [allProducts, searchTerm, categoryFilter, typeFilter, statusFilter, sortField, sortOrder]);

  const handleLockToggle = async (product: Product) => {
    try {
      await adminAPI.lockProduct(product.id, !product.is_locked);
      await loadProducts();
      setSuccess(`Product ${!product.is_locked ? 'locked' : 'unlocked'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      setError('Failed to update product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBulkLock = async (lock: boolean) => {
    try {
      for (const productId of selectedProducts) {
        await adminAPI.lockProduct(productId, lock);
      }
      await loadProducts();
      setSelectedProducts([]);
      setSuccess(`Bulk ${lock ? 'locked' : 'unlocked'} ${selectedProducts.length} products`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to bulk update products');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseFileContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseFileContent = (content: string, fileName: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const entries: CodeEntry[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const parts = trimmed.split(',').map(p => p.trim());
        
        if (parts.length >= 1) {
          const code = parts[0];
          const pin = parts[1] || '';
          const value = parts[2] ? parseFloat(parts[2]) : (selectedProduct ? parseFloat(selectedProduct.price_usd || selectedProduct.base_price_usd) : 0);

          if (code) {
            entries.push({ code, pin, value });
          } else {
            errors.push(`Line ${index + 1}: Missing code`);
          }
        }
      });

      if (errors.length > 0) {
        setError(`Some lines had errors: ${errors.slice(0, 5).join(', ')}`);
      }

      if (entries.length > 0) {
        setCodeEntries(entries);
        setUploadMethod('manual');
        setSuccess(`Successfully parsed ${entries.length} codes from file`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('No valid codes found in file');
      }
    } catch (err) {
      setError('Failed to parse file. Please check the format.');
      console.error('File parse error:', err);
    }
  };

  const addManualEntry = () => {
    setCodeEntries([...codeEntries, { code: '', pin: '', value: selectedProduct ? parseFloat(selectedProduct.price_usd || selectedProduct.base_price_usd) : 0 }]);
  };

  const updateCodeEntry = (index: number, field: keyof CodeEntry, value: string | number) => {
    const updated = [...codeEntries];
    updated[index] = { ...updated[index], [field]: value };
    setCodeEntries(updated);
  };

  const removeCodeEntry = (index: number) => {
    setCodeEntries(codeEntries.filter((_, i) => i !== index));
  };

  const handleUploadCodes = async () => {
    if (!selectedProduct) return;
    
    const validEntries = codeEntries.filter(entry => entry.code.trim());
    if (validEntries.length === 0 && !uploadCodes.trim()) {
      setError('Please add at least one code to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      let codesArray: any[] = [];
      
      if (uploadMethod === 'manual' && codeEntries.length > 0) {
        codesArray = validEntries.map(entry => ({
          code: entry.code.trim(),
          pin: entry.pin.trim(),
          value: entry.value || parseFloat(selectedProduct.price_usd || selectedProduct.base_price_usd)
        }));
      } else if (uploadCodes.trim()) {
        try {
          codesArray = JSON.parse(uploadCodes);
        } catch {
          const lines = uploadCodes.split('\n').filter(line => line.trim());
          codesArray = lines.map(line => {
            const parts = line.split(',').map(p => p.trim());
            return {
              code: parts[0] || '',
              pin: parts[1] || '',
              value: parts[2] ? parseFloat(parts[2]) : parseFloat(selectedProduct.price_usd || selectedProduct.base_price_usd)
            };
          });
        }
      }
      
      if (codesArray.length === 0) {
        setError('No valid codes to upload');
        setUploading(false);
        return;
      }

      await adminAPI.uploadCodes(selectedProduct.id, codesArray);
      setShowUploadModal(false);
      setUploadCodes('');
      setCodeEntries([]);
      setSelectedProduct(null);
      setSuccess(`Successfully uploaded ${codesArray.length} codes to ${selectedProduct.name_en}`);
      setTimeout(() => setSuccess(''), 5000);
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to upload codes:', error);
      setError(error.response?.data?.error || 'Failed to upload codes. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = (product: Product) => {
    setSelectedProduct(product);
    setShowUploadModal(true);
    setUploadCodes('');
    setCodeEntries([]);
    setError('');
    setSuccess('');
    setUploadMethod('manual');
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadCodes('');
    setCodeEntries([]);
    setSelectedProduct(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stats = {
    total: allProducts.length,
    instant: allProducts.filter(p => p.product_type === 'instant').length,
    manual: allProducts.filter(p => p.product_type === 'manual').length,
    locked: allProducts.filter(p => p.is_locked).length,
    totalCodes: allProducts.reduce((sum, p) => sum + (p.available_codes || 0), 0)
  };

  if (loading) {
    return <Loading fullScreen message="Loading Products" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Products<span className="text-blue-200">.</span>
            </h1>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mt-2">
              Manage Product Catalog & Gift Card Inventory
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-black uppercase text-xs hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black uppercase text-xs hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={18} />
              New Product
            </button>
          </div>
        </div>
      </div>

      {/* SYNC STATUS */}
      {(syncStats || error || success) && (
        <div className={`rounded-2xl p-6 border-2 ${
          error 
            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900'
            : success
            ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900'
            : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900'
        }`}>
          {error && (
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-black text-red-700 dark:text-red-300 uppercase mb-1">Sync Error</p>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-black text-green-700 dark:text-green-300 uppercase mb-2">Sync Completed Successfully!</p>
                {syncStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-green-200 dark:border-green-900">
                      <p className="text-2xl font-black text-green-700 dark:text-green-300">{syncStats.created}</p>
                      <p className="text-[10px] font-bold text-green-600 uppercase dark:text-green-300">Created</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-green-200 dark:border-green-900">
                      <p className="text-2xl font-black text-green-700 dark:text-green-300">{syncStats.updated}</p>
                      <p className="text-[10px] font-bold text-green-600 uppercase dark:text-green-300">Updated</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-green-200 dark:border-green-900">
                      <p className="text-2xl font-black text-green-700 dark:text-green-300">{syncStats.skipped}</p>
                      <p className="text-[10px] font-bold text-green-600 uppercase dark:text-green-300">Skipped</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-green-200 dark:border-green-900">
                      <p className="text-2xl font-black text-green-700 dark:text-green-300">{syncStats.errors}</p>
                      <p className="text-[10px] font-bold text-green-600 uppercase dark:text-green-300">Errors</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-blue-600" size={20} />
            <TrendingUp className="text-green-600" size={16} />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{stats.total}</p>
          <p className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">Total Products</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="text-green-600" size={20} />
            <span className="text-xs font-black text-green-600">{stats.instant}</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{stats.instant}</p>
          <p className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">Instant</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-600" size={20} />
            <span className="text-xs font-black text-orange-600">{stats.manual}</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{stats.manual}</p>
          <p className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">Manual</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Lock className="text-red-600" size={20} />
            <span className="text-xs font-black text-red-600">{stats.locked}</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{stats.locked}</p>
          <p className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">Locked</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="text-purple-600" size={20} />
            <span className="text-xs font-black text-purple-600">{stats.totalCodes}</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{stats.totalCodes.toLocaleString()}</p>
          <p className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">Total Codes</p>
        </div>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-900 rounded-3xl p-6 flex items-start gap-4 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="text-green-600 shrink-0" size={24} />
          <div className="flex-1">
            <p className="text-sm text-green-900 dark:text-green-200 font-black uppercase">Success</p>
            <p className="text-sm text-green-700 dark:text-green-300 font-bold">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">×</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-3xl p-6 flex items-start gap-4 shadow-lg animate-in slide-in-from-top">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <div className="flex-1">
            <p className="text-sm text-red-900 dark:text-red-200 font-black uppercase">Error</p>
            <p className="text-sm text-red-700 font-bold dark:text-red-300">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* BULK ACTIONS */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-blue-900 dark:text-blue-200">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkLock(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-black uppercase text-xs hover:bg-red-700 transition-all"
            >
              Lock Selected
            </button>
            <button
              onClick={() => handleBulkLock(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-black uppercase text-xs hover:bg-green-700 transition-all"
            >
              Unlock Selected
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-black uppercase text-xs hover:bg-gray-300 dark:hover:bg-neutral-700 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* SEARCH & FILTERS */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, category, or slug..."
              className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-sm font-bold transition-all dark:text-neutral-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-black uppercase text-xs border-2 transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
              }`}
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* EXPANDED FILTERS */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t-2 border-gray-200 dark:border-neutral-700 animate-in slide-in-from-top">
            <div>
              <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
              >
                <option value="all">All Types</option>
                <option value="instant">Instant</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
                <option value="unlocked">Unlocked</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                >
                  <option value="created">Date Created</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="codes">Available Codes</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all"
                >
                  {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCTS GRID/LIST */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              onSelect={(id) => {
                if (selectedProducts.includes(id)) {
                  setSelectedProducts(selectedProducts.filter(p => p !== id));
                } else {
                  setSelectedProducts([...selectedProducts, id]);
                }
              }}
              onLockToggle={handleLockToggle}
              onUpload={openUploadModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b-2 border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(products.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Product</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Category</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Type</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Price</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Codes</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Status</th>
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnail_url ? (
                        <img src={product.thumbnail_url} alt={product.name_en} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                          <Package className="text-gray-400 dark:text-neutral-500" size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-gray-900 dark:text-neutral-100">{product.name_en}</p>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">{product.category?.name_en || '—'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      product.product_type === 'instant' 
                        ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                        : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                    }`}>
                      {product.product_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-neutral-100">${product.price_usd || product.base_price_usd}</p>
                      <p className="text-[10px] text-gray-500 dark:text-neutral-400">{formatIRRShort(product.price_iqd || product.base_price_iqd)} تومان</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {product.product_type === 'instant' ? (
                      <div>
                        <p className="font-black text-gray-900 dark:text-neutral-100">{product.available_codes}</p>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">of {product.total_codes}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {product.is_locked && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 w-fit">Locked</span>
                      )}
                      {!product.is_active && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 w-fit">Inactive</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => handleLockToggle(product)}
                        className={`p-2 rounded-lg transition-all ${
                          product.is_locked
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
                            : 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
                        }`}
                      >
                        {product.is_locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      {product.product_type === 'instant' && (
                        <button
                          onClick={() => openUploadModal(product)}
                          className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all"
                        >
                          <Upload size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl">
          <Package className="w-20 h-20 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-neutral-400 font-black uppercase text-lg">No products found</p>
          <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* UPLOAD CODES MODAL */}
      {showUploadModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200 dark:border-neutral-700">
              <div>
                <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-neutral-100">Upload Gift Card Codes</h2>
                <p className="text-sm text-gray-500 font-bold mt-1 dark:text-neutral-400">{selectedProduct.name_en}</p>
              </div>
              <button
                onClick={closeUploadModal}
                className="p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
              >
                <X size={24} className="text-gray-400 dark:text-neutral-500" />
              </button>
            </div>
            
            {/* UPLOAD METHOD SELECTOR */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  setUploadMethod('manual');
                  setCodeEntries([]);
                  setUploadCodes('');
                }}
                className={`flex-1 py-3 rounded-xl font-black uppercase text-xs border-2 transition-all ${
                  uploadMethod === 'manual'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                }`}
              >
                <Plus size={16} className="inline mr-2" />
                Manual Entry
              </button>
              <button
                onClick={() => {
                  setUploadMethod('file');
                  fileInputRef.current?.click();
                }}
                className={`flex-1 py-3 rounded-xl font-black uppercase text-xs border-2 transition-all ${
                  uploadMethod === 'file'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                File Upload
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* MANUAL ENTRY MODE */}
            {uploadMethod === 'manual' && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase mb-1">Format Instructions</p>
                      <p className="text-xs text-blue-800 dark:text-blue-300 font-bold">
                        Add codes manually or paste CSV format: <code className="bg-white dark:bg-neutral-800 px-2 py-1 rounded">code,pin,value</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {codeEntries.map((entry, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-4 flex gap-3 items-center">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={entry.code}
                          onChange={(e) => updateCodeEntry(index, 'code', e.target.value)}
                          placeholder="Code"
                          className="px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-bold outline-none focus:border-blue-600 dark:text-neutral-100"
                        />
                        <input
                          type="text"
                          value={entry.pin}
                          onChange={(e) => updateCodeEntry(index, 'pin', e.target.value)}
                          placeholder="PIN (optional)"
                          className="px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-bold outline-none focus:border-blue-600 dark:text-neutral-100"
                        />
                        <input
                          type="number"
                          value={entry.value}
                          onChange={(e) => updateCodeEntry(index, 'value', parseFloat(e.target.value) || 0)}
                          placeholder="Value"
                          step="0.01"
                          className="px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-bold outline-none focus:border-blue-600 dark:text-neutral-100"
                        />
                      </div>
                      <button
                        onClick={() => removeCodeEntry(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addManualEntry}
                    className="px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-black uppercase text-xs hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Row
                  </button>
                  <div className="flex-1" />
                  <span className="text-sm font-bold text-gray-600 dark:text-neutral-300 self-center">
                    {codeEntries.filter(e => e.code.trim()).length} codes ready
                  </span>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">
                    Or paste codes (one per line, CSV format: code,pin,value)
                  </label>
                  <textarea
                    value={uploadCodes}
                    onChange={(e) => setUploadCodes(e.target.value)}
                    placeholder='ABC123,1234,100&#10;DEF456,5678,50'
                    rows={6}
                    className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 font-mono text-sm dark:text-neutral-100"
                  />
                </div>
              </div>
            )}

            {/* FILE UPLOAD MODE */}
            {uploadMethod === 'file' && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-900 rounded-2xl p-6 text-center">
                  <FileSpreadsheet className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-sm font-black text-gray-900 dark:text-neutral-100 mb-2">Upload CSV or TXT File</p>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 font-bold mb-4">
                    Format: One code per line as <code>code,pin,value</code>
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-black uppercase text-xs hover:bg-green-700 transition-all"
                  >
                    Choose File
                  </button>
                </div>
                {codeEntries.length > 0 && (
                  <div className="bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-4">
                    <p className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2">
                      Preview ({codeEntries.length} codes loaded)
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {codeEntries.slice(0, 10).map((entry, index) => (
                        <div key={index} className="text-xs font-mono bg-white dark:bg-neutral-900 p-2 rounded">
                          {entry.code} {entry.pin && `| PIN: ${entry.pin}`} {entry.value && `| $${entry.value}`}
                        </div>
                      ))}
                      {codeEntries.length > 10 && (
                        <p className="text-xs text-gray-500 dark:text-neutral-400">... and {codeEntries.length - 10} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200 dark:border-neutral-700">
              <button
                onClick={handleUploadCodes}
                disabled={uploading || (codeEntries.length === 0 && !uploadCodes.trim())}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {uploading ? (
                  <>
                    <Upload className="animate-pulse" size={20} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload {codeEntries.filter(e => e.code.trim()).length || 'Codes'}
                  </>
                )}
              </button>
              <button
                onClick={closeUploadModal}
                className="px-8 py-4 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {showCreateModal && (
        <CreateProductModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            setSuccess('Product created successfully!');
            setTimeout(() => setSuccess(''), 3000);
            await loadProducts();
          }}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  isSelected, 
  onSelect, 
  onLockToggle, 
  onUpload 
}: { 
  product: Product; 
  isSelected: boolean; 
  onSelect: (id: number) => void;
  onLockToggle: (product: Product) => void;
  onUpload: (product: Product) => void;
}) {
  return (
    <div className={`bg-white dark:bg-neutral-900 border-2 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all group relative ${
      isSelected ? 'border-blue-600 ring-4 ring-blue-100' : 'border-gray-200 dark:border-neutral-700'
    }`}>
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 pr-8 min-w-0">
          {product.thumbnail_url ? (
            <img src={product.thumbnail_url} alt={product.name_en} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200 dark:border-neutral-700 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center border-2 border-gray-200 dark:border-neutral-700 flex-shrink-0">
              <Package className="text-gray-400 dark:text-neutral-500" size={32} />
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-lg font-black uppercase truncate text-gray-900 dark:text-neutral-100" title={product.name_en}>{product.name_en}</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400 truncate">
              {product.category?.name_en || 'Uncategorized'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
          <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">USD Price</span>
          <span className="text-lg font-black text-gray-900 dark:text-neutral-100">${product.price_usd || product.base_price_usd}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
          <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">IRR Price</span>
          <span className="text-lg font-black text-gray-900 dark:text-neutral-100">{formatIRRShort(product.price_iqd || product.base_price_iqd)} تومان</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
          <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Type</span>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full border-2 ${
            product.product_type === 'instant' 
              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900'
              : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900'
          }`}>
            {product.product_type === 'instant' ? (
              <span className="flex items-center gap-1"><Zap size={12} /> INSTANT</span>
            ) : (
              'MANUAL'
            )}
          </span>
        </div>
        {product.product_type === 'instant' && (
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 border border-gray-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Available Codes</span>
              <span className="text-sm font-black text-gray-900 dark:text-neutral-100">
                {product.available_codes} / {product.total_codes}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${product.total_codes > 0 ? (product.available_codes / product.total_codes) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t-2 border-gray-100 dark:border-neutral-800">
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="flex-1 py-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-900 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2"
        >
          <Eye size={14} />
          View
        </Link>
        <button
          onClick={() => onLockToggle(product)}
          className={`py-2.5 px-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all border-2 ${
            product.is_locked
              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40'
              : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900/40'
          }`}
        >
          {product.is_locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        {product.product_type === 'instant' && (
          <button
            onClick={() => onUpload(product)}
            className="py-2.5 px-4 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-900 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all"
          >
            <Upload size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// Create Product Modal Component
function CreateProductModal({ 
  categories, 
  onClose, 
  onSuccess 
}: { 
  categories: Array<{id?: number; name_en: string; slug: string}>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    category_id: '',
    product_type: 'instant',
    base_price_usd: '',
    base_price_iqd: '',
    is_active: true,
    is_locked: false,
    requires_verification: false
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name_en || !formData.base_price_usd) {
      setError('Product name and USD price are required');
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        product_type: formData.product_type,
        base_price_usd: parseFloat(formData.base_price_usd),
        is_active: formData.is_active,
        is_locked: formData.is_locked,
        requires_verification: formData.requires_verification
      };

      if (formData.category_id) {
        payload.category_id = formData.category_id;
      }

      if (formData.base_price_iqd) {
        payload.base_price_iqd = parseFloat(formData.base_price_iqd);
      }

      await adminAPI.createProduct(payload);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setError(err.response?.data?.error || 'Failed to create product. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200 dark:border-neutral-700">
          <div>
            <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-neutral-100">Create New Product</h2>
            <p className="text-sm text-gray-500 font-bold mt-1 dark:text-neutral-400">Add a new product to your catalog</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X size={24} className="text-gray-400 dark:text-neutral-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-bold dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-neutral-100 border-b-2 border-gray-200 dark:border-neutral-700 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Product Name (English) *</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  required
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                  placeholder="e.g., Amazon Gift Card"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Product Name (Arabic)</label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                  placeholder="بطاقة هدية أمازون"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Description (English)</label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                rows={3}
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Description (Arabic)</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                rows={3}
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                placeholder="وصف المنتج..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.id || cat.slug}>{cat.name_en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Product Type</label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                >
                  <option value="instant">Instant E-Code</option>
                  <option value="manual">Buy-on-Request</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-neutral-100 border-b-2 border-gray-200 dark:border-neutral-700 pb-2">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.base_price_usd}
                  onChange={(e) => setFormData({...formData, base_price_usd: e.target.value})}
                  required
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-700 dark:text-neutral-300 uppercase mb-2 block">Price (IRR) - Auto-calculated if empty</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.base_price_iqd}
                  onChange={(e) => setFormData({...formData, base_price_iqd: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:text-neutral-100"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-neutral-100 border-b-2 border-gray-200 dark:border-neutral-700 pb-2">Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-black text-gray-900 dark:text-neutral-100">Active (visible to customers)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_locked}
                  onChange={(e) => setFormData({...formData, is_locked: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-black text-gray-900 dark:text-neutral-100">Locked (requires login to purchase)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_verification}
                  onChange={(e) => setFormData({...formData, requires_verification: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-black text-gray-900 dark:text-neutral-100">Requires Email Verification</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-200 dark:border-neutral-700">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
