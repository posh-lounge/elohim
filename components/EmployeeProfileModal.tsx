'use client';

import { useState, useRef, useEffect } from 'react';
import {
  User, Phone, Mail, MapPin, Calendar, Briefcase, Building2,
  CreditCard, FileText, Upload, Trash2, Download, Camera,
  Loader2, X, AlertCircle, Plus, ChevronDown, Edit2, Save
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import type { Employee, EmployeeDocument } from '@/lib/types';
import {
  useEmployeeDocuments,
  useUploadEmployeeDocument,
  useDeleteEmployeeDocument,
  useUploadProfilePhoto,
  useUpdateEmployee,
} from '@/hooks/useEmployees';

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'contract', label: 'Employment Contract' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'cv', label: 'CV / Resume' },
  { value: 'recommendation', label: 'Recommendation Letter' },
  { value: 'medical', label: 'Medical Certificate' },
  { value: 'other', label: 'Other' },
];

function fmtSize(b: number) {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1048576).toFixed(1)}MB`;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function Avatar({ name, photoPath, size = 80 }: { name: string; photoPath: string | null; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  if (photoPath) {
    return (
      <img
        src={`/${photoPath}`}
        alt={name}
        className="rounded-full object-cover border-2 border-gold/30"
        style={{ width: size, height: size }}
      />
    );
  }
  
  return (
    <div
      className="rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold border-2 border-gold/30"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function Tab({ label, icon, active, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-gold text-gold'
          : 'border-transparent text-muted hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function EmployeeProfileModal({
  employee,
  canManage,
  onClose,
}: {
  employee: Employee;
  canManage: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'emergency'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: employee.dateOfBirth ?? '',
    nationalId: employee.nationalId ?? '',
    address: employee.address ?? '',
    emergencyContactName: employee.emergencyContactName ?? '',
    emergencyContactPhone: employee.emergencyContactPhone ?? '',
    emergencyContactRelationship: employee.emergencyContactRelationship ?? '',
    bankAccount: employee.bankAccount ?? '',
    bankName: employee.bankName ?? '',
    tinNumber: employee.tinNumber ?? '',
    socialSecurityNumber: employee.socialSecurityNumber ?? '',
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('national_id');
  const [docDescription, setDocDescription] = useState('');

  const documentsQuery = useEmployeeDocuments(employee.id);
  const uploadDocument = useUploadEmployeeDocument();
  const deleteDocument = useDeleteEmployeeDocument();
  const uploadPhoto = useUploadProfilePhoto();
  const updateEmployee = useUpdateEmployee();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSave = async () => {
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        ...form,
      });
      setIsEditing(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo too large', { description: 'Maximum 5MB' });
      return;
    }
    
    await uploadPhoto.mutateAsync({ employeeId: employee.id, file });
    e.target.value = '';
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum 20MB' });
      return;
    }
    
    await uploadDocument.mutateAsync({
      employeeId: employee.id,
      file,
      documentType: selectedDocType,
      description: docDescription || undefined,
    });
    
    setDocDescription('');
    e.target.value = '';
  };

  const handleDeleteDocument = async (doc: EmployeeDocument) => {
    if (confirm(`Delete "${doc.fileName}"?`)) {
      await deleteDocument.mutateAsync({
        employeeId: employee.id,
        documentId: doc.id,
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#0d1120] rounded-2xl border border-[#1a2035] w-full max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-[#1a2035]">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar name={employee.name} photoPath={employee.profilePhotoPath} size={72} />
                {canManage && (
                  <>
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadPhoto.isPending}
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    >
                      {uploadPhoto.isPending
                        ? <Loader2 size={18} className="animate-spin text-white" />
                        : <Camera size={18} className="text-white" />}
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </>
                )}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">{employee.name}</h2>
                <p className="text-muted text-sm">{employee.position}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded-full border capitalize ${
                    employee.employmentType === 'permanent'
                      ? 'text-success border-success'
                      : 'text-gold border-gold'
                  }`}>
                    {employee.employmentType}
                  </span>
                  {employee.isActive ? (
                    <span className="text-[10.5px] text-success">● Active</span>
                  ) : (
                    <span className="text-[10.5px] text-danger">● Inactive</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted hover:text-white hover:bg-[#1a2035] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1a2035] px-2">
            <Tab
              id="info"
              label="Personal Info"
              icon={<User size={14} />}
              active={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
            />
            <Tab
              id="emergency"
              label="Emergency & Bank"
              icon={<AlertCircle size={14} />}
              active={activeTab === 'emergency'}
              onClick={() => setActiveTab('emergency')}
            />
            <Tab
              id="documents"
              label={`Documents ${documentsQuery.data ? `(${documentsQuery.data.documents.length})` : ''}`}
              icon={<FileText size={14} />}
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'info' && (
              <div className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-muted text-xs font-medium mb-1.5 block">Date of Birth</label>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="text-muted text-xs font-medium mb-1.5 block">National ID</label>
                        <input
                          value={form.nationalId}
                          onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                          placeholder="e.g. 1199880012345678"
                          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-muted text-xs font-medium mb-1.5 block">Address</label>
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Residential address"
                        rows={2}
                        className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow icon={<User size={14} />} label="Full Name" value={employee.name} />
                    <InfoRow icon={<Phone size={14} />} label="Phone" value={employee.phone ?? '—'} />
                    <InfoRow icon={<Mail size={14} />} label="Email" value={employee.email ?? '—'} />
                    <InfoRow icon={<Briefcase size={14} />} label="Position" value={employee.position} />
                    <InfoRow icon={<Building2 size={14} />} label="Department" value={employee.department} />
                    <InfoRow icon={<Calendar size={14} />} label="Hire Date" value={fmtDate(employee.hireDate)} />
                    <InfoRow icon={<Calendar size={14} />} label="Date of Birth" value={fmtDate(employee.dateOfBirth)} />
                    <InfoRow icon={<User size={14} />} label="National ID" value={employee.nationalId ?? '—'} />
                    <div className="col-span-2">
                      <InfoRow icon={<MapPin size={14} />} label="Address" value={employee.address ?? '—'} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-400" />
                        Emergency Contact
                      </h3>
                      <div className="space-y-3">
                        <input
                          value={form.emergencyContactName}
                          onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                          placeholder="Contact name"
                          className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={form.emergencyContactPhone}
                            onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                            placeholder="Phone number"
                            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                          />
                          <input
                            value={form.emergencyContactRelationship}
                            onChange={(e) => setForm({ ...form, emergencyContactRelationship: e.target.value })}
                            placeholder="Relationship"
                            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                        <CreditCard size={14} className="text-blue-400" />
                        Bank & Tax Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={form.bankName}
                            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                            placeholder="Bank name"
                            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                          />
                          <input
                            value={form.bankAccount}
                            onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                            placeholder="Account number"
                            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={form.tinNumber}
                            onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
                            placeholder="TIN Number"
                            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                          />
                          <input
                            value={form.socialSecurityNumber}
                            onChange={(e) => setForm({ ...form, socialSecurityNumber: e.target.value })}
                            placeholder="Social Security Number"
                            className="w-full bg-[#080c18] border border-[#1a2035] rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-gold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-400" />
                        Emergency Contact
                      </h3>
                      <div className="bg-[#080c18] rounded-xl border border-[#1a2035] p-4 space-y-3">
                        <InfoRow
                          icon={<User size={14} />}
                          label="Name"
                          value={employee.emergencyContactName ?? '—'}
                        />
                        <InfoRow
                          icon={<Phone size={14} />}
                          label="Phone"
                          value={employee.emergencyContactPhone ?? '—'}
                        />
                        <InfoRow
                          icon={<User size={14} />}
                          label="Relationship"
                          value={employee.emergencyContactRelationship ?? '—'}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                        <CreditCard size={14} className="text-blue-400" />
                        Bank & Tax Information
                      </h3>
                      <div className="bg-[#080c18] rounded-xl border border-[#1a2035] p-4 space-y-3">
                        <InfoRow
                          icon={<Building2 size={14} />}
                          label="Bank"
                          value={employee.bankName ?? '—'}
                        />
                        <InfoRow
                          icon={<CreditCard size={14} />}
                          label="Account Number"
                          value={employee.bankAccount ?? '—'}
                        />
                        <InfoRow
                          icon={<FileText size={14} />}
                          label="TIN Number"
                          value={employee.tinNumber ?? '—'}
                        />
                        <InfoRow
                          icon={<FileText size={14} />}
                          label="Social Security"
                          value={employee.socialSecurityNumber ?? '—'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                {/* Upload section */}
                {canManage && (
                  <div className="bg-[#080c18] rounded-xl border border-[#1a2035] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="bg-[#0d1120] border border-[#1a2035] rounded-lg px-3 py-2 text-white text-sm outline-none"
                      >
                        {DOCUMENT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <input
                        value={docDescription}
                        onChange={(e) => setDocDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="flex-1 bg-[#0d1120] border border-[#1a2035] rounded-lg px-3 py-2 text-white text-sm outline-none"
                      />
                    </div>
                    <button
                      onClick={() => docInputRef.current?.click()}
                      disabled={uploadDocument.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#1a2035] rounded-xl text-muted hover:text-gold hover:border-gold/50 transition disabled:opacity-50"
                    >
                      {uploadDocument.isPending
                        ? <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                        : <><Upload size={15} /> Upload document (max 20MB)</>}
                    </button>
                    <input
                      ref={docInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                  </div>
                )}

                {/* Documents list */}
                {documentsQuery.isLoading && (
                  <div className="text-center py-8 text-muted text-sm">Loading documents…</div>
                )}

                {documentsQuery.data?.documents.length === 0 && (
                  <div className="text-center py-12">
                    <FileText size={32} className="mx-auto text-muted/30 mb-3" />
                    <p className="text-muted text-sm">No documents uploaded yet</p>
                  </div>
                )}

                <div className="space-y-2">
                  {documentsQuery.data?.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-[#080c18] rounded-xl border border-[#1a2035] hover:border-gold/30 transition group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#1a2035] flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span className="capitalize">{doc.documentType.replace('_', ' ')}</span>
                          <span>·</span>
                          <span>{fmtSize(doc.fileSize)}</span>
                          <span>·</span>
                          <span>{doc.uploadedByName}</span>
                        </div>
                        {doc.description && (
                          <p className="text-muted/70 text-xs mt-0.5 truncate">{doc.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/${doc.filePath}`}
                          download
                          className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                        {canManage && (
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            disabled={deleteDocument.isPending}
                            className="p-2 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-[#1a2035]">
            <div className="text-xs text-muted">
              Employee ID: #{employee.id}
            </div>
            <div className="flex gap-2">
              {canManage && (
                isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setForm({
                          dateOfBirth: employee.dateOfBirth ?? '',
                          nationalId: employee.nationalId ?? '',
                          address: employee.address ?? '',
                          emergencyContactName: employee.emergencyContactName ?? '',
                          emergencyContactPhone: employee.emergencyContactPhone ?? '',
                          emergencyContactRelationship: employee.emergencyContactRelationship ?? '',
                          bankAccount: employee.bankAccount ?? '',
                          bankName: employee.bankName ?? '',
                          tinNumber: employee.tinNumber ?? '',
                          socialSecurityNumber: employee.socialSecurityNumber ?? '',
                        });
                      }}
                      className="px-4 py-2 border border-[#1a2035] rounded-xl text-muted text-sm hover:bg-[#1a2035] transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateEmployee.isPending}
                      className="flex items-center gap-2 px-5 py-2 bg-gold text-[#1A1408] font-bold rounded-xl text-sm hover:bg-gold/90 disabled:opacity-50 transition"
                    >
                      {updateEmployee.isPending
                        ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                        : <><Save size={13} /> Save Changes</>}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a2035] rounded-xl text-white text-sm hover:bg-[#232b45] transition"
                  >
                    <Edit2 size={13} /> Edit Info
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-muted text-xs">{label}</p>
        <p className="text-white text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}