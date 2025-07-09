import React, { useState, useEffect } from 'react';
import { Settings, User, Building, Mail, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSettings, useUpdateSettings } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

export const Parametres: React.FC = () => {
  const { darkMode } = useApp();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { user } = useAuth();

  // Local state for form fields
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [company, setCompany] = useState({ name: '', matricule: '', address: '', logo: '', telephone: '', email: '', rib: '' });
  const [emailConfig, setEmailConfig] = useState({ smtp: '', port: '' });

  useEffect(() => {
    if (settings) {
      setUserProfile({
        name: settings.userProfile?.name || user?.nom || '',
        email: settings.userProfile?.email || user?.email || '',
      });
      setCompany({
        name: settings.company?.name || '',
        matricule: settings.company?.matricule || '',
        address: settings.company?.address || '',
        logo: settings.company?.logo || '',
        telephone: settings.company?.telephone || '',
        email: settings.company?.email || '',
        rib: settings.company?.rib || '',
      });
      setEmailConfig({
        smtp: settings.emailConfig?.smtp || '',
        port: settings.emailConfig?.port?.toString() || '',
      });
    }
  }, [settings, user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      userProfile: { ...userProfile },
      company: { ...company },
      emailConfig: { smtp: emailConfig.smtp, port: Number(emailConfig.port) },
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCompany(prev => ({ ...prev, logo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement des paramètres...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-poppins font-bold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Paramètres
          </h1>
          <p className={`text-sm mt-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Configurez votre application et vos préférences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-5 h-5 text-orange-sfaxien" />
            <h3 className={`text-lg font-poppins font-semibold ${
              darkMode ? 'text-white' : 'text-bleu-nuit'
            }`}>
              Profil utilisateur
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                value={userProfile.email}
                onChange={e => setUserProfile({ ...userProfile, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <Building className="w-5 h-5 text-orange-sfaxien" />
            <h3 className={`text-lg font-poppins font-semibold ${
              darkMode ? 'text-white' : 'text-bleu-nuit'
            }`}>
              Informations entreprise
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany({ ...company, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Matricule fiscale
              </label>
              <input
                type="text"
                value={company.matricule}
                onChange={e => setCompany({ ...company, matricule: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Adresse
              </label>
              <textarea
                rows={3}
                value={company.address}
                onChange={e => setCompany({ ...company, address: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Logo de l'entreprise
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-sfaxien file:text-white hover:file:bg-orange-600"
              />
              {company.logo && (
                <div className="mt-2">
                  <img src={company.logo} alt="Logo preview" className="h-16 object-contain border rounded bg-white p-2" />
                </div>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Téléphone
              </label>
              <input
                type="text"
                value={company.telephone}
                onChange={e => setCompany({ ...company, telephone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email entreprise
              </label>
              <input
                type="email"
                value={company.email}
                onChange={e => setCompany({ ...company, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                RIB
              </label>
              <input
                type="text"
                value={company.rib}
                onChange={e => setCompany({ ...company, rib: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-orange-sfaxien" />
          <h3 className={`text-lg font-poppins font-semibold ${
            darkMode ? 'text-white' : 'text-bleu-nuit'
          }`}>
            Configuration email
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Serveur SMTP
            </label>
            <input
              type="text"
              value={emailConfig.smtp}
              onChange={e => setEmailConfig({ ...emailConfig, smtp: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Port
            </label>
            <input
              type="number"
              value={emailConfig.port}
              onChange={e => setEmailConfig({ ...emailConfig, port: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-orange-sfaxien`}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-orange-sfaxien text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center space-x-2"
          disabled={updateSettings.isLoading}
        >
          <Save className="w-4 h-4" />
          <span>{updateSettings.isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}</span>
        </button>
      </div>
    </form>
  );
};