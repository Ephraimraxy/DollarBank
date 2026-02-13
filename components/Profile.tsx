import React, { useState } from 'react';
import { 
  ArrowLeft, Camera, User, Mail, Phone, LogOut, 
  ChevronRight, Shield, Bell, CheckCircle2, 
  Globe, Moon, ShieldCheck, Save, X, Upload
} from 'lucide-react';

interface Props {
  user: { fullName: string; email: string; phone: string; address: string };
  setUser: (user: any) => void;
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onLogout?: () => void;
}

export default function Profile({ user, setUser, onBack, darkMode, setDarkMode, onLogout }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

  const handleSave = () => {
    setUser({ ...tempUser });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempUser({ ...user });
    setIsEditing(false);
  };

  return (
    <div className={`min-h-full pb-10 transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40 border-b`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest">Account Hub</h1>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="p-2 text-gray-400"><X size={20} /></button>
            <button onClick={handleSave} className="p-2 text-red-600 animate-pulse"><Save size={20} /></button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center pt-4">
          <div className="relative">
            <img src="https://picsum.photos/120/120" alt="Avatar" className={`w-24 h-24 rounded-[32px] border-4 shadow-xl ${darkMode ? 'border-gray-800' : 'border-white'}`} />
            <button className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-red-700 transition-all active:scale-95"><Camera size={16} /></button>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-6">{user.fullName}</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">Platinum Member Since 2021</p>
        </div>

        {/* KYC Section */}
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-3xl p-5 shadow-sm border`}>
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Digital Identity Status</span>
              </div>
              <span className="text-[8px] font-black px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 uppercase">Verified</span>
           </div>
           <div className={`p-3 rounded-2xl flex items-center gap-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-[10px] font-bold text-gray-500">Your biometric profile is secure and up-to-date.</p>
           </div>
        </div>

        {/* Identity Form */}
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[32px] shadow-sm border overflow-hidden`}>
          <div className={`px-5 py-3 flex justify-between items-center ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Personal Details</span>
            {!isEditing && <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-red-600 uppercase tracking-widest">Edit Profile</button>}
          </div>
          <div className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-50'}`}>
            <EditableItem icon={<User size={18} />} label="Full Name" value={isEditing ? tempUser.fullName : user.fullName} isEditing={isEditing} onChange={(v: string) => setTempUser({ ...tempUser, fullName: v })} darkMode={darkMode} />
            <EditableItem icon={<Mail size={18} />} label="Email Address" value={isEditing ? tempUser.email : user.email} isEditing={isEditing} onChange={(v: string) => setTempUser({ ...tempUser, email: v })} darkMode={darkMode} />
            <EditableItem icon={<Phone size={18} />} label="Mobile" value={isEditing ? tempUser.phone : user.phone} isEditing={isEditing} onChange={(v: string) => setTempUser({ ...tempUser, phone: v })} darkMode={darkMode} />
          </div>
        </div>

        {/* Preferences */}
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[32px] shadow-sm border overflow-hidden`}>
          <div className={`px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>Preferences</div>
          <PreferenceToggle icon={<Moon className="text-purple-500" size={18} />} label="Interface Theme" subLabel={darkMode ? "Dark Mode Active" : "Light Mode Active"} isActive={darkMode} onClick={() => setDarkMode(!darkMode)} darkMode={darkMode} />
          <PreferenceToggle icon={<Shield className="text-blue-500" size={18} />} label="Biometric Sign-in" subLabel="Always On" isActive={true} onClick={() => {}} darkMode={darkMode} />
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all text-xs"
        >
           <LogOut size={16} />
           Terminate Session
        </button>
      </div>
    </div>
  );
}

const EditableItem = ({ label, value, isEditing, icon, onChange, darkMode }: any) => (
  <div className="p-5 flex items-center gap-4">
    <div className={`w-10 h-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl flex items-center justify-center text-gray-500`}>{icon}</div>
    <div className="flex-1">
      <label className="text-[9px] text-gray-400 font-black uppercase tracking-tight">{label}</label>
      {isEditing ? (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full text-sm font-bold bg-transparent border-b border-red-500 outline-none mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
      ) : (
        <div className={`text-sm font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      )}
    </div>
  </div>
);

const PreferenceToggle = ({ icon, label, subLabel, isActive, onClick, darkMode }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-5 border-b transition-colors last:border-0 ${darkMode ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-gray-50 border-gray-50'}`}>
    <div className="flex items-center gap-3">
       <div className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl flex items-center justify-center`}>{icon}</div>
       <div className="text-left">
          <div className="font-bold text-sm tracking-tight">{label}</div>
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{subLabel}</div>
       </div>
    </div>
    <div className={`w-10 h-6 rounded-full relative transition-colors ${isActive ? 'bg-red-600' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isActive ? 'right-1' : 'left-1'}`}></div>
    </div>
  </button>
);