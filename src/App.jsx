import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ── SVG Icon set ──────────────────────────────────────────────────────────────
const Icons = {
  Clinic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
      <line x1="12" y1="5" x2="12" y2="9"/>
      <line x1="10" y1="7" x2="14" y2="7"/>
    </svg>
  ),
  Ads: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
  Edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  ToggleOn: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
      <circle cx="16" cy="12" r="3" fill="currentColor"/>
    </svg>
  ),
  ToggleOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
      <circle cx="8" cy="12" r="3" fill="currentColor"/>
    </svg>
  ),
  Image: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Link: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
};

// ── Constants ─────────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Blank forms ───────────────────────────────────────────────────────────────
const BLANK_CLINIC = {
  name: '',
  address: '',
  phone: '',
  email: '',
  startDay: 'Monday',
  endDay: 'Friday',
  openTime: '08:00',
  closeTime: '17:00',
  closedDaysList: [],
  hasSecondarySchedule: false,
  secondaryStartDay: 'Saturday',
  secondaryEndDay: 'Saturday',
  secondaryOpenTime: '08:00',
  secondaryCloseTime: '12:00',
  latitude: '',
  longitude: '',
};

const BLANK_AD = {
  title: '',
  description: '',
  imageUrl: '',
  targetUrl: '',
  isActive: true,
  startDate: '',
  endDate: '',
};

// ── Utility ───────────────────────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '—';
  if (ts.toDate) return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (typeof ts === 'string') return ts;
  return '—';
}

function fmt12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatSingleSchedule(startDay, endDay, openTime, closeTime, closedDaysList = []) {
  if (!startDay) return '';
  let rangeStr = startDay === endDay ? startDay : `${startDay} to ${endDay}`;
  if ((startDay === 'Monday' || startDay === 'Mon') && (endDay === 'Sunday' || endDay === 'Sun')) {
    rangeStr = 'Monday to Sunday (Everyday)';
  }
  if (closedDaysList && closedDaysList.length > 0) {
    rangeStr += ` (Closed ${closedDaysList.join(', ')})`;
  }
  const timeStr = (openTime || closeTime) ? ` (${fmt12(openTime)} – ${fmt12(closeTime)})` : '';
  return rangeStr + timeStr;
}

