import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  User,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Phone,
  Save,
  CheckCircle2,
  Calendar,
  Pill,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const HealthProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [dob, setDob] = useState('1978-05-14');
  const [emergencyName, setEmergencyName] = useState('Ramesh Ramanathan');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98490 12345');
  const [preferredLang, setPreferredLang] = useState('te');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setGender(user.profile.gender || 'Female');
      setBloodGroup(user.profile.blood_group || 'B+');
      setDob(user.profile.date_of_birth || '1978-05-14');
      setEmergencyName(user.profile.emergency_contact_name || '');
      setEmergencyPhone(user.profile.emergency_contact_phone || '');
      setPreferredLang(user.profile.preferred_language || 'en');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await axios.put('/api/auth/profile', {
        gender,
        blood_group: bloodGroup,
        date_of_birth: dob,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        preferred_language: preferredLang
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t.nav.profile}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Unified clinical demographic profile with linked ABHA identifier and emergency data.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">Patient profile preferences updated successfully.</span>
        </div>
      )}

      {/* ABHA Identity Card */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-teal-700/60 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-400/30">
                Ayushman Bharat Digital Mission (ABDM)
              </span>
              <span className="text-xs text-slate-300">Mock Profile</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">{user?.full_name}</h2>
            <div className="text-xs font-mono text-teal-200 mt-1">
              ABHA ID: <strong className="text-white">{user?.profile?.abha_id || '91-9876-5432-1098 [MOCK ABHA]'}</strong>
            </div>
          </div>

          <div className="sm:text-right text-xs text-slate-300 space-y-1">
            <div>Gender: <span className="font-semibold text-white">{gender}</span></div>
            <div>Blood Group: <span className="font-semibold text-white">{bloodGroup}</span></div>
            <div>DOB: <span className="font-semibold text-white">{dob}</span></div>
          </div>
        </div>
      </div>

      {/* Chronic Conditions & Verified Allergies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Documented Chronic Conditions</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(user?.profile?.chronic_conditions && user.profile.chronic_conditions.length > 0) ? (
              user.profile.chronic_conditions.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  {c}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No chronic conditions recorded</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Verified Allergies</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(user?.profile?.verified_allergies && user.profile.verified_allergies.length > 0) ? (
              user.profile.verified_allergies.map((a, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200"
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No known drug allergies verified</span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Update Clinical Demographics</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
            <input
              type="text"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred AI Language</label>
          <select
            value={preferredLang}
            onChange={(e) => setPreferredLang(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="en">English (Default)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
