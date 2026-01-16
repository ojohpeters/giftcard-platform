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
  Download,
  FileSpreadsheet,
  Info,
  Trash2,
  Plus,
  XCircle
} from "lucide-react";
import { productsAPI, adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Loading from '@/components/Loading';

interface Product {
  id: number;
  name_en: string;
  slug: string;
  category?: { name_en: string };
  product_type: string;
  base_price_usd: string;
  base_price_iqd: string;
  is_locked: boolean;
  is_active: boolean;
  available_codes: number;
  total_codes: number;
  thumbnail_url?: string;
}

interface CodeEntry {
  code: string;
  pin: string;
  value: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'file'>('manual');
  const [uploadCodes, setUploadCodes] = useState('');
  const [codeEntries, setCodeEntries] = useState<CodeEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadProducts();
  }, [user, router]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.list({ is_active: true });
      setProducts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockToggle = async (product: Product) => {
    try {
      await adminAPI.lockProduct(product.id, !product.is_locked);
      await loadProducts();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to update product');
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
        if (!trimmed || trimmed.startsWith('#')) return; // Skip empty lines and comments

        // Try CSV format: code,pin,value
        const parts = trimmed.split(',').map(p => p.trim());
        
        if (parts.length >= 1) {
          const code = parts[0];
          const pin = parts[1] || '';
          const value = parts[2] ? parseFloat(parts[2]) : (selectedProduct ? parseFloat(selectedProduct.base_price_usd) : 0);

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
    setCodeEntries([...codeEntries, { code: '', pin: '', value: selectedProduct ? parseFloat(selectedProduct.base_price_usd) : 0 }]);
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
    
    // Validate entries
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
        // Use manual entries
        codesArray = validEntries.map(entry => ({
          code: entry.code.trim(),
          pin: entry.pin.trim(),
          value: entry.value || parseFloat(selectedProduct.base_price_usd)
        }));
      } else if (uploadCodes.trim()) {
        // Parse text input
        try {
          codesArray = JSON.parse(uploadCodes);
        } catch {
          // If not JSON, try newline-separated format
          const lines = uploadCodes.split('\n').filter(line => line.trim());
          codesArray = lines.map(line => {
            const parts = line.split(',').map(p => p.trim());
            return {
              code: parts[0] || '',
              pin: parts[1] || '',
              value: parts[2] ? parseFloat(parts[2]) : parseFloat(selectedProduct.base_price_usd)
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

  const filteredProducts = products.filter(p =>
    p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading fullScreen message="Loading Products" size="lg" />;
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-black uppercase text-xs hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <FileSpreadsheet size={18} />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS/ERROR ALERTS */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 flex items-start gap-4 shadow-lg">
          <CheckCircle2 className="text-green-600 shrink-0" size={24} />
          <div className="flex-1">
            <p className="text-sm text-green-900 font-black uppercase">Success</p>
            <p className="text-sm text-green-700 font-bold">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">×</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-start gap-4 shadow-lg">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <div className="flex-1">
            <p className="text-sm text-red-900 font-black uppercase">Error</p>
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name or category..."
          className="w-full bg-white border-2 border-gray-200 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-sm font-bold transition-all"
        />
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                {product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt={product.name_en} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-gray-200">
                    <Package className="text-gray-400" size={32} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black uppercase truncate text-gray-900">{product.name_en}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    {product.category?.name_en || 'Uncategorized'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase">USD Price</span>
                <span className="text-lg font-black text-gray-900">${product.base_price_usd}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase">IQD Price</span>
                <span className="text-lg font-black text-gray-900">{formatIQDShort(product.base_price_iqd)} IQD</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Type</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border-2 ${
                  product.product_type === 'instant' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  {product.product_type === 'instant' ? (
                    <span className="flex items-center gap-1"><Zap size={12} /> INSTANT</span>
                  ) : (
                    'MANUAL'
                  )}
                </span>
              </div>
              {product.product_type === 'instant' && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Available Codes</span>
                    <span className="text-sm font-black text-gray-900">
                      {product.available_codes} / {product.total_codes}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(product.available_codes / product.total_codes) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
              <button
                onClick={() => handleLockToggle(product)}
                className={`flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all border-2 ${
                  product.is_locked
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                }`}
              >
                {product.is_locked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
              {product.product_type === 'instant' && (
                <button
                  onClick={() => openUploadModal(product)}
                  className="flex-1 py-3 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Upload
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white border-2 border-gray-200 rounded-3xl">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-black uppercase text-lg">No products found</p>
          <p className="text-[10px] text-gray-400 mt-2">Try adjusting your search terms</p>
        </div>
      )}

      {/* UPLOAD CODES MODAL */}
      {showUploadModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
              <div>
                <h2 className="text-3xl font-black uppercase text-gray-900">Upload Gift Card Codes</h2>
                <p className="text-sm text-gray-500 font-bold mt-1">{selectedProduct.name_en}</p>
              </div>
              <button
                onClick={closeUploadModal}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={24} className="text-gray-400" />
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
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
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
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
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
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs font-black text-blue-900 uppercase mb-1">Format Instructions</p>
                      <p className="text-xs text-blue-800 font-bold">
                        Add codes manually or paste CSV format: <code className="bg-white px-2 py-1 rounded">code,pin,value</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {codeEntries.map((entry, index) => (
                    <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 flex gap-3 items-center">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={entry.code}
                          onChange={(e) => updateCodeEntry(index, 'code', e.target.value)}
                          placeholder="Code"
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:border-blue-600"
                        />
                        <input
                          type="text"
                          value={entry.pin}
                          onChange={(e) => updateCodeEntry(index, 'pin', e.target.value)}
                          placeholder="PIN (optional)"
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:border-blue-600"
                        />
                        <input
                          type="number"
                          value={entry.value}
                          onChange={(e) => updateCodeEntry(index, 'value', parseFloat(e.target.value) || 0)}
                          placeholder="Value"
                          step="0.01"
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:border-blue-600"
                        />
                      </div>
                      <button
                        onClick={() => removeCodeEntry(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addManualEntry}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-black uppercase text-xs hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Row
                  </button>
                  <div className="flex-1" />
                  <span className="text-sm font-bold text-gray-600 self-center">
                    {codeEntries.filter(e => e.code.trim()).length} codes ready
                  </span>
                </div>

                {/* TEXTAREA FALLBACK */}
                <div className="mt-4">
                  <label className="text-xs font-black text-gray-700 uppercase mb-2 block">
                    Or paste codes (one per line, CSV format: code,pin,value)
                  </label>
                  <textarea
                    value={uploadCodes}
                    onChange={(e) => setUploadCodes(e.target.value)}
                    placeholder='ABC123,1234,100&#10;DEF456,5678,50'
                    rows={6}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* FILE UPLOAD MODE */}
            {uploadMethod === 'file' && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                  <FileSpreadsheet className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-sm font-black text-gray-900 mb-2">Upload CSV or TXT File</p>
                  <p className="text-xs text-gray-600 font-bold mb-4">
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
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-black text-gray-700 uppercase mb-2">
                      Preview ({codeEntries.length} codes loaded)
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {codeEntries.slice(0, 10).map((entry, index) => (
                        <div key={index} className="text-xs font-mono bg-white p-2 rounded">
                          {entry.code} {entry.pin && `| PIN: ${entry.pin}`} {entry.value && `| $${entry.value}`}
                        </div>
                      ))}
                      {codeEntries.length > 10 && (
                        <p className="text-xs text-gray-500">... and {codeEntries.length - 10} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200">
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
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
