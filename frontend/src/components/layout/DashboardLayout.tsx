// components/layout/DashboardLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Layers, Wand2, MessageSquare, 
  PieChart, Heart, Plane, Plus, Menu, X, LogOut, User, Save, Camera,
  Eye, Smile
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Tailored Navigation items with bespoke hover physics & lighting palettes
const navItems = [
  { 
    icon: (
      <PieChart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-400 group-hover:rotate-6" />
    ), 
    label: 'Dashboard', 
    path: '/app',
    hoverGlow: 'group-hover:bg-violet-500/10 group-hover:border-violet-500/30 group-hover:text-violet-200'
  },
  { 
    icon: (
      <Layers className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-emerald-400" />
    ), 
    label: 'Wardrobe', 
    path: '/app/wardrobe',
    hoverGlow: 'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-200'
  },
  { 
    icon: (
      <Wand2 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-115 group-hover:text-fuchsia-400" />
    ), 
    label: 'Outfits', 
    path: '/app/outfits/generate',
    hoverGlow: 'group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500/30 group-hover:text-fuchsia-200'
  },
  { 
    icon: (
      <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:scale-115 group-hover:-translate-y-0.5 group-hover:text-purple-400" />
    ), 
    label: 'AI Stylist', 
    path: '/app/stylist',
    hoverGlow: 'group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-200'
  },
  { 
    icon: (
      <Camera className="w-5 h-5 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-[-8deg] group-hover:text-cyan-400" />
    ), 
    label: 'Inspo Matcher', 
    path: '/app/inspo-match',
    hoverGlow: 'group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 group-hover:text-cyan-200'
  },
  { 
    icon: (
      <Heart className="w-5 h-5 transition-all duration-300 group-hover:scale-120 group-hover:text-rose-400 group-hover:fill-rose-400/40" />
    ), 
    label: 'Saved Looks', 
    path: '/app/outfits',
    hoverGlow: 'group-hover:bg-rose-500/10 group-hover:border-rose-500/30 group-hover:text-rose-200'
  },
  { 
    icon: (
      <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-120 group-hover:text-amber-400" />
    ), 
    label: 'Style DNA', 
    path: '/app/style',
    hoverGlow: 'group-hover:bg-amber-500/10 group-hover:border-amber-500/30 group-hover:text-amber-200'
  },
  { 
    icon: (
      <Plane className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-[-10deg] group-hover:text-sky-400" />
    ), 
    label: 'Travel', 
    path: '/app/travel',
    hoverGlow: 'group-hover:bg-sky-500/10 group-hover:border-sky-500/30 group-hover:text-sky-200'
  },
];

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  stylePreference: string;
  shirtSize: string;
  shoeSize: string;
  avatarInitials: string;
  avatarUrl?: string;
}

