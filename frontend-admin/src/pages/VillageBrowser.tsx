import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEMO_KEY = 'ak_demo0000000000000000000000000000';
const DEMO_SECRET = 'demo_secret';

const headers = { 'X-API-KEY': DEMO_KEY, 'X-API-SECRET': DEMO_SECRET };

export default function VillageBrowser() {
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadStates = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/v1/states`, { headers });
      setStates(data);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const onStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    setSelectedDistrict('');
    setSelectedSub('');
    setDistricts([]);
    setSubDistricts([]);
    setVillages([]);
    if (!stateId) return;
    const { data } = await axios.get(`${API_URL}/v1/districts/${stateId}`, { headers });
    setDistricts(data);
  };

  const onDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedSub('');
    setSubDistricts([]);
    setVillages([]);
    if (!districtId) return;
    const { data } = await axios.get(`${API_URL}/v1/subdistricts/${districtId}`, { headers });
    setSubDistricts(data);
  };

  const onSubDistrictChange = async (subId: string) => {
    setSelectedSub(subId);
    setVillages([]);
    if (!subId) return;
    const { data } = await axios.get(`${API_URL}/v1/villages/${subId}`, { headers });
    setVillages(data.villages || data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Village Browser</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
          <select
            className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
            value={selectedState}
            onFocus={loadStates}
            onChange={e => onStateChange(e.target.value)}
          >
            <option value="">{loading ? 'Loading...' : 'Select State'}</option>
            {states.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
          <select
            className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-400 disabled:opacity-50"
            value={selectedDistrict}
            onChange={e => onDistrictChange(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select District</option>
            {districts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Sub-District</label>
          <select
            className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-indigo-400 disabled:opacity-50"
            value={selectedSub}
            onChange={e => onSubDistrictChange(e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">Select Sub-District</option>
            {subDistricts.map((sd: any) => <option key={sd.id} value={sd.id}>{sd.name}</option>)}
          </select>
        </div>
      </div>

      {villages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Villages</h3>
            <span className="text-sm text-gray-500">{villages.length} records</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {villages.map((v: any) => (
              <div key={v.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">{v.name}</span>
                <span className="text-xs text-gray-400 font-mono">PLCN: {v.mddsPlcn}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
