import React, { useEffect, useState } from 'react';
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertTriangle,
  Info,
  Calendar,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { LabTrendResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const LabTrendsPage: React.FC = () => {
  const { t } = useLanguage();
  const [availableTests] = useState([
    'HbA1c',
    'Fasting Blood Sugar',
    'Total Cholesterol',
    'Serum Creatinine',
    'Hemoglobin'
  ]);
  const [selectedTest, setSelectedTest] = useState('HbA1c');
  const [trendData, setTrendData] = useState<LabTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrend(selectedTest);
  }, [selectedTest]);

  const fetchTrend = async (testName: string) => {
    setLoading(true);
    try {
      const data = await api.getLabTrends(testName);
      setTrendData(data);
    } catch (err) {
      console.error('Failed to load lab trends', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.trends.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.trends.trendNote}
          </p>
        </div>

        {/* Test Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Test:</label>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {availableTests.map((tName) => (
              <option key={tName} value={tName}>
                {tName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Loading trend data...
        </div>
      ) : trendData && trendData.data_points.length > 0 ? (
        <div className="space-y-6">
          {/* Trend Summary Header Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{trendData.test_name}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Unit: {trendData.unit}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Historical range: {trendData.earliest_date} to {trendData.latest_date} ({trendData.data_points.length} measurements)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  trendData.trend_direction === 'decreased'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : trendData.trend_direction === 'increased'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                {trendData.trend_direction === 'decreased' && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                {trendData.trend_direction === 'increased' && <TrendingUp className="w-4 h-4 text-rose-600" />}
                {trendData.trend_direction === 'stable' && <Minus className="w-4 h-4 text-slate-600" />}
                <span className="capitalize">Trend: {trendData.trend_direction}</span>
              </div>
            </div>
          </div>

          {/* Recharts Chart Visualization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Time-Series Trajectory</span>
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine
                  data={trendData.data_points}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={['auto', 'auto']}
                    unit={` ${trendData.unit}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                            <div className="font-bold">{pt.date}</div>
                            <div className="text-teal-300">
                              Reading: <strong>{pt.value} {pt.unit}</strong>
                            </div>
                            {pt.reference_interval_str && (
                              <div className="text-slate-300 text-[11px]">
                                Ref Range: {pt.reference_interval_str}
                              </div>
                            )}
                            <div className="text-slate-400 text-[10px]">
                              Source: {pt.document_name}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {trendData.data_points[0]?.reference_high && (
                    <ReferenceLine
                      y={trendData.data_points[0].reference_high}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: 'Upper Ref', fill: '#d97706', fontSize: 10 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={trendData.test_name}
                    stroke="#0f766e"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#0f766e' }}
                    activeDot={{ r: 8 }}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Readings Table with Document Citations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Individual Document Readings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Measured Value</th>
                    <th className="p-3">Reference Range</th>
                    <th className="p-3">Flag</th>
                    <th className="p-3">Source Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trendData.data_points.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{pt.date}</td>
                      <td className="p-3 font-bold text-teal-800">
                        {pt.value} {pt.unit}
                      </td>
                      <td className="p-3 text-slate-600">{pt.reference_interval_str || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pt.abnormal_flag === 'HIGH' || pt.abnormal_flag === 'LOW'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {pt.abnormal_flag}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{pt.document_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Caution Notice */}
          <div className="p-4 bg-slate-100 text-slate-600 rounded-xl text-xs flex items-center gap-3">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>{trendData.clinical_caution}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No historical measurements found for <strong>{selectedTest}</strong>.
          Upload laboratory reports or load the demo dataset to view interactive trend curves.
        </div>
      )}
    </div>
  );
};
