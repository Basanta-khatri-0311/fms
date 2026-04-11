import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axiosConfig';

const SystemSettingsContext = createContext();

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    systemName: 'Finance Management System',
    currencySymbol: 'NPR.',
    fiscalYearBS: '2081/82',
    availableFiscalYears: [],
    taxSettings: {
      vatRate: 13,
      panNumber: '',
      tdsRates: {
        rent: 10,
        consultancy: 1.5,
        salary: 1
      }
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/system');
      if (response.data) {
        const data = response.data;
        const normalized = {
          ...data,
          availableFiscalYears: (data.availableFiscalYears || []).map(fy => 
            typeof fy === 'string' 
              ? { year: fy, startDateAD: fy === data.fiscalYearBS ? data.startDateAD : '', endDateAD: fy === data.fiscalYearBS ? data.endDateAD : '' } 
              : fy
          )
        };
        setSettings(normalized);
      }
    } catch (error) {
      console.error('Error fetching global system settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Allow manual refresh if settings are updated
  const refreshSettings = () => fetchSettings();

  return (
    <SystemSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};
