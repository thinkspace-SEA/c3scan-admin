"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  User,
  Eye,
  AlertCircle
} from "lucide-react";

interface AliasSuggestion {
  alias_suggestion_id: string;
  location_name: string;
  company_id: string | null;
  company_name: string | null;
  suggested_alias: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by_email: string;
  created_at: string;
  mail_item_id: string | null;
  envelope_image_path: string | null;
}

interface Company {
  company_id: string;
  company_name: string;
  pmb_number: string;
}

export default function AliasSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AliasSuggestion[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<AliasSuggestion | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Fetch suggestions
  useEffect(() => {
    fetchSuggestions();
    fetchCompanies();
  }, [activeTab]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/alias-suggestions?status=${activeTab}`);
      const data = await res.json();
      if (data.items) {
        setSuggestions(data.items);
      }
      if (data.summary?.by_status) {
        setStats({
          pending: data.summary.by_status.pending || 0,
          approved: data.summary.by_status.approved || 0,
          rejected: data.summary.by_status.rejected || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies?limit=500');
      const data = await res.json();
      if (data.items) {
        setCompanies(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleDecision = async () => {
    if (!selectedSuggestion || !decisionAction) return;
    
    setSubmitting(true);
    try {
      const body: any = { action: decisionAction };
      
      if (decisionAction === 'approve') {
        if (!selectedCompanyId) {
          alert('Please select a company');
          setSubmitting(false);
          return;
        }
        body.company_id = selectedCompanyId;
        body.alias_type = 'ocr_variant';
      } else {
        if (!rejectReason) {
          alert('Please provide a rejection reason');
          setSubmitting(false);
          return;
        }
        body.reject_reason = rejectReason;
      }
      
      const res = await fetch(`/api/admin/alias-suggestions/${selectedSuggestion.alias_suggestion_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setDecisionModalOpen(false);
        setSelectedSuggestion(null);
        setSelectedCompanyId('');
        setRejectReason('');
        fetchSuggestions();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to process decision');
      }
    } catch (err) {
      console.error('Decision error:', err);
      alert('Failed to process decision');
    } finally {
      setSubmitting(false);
    }
  };

  const openDecisionModal = (suggestion: AliasSuggestion, action: 'approve' | 'reject') => {
    setSelectedSuggestion(suggestion);
    setDecisionAction(action);
    setDecisionModalOpen(true);
    setSelectedCompanyId(suggestion.company_id || '');
    setRejectReason('');
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.suggested_alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.company_name && s.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Alias Suggestions</h1>
        <p className="text-gray-600 mt-1">Review and approve unmatched mail aliases from staff</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="text-2xl font-semibold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'pending', label: 'Pending', count: stats.pending },
          { id: 'approved', label: 'Approved', count: stats.approved },
          { id: 'rejected', label: 'Rejected', count: stats.rejected },
          { id: 'all', label: 'All', count: stats.pending + stats.approved + stats.rejected },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-[#FFCC00] text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by alias, location, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Suggestions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-600">
            <div className="animate-spin w-8 h-8 border-2 border-[#FFCC00] border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading suggestions...
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {activeTab === 'all' ? '' : activeTab} suggestions
            </h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'pending' 
                ? 'All caught up! No pending alias suggestions to review.'
                : `No ${activeTab} suggestions found.`}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suggested Alias</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proposed Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {activeTab === 'pending' && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSuggestions.map((s) => (
                <tr key={s.alias_suggestion_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.suggested_alias}</p>
                    {s.mail_item_id && (
                      <Link 
                        href={`/admin/mail/${s.mail_item_id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                      >
                        <Eye size={12} /> View mail item
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 size={14} className="text-gray-400" />
                      {s.location_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.company_name ? (
                      <div>
                        <span className="text-gray-900">{s.company_name}</span>
                        <span className="text-xs text-blue-600 block">Staff selected</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not matched</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {s.created_by_email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      s.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.status === 'pending' ? <Clock size={12} /> :
                       s.status === 'approved' ? <CheckCircle size={12} /> :
                       <XCircle size={12} />}
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  {activeTab === 'pending' && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDecisionModal(s, 'approve')}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          title={s.company_id ? `Current: ${s.company_name}` : 'Select company to assign'}
                        >
                          <CheckCircle size={14} />
                          {s.company_id ? 'Review & Approve' : 'Assign & Approve'}
                        </button>
                        <button
                          onClick={() => openDecisionModal(s, 'reject')}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Decision Modal */}
      {decisionModalOpen && selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {decisionAction === 'approve' ? 'Approve Alias' : 'Reject Alias'}
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Suggested Alias:</p>
              <p className="font-medium text-gray-900">{selectedSuggestion.suggested_alias}</p>
              <p className="text-sm text-gray-600 mt-2">Location:</p>
              <p className="text-sm text-gray-900">{selectedSuggestion.location_name}</p>
            </div>
            
            {decisionAction === 'approve' ? (
              <div className="space-y-4">
                {/* Show originally selected company if different */}
                {selectedSuggestion?.company_id && selectedSuggestion?.company_name && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Originally selected:</span> {selectedSuggestion.company_name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You can keep this or select a different company below.
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Company *
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  >
                    <option value="">Select a company...</option>
                    {companies.map(c => (
                      <option key={c.company_id} value={c.company_id}>
                        {c.company_name} (PMB {c.pmb_number})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Staff selected wrong company, corrected to..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] h-20 resize-none"
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  This will create a new OCR variant alias for the selected company. 
                  Future scans matching &quot;{selectedSuggestion?.suggested_alias}&quot; will automatically route to this company.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Not a valid company name, Already exists, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] h-24 resize-none"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDecisionModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecision}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  decisionAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {submitting ? 'Processing...' : decisionAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
