'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import ChatWindow from '../../components/ChatWindow';
import LeadDetailsPanel from '../../components/LeadDetailsPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Plus, Download, MoreHorizontal, LayoutGrid, List as ListIcon, Trash2, UserPlus, X, MessageSquare, Zap, Eye, MessageCircle } from 'lucide-react';
import CreateLeadModal from '../../components/CreateLeadModal';

interface Lead {
    id: string;
    name: string;
    source: string;
    status: string;
    score: number;
    created_at: string;
    phone?: string;
    email?: string;
    notes?: string;
    tags?: string[];
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

import { useSearchParams } from 'next/navigation';

export default function LeadsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // --- STATE ---
    const [leads, setLeads] = useState<Lead[]>([]);

    // Interaction States
    const [modalLead, setModalLead] = useState<Lead | null>(null); // For Create/Edit/Duplicate
    const [detailLead, setDetailLead] = useState<Lead | null>(null); // For View Details
    const [chatLead, setChatLead] = useState<Lead | null>(null); // For Chat

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
    const [loading, setLoading] = useState(false);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 25, total: 0, pages: 1 });
    const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('LIST');

    // Bulk Actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBulkMsgModalOpen, setIsBulkMsgModalOpen] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [teamMembers, setTeamMembers] = useState<{ id: number, name: string }[]>([]);
    const [assignTarget, setAssignTarget] = useState<number | ''>('');

    const STATUS_COLUMNS = ['NEW', 'CONTACTED', 'VIP', 'CLOSED'];

    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        console.log('Drag Start:', id);
        setDraggedLeadId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        console.log('Drop:', { draggedLeadId, newStatus });
        if (!draggedLeadId) return;

        const originalLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === draggedLeadId ? { ...l, status: newStatus } : l));
        setDraggedLeadId(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads/${draggedLeadId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                let errData;
                try {
                    errData = await res.json();
                } catch (e) {
                    errData = await res.text();
                }
                console.error('Failed to update status:', res.status, errData);
                setLeads(originalLeads);
            }
        } catch (err) {
            setLeads(originalLeads);
            console.error('Error updating status:', err);
        }
    };

    // --- EFFECTS & DATA FETCHING ---
    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: statusFilter,
                search: searchQuery
            });
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leads?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    // Token expired or missing
                    window.location.href = '/login';
                    return;
                }
                throw new Error(data.error || 'Failed to fetch leads');
            }

            if (data.data) {
                setLeads(data.data);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, statusFilter, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(fetchLeads, 300);
        return () => clearTimeout(timer);
    }, [fetchLeads]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/team`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => setTeamMembers(data))
            .catch(() => { });

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/quick-responses`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => setTemplates(data))
            .catch(() => { });
    }, []);

    // --- HANDLERS ---
    const toggleSelection = (id: string, e?: React.SyntheticEvent) => {
        if (e) e.stopPropagation();
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const allOnPageSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id));

    const handleSelectAll = () => {
        const next = new Set(selectedIds);
        if (allOnPageSelected) {
            leads.forEach(l => next.delete(l.id));
        } else {
            leads.forEach(l => next.add(l.id));
        }
        setSelectedIds(next);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} leads? This cannot be undone.`)) return;
        try {
            const res = await fetch('http://localhost:5000/api/leads/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Deleted ${data.count} leads`);
                setSelectedIds(new Set());
                fetchLeads();
            }
        } catch (e) { alert('Error deleting leads'); }
    };

    const handleBulkAssign = async () => {
        if (!assignTarget) return;
        try {
            const res = await fetch('http://localhost:5000/api/team/bulk-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ leadIds: Array.from(selectedIds), userId: assignTarget })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Assigned ${data.count} leads`);
                setSelectedIds(new Set());
                setIsAssignModalOpen(false);
                fetchLeads();
            }
        } catch (e) { alert('Error assigning leads'); }
    };

    const handleBulkSend = async () => {
        if (!bulkMessage.trim()) return;
        if (!confirm(`Send this message to ${selectedIds.size} leads?`)) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/whatsapp/bulk-send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ leadIds: Array.from(selectedIds), message: bulkMessage })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message); // "Queued X messages"
                setBulkMessage('');
                setIsBulkMsgModalOpen(false);
                setSelectedIds(new Set());
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) { alert('Failed to send messages'); }
    };

    const insertTemplate = (content: string) => {
        setBulkMessage(content);
        setShowTemplates(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        try {
            alert('Uploading...');
            const res = await fetch('http://localhost:5000/api/leads/import', { method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            alert(data.message + `\nImported: ${data.stats.imported}`);
            fetchLeads();
        } catch (err) { alert('Import failed'); }
    };


    const handleEdit = () => {
        if (selectedIds.size !== 1) {
            alert('Please select exactly one lead to edit.');
            return;
        }
        const lead = leads.find(l => l.id === Array.from(selectedIds)[0]);
        if (lead) {
            setModalLead(lead);
            setModalMode('edit');
            setIsCreateModalOpen(true);
        }
    };

    const handleDuplicate = () => {
        if (selectedIds.size !== 1) {
            alert('Please select exactly one lead to duplicate.');
            return;
        }
        const lead = leads.find(l => l.id === Array.from(selectedIds)[0]);
        if (lead) {
            setModalLead(lead);
            setModalMode('duplicate');
            setIsCreateModalOpen(true);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#F0F2F5] overflow-hidden">
            {/* --- LEVEL 1: HEADER & TABS --- */}
            <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0 shrink-0 shadow-sm z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns & Leads</h1>
                            <p className="text-xs text-gray-500 font-medium">Manage your pipeline efficiently</p>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex gap-8">
                    <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">All Leads</button>
                    <button onClick={() => router.push('/leads?view=smart')} className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-all">Smart Queues</button>
                    <button onClick={() => router.push('/insights')} className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-all">Analytics</button>
                    <button onClick={() => router.push('/settings')} className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-all">Settings</button>
                </div>
            </div>

            {/* --- LEVEL 2: ACTION TOOLBAR --- */}
            <div className="px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setModalMode('create');
                            setModalLead(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Create
                    </button>
                    <div className="h-6 w-px bg-gray-300 mx-1" />
                    <button onClick={handleDuplicate} className="h-9 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors shadow-sm">
                        Duplicate
                    </button>
                    <button onClick={handleEdit} className="h-9 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors shadow-sm">
                        Edit
                    </button>
                </div>

                {/* Modal Injection */}
                <CreateLeadModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchLeads}
                    mode={modalMode}
                    initialData={modalLead}
                />

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-white border border-gray-300 rounded-md p-0.5 shadow-sm">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`p-1.5 rounded-sm transition-all ${viewMode === 'LIST' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                        <div className="w-px bg-gray-200 my-1" />
                        <button
                            onClick={() => setViewMode('BOARD')}
                            className={`p-1.5 rounded-sm transition-all ${viewMode === 'BOARD' ? 'bg-gray-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <label className="h-9 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                        <Download size={16} /> Import
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {/* --- LEVEL 3: FILTERS & DATA --- */}
            <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">

                    {/* Filters Bar */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-9 pl-9 pr-4 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none text-gray-800 placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="h-9 pl-3 pr-8 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:border-gray-400 transition-colors min-w-[140px]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="flex-1" />
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                            {leads.length} records found
                        </span>
                    </div>

                    {/* Data View */}
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                            <p className="text-sm font-medium">Loading data...</p>
                        </div>
                    ) : viewMode === 'LIST' ? (
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 w-12 border-b border-gray-200 text-center">
                                            <input type="checkbox" onChange={handleSelectAll} checked={allOnPageSelected} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer" />
                                        </th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">Name</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">Contact</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">Status</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">Score</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">Source</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">Created</th>
                                        <th className="py-3 px-4 w-24 border-b border-gray-200 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} onClick={(e) => {
                                            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('button')) return;
                                            setDetailLead(lead);
                                        }} className={`group hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedIds.has(lead.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(lead.id)}
                                                    onChange={(e) => toggleSelection(lead.id, e)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{lead.name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {lead.id.slice(0, 6)}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600">{(lead as any).phone || '—'}</div>
                                                <div className="text-xs text-gray-400">{(lead as any).email}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${lead.status === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    lead.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        lead.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${lead.status === 'VIP' ? 'bg-purple-500' :
                                                        lead.status === 'CONTACTED' ? 'bg-yellow-500' :
                                                            lead.status === 'NEW' ? 'bg-blue-500' : 'bg-gray-400'
                                                        }`} />
                                                    {lead.status || 'NEW'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(lead.score, 100)}%` }} />
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-500">{lead.score}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100 truncate max-w-[100px] inline-block">
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setChatLead(lead); }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                                                        title="Message"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDetailLead(lead); }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto bg-[#F0F2F5] p-4">
                            {/* BOARD MODE - Simplified for brevity but logic should match */}
                            <div className="grid grid-cols-4 gap-6 h-full min-w-[1000px]">
                                {STATUS_COLUMNS.map(status => (
                                    <div
                                        key={status}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, status)}
                                        className="flex flex-col h-full bg-gray-100/50 rounded-xl border border-gray-200/60 p-1"
                                    >
                                        <div className="p-3 flex justify-between items-center mb-1">
                                            <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500">{status}</h3>
                                            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 shadow-sm">
                                                {leads.filter(l => (l.status || 'NEW') === status).length}
                                            </span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                                            {leads.filter(l => (l.status || 'NEW') === status).map((lead) => (
                                                <div
                                                    key={lead.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                                    onClick={() => setDetailLead(lead)}
                                                    className={`group bg-white p-3 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-300 relative ${selectedIds.has(lead.id) ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}`}
                                                >
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); setChatLead(lead); }} className="p-1 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MessageCircle size={14} />
                                                        </button>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(lead.id)}
                                                            onChange={(e) => { e.stopPropagation(); toggleSelection(lead.id); }}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 pr-10">{lead.name}</h4>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{(lead as any).phone || 'No Phone'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-50">
                                                            <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 border border-gray-100">{lead.source}</span>
                                                            <span className={`text-[10px] font-mono ${lead.score > 50 ? 'text-green-600' : 'text-gray-400'}`}>{lead.score}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer / Pagination */}
                    {viewMode === 'LIST' && (
                        <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50 text-xs text-gray-500">
                            <span>
                                Showing <span className="font-medium text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="font-medium text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-gray-900">{pagination.total}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="h-8 w-8 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"><ChevronLeft size={14} /></button>
                                <span className="font-medium text-gray-900">Page {pagination.page}</span>
                                <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="h-8 w-8 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- FLOATING BULK ACTIONS --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-gray-700"
                    >
                        <span className="font-semibold text-sm pl-2">{selectedIds.size} Selected</span>
                        <div className="h-4 w-px bg-gray-700" />

                        <button onClick={() => setIsAssignModalOpen(true)} className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
                            <UserPlus size={18} /> <span className="hidden sm:inline">Assign</span>
                        </button>

                        <button onClick={() => setIsBulkMsgModalOpen(true)} className="flex items-center gap-2 text-sm font-medium hover:text-green-400 transition-colors">
                            <MessageSquare size={18} /> <span className="hidden sm:inline">Message</span>
                        </button>

                        <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 size={18} /> <span className="hidden sm:inline">Delete</span>
                        </button>

                        <button onClick={() => setSelectedIds(new Set())} className="ml-2 bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full transition-colors"><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PANELS & MODALS --- */}
            <AnimatePresence>
                {/* Details Panel */}
                {detailLead && (
                    <LeadDetailsPanel
                        lead={detailLead}
                        onClose={() => setDetailLead(null)}
                        onEdit={() => {
                            setModalLead(detailLead);
                            setModalMode('edit');
                            setIsCreateModalOpen(true);
                            setDetailLead(null);
                        }}
                        onChat={() => {
                            setChatLead(detailLead);
                            setDetailLead(null);
                        }}
                    />
                )}

                {/* Chat Panel (Right Drawer) */}
                {chatLead && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col"
                    >
                        <ChatWindow lead={chatLead} onClose={() => setChatLead(null)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-xl border border-gray-200 p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                                <UserPlus size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Assign Leads</h3>
                            <p className="text-sm text-gray-500 text-center mt-1">Assign {selectedIds.size} selected leads to a team member.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Member</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 transition-all text-sm"
                                    value={assignTarget}
                                    onChange={(e) => setAssignTarget(Number(e.target.value) || '')}
                                >
                                    <option value="">Select an agent...</option>
                                    {teamMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button onClick={() => setIsAssignModalOpen(false)} className="h-10 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">Cancel</button>
                                <button
                                    onClick={handleBulkAssign}
                                    className="h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
                                    disabled={!assignTarget}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isBulkMsgModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Bulk Message</h3>
                                <p className="text-sm text-gray-500 mt-1">Sending to <span className="font-bold text-blue-600">{selectedIds.size} Leads</span>. (Auto-queued with delay)</p>
                            </div>
                            <button onClick={() => setIsBulkMsgModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute top-2 right-2 z-10">
                                    <button
                                        onClick={() => setShowTemplates(!showTemplates)}
                                        className="text-xs flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 border border-yellow-200 font-medium"
                                    >
                                        <Zap size={12} /> Templates
                                    </button>
                                </div>

                                {showTemplates && (
                                    <div className="absolute top-8 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                                        {templates.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => insertTemplate(t.content)}
                                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-left"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-xs text-gray-900">{t.title}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 truncate">{t.content}</p>
                                            </div>
                                        ))}
                                        {templates.length === 0 && <div className="p-3 text-center text-xs text-gray-400">No templates found</div>}
                                    </div>
                                )}

                                <textarea
                                    className="w-full h-32 p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-900 text-sm resize-none"
                                    placeholder="Type your message here... Use {name} to personalize."
                                    value={bulkMessage}
                                    onChange={(e) => setBulkMessage(e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">{bulkMessage.length} characters</p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-700">
                                    <span className="font-bold">Note:</span> Messages are sent with a 2-5 sec delay to prevent spam flags. It may take a few minutes to complete.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsBulkMsgModalOpen(false)} className="h-10 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">Cancel</button>
                                <button
                                    onClick={handleBulkSend}
                                    className="h-10 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium text-sm shadow-sm disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                                    disabled={!bulkMessage.trim()}
                                >
                                    <MessageSquare size={16} /> Send Blast
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Create Modal */}
            <CreateLeadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchLeads();
                    alert('Action Successful');
                }}
                mode={modalMode}
                initialData={modalLead}
            />
        </div>
    );
}