function buildHoursString(data) {
  if (!data) return '';
  if (typeof data === 'string') {
    const [startDay, endDay, openTime, closeTime] = arguments;
    return formatSingleSchedule(startDay, endDay, openTime, closeTime);
  }
  const primary = formatSingleSchedule(data.startDay, data.endDay, data.openTime, data.closeTime, data.closedDaysList);
  if (data.hasSecondarySchedule) {
    const secondary = formatSingleSchedule(data.secondaryStartDay || 'Saturday', data.secondaryEndDay || 'Saturday', data.secondaryOpenTime, data.secondaryCloseTime);
    if (secondary) {
      return `${primary}, ${secondary}`;
    }
  }
  return primary;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('clinics');
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore data
  const [clinics, setClinics] = useState([]);
  const [ads, setAds] = useState([]);

  // Modal state
  const [clinicModal, setClinicModal] = useState({ open: false, mode: 'add', data: BLANK_CLINIC, id: null });
  const [adModal, setAdModal] = useState({ open: false, mode: 'add', data: BLANK_AD, id: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, title: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Firestore listeners (only when logged in) ──
  useEffect(() => {
    if (!user) return;

    const unsubClinics = onSnapshot(collection(db, 'vetClinics'), (snap) => {
      setClinics(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubAds = onSnapshot(collection(db, 'ads'), (snap) => {
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubClinics();
      unsubAds();
    };
  }, [user]);

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword.trim());
    } catch (err) {
      let msg = 'Authentication failed. Please check your credentials.';
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
        msg = 'Invalid email address or passcode.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email format.';
      }
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Clinic CRUD ──
  const openAddClinic = () => setClinicModal({ open: true, mode: 'add', data: { ...BLANK_CLINIC }, id: null });
  const openEditClinic = (clinic) => {
    const closedDaysList = Array.isArray(clinic.closedDaysList) ? clinic.closedDaysList : [];
    const startDay = clinic.startDay || (Array.isArray(clinic.operatingDays) && clinic.operatingDays.length > 0 ? clinic.operatingDays[0] : 'Monday');
    const endDay = clinic.endDay || (Array.isArray(clinic.operatingDays) && clinic.operatingDays.length > 0 ? clinic.operatingDays[clinic.operatingDays.length - 1] : 'Friday');
    setClinicModal({
      open: true, mode: 'edit',
      data: { ...BLANK_CLINIC, ...clinic, closedDaysList, startDay, endDay },
      id: clinic.id
    });
  };
  const closeClinicModal = () => setClinicModal(m => ({ ...m, open: false }));

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    if (!clinicModal.data.name.trim()) { alert('Clinic name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: clinicModal.data.name.trim(),
        address: clinicModal.data.address.trim(),
        phone: clinicModal.data.phone.trim(),
        email: clinicModal.data.email.trim(),
        startDay: clinicModal.data.startDay || 'Monday',
        endDay: clinicModal.data.endDay || 'Friday',
        openTime: clinicModal.data.openTime || '',
        closeTime: clinicModal.data.closeTime || '',
        closedDaysList: clinicModal.data.closedDaysList || [],
        hasSecondarySchedule: Boolean(clinicModal.data.hasSecondarySchedule),
        secondaryStartDay: clinicModal.data.secondaryStartDay || 'Saturday',
        secondaryEndDay: clinicModal.data.secondaryEndDay || 'Saturday',
        secondaryOpenTime: clinicModal.data.secondaryOpenTime || '',
        secondaryCloseTime: clinicModal.data.secondaryCloseTime || '',
        hours: buildHoursString(clinicModal.data),
        latitude: clinicModal.data.latitude ? parseFloat(clinicModal.data.latitude) : null,
        longitude: clinicModal.data.longitude ? parseFloat(clinicModal.data.longitude) : null,
        updatedAt: serverTimestamp(),
      };
      if (clinicModal.mode === 'add') {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'vetClinics'), payload);
      } else {
        await updateDoc(doc(db, 'vetClinics', clinicModal.id), payload);
      }
      closeClinicModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save clinic. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteClinic = (id, name) => setDeleteModal({ open: true, type: 'clinic', id, title: name });

  // ── Ads CRUD ──
  const openAddAd = () => setAdModal({ open: true, mode: 'add', data: { ...BLANK_AD }, id: null });
  const openEditAd = (ad) => setAdModal({ open: true, mode: 'edit', data: { ...ad }, id: ad.id });
  const closeAdModal = () => setAdModal(m => ({ ...m, open: false }));

  const handleSaveAd = async (e) => {
    e.preventDefault();
    if (!adModal.data.title.trim()) { alert('Advertisement title is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: adModal.data.title.trim(),
        description: adModal.data.description.trim(),
        imageUrl: adModal.data.imageUrl.trim(),
        targetUrl: adModal.data.targetUrl.trim(),
        isActive: Boolean(adModal.data.isActive),
        startDate: adModal.data.startDate || null,
        endDate: adModal.data.endDate || null,
        updatedAt: serverTimestamp(),
      };
      if (adModal.mode === 'add') {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'ads'), payload);
      } else {
        await updateDoc(doc(db, 'ads', adModal.id), payload);
      }
      closeAdModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save advertisement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteAd = (id, title) => setDeleteModal({ open: true, type: 'ad', id, title });

  // ── Delete Confirmation Handlers ──
  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, type: '', id: null, title: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      if (deleteModal.type === 'clinic') {
        await deleteDoc(doc(db, 'vetClinics', deleteModal.id));
      } else if (deleteModal.type === 'ad') {
        await deleteDoc(doc(db, 'ads', deleteModal.id));
      }
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      alert(`Failed to delete ${deleteModal.type === 'clinic' ? 'clinic' : 'advertisement'}. Please try again.`);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAdActive = async (id, current) => {
    try {
      await updateDoc(doc(db, 'ads', id), { isActive: !current, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
      alert('Failed to toggle advertisement status.');
    }
  };

  // ── Filtered lists ──
  const filteredClinics = clinics.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAds = ads.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Loading screen ──
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-canvas)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading Portal...</p>
        </div>
      </div>
    );
  }

  // ── Login screen ──
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-sans)', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '44px 40px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="login-logo-wrapper">
              <img src="/logo.png" alt="PawsCura Logo" className="login-logo-img" />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px', fontWeight: '500' }}>Sign in to manage clinics and advertisements</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Alert />
              <span style={{ fontWeight: '500' }}>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="admin@pawscura.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Passcode</label>
              <input type="password" className="form-control" placeholder="••••••••" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" disabled={loginLoading}
              style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, hsl(200,95%,30%) 0%, hsl(200,95%,44%) 100%)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)' }}>
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin layout ──
  return (
    <div className="admin-container">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo-wrapper">
            <img src="/logo.png" alt="PawsCura Logo" className="brand-logo-img" />
          </div>
        </div>

        <ul className="nav-list">
          <li>
            <div
              className={`nav-item ${activeTab === 'clinics' ? 'active' : ''}`}
              onClick={() => { setActiveTab('clinics'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Clinic /></span>
              <span>Vet Clinics</span>
            </div>
          </li>
          <li>
            <div
              className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ads'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Ads /></span>
              <span>Advertisements</span>
            </div>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div
            className="nav-item nav-item-logout"
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out of the PawsCura Portal?')) {
                signOut(auth);
              }
            }}
          >
            <span className="nav-icon"><Icons.Logout /></span>
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* ── WORKSPACE ── */}
      <main className="workspace">
        <header className="header-row">
          <div>
            <h2 className="header-title">
              {activeTab === 'clinics' && 'Veterinary Clinic Directory'}
              {activeTab === 'ads' && 'Advertisements Manager'}
            </h2>
            <p className="header-subtitle">
              {activeTab === 'clinics' && `${filteredClinics.length} clinic${filteredClinics.length !== 1 ? 's' : ''} listed`}
              {activeTab === 'ads' && `${filteredAds.length} advertisement${filteredAds.length !== 1 ? 's' : ''} · ${ads.filter(a => a.isActive).length} active`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Search */}
            <div className="search-input-wrap">
              <span className="search-icon"><Icons.Search /></span>
              <input
                type="text"
                className="search-input"
                placeholder={activeTab === 'clinics' ? 'Search clinics...' : 'Search advertisements...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Add button */}
            {activeTab === 'clinics' && (
              <button
                className="btn-primary"
                onClick={openAddClinic}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', padding: '10px 18px' }}
              >
                <Icons.Plus /> Add Clinic
              </button>
            )}
            {activeTab === 'ads' && (
              <button
                className="btn-primary"
                onClick={openAddAd}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', padding: '10px 18px' }}
              >
                <Icons.Plus /> Add Advertisement
              </button>
            )}
          </div>
        </header>

        {/* ── VET CLINICS TAB ── */}
        {activeTab === 'clinics' && (
          <div className="panel" style={{ flex: 1 }}>
            {filteredClinics.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '80px 0', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                    {searchQuery ? 'No clinics matched your search.' : 'No clinics yet.'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {searchQuery ? 'Try a different keyword.' : 'Click "Add Clinic" to add the first directory entry.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Clinic Name</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Hours</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClinics.map(clinic => (
                      <tr key={clinic.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '3px' }}>{clinic.name}</div>
                          {clinic.email && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{clinic.email}</div>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                            <span style={{ marginTop: '2px', color: 'var(--color-text-muted)', flexShrink: 0 }}><Icons.MapPin /></span>
                            <span style={{ fontSize: '13px' }}>{clinic.address || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}><Icons.Phone /></span>
                            <span>{clinic.phone || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}><Icons.Clock /></span>
                            <span>{clinic.hours || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => openEditClinic(clinic)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              <Icons.Edit /> Edit
                            </button>
                            <button
                              onClick={() => triggerDeleteClinic(clinic.id, clinic.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              <Icons.Trash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ADS TAB ── */}
        {activeTab === 'ads' && (
          <div className="panel" style={{ flex: 1 }}>
            {filteredAds.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '80px 0', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)' }}>
                  <Icons.Ads />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                    {searchQuery ? 'No advertisements matched your search.' : 'No advertisements yet.'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {searchQuery ? 'Try a different keyword.' : 'Click "Add Advertisement" to create the first promotion.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Advertisement Details</th>
                      <th>Image URL</th>
                      <th>Target URL</th>
                      <th>Duration</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAds.map(ad => (
                      <tr key={ad.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{ad.title}</div>
                          {ad.description && (
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ad.description}
                            </div>
                          )}
                        </td>
                        <td>
                          {ad.imageUrl ? (
                            <a href={ad.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-brand)', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
                              <Icons.Image /> Preview
                            </a>
                          ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>}
                        </td>
                        <td>
                          {ad.targetUrl ? (
                            <a href={ad.targetUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-brand)', fontSize: '12px', textDecoration: 'none', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Icons.Link /> {ad.targetUrl.replace(/^https?:\/\//, '')}
                            </a>
                          ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>}
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {ad.startDate || '—'} → {ad.endDate || '—'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleAdActive(ad.id, ad.isActive)}
                            title={ad.isActive ? 'Click to deactivate' : 'Click to activate'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto', padding: '6px 10px', borderRadius: 'var(--radius-sm)', color: ad.isActive ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 700, fontSize: '12px', backgroundColor: ad.isActive ? 'var(--color-success-bg)' : 'var(--color-overlay)' }}
                          >
                            {ad.isActive ? <><Icons.ToggleOn /> Active</> : <><Icons.ToggleOff /> Inactive</>}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => openEditAd(ad)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              <Icons.Edit /> Edit
                            </button>
                            <button
                              onClick={() => triggerDeleteAd(ad.id, ad.title)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              <Icons.Trash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════
          CLINIC MODAL — Add / Edit
      ══════════════════════════════════════════════════════════ */}
      {clinicModal.open && (
        <div className="modal-overlay" onClick={closeClinicModal}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeClinicModal}><Icons.Close /></button>
            <h3 className="modal-title">
              {clinicModal.mode === 'add' ? 'Add New Veterinary Clinic' : 'Edit Clinic Information'}
            </h3>

            <form onSubmit={handleSaveClinic}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Clinic Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PetCare Animal Hospital"
                    required
                    value={clinicModal.data.name}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 123 Veterinary Lane, Manila"
                    value={clinicModal.data.address}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, address: e.target.value } }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+63 123 123 1234"
                    value={clinicModal.data.phone}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, phone: e.target.value } }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="clinic@example.com"
                    value={clinicModal.data.email}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, email: e.target.value } }))}
                  />
                </div>

                {/* ── Primary Operating Schedule ── */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Operating Days</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Start Day</label>
                      <select
                        className="form-control"
                        value={clinicModal.data.startDay || 'Monday'}
                        onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, startDay: e.target.value } }))}
                      >
                        {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>End Day</label>
                      <select
                        className="form-control"
                        value={clinicModal.data.endDay || 'Friday'}
                        onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, endDay: e.target.value } }))}
                      >
                        {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Closed Days Selector */}
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Closed Days mid-week <span style={{ fontWeight: 400 }}>(e.g. Tuesday)</span></label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {WEEK_DAYS.map(day => {
                        const isClosed = (clinicModal.data.closedDaysList || []).includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const list = clinicModal.data.closedDaysList || [];
                              const next = isClosed ? list.filter(d => d !== day) : [...list, day];
                              setClinicModal(m => ({ ...m, data: { ...m.data, closedDaysList: next } }));
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-full)',
                              border: isClosed ? '2px solid var(--color-danger)' : '2px solid var(--color-border)',
                              backgroundColor: isClosed ? 'var(--color-danger)' : 'var(--color-canvas)',
                              color: isClosed ? '#ffffff' : 'var(--color-text-secondary)',
                              fontWeight: 600,
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-sans)',
                              transition: 'all 150ms ease',
                            }}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Open Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={clinicModal.data.openTime}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, openTime: e.target.value } }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Close Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={clinicModal.data.closeTime}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, closeTime: e.target.value } }))}
                  />
                </div>

                {/* ── Optional Secondary Schedule (e.g. Saturday / Weekend Hours) ── */}
                <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                  {!clinicModal.data.hasSecondarySchedule ? (
                    <button
                      type="button"
                      onClick={() => setClinicModal(m => ({ ...m, data: { ...m.data, hasSecondarySchedule: true } }))}
                      style={{
                        background: 'none',
                        border: '1px dashed var(--color-brand)',
                        color: 'var(--color-brand)',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      + Add Weekend / Different Schedule (e.g., Sat 8am–12pm)
                    </button>
                  ) : (
                    <div style={{ padding: '14px', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase' }}>Secondary / Weekend Schedule</span>
                        <button
                          type="button"
                          onClick={() => setClinicModal(m => ({ ...m, data: { ...m.data, hasSecondarySchedule: false } }))}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Start Day</label>
                          <select
                            className="form-control"
                            value={clinicModal.data.secondaryStartDay || 'Saturday'}
                            onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, secondaryStartDay: e.target.value } }))}
                          >
                            {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>End Day</label>
                          <select
                            className="form-control"
                            value={clinicModal.data.secondaryEndDay || 'Saturday'}
                            onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, secondaryEndDay: e.target.value } }))}
                          >
                            {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Open Time</label>
                          <input
                            type="time"
                            className="form-control"
                            value={clinicModal.data.secondaryOpenTime || '08:00'}
                            onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, secondaryOpenTime: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Close Time</label>
                          <input
                            type="time"
                            className="form-control"
                            value={clinicModal.data.secondaryCloseTime || '12:00'}
                            onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, secondaryCloseTime: e.target.value } }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hours preview */}
                {clinicModal.data.startDay && (
                  <div style={{ gridColumn: '1 / -1', padding: '10px 14px', backgroundColor: 'var(--color-brand-transparent)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(14,165,233,0.2)', fontSize: '13px', color: 'var(--color-brand)', fontWeight: 600 }}>
                    📅 {buildHoursString(clinicModal.data)}
                  </div>
                )}



                <div className="form-group">
                  <label className="form-label">Latitude <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--color-text-muted)' }}>(optional)</span></label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 14.5995"
                    value={clinicModal.data.latitude}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, latitude: e.target.value } }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--color-text-muted)' }}>(optional)</span></label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 120.9842"
                    value={clinicModal.data.longitude}
                    onChange={e => setClinicModal(m => ({ ...m, data: { ...m.data, longitude: e.target.value } }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={closeClinicModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: '120px' }}>
                  {saving ? 'Saving...' : clinicModal.mode === 'add' ? 'Add Clinic' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          AD MODAL — Add / Edit
      ══════════════════════════════════════════════════════════ */}
      {adModal.open && (
        <div className="modal-overlay" onClick={closeAdModal}>
          <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAdModal}><Icons.Close /></button>
            <h3 className="modal-title">
              {adModal.mode === 'add' ? 'Create New Advertisement' : 'Edit Advertisement'}
            </h3>

            <form onSubmit={handleSaveAd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Advertisement Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Summer Pet Health Promo"
                    required
                    value={adModal.data.title}
                    onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, title: e.target.value } }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe what the advertisement is about..."
                    style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                    value={adModal.data.description}
                    onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, description: e.target.value } }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/ad-banner.jpg"
                    value={adModal.data.imageUrl}
                    onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, imageUrl: e.target.value } }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Target URL <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--color-text-muted)' }}>(where it links to)</span></label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/promo"
                    value={adModal.data.targetUrl}
                    onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, targetUrl: e.target.value } }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={adModal.data.startDate}
                    onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, startDate: e.target.value } }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={adModal.data.endDate}
                    onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, endDate: e.target.value } }))}
                  />
                </div>

                {/* Active toggle */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Active Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <label className="switch" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={adModal.data.isActive}
                        onChange={e => setAdModal(m => ({ ...m, data: { ...m.data, isActive: e.target.checked } }))}
                      />
                      <span className="slider" />
                    </label>
                    <span style={{ fontSize: '13px', color: adModal.data.isActive ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      {adModal.data.isActive ? 'Advertisement is Active (visible in app)' : 'Advertisement is Inactive (hidden from app)'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={closeAdModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: '120px' }}>
                  {saving ? 'Saving...' : adModal.mode === 'add' ? 'Create Advertisement' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════ */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '32px 28px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDeleteModal} disabled={deleting}><Icons.Close /></button>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Icons.Trash />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {deleteModal.type === 'clinic' ? 'Delete Veterinary Clinic?' : 'Delete Advertisement?'}
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>"{deleteModal.title}"</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{ flex: 1, padding: '11px', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '11px', fontWeight: '700', backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
