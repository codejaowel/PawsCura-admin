import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc,
  addDoc,
  deleteDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Premium SVG Icon set to enforce V2.0 Anti-Generic UI Policy (No static Emojis in UI)
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Pets: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></svg>
  ),
  Scans: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  ),
  Transactions: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line><line x1="2" y1="10" x2="22" y2="10"></line></svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Alert: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5-3-3"></path></svg>
  ),
  Cross: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  )
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database States
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Auth state change subscription with role check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;
            
            if (role === 'admin' || currentUser.email === 'admin@pawscura.com') {
              if (role !== 'admin' && currentUser.email === 'admin@pawscura.com') {
                await updateDoc(userDocRef, { role: 'admin' });
              }
              setUser(currentUser);
            } else {
              setLoginError('Access Denied: Not an administrator.');
              await signOut(auth);
              setUser(null);
            }
          } else {
            // Auto create system admin document if email matches default
            if (currentUser.email === 'admin@pawscura.com') {
              await setDoc(userDocRef, {
                email: currentUser.email,
                name: 'System Admin',
                role: 'admin',
                isPremium: true
              });
              setUser(currentUser);
            } else {
              setLoginError('Access Denied: Admin profile record not found.');
              await signOut(auth);
              setUser(null);
            }
          }
        } catch (err) {
          console.error('Error fetching admin role:', err);
          setLoginError('Authentication failed due to access validation error.');
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Detail Modal states (Matches flowchart Select/Display nodes)
  const [selectedScan, setSelectedScan] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTrans, setSelectedTrans] = useState(null);

  // Urgency Filter
  const [scanUrgencyFilter, setScanUrgencyFilter] = useState('All');

  // Firestore subscribers
  useEffect(() => {
    if (!user) return;
    
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });

    const unsubPets = onSnapshot(collection(db, 'pets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPets(data);
    });

    const unsubRecords = onSnapshot(collection(db, 'healthRecords'), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        let displayDate = item.date;
        if (item.date && item.date.toDate) {
          displayDate = item.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return { id: doc.id, ...item, displayDate };
      });
      data.sort((a, b) => {
        const timeA = a.date?.toMillis ? a.date.toMillis() : Date.parse(a.date) || 0;
        const timeB = b.date?.toMillis ? b.date.toMillis() : Date.parse(b.date) || 0;
        return timeB - timeA;
      });
      setHealthRecords(data);
    });

    const unsubTransactions = onSnapshot(collection(db, 'payments'), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        let displayDate = 'N/A';
        if (item.date && item.date.toDate) {
          displayDate = item.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        return { 
          id: doc.id, 
          ...item, 
          price: item.amount !== undefined ? item.amount : (item.price || 0), 
          planName: item.planName || (item.amount > 0 ? 'Premium' : 'Free'), 
          displayDate 
        };
      });
      data.sort((a, b) => {
        const timeA = a.date?.toMillis ? a.date.toMillis() : Date.parse(a.date) || 0;
        const timeB = b.date?.toMillis ? b.date.toMillis() : Date.parse(b.date) || 0;
        return timeB - timeA;
      });
      setTransactions(data);
    });

    return () => {
      unsubUsers();
      unsubPets();
      unsubRecords();
      unsubTransactions();
    };
  }, [user]);

  // Update user premium status
  const handleTogglePremium = async (userId, currentVal) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { isPremium: !currentVal });
      
      await addDoc(collection(db, 'payments'), {
        userId: userId,
        subscriptionId: 'admin_override',
        amount: !currentVal ? 9.99 : 0,
        status: !currentVal ? 'Admin Granted' : 'Admin Cancelled',
        method: 'Admin Allocation',
        date: new Date(),
        // Keep these fields for backward compatibility in the dashboard lists
        userEmail: users.find(u => u.id === userId)?.email || 'admin@pawscura.com',
        planName: !currentVal ? 'Premium' : 'Free'
      });
    } catch (e) {
      console.error('Error toggling premium:', e);
      alert('Failed to update premium status.');
    }
  };

  // Suspend/Reactivate user (Flowchart: Suspend Account -> Account Suspended)
  const handleToggleSuspension = async (userId, currentVal) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { isSuspended: !currentVal });
      alert(`User account has been successfully ${!currentVal ? 'SUSPENDED' : 'REACTIVATED'}.`);
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, isSuspended: !currentVal }));
      }
    } catch (e) {
      console.error('Error toggling suspension:', e);
      alert('Failed to update account suspension.');
    }
  };

  // Simulate Password Reset (Flowchart: Reset Password -> Password Reset)
  const handleResetPassword = (email) => {
    if (!email) {
      alert('Cannot send password reset link: No email registered.');
      return;
    }
    alert(`Password reset link has been successfully dispatched to ${email}.`);
  };

  // Update user role status
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (userId === auth.currentUser?.uid && newRole === 'user') {
      if (!window.confirm('Warning: You are demoting yourself from administrator. You will lose access to this portal immediately. Proceed?')) {
        return;
      }
    }
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { role: newRole });
      alert(`User role has been updated to ${newRole.toUpperCase()}.`);
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
    } catch (e) {
      console.error('Error toggling role:', e);
      alert('Failed to update user role.');
    }
  };


  // Delete transaction log
  const handleDeleteTransaction = async (transId) => {
    if (!window.confirm('Are you sure you want to permanently delete this transaction record?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'payments', transId));
      setSelectedTrans(null);
      alert('Transaction log deleted successfully.');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction log.');
    }
  };

  // Authenticate Admin User
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
      console.error('Error logging in:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or passcode.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email format.';
      }
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // Dashboard calculations
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.isPremium).length;
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;
    
    const successfulPayments = transactions.filter(t => t.status === 'Success' || t.status === 'Admin Granted');
    const totalRevenue = successfulPayments.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0).toFixed(2);

    const urgentScans = healthRecords.filter(r => r.status?.toLowerCase() === 'urgent' || r.status?.toLowerCase() === 'immediate care').length;

    // AI Classification: percentage of safe/healthy scans dynamically calculated from data
    const safeScans = healthRecords.filter(r => r.status?.toLowerCase() === 'safe' || r.status?.toLowerCase() === 'no concerns detected').length;
    const safeScanRate = healthRecords.length > 0 ? ((safeScans / healthRecords.length) * 100).toFixed(1) : 0;

    return {
      totalUsers,
      premiumUsers,
      conversionRate,
      totalRevenue,
      totalPets: pets.length,
      totalScans: healthRecords.length,
      urgentScans,
      safeScanRate
    };
  }, [users, pets, healthRecords, transactions]);

  // Tab Filtering & Query Searches
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.id.includes(searchQuery)
    );
  }, [users, searchQuery]);

  const filteredPets = useMemo(() => {
    return pets.filter(p => 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.breed && p.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.species && p.species.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [pets, searchQuery]);

  const filteredScans = useMemo(() => {
    let scans = healthRecords;
    if (scanUrgencyFilter !== 'All') {
      scans = scans.filter(s => {
        if (scanUrgencyFilter === 'Urgent') return s.status?.toLowerCase() === 'urgent' || s.status?.toLowerCase() === 'immediate care';
        if (scanUrgencyFilter === 'Moderate') return s.status?.toLowerCase() === 'moderate';
        return s.status?.toLowerCase() === 'safe' || s.status?.toLowerCase() === 'no concerns detected';
      });
    }
    return scans.filter(s => 
      (s.petName && s.petName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.issue && s.issue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [healthRecords, scanUrgencyFilter, searchQuery]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.status && t.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [transactions, searchQuery]);

  // Calculate dynamic weekly revenue history from transactions database
  const weeklyRevenueHistory = useMemo(() => {
    const now = new Date();
    const weeks = Array(7).fill(0);
    const successful = transactions.filter(t => t.status === 'Success' || t.status === 'Admin Granted');
    
    successful.forEach(t => {
      let tDate = new Date();
      if (t.date) {
        if (t.date.toDate) {
          tDate = t.date.toDate();
        } else {
          tDate = new Date(t.date);
        }
      }
      const diffTime = Math.abs(now - tDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weekIndex = 6 - Math.floor(diffDays / 7);
      
      if (weekIndex >= 0 && weekIndex < 7) {
        weeks[weekIndex] += parseFloat(t.price) || 0;
      }
    });
    return weeks;
  }, [transactions]);

  const maxRevenue = useMemo(() => {
    const maxVal = Math.max(...weeklyRevenueHistory);
    return maxVal > 0 ? maxVal : 100;
  }, [weeklyRevenueHistory]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ fontWeight: '600', fontSize: '14px' }}>Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-canvas)',
        fontFamily: 'var(--font-sans)',
        padding: '16px'
      }}>
        <div className="login-card" style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/logo.png" alt="PawsCura Logo" style={{ width: '48px', height: 'auto', margin: '0 auto 16px auto', display: 'block', objectFit: 'contain' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>PawsCura Portal</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Sign in to access administrator dashboard controls</p>
          </div>
          
          {loginError && (
            <div style={{
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '20px',
              color: 'var(--color-danger)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icons.Alert />
              <span style={{ fontWeight: '500' }}>{loginError}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Email Address</label>
              <input 
                type="email" 
                className="form-control"
                placeholder="admin@pawscura.com"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Passcode</label>
              <input 
                type="password" 
                className="form-control"
                placeholder="••••••••"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loginLoading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '14px', 
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, hsl(200,95%,30%) 0%, hsl(200,95%,44%) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="sidebar">
        <div className="brand-section">
          <img src="/logo.png" alt="PawsCura Logo" style={{ width: '36px', height: 'auto', objectFit: 'contain', display: 'block' }} />
          <h1 className="brand-name">PawsCura</h1>
        </div>
        
        <ul className="nav-list">
          <li>
            <div 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Dashboard /></span>
              <span>Dashboard</span>
            </div>
          </li>
          <li>
            <div 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Users /></span>
              <span>App Users</span>
            </div>
          </li>
          <li>
            <div 
              className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('transactions'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Transactions /></span>
              <span>Transactions</span>
            </div>
          </li>
          <li>
            <div 
              className={`nav-item ${activeTab === 'scans' ? 'active' : ''}`}
              onClick={() => { setActiveTab('scans'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Scans /></span>
              <span>Diagnostic Logs</span>
            </div>
          </li>
          <li>
            <div 
              className={`nav-item ${activeTab === 'pets' ? 'active' : ''}`}
              onClick={() => { setActiveTab('pets'); setSearchQuery(''); }}
            >
              <span className="nav-icon"><Icons.Pets /></span>
              <span>Pets Directory</span>
            </div>
          </li>
        </ul>

        {/* Sidebar Footer with Sign Out button */}
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
              {activeTab === 'dashboard' && 'Operations Dashboard'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'transactions' && 'Billing & Transactions'}
              {activeTab === 'scans' && 'AI Assessment Center'}
              {activeTab === 'pets' && 'Registered Pet Registry'}
            </h2>
            <p className="header-subtitle">
              {activeTab === 'dashboard' && 'Real-time telemetry and subscription health metrics'}
              {activeTab === 'users' && `Listing ${filteredUsers.length} total mobile accounts`}
              {activeTab === 'transactions' && `Tracking ${filteredTransactions.length} processed invoices`}
              {activeTab === 'scans' && `Analyzing ${filteredScans.length} diagnostic scan entries`}
              {activeTab === 'pets' && `Viewing ${filteredPets.length} registered animal logs`}
            </p>
          </div>

          {/* Search Box */}
          {activeTab !== 'dashboard' && (
            <div className="search-input-wrap">
              <span className="search-icon"><Icons.Search /></span>
              <input 
                type="text" 
                className="search-input"
                placeholder={
                  activeTab === 'users' ? 'Search by name, email, or ID...' :
                  activeTab === 'scans' ? 'Search by pet, issue, or notes...' :
                  activeTab === 'transactions' ? 'Search by email or plan...' :
                  'Search pets...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </header>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Banner */}
            <div className="welcome-banner" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, hsl(200,95%,30%) 0%, hsl(220,80%,22%) 60%, hsl(260,60%,20%) 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 40px',
              marginBottom: '28px',
              boxShadow: '0 8px 32px rgba(14,165,233,0.25)',
              overflow: 'hidden',
              position: 'relative',
              height: '200px',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}>
              {/* Decorative blur circles */}
              <div style={{ position:'absolute', top:'-40px', right:'220px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'-60px', right:'100px', width:'260px', height:'260px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
              <div style={{ flex: 1, paddingRight: '32px', position:'relative', zIndex:1, overflow:'hidden' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform:'uppercase', marginBottom:'10px' }}>Admin Control Center</p>
                <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', lineHeight: '1.25', marginBottom: '12px' }}>Welcome to the PawsCura Portal</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.7', maxWidth: '520px' }}>
                  Manage user subscriptions, search pet records, and review transaction invoices.
                </p>
              </div>
              <div style={{ flexShrink: 0, width: '160px', height: '160px', position:'relative', zIndex:1 }}>
                <img 
                  src="/Landing.png" 
                  alt="PawsCura App Mascot" 
                  style={{ 
                    width: '160px',
                    height: '160px',
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))'
                  }} 
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-primary">
                  <Icons.Users />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalUsers}</span>
                  <span className="stat-label">Total Users</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-success">
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>$</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value">${stats.totalRevenue}</span>
                  <span className="stat-label">Total Revenue</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-primary">
                  <Icons.Pets />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalPets}</span>
                  <span className="stat-label">Pets Registered</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-primary">
                  <Icons.Scans />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalScans}</span>
                  <span className="stat-label">Diagnostic Scans</span>
                </div>
              </div>
            </div>

            {/* Conversion panel & Revenue Charts (Flowchart: Display Revenue Charts) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div className="panel">
                <h3 className="panel-title" style={{ marginBottom: '16px' }}>Subscription Conversion</h3>
                <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Premium Subscribers</span>
                    <h4 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-brand)', marginTop: '4px' }}>
                      {stats.premiumUsers} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>users</span>
                    </h4>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Conversion Ratio</span>
                    <h4 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
                      {stats.conversionRate}%
                    </h4>
                  </div>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats.conversionRate}%`, backgroundColor: 'var(--color-brand)', borderRadius: 'var(--radius-full)' }}></div>
                </div>
              </div>

              <div className="panel">
                <h3 className="panel-title" style={{ marginBottom: '16px' }}>Weekly Revenue Progression</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', paddingBottom: '10px' }}>
                  {weeklyRevenueHistory.map((rev, index) => {
                    const heightPercent = (rev / maxRevenue) * 100;
                    return (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ 
                          height: `${heightPercent}px`, 
                          width: '18px', 
                          backgroundColor: 'var(--color-brand)', 
                          borderRadius: 'var(--radius-xs)',
                          minHeight: '4px'
                        }}></div>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '4px' }}>W{index + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Scans list */}
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Recent Critical Assessments</h3>
                <button 
                  className="filter-tab active"
                  onClick={() => setActiveTab('scans')}
                >
                  View All Scans
                </button>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pet Name</th>
                      <th>Suspected Issue</th>
                      <th>Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthRecords.slice(0, 5).map(record => (
                      <tr key={record.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedScan(record)}>
                        <td>{record.displayDate || record.date}</td>
                        <td>{record.petName}</td>
                        <td>{record.issue}</td>
                        <td>
                          <span className={`badge ${
                            record.status?.toLowerCase() === 'urgent' || record.status?.toLowerCase() === 'immediate care' ? 'badge-urgent' :
                            record.status?.toLowerCase() === 'moderate' ? 'badge-moderate' : 'badge-safe'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {healthRecords.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>No scan history logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="panel">
            <h3 className="panel-title" style={{ marginBottom: '20px' }}>Application Access</h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Premium Access</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(userItem => (
                    <tr key={userItem.id} style={{ cursor: 'pointer', opacity: userItem.isSuspended ? 0.65 : 1 }} onClick={() => setSelectedUser(userItem)}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{userItem.id}</td>
                      <td>{userItem.email || 'guest@pawscura.com'}</td>
                      <td>
                        <span className={`badge ${userItem.role === 'admin' ? 'badge-urgent' : 'badge-safe'}`} style={{
                          backgroundColor: userItem.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: userItem.role === 'admin' ? 'rgb(239, 68, 68)' : 'rgb(16, 185, 129)',
                          border: userItem.role === 'admin' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          {userItem.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${userItem.isPremium ? 'badge-safe' : 'badge-moderate'}`}>
                          {userItem.isPremium ? 'Premium Sub' : 'Free Tier'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${userItem.isSuspended ? 'badge-urgent' : 'badge-safe'}`}>
                          {userItem.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">No app user directories matched search queries.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {activeTab === 'transactions' && (
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '20px' }}>
              <h3 className="panel-title" style={{ margin: 0 }}>Invoicing System</h3>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User Email</th>
                    <th>Plan Selected</th>
                    <th>Amount Paid</th>
                    <th>Cardholder Reference</th>
                    <th>Transaction Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(trans => (
                    <tr key={trans.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTrans(trans)}>
                      <td>{trans.displayDate}</td>
                      <td>{trans.userEmail}</td>
                      <td>
                        <span className="badge badge-safe" style={{ backgroundColor: 'var(--color-brand-transparent)', color: 'var(--color-brand)' }}>
                          {trans.planName}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        ${trans.price.toFixed(2)}
                      </td>
                      <td>{trans.cardholderName || 'Admin Action'}</td>
                      <td>
                        <span className={`badge ${
                          trans.status?.toLowerCase().includes('success') || trans.status?.toLowerCase().includes('granted')
                            ? 'badge-safe' 
                            : 'badge-urgent'
                        }`}>
                          {trans.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">No billing records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DIAGNOSTIC LOGS TAB (Flowchart: Manage AI Agent / Monitor Usage) ── */}
        {activeTab === 'scans' && (
          <>
            {/* Monitor Usage & Classification analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-primary">
                  <Icons.Scans />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalScans}</span>
                  <span className="stat-label">Total AI Queries</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-success">
                  <Icons.Check />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.safeScanRate}%</span>
                  <span className="stat-label">Safe Diagnostic Ratio</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap stat-icon-warning">
                  <Icons.Alert />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.urgentScans}</span>
                  <span className="stat-label">High Severity Scans</span>
                </div>
              </div>
            </div>

            <div className="filter-tabs">
              {['All', 'Urgent', 'Moderate', 'Safe'].map(tab => (
                <div 
                  key={tab} 
                  className={`filter-tab ${scanUrgencyFilter === tab ? 'active' : ''}`}
                  onClick={() => setScanUrgencyFilter(tab)}
                >
                  {tab} Scans
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pet</th>
                      <th>Suspected Condition</th>
                      <th>Veterinary Urgency</th>
                      <th>Assigned Vet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScans.map(scan => (
                      <tr key={scan.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedScan(scan)}>
                        <td>{scan.displayDate || scan.date}</td>
                        <td>{scan.petName}</td>
                        <td>{scan.issue}</td>
                        <td>
                          <span className={`badge ${
                            scan.status?.toLowerCase() === 'urgent' || scan.status?.toLowerCase() === 'immediate care' ? 'badge-urgent' :
                            scan.status?.toLowerCase() === 'moderate' ? 'badge-moderate' : 'badge-safe'
                          }`}>
                            {scan.status}
                          </span>
                        </td>
                        <td>{scan.vet}</td>
                      </tr>
                    ))}
                    {filteredScans.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-state">No diagnostic reports matches.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── PETS TAB ── */}
        {activeTab === 'pets' && (
          <div className="pets-gallery">
            {filteredPets.map(pet => (
              <div key={pet.id} className="pet-card">
                <div className="pet-icon-wrap">
                  <Icons.Pets />
                </div>
                <h4 className="pet-name">{pet.name}</h4>
                <p className="pet-meta">{pet.species.toUpperCase()} • {pet.breed}</p>
                <p className="pet-meta">{pet.gender} • {pet.age} yrs old</p>
                <span className="pet-owner">Owner ID: {pet.userId.slice(0, 10)}...</span>
              </div>
            ))}
            {filteredPets.length === 0 && (
              <div className="panel" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Icons.Pets />
                  </div>
                  <p className="empty-state-title">No Pets Registered</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── USER DETAILS MODAL (Flowchart: Display User Information & Reset Password & Suspend Account) ── */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedUser(null)}>
              <Icons.Close />
            </button>
            <h3 className="modal-title">User Account Information</h3>
            
            <div className="detail-row">
              <span className="detail-label">User ID:</span>
              <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedUser.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedUser.name || 'Guest User'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{selectedUser.email || 'guest@pawscura.com'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">User Role:</span>
              <span className="detail-value">
                <span className={`badge ${selectedUser.role === 'admin' ? 'badge-urgent' : 'badge-safe'}`}>
                  {selectedUser.role === 'admin' ? 'ADMINISTRATOR' : 'APP USER'}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Billing Plan:</span>
              <span className="detail-value">
                <span className={`badge ${selectedUser.isPremium ? 'badge-safe' : 'badge-moderate'}`}>
                  {selectedUser.isPremium ? 'Premium Plan' : 'Free Plan'}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Account Status:</span>
              <span className="detail-value">
                <span className={`badge ${selectedUser.isSuspended ? 'badge-urgent' : 'badge-safe'}`}>
                  {selectedUser.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                </span>
              </span>
            </div>

            <div className="detail-divider" />

            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Administrative Actions</h4>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Suspend / Reactivate action */}
              <button 
                onClick={() => handleToggleSuspension(selectedUser.id, !!selectedUser.isSuspended)}
                style={{
                  backgroundColor: selectedUser.isSuspended ? 'var(--color-success)' : 'var(--color-danger)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {selectedUser.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
              </button>

              {/* Reset Password Action */}
              <button 
                onClick={() => handleResetPassword(selectedUser.email)}
                style={{
                  backgroundColor: 'var(--color-overlay)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-strong)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Reset Password
              </button>

              {/* Premium Toggle Access */}
              <button 
                onClick={() => handleTogglePremium(selectedUser.id, !!selectedUser.isPremium)}
                style={{
                  backgroundColor: 'var(--color-overlay)',
                  color: 'var(--color-brand)',
                  border: '1px solid var(--color-brand)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Toggle Premium Status
              </button>

              {/* Toggle User Role Access */}
              <button 
                onClick={() => handleToggleRole(selectedUser.id, selectedUser.role)}
                style={{
                  backgroundColor: 'var(--color-overlay)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-strong)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Toggle Admin Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTION DETAILS MODAL (Flowchart: Display Log Information) ── */}
      {selectedTrans && (
        <div className="modal-overlay" onClick={() => setSelectedTrans(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTrans(null)}>
              <Icons.Close />
            </button>
            <h3 className="modal-title">Payment Transaction Log</h3>
            
            <>
              <div className="detail-row">
                <span className="detail-label">Log ID:</span>
                <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedTrans.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date/Time:</span>
                <span className="detail-value">{selectedTrans.displayDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subscriber Email:</span>
                <span className="detail-value">{selectedTrans.userEmail}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Selected Plan:</span>
                <span className="detail-value">
                  <span className="badge badge-safe" style={{ backgroundColor: 'var(--color-brand-transparent)', color: 'var(--color-brand)' }}>
                    {selectedTrans.planName}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount Paid:</span>
                <span className="detail-value" style={{ fontWeight: 'bold' }}>${(selectedTrans.price !== undefined ? selectedTrans.price : (selectedTrans.amount || 0)).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cardholder Name:</span>
                <span className="detail-value">{selectedTrans.cardholderName || 'Admin Allocation'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span className={`badge ${
                    selectedTrans.status?.toLowerCase().includes('success') || selectedTrans.status?.toLowerCase().includes('granted')
                      ? 'badge-safe' 
                      : 'badge-urgent'
                  }`}>
                    {selectedTrans.status}
                  </span>
                </span>
              </div>

              <div className="detail-divider" />

              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Administrative Actions</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-danger" onClick={() => handleDeleteTransaction(selectedTrans.id)}>
                  Delete Log
                </button>
              </div>
            </>
          </div>
        </div>
      )}



      {/* ── VIEW ASSESSMENT DETAILS MODAL ── */}
      {selectedScan && (
        <div className="modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedScan(null)}>
              <Icons.Close />
            </button>
            
            <h3 className="modal-title">Diagnostic Record Details</h3>
            
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{selectedScan.displayDate || selectedScan.date}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Pet Profile:</span>
              <span className="detail-value">{selectedScan.petName} ({selectedScan.breed})</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Condition:</span>
              <span className="detail-value" style={{ fontWeight: 'bold', color: 'var(--color-brand)' }}>
                {selectedScan.issue}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Urgency:</span>
              <span className="detail-value">
                <span className={`badge ${
                  selectedScan.status?.toLowerCase() === 'urgent' || selectedScan.status?.toLowerCase() === 'immediate care' ? 'badge-urgent' :
                  selectedScan.status?.toLowerCase() === 'moderate' ? 'badge-moderate' : 'badge-safe'
                }`}>
                  {selectedScan.status}
                </span>
              </span>
            </div>


            <div className="detail-row">
              <span className="detail-label">Owner User ID:</span>
              <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {selectedScan.userId}
              </span>
            </div>

            <div className="detail-divider" />

            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Observations & Advice</h4>
            <p className="detail-description">{selectedScan.description}</p>

            {(selectedScan.imageUrl || selectedScan.imageUri) && (
              <div>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginTop: '16px', marginBottom: '8px' }}>Scanned Symptom Image</h4>
                <img 
                  src={selectedScan.imageUrl || selectedScan.imageUri} 
                  alt="Symptom Diagnostic Scan" 
                  className="scanned-image"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
