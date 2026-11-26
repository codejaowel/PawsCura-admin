import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import MapPicker from './MapPicker';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

// ── SVG Icon set ──────────────────────────────────────────────────────────────
const Icons = {
  Clinic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <line x1="12" y1="5" x2="12" y2="9" />
      <line x1="10" y1="7" x2="14" y2="7" />
    </svg>
  ),
  Ads: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  ToggleOn: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  ToggleOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="8" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  Image: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Link: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

// ── Constants ─────────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlg5lkxmu';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'PawsCura_ScanImg';

function getItemsPerPage() {
  return Math.max(6, Math.floor((window.innerHeight - 240) / 54) - 1);
}

function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        Showing {start}–{end} of {totalItems}
      </span>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="pagination-page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d+\-()\s/]{7,}$/;

function isValidHttpUrl(val) {
  try {
    const u = new URL(val);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function scrollToFirstError(formEl) {
  requestAnimationFrame(() => {
    const firstInvalid = formEl?.querySelector('.input-error');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus({ preventScroll: true });
    }
  });
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
  const [loginFieldErrors, setLoginFieldErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('clinics');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);

  useEffect(() => {
    const onResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Firestore data
  const [clinics, setClinics] = useState([]);
  const [ads, setAds] = useState([]);

  // Modal state
  const [clinicModal, setClinicModal] = useState({ open: false, mode: 'add', data: BLANK_CLINIC, id: null });
  const [clinicErrors, setClinicErrors] = useState({});
  const [adModal, setAdModal] = useState({ open: false, mode: 'add', data: BLANK_AD, id: null });
  const [adErrors, setAdErrors] = useState({});
  const [adImageUploading, setAdImageUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, title: '' });
  const [deleteError, setDeleteError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Admin Profile state
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // ── Auth listener (Strict Admin Role Enforced) ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', u.uid));
          if (userDocSnap.exists()) {
            const role = userDocSnap.data()?.role;
            if (role !== 'admin') {
              await signOut(auth);
              setUser(null);
              setLoginError('Access restricted. This portal is exclusively for administrator accounts.');
              setAuthLoading(false);
              return;
            }
          }
        } catch (roleErr) {
          console.warn('Admin role verification check warning:', roleErr);
        }

        setUser(u);
        setProfileForm({
          displayName: u.displayName || '',
          email: u.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setUser(null);
      }
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

  // ── Login (Strict Admin Role Enforced) ──
  const handleLogin = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setLoginError('');
    const errs = {};
    if (!loginEmail.trim()) {
      errs.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(loginEmail.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (!loginPassword.trim()) {
      errs.password = 'Passcode is required.';
    }
    if (Object.keys(errs).length > 0) {
      setLoginFieldErrors(errs);
      scrollToFirstError(formEl);
      return;
    }
    setLoginFieldErrors({});
    setLoginLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword.trim());

      // Strict allowlist: Only 'admin' accounts can log into the web admin portal
      const userDocSnap = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDocSnap.exists()) {
        const role = userDocSnap.data()?.role;
        if (role !== 'admin') {
          await signOut(auth);
          setLoginError('Access restricted. This portal is exclusively for administrator accounts.');
          return;
        }
      }
    } catch (err) {
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
        setLoginFieldErrors({ email: 'Check your email address.', password: 'Invalid email or passcode.' });
        scrollToFirstError(formEl);
      } else if (err.code === 'auth/invalid-email') {
        setLoginFieldErrors({ email: 'Invalid email format.' });
        scrollToFirstError(formEl);
      } else {
        setLoginError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Admin Profile Update ──
  const openProfileTab = () => {
    if (auth.currentUser) {
      setProfileForm({
        displayName: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setProfileErrors({});
    setProfileMessage({ type: '', text: '' });
    setActiveTab('profile');
    setSearchQuery('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setProfileMessage({ type: '', text: '' });

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const trimmedName = profileForm.displayName.trim();
    const trimmedEmail = profileForm.email.trim();
    const emailChanged = trimmedEmail && trimmedEmail !== (currentUser.email || '');
    const passwordChanged = Boolean(profileForm.newPassword || profileForm.confirmPassword);
    const profileInfoChanged = trimmedName !== (currentUser.displayName || '');

    const errs = {};
    if (!trimmedName) {
      errs.displayName = 'Display name is required.';
    }
    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address.';
    }

    if (passwordChanged) {
      if (!profileForm.newPassword || profileForm.newPassword.length < 6) {
        errs.newPassword = 'New passcode must be at least 6 characters.';
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        errs.confirmPassword = 'Passcodes do not match.';
      }
    }

    if ((emailChanged || passwordChanged) && !profileForm.currentPassword) {
      errs.currentPassword = 'Enter your current passcode to verify this change.';
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      scrollToFirstError(formEl);
      return;
    }

    if (!emailChanged && !passwordChanged && !profileInfoChanged) {
      setProfileErrors({ displayName: 'Modify at least one field before saving.' });
      scrollToFirstError(formEl);
      return;
    }

    setProfileErrors({});
    setProfileSaving(true);
    try {
      // Re-authenticate if sensitive fields (email or password) are being updated
      if (emailChanged || passwordChanged) {
        const credential = EmailAuthProvider.credential(currentUser.email, profileForm.currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      if (profileInfoChanged) {
        await updateProfile(currentUser, {
          displayName: trimmedName,
        });
      }

      if (emailChanged) {
        await updateEmail(currentUser, trimmedEmail);
      }

      if (passwordChanged) {
        await updatePassword(currentUser, profileForm.newPassword);
      }

      // Sync React user state with updated Firebase Auth user properties
      setUser({
        ...currentUser,
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
      });

      setProfileForm(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setProfileMessage({
        type: 'success',
        text: 'Admin profile updated successfully!'
      });
    } catch (err) {
      console.error(err);
      if (['auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
        setProfileErrors({ currentPassword: 'Current passcode is incorrect.' });
        scrollToFirstError(formEl);
      } else if (err.code === 'auth/email-already-in-use') {
        setProfileErrors({ email: 'That email address is already in use.' });
        scrollToFirstError(formEl);
      } else if (err.code === 'auth/invalid-email') {
        setProfileErrors({ email: 'Enter a valid email address.' });
        scrollToFirstError(formEl);
      } else if (err.code === 'auth/weak-password') {
        setProfileErrors({ newPassword: 'Passcode must be at least 6 characters.' });
        scrollToFirstError(formEl);
      } else if (err.code === 'auth/requires-recent-login') {
        setProfileErrors({ currentPassword: 'Enter your current passcode to verify your identity.' });
        scrollToFirstError(formEl);
      } else {
        setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Clinic CRUD ──
  const openAddClinic = () => {
    setClinicErrors({});
    setClinicModal({ open: true, mode: 'add', data: { ...BLANK_CLINIC }, id: null });
  };
  const openEditClinic = (clinic) => {
    setClinicErrors({});
    const closedDaysList = Array.isArray(clinic.closedDaysList) ? clinic.closedDaysList : [];
    const startDay = clinic.startDay || (Array.isArray(clinic.operatingDays) && clinic.operatingDays.length > 0 ? clinic.operatingDays[0] : 'Monday');
    const endDay = clinic.endDay || (Array.isArray(clinic.operatingDays) && clinic.operatingDays.length > 0 ? clinic.operatingDays[clinic.operatingDays.length - 1] : 'Friday');
    setClinicModal({
      open: true, mode: 'edit',
      data: {
        ...BLANK_CLINIC,
        ...clinic,
        name: clinic.name || '',
        address: clinic.address || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        latitude: clinic.latitude ?? '',
        longitude: clinic.longitude ?? '',
        closedDaysList,
        startDay,
        endDay,
      },
      id: clinic.id
    });
  };
  const closeClinicModal = () => {
    setClinicErrors({});
    setClinicModal(m => ({ ...m, open: false }));
  };

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const errs = {};
    const trimmedName = (clinicModal.data.name || '').trim();
    const trimmedAddress = (clinicModal.data.address || '').trim();
    const trimmedPhone = (clinicModal.data.phone || '').trim();
    const trimmedEmail = (clinicModal.data.email || '').trim();

    if (!trimmedName) {
      errs.name = 'Clinic name is required.';
    }
    if (!trimmedAddress) {
      errs.address = 'Address is required.';
    }
    if (!trimmedPhone) {
      errs.phone = 'Phone number is required.';
    } else if (!PHONE_REGEX.test(trimmedPhone)) {
      errs.phone = 'Enter a valid phone number.';
    }
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!clinicModal.data.openTime) {
      errs.openTime = 'Open time is required.';
    }
    if (!clinicModal.data.closeTime) {
      errs.closeTime = 'Close time is required.';
    } else if (clinicModal.data.openTime && clinicModal.data.closeTime <= clinicModal.data.openTime) {
      errs.closeTime = 'Close time must be after open time.';
    }

    if (clinicModal.data.hasSecondarySchedule) {
      if (!clinicModal.data.secondaryOpenTime) {
        errs.secondaryOpenTime = 'Open time is required.';
      }
      if (!clinicModal.data.secondaryCloseTime) {
        errs.secondaryCloseTime = 'Close time is required.';
      } else if (
        clinicModal.data.secondaryOpenTime &&
        clinicModal.data.secondaryCloseTime <= clinicModal.data.secondaryOpenTime
      ) {
        errs.secondaryCloseTime = 'Close time must be after open time.';
      }
    }

    const rawLat = String(clinicModal.data.latitude ?? '').trim();
    const rawLng = String(clinicModal.data.longitude ?? '').trim();
    const parsedLat = rawLat !== '' ? Number(rawLat) : null;
    const parsedLng = rawLng !== '' ? Number(rawLng) : null;

    if (rawLat === '') {
      errs.latitude = 'Latitude is required (click the map or enter a value).';
    } else if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      errs.latitude = 'Must be between -90 and 90.';
    }

    if (rawLng === '') {
      errs.longitude = 'Longitude is required (click the map or enter a value).';
    } else if (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      errs.longitude = 'Must be between -180 and 180.';
    }

    if (Object.keys(errs).length > 0) {
      setClinicErrors(errs);
      scrollToFirstError(formEl);
      return;
    }

    setClinicErrors({});
    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        address: trimmedAddress,
        phone: trimmedPhone,
        email: trimmedEmail,
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
        latitude: parsedLat,
        longitude: parsedLng,
        userId: user?.uid || auth.currentUser?.uid || null,
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
      setClinicErrors({ form: 'Failed to save clinic. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteClinic = (id, name) => {
    setDeleteError('');
    setDeleteModal({ open: true, type: 'clinic', id, title: name });
  };

  // ── Ads CRUD ──
  const openAddAd = () => {
    setAdErrors({});
    setAdModal({ open: true, mode: 'add', data: { ...BLANK_AD }, id: null });
  };
  const openEditAd = (ad) => {
    setAdErrors({});
    setAdModal({
      open: true,
      mode: 'edit',
      data: {
        ...BLANK_AD,
        ...ad,
        title: ad.title || '',
        description: ad.description || '',
        imageUrl: ad.imageUrl || '',
        targetUrl: ad.targetUrl || '',
        startDate: ad.startDate || '',
        endDate: ad.endDate || '',
        isActive: ad.isActive ?? true,
      },
      id: ad.id,
    });
  };
  const closeAdModal = () => {
    setAdErrors({});
    setAdImageUploading(false);
    setAdModal(m => ({ ...m, open: false }));
  };

  const handleAdImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAdErrors(prev => ({ ...prev, imageUrl: 'Please select a valid image file (PNG, JPG, WEBP).' }));
      return;
    }

    setAdErrors(prev => ({ ...prev, imageUrl: '' }));
    setAdImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const json = await res.json();
      if (json.secure_url) {
        setAdModal(m => ({ ...m, data: { ...m.data, imageUrl: json.secure_url } }));
      } else {
        setAdErrors(prev => ({ ...prev, imageUrl: 'Image upload failed. Please try again.' }));
      }
    } catch (err) {
      console.error(err);
      setAdErrors(prev => ({ ...prev, imageUrl: 'Failed to upload image to Cloudinary. Please try again.' }));
    } finally {
      setAdImageUploading(false);
    }
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const errs = {};
    const trimmedTitle = (adModal.data.title || '').trim();
    const trimmedDescription = (adModal.data.description || '').trim();
    const trimmedImage = (adModal.data.imageUrl || '').trim();
    const trimmedTarget = (adModal.data.targetUrl || '').trim();

    if (!trimmedTitle) {
      errs.title = 'Advertisement title is required.';
    }
    if (!trimmedDescription) {
      errs.description = 'Description is required.';
    }
    if (adImageUploading) {
      errs.imageUrl = 'Please wait for the image upload to finish.';
    } else if (!trimmedImage) {
      errs.imageUrl = 'Please upload an advertisement image.';
    }
    if (!trimmedTarget) {
      errs.targetUrl = 'Target URL is required.';
    } else if (!isValidHttpUrl(trimmedTarget)) {
      errs.targetUrl = 'Enter a valid URL starting with http:// or https://.';
    }
    if (!adModal.data.startDate) {
      errs.startDate = 'Start date is required.';
    }
    if (!adModal.data.endDate) {
      errs.endDate = 'End date is required.';
    } else if (adModal.data.startDate && adModal.data.endDate < adModal.data.startDate) {
      errs.endDate = 'End date cannot be earlier than start date.';
    }

    if (Object.keys(errs).length > 0) {
      setAdErrors(errs);
      scrollToFirstError(formEl);
      return;
    }

    setAdErrors({});
    setSaving(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDescription,
        imageUrl: trimmedImage,
        targetUrl: trimmedTarget,
        isActive: Boolean(adModal.data.isActive),
        startDate: adModal.data.startDate,
        endDate: adModal.data.endDate,
        userId: user?.uid || auth.currentUser?.uid || null,
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
      setAdErrors({ form: 'Failed to save advertisement. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteAd = (id, title) => {
    setDeleteError('');
    setDeleteModal({ open: true, type: 'ad', id, title });
  };

  // ── Delete Confirmation Handlers ──
  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteError('');
    setDeleteModal({ open: false, type: '', id: null, title: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      if (deleteModal.type === 'clinic') {
        await deleteDoc(doc(db, 'vetClinics', deleteModal.id));
      } else if (deleteModal.type === 'ad') {
        await deleteDoc(doc(db, 'ads', deleteModal.id));
      }
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      setDeleteError(`Failed to delete ${deleteModal.type === 'clinic' ? 'clinic' : 'advertisement'}. Please try again.`);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAdActive = async (id, current) => {
    try {
      await updateDoc(doc(db, 'ads', id), { isActive: !current, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const activeListLength = activeTab === 'clinics' ? filteredClinics.length : filteredAds.length;
  const maxPage = Math.max(1, Math.ceil(activeListLength / itemsPerPage));
  const safePage = Math.min(currentPage, maxPage);
  const paginatedClinics = filteredClinics.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
  const paginatedAds = filteredAds.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

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

          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-control ${loginFieldErrors.email ? 'input-error' : ''}`}
                placeholder="admin@pawscura.com"
                value={loginEmail}
                onChange={e => {
                  setLoginEmail(e.target.value);
                  if (loginFieldErrors.email) setLoginFieldErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {loginFieldErrors.email && <span className="field-error">{loginFieldErrors.email}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Passcode</label>
              <input
                type="password"
                className={`form-control ${loginFieldErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => {
                  setLoginPassword(e.target.value);
                  if (loginFieldErrors.password) setLoginFieldErrors(prev => ({ ...prev, password: '' }));
                }}
              />
              {loginFieldErrors.password && <span className="field-error">{loginFieldErrors.password}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={loginLoading}
              style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #794B35 0%, #D88D59 100%)', color: '#FFF8F1', border: 'none', borderRadius: 'var(--radius-md)' }}>
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const adminDisplayName = user.displayName || 'Admin';
  const adminInitial = (user.displayName || user.email || 'A').charAt(0).toUpperCase();

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
          <li>
            <div
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={openProfileTab}
            >
              <span className="nav-icon"><Icons.User /></span>
              <span>Admin Profile</span>
            </div>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div
            className="admin-profile-card"
            onClick={openProfileTab}
            title="Click to update admin profile"
          >
            <div className="admin-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt={adminDisplayName} />
              ) : (
                adminInitial
              )}
            </div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">{adminDisplayName}</span>
              <span className="admin-profile-email">{user.email}</span>
            </div>
          </div>

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
              {activeTab === 'profile' && 'Admin Profile Settings'}
            </h2>
            <p className="header-subtitle">
              {activeTab === 'clinics' && `${filteredClinics.length} clinic${filteredClinics.length !== 1 ? 's' : ''} listed`}
              {activeTab === 'ads' && `${filteredAds.length} advertisement${filteredAds.length !== 1 ? 's' : ''} · ${ads.filter(a => a.isActive).length} active`}
              {activeTab === 'profile' && 'Update your admin display name, email address, and security passcode'}
            </p>
          </div>

          {activeTab !== 'profile' && (
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
          )}
        </header>

        {/* ── VET CLINICS TAB ── */}
        {activeTab === 'clinics' && (
          <div className="panel" style={{ flex: 1 }}>
            {filteredClinics.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '80px 0', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
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
              <>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>Clinic Name</th>
                        <th style={{ width: '28%' }}>Address</th>
                        <th style={{ width: '15%' }}>Phone</th>
                        <th style={{ width: '21%' }}>Hours</th>
                        <th style={{ width: '170px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClinics.map(clinic => (
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
                <Pagination
                  currentPage={safePage}
                  totalItems={filteredClinics.length}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
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
              <>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Advertisement Details</th>
                        <th style={{ width: '11%' }}>Image URL</th>
                        <th style={{ width: '17%' }}>Target URL</th>
                        <th style={{ width: '17%' }}>Duration</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                        <th style={{ width: '170px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAds.map(ad => (
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
                          <td style={{ textAlign: 'center', width: '120px' }}>
                            <button
                              onClick={() => handleToggleAdActive(ad.id, ad.isActive)}
                              title={ad.isActive ? 'Click to deactivate' : 'Click to activate'}
                              style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '104px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', color: ad.isActive ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 700, fontSize: '12px', backgroundColor: ad.isActive ? 'var(--color-success-bg)' : 'var(--color-overlay)' }}
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
                <Pagination
                  currentPage={safePage}
                  totalItems={filteredAds.length}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        )}

        {/* ── ADMIN PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Current Profile Overview Card */}
            <div className="panel" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}>
              <div style={{
                width: '88px',
                height: '88px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #794B35 0%, #D88D59 100%)',
                color: '#FFF8F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '800',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                border: '3px solid var(--color-border)'
              }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={adminDisplayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  adminInitial
                )}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {adminDisplayName}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500', marginBottom: '16px' }}>
                {user.email}
              </p>

              <span className="badge badge-moderate" style={{ padding: '6px 14px', fontSize: '11px' }}>
                Admin
              </span>

              <div className="detail-divider" style={{ width: '100%', margin: '24px 0 16px 0' }} />

              <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Account UID</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '2px' }}>
                    {user.uid}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Portal Access</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600', marginTop: '2px' }}>
                    Full Read & Write (Clinics, Ads)
                  </div>
                </div>
              </div>
            </div>

            {/* Update Profile Form Panel */}
            <div className="panel" style={{ padding: '32px' }}>
              <h3 className="panel-title" style={{ marginBottom: '6px', fontSize: '18px' }}>Update Profile Information</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                Modify your admin profile details or change your login credentials below.
              </p>

              {profileMessage.text && (
                <div style={{
                  backgroundColor: profileMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  border: `1px solid ${profileMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: profileMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '600'
                }}>
                  {profileMessage.type === 'success' ? <Icons.Check /> : <Icons.Alert />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input
                      type="text"
                      className={`form-control ${profileErrors.displayName ? 'input-error' : ''}`}
                      placeholder="e.g. PawsCura Admin"
                      value={profileForm.displayName}
                      onChange={e => {
                        setProfileForm(f => ({ ...f, displayName: e.target.value }));
                        if (profileErrors.displayName) setProfileErrors(prev => ({ ...prev, displayName: '' }));
                      }}
                    />
                    {profileErrors.displayName && <span className="field-error">{profileErrors.displayName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className={`form-control ${profileErrors.email ? 'input-error' : ''}`}
                      placeholder="admin@pawscura.com"
                      value={profileForm.email}
                      onChange={e => {
                        setProfileForm(f => ({ ...f, email: e.target.value }));
                        if (profileErrors.email) setProfileErrors(prev => ({ ...prev, email: '' }));
                      }}
                    />
                    {profileErrors.email && <span className="field-error">{profileErrors.email}</span>}
                  </div>
                </div>

                <div className="detail-divider" style={{ margin: '24px 0' }} />

                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Security & Passcode
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  Leave the new passcode fields blank if you do not wish to change your passcode. Your current passcode is required when changing your email or passcode.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">New Passcode</label>
                    <input
                      type="password"
                      className={`form-control ${profileErrors.newPassword ? 'input-error' : ''}`}
                      placeholder="New passcode (min. 6 chars)"
                      value={profileForm.newPassword}
                      onChange={e => {
                        setProfileForm(f => ({ ...f, newPassword: e.target.value }));
                        if (profileErrors.newPassword) setProfileErrors(prev => ({ ...prev, newPassword: '' }));
                      }}
                    />
                    {profileErrors.newPassword && <span className="field-error">{profileErrors.newPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Passcode</label>
                    <input
                      type="password"
                      className={`form-control ${profileErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter new passcode"
                      value={profileForm.confirmPassword}
                      onChange={e => {
                        setProfileForm(f => ({ ...f, confirmPassword: e.target.value }));
                        if (profileErrors.confirmPassword) setProfileErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                    />
                    {profileErrors.confirmPassword && <span className="field-error">{profileErrors.confirmPassword}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      Current Passcode <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--color-text-muted)' }}>(required to change email or passcode)</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${profileErrors.currentPassword ? 'input-error' : ''}`}
                      placeholder="Enter your current passcode to verify changes"
                      value={profileForm.currentPassword}
                      onChange={e => {
                        setProfileForm(f => ({ ...f, currentPassword: e.target.value }));
                        if (profileErrors.currentPassword) setProfileErrors(prev => ({ ...prev, currentPassword: '' }));
                      }}
                    />
                    {profileErrors.currentPassword && <span className="field-error">{profileErrors.currentPassword}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" disabled={profileSaving} style={{ minWidth: '150px' }}>
                    {profileSaving ? 'Updating...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════
          CLINIC MODAL — Add / Edit
      ══════════════════════════════════════════════════════════ */}
      {clinicModal.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={closeClinicModal}><Icons.Close /></button>
            <h3 className="modal-title">
              {clinicModal.mode === 'add' ? 'Add New Veterinary Clinic' : 'Edit Clinic Information'}
            </h3>

            <form onSubmit={handleSaveClinic} noValidate>
              {clinicErrors.form && <div className="field-error" style={{ marginBottom: '12px' }}>{clinicErrors.form}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Clinic Name *</label>
                  <input
                    type="text"
                    className={`form-control ${clinicErrors.name ? 'input-error' : ''}`}
                    placeholder="e.g. PetCare Animal Hospital"
                    value={clinicModal.data.name}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }));
                      if (clinicErrors.name) setClinicErrors(prev => ({ ...prev, name: '' }));
                    }}
                  />
                  {clinicErrors.name && <span className="field-error">{clinicErrors.name}</span>}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className={`form-control ${clinicErrors.address ? 'input-error' : ''}`}
                    placeholder="e.g. 123 Veterinary Lane, Manila"
                    value={clinicModal.data.address}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, address: e.target.value } }));
                      if (clinicErrors.address) setClinicErrors(prev => ({ ...prev, address: '' }));
                    }}
                  />
                  {clinicErrors.address && <span className="field-error">{clinicErrors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className={`form-control ${clinicErrors.phone ? 'input-error' : ''}`}
                    placeholder="+63 123 123 1234"
                    value={clinicModal.data.phone}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, phone: e.target.value } }));
                      if (clinicErrors.phone) setClinicErrors(prev => ({ ...prev, phone: '' }));
                    }}
                  />
                  {clinicErrors.phone && <span className="field-error">{clinicErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${clinicErrors.email ? 'input-error' : ''}`}
                    placeholder="clinic@example.com"
                    value={clinicModal.data.email}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, email: e.target.value } }));
                      if (clinicErrors.email) setClinicErrors(prev => ({ ...prev, email: '' }));
                    }}
                  />
                  {clinicErrors.email && <span className="field-error">{clinicErrors.email}</span>}
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
                  <label className="form-label">Open Time *</label>
                  <input
                    type="time"
                    className={`form-control ${clinicErrors.openTime ? 'input-error' : ''}`}
                    value={clinicModal.data.openTime}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, openTime: e.target.value } }));
                      if (clinicErrors.openTime || clinicErrors.closeTime) {
                        setClinicErrors(prev => ({ ...prev, openTime: '', closeTime: '' }));
                      }
                    }}
                  />
                  {clinicErrors.openTime && <span className="field-error">{clinicErrors.openTime}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Close Time *</label>
                  <input
                    type="time"
                    className={`form-control ${clinicErrors.closeTime ? 'input-error' : ''}`}
                    value={clinicModal.data.closeTime}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, closeTime: e.target.value } }));
                      if (clinicErrors.closeTime) setClinicErrors(prev => ({ ...prev, closeTime: '' }));
                    }}
                  />
                  {clinicErrors.closeTime && <span className="field-error">{clinicErrors.closeTime}</span>}
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
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Open Time *</label>
                          <input
                            type="time"
                            className={`form-control ${clinicErrors.secondaryOpenTime ? 'input-error' : ''}`}
                            value={clinicModal.data.secondaryOpenTime || '08:00'}
                            onChange={e => {
                              setClinicModal(m => ({ ...m, data: { ...m.data, secondaryOpenTime: e.target.value } }));
                              if (clinicErrors.secondaryOpenTime || clinicErrors.secondaryCloseTime) {
                                setClinicErrors(prev => ({ ...prev, secondaryOpenTime: '', secondaryCloseTime: '' }));
                              }
                            }}
                          />
                          {clinicErrors.secondaryOpenTime && <span className="field-error">{clinicErrors.secondaryOpenTime}</span>}
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Close Time *</label>
                          <input
                            type="time"
                            className={`form-control ${clinicErrors.secondaryCloseTime ? 'input-error' : ''}`}
                            value={clinicModal.data.secondaryCloseTime || '12:00'}
                            onChange={e => {
                              setClinicModal(m => ({ ...m, data: { ...m.data, secondaryCloseTime: e.target.value } }));
                              if (clinicErrors.secondaryCloseTime) {
                                setClinicErrors(prev => ({ ...prev, secondaryCloseTime: '' }));
                              }
                            }}
                          />
                          {clinicErrors.secondaryCloseTime && <span className="field-error">{clinicErrors.secondaryCloseTime}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hours preview */}
                {clinicModal.data.startDay && (
                  <div style={{ gridColumn: '1 / -1', padding: '10px 14px', backgroundColor: 'var(--color-brand-transparent)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-strong)', fontSize: '13px', color: 'var(--color-brand)', fontWeight: 600 }}>
                    📅 {buildHoursString(clinicModal.data)}
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Pin Location on Map *</label>
                  <MapPicker
                    latitude={clinicModal.data.latitude}
                    longitude={clinicModal.data.longitude}
                    onChange={(lat, lng) => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, latitude: lat, longitude: lng } }));
                      if (clinicErrors.latitude || clinicErrors.longitude) {
                        setClinicErrors(prev => ({ ...prev, latitude: '', longitude: '' }));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    className={`form-control ${clinicErrors.latitude ? 'input-error' : ''}`}
                    placeholder="e.g. 14.5995"
                    value={clinicModal.data.latitude}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, latitude: e.target.value } }));
                      if (clinicErrors.latitude) setClinicErrors(prev => ({ ...prev, latitude: '' }));
                    }}
                  />
                  {clinicErrors.latitude && <span className="field-error">{clinicErrors.latitude}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    className={`form-control ${clinicErrors.longitude ? 'input-error' : ''}`}
                    placeholder="e.g. 120.9842"
                    value={clinicModal.data.longitude}
                    onChange={e => {
                      setClinicModal(m => ({ ...m, data: { ...m.data, longitude: e.target.value } }));
                      if (clinicErrors.longitude) setClinicErrors(prev => ({ ...prev, longitude: '' }));
                    }}
                  />
                  {clinicErrors.longitude && <span className="field-error">{clinicErrors.longitude}</span>}
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <button className="modal-close" onClick={closeAdModal}><Icons.Close /></button>
            <h3 className="modal-title">
              {adModal.mode === 'add' ? 'Create New Advertisement' : 'Edit Advertisement'}
            </h3>

            <form onSubmit={handleSaveAd} noValidate>
              {adErrors.form && <div className="field-error" style={{ marginBottom: '12px' }}>{adErrors.form}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Advertisement Title *</label>
                  <input
                    type="text"
                    className={`form-control ${adErrors.title ? 'input-error' : ''}`}
                    placeholder="e.g. Summer Pet Health Promo"
                    value={adModal.data.title}
                    onChange={e => {
                      setAdModal(m => ({ ...m, data: { ...m.data, title: e.target.value } }));
                      if (adErrors.title) setAdErrors(prev => ({ ...prev, title: '' }));
                    }}
                  />
                  {adErrors.title && <span className="field-error">{adErrors.title}</span>}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${adErrors.description ? 'input-error' : ''}`}
                    rows={3}
                    placeholder="Describe what the advertisement is about..."
                    style={{ resize: 'none', fontFamily: 'var(--font-sans)' }}
                    value={adModal.data.description}
                    onChange={e => {
                      setAdModal(m => ({ ...m, data: { ...m.data, description: e.target.value } }));
                      if (adErrors.description) setAdErrors(prev => ({ ...prev, description: '' }));
                    }}
                  />
                  {adErrors.description && <span className="field-error">{adErrors.description}</span>}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Advertisement Image *</label>
                  <label
                    className={`file-upload-box ${adErrors.imageUrl ? 'input-error' : ''}`}
                    tabIndex={0}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      disabled={adImageUploading}
                      onChange={handleAdImageUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      {adModal.data.imageUrl && !adImageUploading ? (
                        <img
                          src={adModal.data.imageUrl}
                          alt="Ad preview"
                          className="file-upload-thumb"
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-overlay)', color: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icons.Image />
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {adImageUploading
                            ? 'Uploading image to Cloudinary...'
                            : adModal.data.imageUrl
                            ? 'Image uploaded and ready'
                            : 'Select an image file to upload'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                          {adImageUploading
                            ? 'Please wait a moment'
                            : adModal.data.imageUrl
                            ? 'Click to replace with a different image'
                            : 'Supports PNG, JPG, WEBP'}
                        </span>
                      </div>
                    </div>
                    <span className="file-upload-btn">
                      <Icons.Image />
                      {adImageUploading ? 'Uploading...' : adModal.data.imageUrl ? 'Change Image' : 'Choose Image'}
                    </span>
                  </label>
                  {adErrors.imageUrl && <span className="field-error">{adErrors.imageUrl}</span>}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Target URL * <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--color-text-muted)' }}>(where it links to)</span></label>
                  <input
                    type="url"
                    className={`form-control ${adErrors.targetUrl ? 'input-error' : ''}`}
                    placeholder="https://example.com/promo"
                    value={adModal.data.targetUrl}
                    onChange={e => {
                      setAdModal(m => ({ ...m, data: { ...m.data, targetUrl: e.target.value } }));
                      if (adErrors.targetUrl) setAdErrors(prev => ({ ...prev, targetUrl: '' }));
                    }}
                  />
                  {adErrors.targetUrl && <span className="field-error">{adErrors.targetUrl}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className={`form-control ${adErrors.startDate ? 'input-error' : ''}`}
                    value={adModal.data.startDate}
                    onChange={e => {
                      setAdModal(m => ({ ...m, data: { ...m.data, startDate: e.target.value } }));
                      if (adErrors.startDate || adErrors.endDate) {
                        setAdErrors(prev => ({ ...prev, startDate: '', endDate: '' }));
                      }
                    }}
                  />
                  {adErrors.startDate && <span className="field-error">{adErrors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className={`form-control ${adErrors.endDate ? 'input-error' : ''}`}
                    value={adModal.data.endDate}
                    onChange={e => {
                      setAdModal(m => ({ ...m, data: { ...m.data, endDate: e.target.value } }));
                      if (adErrors.endDate) setAdErrors(prev => ({ ...prev, endDate: '' }));
                    }}
                  />
                  {adErrors.endDate && <span className="field-error">{adErrors.endDate}</span>}
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
            {deleteError && <div className="field-error" style={{ marginBottom: '16px' }}>{deleteError}</div>}

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