// WhatsApp-style quick fashion emojis
const QUICK_EMOJIS = ['✨', '🕶️', '🖤', '👟', '☕', '🌿', '👔', '👗', '💫', '🔥', '🤍'];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPreviewingPhoto, setIsPreviewingPhoto] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'style'>('profile');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Guest User',
    email: 'loading...',
    bio: 'Minimalist fashion enthusiast curating an effortless, aesthetic wardrobe.',
    stylePreference: 'Minimalist, Streetwear',
    shirtSize: 'M',
    shoeSize: 'US 10',
    avatarInitials: 'GU',
    avatarUrl: ''
  });

  const [draftProfile, setDraftProfile] = useState<UserProfile>(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. DYNAMIC PROFILE SYNC
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
      if (!token) return;

      try {
        const res = await fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const dbUser = await res.json();
          
          const initials = dbUser.full_name
            .trim()
            .split(/\s+/)
            .map((part: string) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const localProfileStr = localStorage.getItem('stylematch_user_profile');
          let localProfile = {};
          if (localProfileStr) {
            localProfile = JSON.parse(localProfileStr);
          }

          const mergedProfile = {
            bio: 'Minimalist fashion enthusiast curating an effortless, aesthetic wardrobe.',
            stylePreference: 'Minimalist, Streetwear',
            shirtSize: 'M',
            shoeSize: 'US 10',
            avatarUrl: '',
            ...localProfile,
            name: dbUser.full_name,
            email: dbUser.email,
            avatarInitials: initials || '??'
          };

          setUserProfile(mergedProfile);
          localStorage.setItem('stylematch_user_profile', JSON.stringify(mergedProfile));
        }
      } catch (e) {
        console.error("Failed to fetch live user profile from backend", e);
      }
    };

    try {
      const savedProfile = localStorage.getItem('stylematch_user_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        const savedOnboarding = localStorage.getItem('stylematch_onboarding');
        if (savedOnboarding) {
          const onboarding = JSON.parse(savedOnboarding);
          setUserProfile(prev => ({
            ...prev,
            stylePreference: onboarding.styles?.join(', ') || prev.stylePreference
          }));
        }
      }
    } catch (e) {
      console.warn('Could not read user profile from localStorage', e);
    }

    fetchUserProfile();
  }, []);

  // 2. LOGOUT CONFIRMATION
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out of StyleMatch AI?");
    if (!confirmLogout) return;

    sessionStorage.removeItem('stylematch_token');       
    localStorage.removeItem('stylematch_token');        
    localStorage.removeItem('stylematch_user_profile');  
    localStorage.removeItem('stylematch_onboarding');    
    
    setUserProfile({
      name: 'Guest User',
      email: 'loading...',
      bio: 'Minimalist fashion enthusiast curating an effortless, aesthetic wardrobe.',
      stylePreference: 'Minimalist, Streetwear',
      shirtSize: 'M',
      shoeSize: 'US 10',
      avatarInitials: 'GU',
      avatarUrl: ''
    });
    
    navigate('/');
  };

  const openProfileModal = () => {
    setDraftProfile(userProfile);
    setActiveTab('profile');
    setIsProfileModalOpen(true);
  };

  // High-Resolution WhatsApp-Style Image Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDraftProfile(prev => ({
          ...prev,
          avatarUrl: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setDraftProfile(prev => ({
      ...prev,
      avatarUrl: ''
    }));
  };

  const handleAddEmojiToBio = (emoji: string) => {
    setDraftProfile(prev => ({
      ...prev,
      bio: `${prev.bio || ''} ${emoji}`.trim()
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const initials = draftProfile.name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updatedProfile = {
      ...draftProfile,
      avatarInitials: initials || '??'
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('stylematch_user_profile', JSON.stringify(updatedProfile));
    setIsProfileModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-black">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-hidden justify-between">
        <div className="p-5 pb-2 flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-6 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-violet-primary/20 border border-violet-primary/40 flex items-center justify-center text-violet-primary group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(138,43,226,0.6)] transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-semibold tracking-wider uppercase text-sm text-white">
              StyleMatch<span className="text-violet-primary">AI</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5 flex-1 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-300 relative group border border-transparent ${
                    isActive 
                      ? 'text-white shadow-[0_0_20px_rgba(138,43,226,0.2)]' 
                      : `text-white/60 hover:text-white ${item.hoverGlow}`
                  }`}
                >
                  {/* Glowing Active Tab Pill */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-violet-600/20 to-indigo-600/10 border border-violet-500/50 rounded-2xl shadow-inner"
                      initial={false}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10 shrink-0">{item.icon}</span>
                  <span className="relative z-10 font-medium text-sm tracking-wide truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM CONTAINER */}
        <div className="mt-auto p-4 border-t border-white/5 space-y-3 bg-black/60 shrink-0">
          <Link 
            to="/app/wardrobe/add" 
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-white/5 to-white/10 hover:from-violet-600/20 hover:to-violet-600/30 border border-white/10 hover:border-violet-500/40 rounded-2xl text-sm font-medium transition-all text-white shadow-sm group"
          >
            <Plus className="w-4 h-4 text-violet-primary group-hover:scale-125 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Clothing</span>
          </Link>

          {/* Clickable Profile Card */}
          <div 
            onClick={openProfileModal}
            className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-primary/40 hover:bg-white/[0.05] cursor-pointer transition-all duration-300 group shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Crisp 1:1 Avatar Circle */}
              <div className="w-9 h-9 aspect-square rounded-full overflow-hidden border border-white/15 shrink-0 shadow-[0_0_15px_rgba(138,43,226,0.35)] group-hover:scale-108 transition-transform duration-300 bg-zinc-900">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white">
                    {userProfile.avatarInitials}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate leading-tight group-hover:text-violet-light transition-colors">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-white/40 truncate leading-tight mt-0.5">
                  {userProfile.email}
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                handleLogout();
              }}
              className="p-1.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/15 transition-all duration-200 shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-primary" />
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/80 p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-black/95 backdrop-blur-xl pt-20 px-6 flex flex-col"
          >
            <nav className="space-y-3 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 text-lg font-display transition-colors ${
                    location.pathname === item.path ? 'text-violet-primary' : 'text-white/70'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="py-6 border-t border-white/5 space-y-3">
              <div 
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfileModal();
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 active:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 aspect-square rounded-full overflow-hidden border border-white/10 shrink-0 shadow-[0_0_15px_rgba(138,43,226,0.35)]">
                    {userProfile.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white">
                        {userProfile.avatarInitials}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">
                      {userProfile.name}
                    </span>
                    <span className="text-xs text-white/40 truncate mt-0.5">
                      {userProfile.email}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-2.5 rounded-xl text-white/50 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pt-16 md:pt-0 overflow-x-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-violet-primary/10 rounded-full blur-[100px] transform-gpu"
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[20%] left-[5%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] bg-fuchsia-600/5 rounded-full blur-[120px] transform-gpu"
            animate={{ 
              x: [0, 100, 0], 
              y: [0, -50, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
        
        <div className="flex-1 p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* =========================================================
          INTERACTIVE PROFILE MODAL (WhatsApp-Style HD Photo Upload)
         ========================================================= */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0b0713] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-xl relative z-10 shadow-[0_0_60px_rgba(138,43,226,0.35)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-primary/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-400/40 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-display font-medium text-white">Your Style Profile</h3>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10 overflow-y-auto max-h-[75vh] pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                
                {/* SETTINGS TABS */}
                <div className="flex border-b border-white/5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors duration-300 ${
                      activeTab === 'profile' ? 'border-violet-primary text-white font-bold' : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    Account Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors duration-300 ${
                      activeTab === 'style' ? 'border-violet-primary text-white font-bold' : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    Style DNA & Sizing
                  </button>
                </div>

                {activeTab === 'profile' ? (
                  /* TAB A: WHATSAPP-STYLE HIGH-DEFINITION PROFILE PICTURE UPLOAD */
                  <div className="space-y-5">
                    
                    {/* 📸 WhatsApp Style Crisp 1:1 Avatar Card */}
                    <div className="flex items-center gap-6 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/10 relative shadow-lg">
                      
                      {/* 1:1 Ratio Circle Container with WhatsApp Camera Badge */}
                      <div className="relative shrink-0">
                        <div 
                          onClick={() => draftProfile.avatarUrl && setIsPreviewingPhoto(true)}
                          className={`w-20 h-20 aspect-square rounded-full overflow-hidden border-2 border-violet-400/50 shadow-[0_0_25px_rgba(138,43,226,0.35)] bg-zinc-900 transition-all ${draftProfile.avatarUrl ? 'cursor-pointer hover:border-violet-400' : ''}`}
                          title={draftProfile.avatarUrl ? 'Click to view full photo' : 'Upload photo'}
                        >
                          {draftProfile.avatarUrl ? (
                            <img 
                              src={draftProfile.avatarUrl} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-lg font-bold text-white">
                              {draftProfile.name ? draftProfile.name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) : '??'}
                            </div>
                          )}
                        </div>

                        {/* WhatsApp-Style Floating Camera Action Badge */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 border-2 border-black flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          title="Change Profile Photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Profile Photo</h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">
                            HD Original
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Click the camera badge to upload a custom profile picture.
                        </p>
                        
                        {draftProfile.avatarUrl && (
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsPreviewingPhoto(true)}
                              className="text-[11px] text-violet-300 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Eye className="w-3 h-3" /> View Photo
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="text-[11px] text-red-400 hover:underline font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={draftProfile.name}
                          onChange={(e) => setDraftProfile({...draftProfile, name: e.target.value})}
                          className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Email Address</label>
                        <input 
                          type="email"
                          required
                          value={draftProfile.email}
                          onChange={(e) => setDraftProfile({...draftProfile, email: e.target.value})}
                          className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* WhatsApp-Style Bio with Quick Emoji Toolbar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-medium text-white/50">Style Bio & Motto</label>
                        <span className="text-[10px] text-white/40">Tap emojis to add</span>
                      </div>

                      <textarea 
                        rows={2}
                        value={draftProfile.bio}
                        onChange={(e) => setDraftProfile({...draftProfile, bio: e.target.value})}
                        placeholder="E.g., Minimalism and high quality essentials over quantity..."
                        className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 resize-none transition-all"
                      />

                      {/* Quick Emoji Toolbar */}
                      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <span className="text-[11px] text-white/40 mr-1 flex items-center gap-1 shrink-0">
                          <Smile className="w-3 h-3" /> Quick:
                        </span>
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddEmojiToBio(emoji)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-sm transition hover:scale-110 active:scale-95 shrink-0"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TAB B: STYLE DNA & CLOTHING SIZES */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Aesthetic / Style Preferences</label>
                      <input 
                        type="text"
                        value={draftProfile.stylePreference}
                        onChange={(e) => setDraftProfile({...draftProfile, stylePreference: e.target.value})}
                        placeholder="E.g., Casual, Retro, Streetwear, Avant-Garde"
                        className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Shirt/Top Size</label>
                        <select 
                          value={draftProfile.shirtSize}
                          onChange={(e) => setDraftProfile({...draftProfile, shirtSize: e.target.value})}
                          className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white select-custom transition-all"
                        >
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <option key={size} value={size} className="bg-[#0b0713] text-white">{size}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Shoe Size</label>
                        <input 
                          type="text"
                          value={draftProfile.shoeSize}
                          placeholder="E.g. US 10, EU 43"
                          onChange={(e) => setDraftProfile({...draftProfile, shoeSize: e.target.value})}
                          className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save and Cancel Footer Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-medium text-white/80 hover:text-white transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl text-xs font-medium text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SIZE PHOTO PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewingPhoto && draftProfile.avatarUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewingPhoto(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-sm w-full bg-zinc-950 border border-white/20 rounded-3xl p-4 shadow-2xl z-10 space-y-3 text-center"
            >
              <button
                onClick={() => setIsPreviewingPhoto(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                <img src={draftProfile.avatarUrl} alt="Full Avatar" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-white/60 font-medium">{draftProfile.name}'s Profile Picture</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}