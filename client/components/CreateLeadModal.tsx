import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface CreateLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
    mode?: 'create' | 'edit' | 'duplicate';
}

export default function CreateLeadModal({ isOpen, onClose, onSuccess, initialData, mode = 'create' }: CreateLeadModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: 'manual',
        status: 'NEW',
        tags: [] as string[],
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: mode === 'duplicate' ? `Copy of ${initialData.name}` : initialData.name || '',
                phone: mode === 'duplicate' ? '' : initialData.phone || '', // Clear phone on duplicate to force unique
                email: initialData.email || '',
                source: initialData.source || 'manual',
                status: initialData.status || 'NEW',
                tags: Array.isArray(initialData.tags) ? initialData.tags : [],
                notes: initialData.notes || ''
            });
        } else if (isOpen) {
            setFormData({ name: '', phone: '', email: '', source: 'manual', status: 'NEW', tags: [], notes: '' });
        }
    }, [isOpen, initialData, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!formData.phone) {
            setError('Phone number is required');
            setLoading(false);
            return;
        }

        try {
            const isEdit = mode === 'edit';
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/${initialData.id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads`;

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
            }

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError(data.error || 'Failed to save lead');
            }
        } catch (err: any) {
            setError(err.message || 'Network error.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-lg">
                        {mode === 'edit' ? 'Edit Lead' : mode === 'duplicate' ? 'Duplicate Lead' : 'Create New Lead'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. +1234567890"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        {mode === 'duplicate' && <p className="text-xs text-amber-600 mt-1">Enter a new phone number for the copy</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="WON">Won</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. #VIP, #Interested"
                            value={formData.tags.join(', ')}
                            onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving...' : <><Save size={16} /> {mode === 'create' ? 'Create' : 'Save Changes'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
