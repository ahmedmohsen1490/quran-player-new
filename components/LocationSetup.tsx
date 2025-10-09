import React, { useState, useMemo } from 'react';
import { PrayerSettings } from '../types';
import { locations } from '../data/locations';
import { CALCULATION_METHODS } from '../constants';

interface LocationSetupProps {
    onSave: (settings: PrayerSettings) => void;
}

const LocationSetup: React.FC<LocationSetupProps> = ({ onSave }) => {
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<number>(3); // Default to Egyptian
    const [error, setError] = useState('');

    const countryNames = useMemo(() => Object.keys(locations).sort(), []);
    const regionNames = useMemo(() => {
        if (selectedCountry && locations[selectedCountry]) {
            return locations[selectedCountry].sort();
        }
        return [];
    }, [selectedCountry]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedRegion(''); // Reset region when country changes
    };

    const handleSave = () => {
        if (!selectedCountry || !selectedRegion) {
            setError('Please complete all selections.');
            return;
        }
        setError('');
        onSave({ country: selectedCountry, region: selectedRegion, method: selectedMethod });
    };

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-card rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-center text-text-primary mb-4">Prayer Time Settings</h2>
                <p className="text-center text-text-secondary mb-6">Select your location for accurate prayer times.</p>
                
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-1">Country</label>
                        <select
                            id="country"
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="block w-full bg-card border border-border-color rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Select Country</option>
                            {countryNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="region" className="block text-sm font-medium text-text-primary mb-1">City / Region</label>
                        <select
                            id="region"
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            disabled={!selectedCountry}
                             className="block w-full bg-card border border-border-color rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                            <option value="">
                                {!selectedCountry 
                                    ? 'Select a country first' 
                                    : 'Select City / Region'
                                }
                            </option>
                            {regionNames.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="method" className="block text-sm font-medium text-text-primary mb-1">Calculation Method</label>
                        <select
                            id="method"
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(Number(e.target.value))}
                            className="block w-full bg-card border border-border-color rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                            {CALCULATION_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationSetup;