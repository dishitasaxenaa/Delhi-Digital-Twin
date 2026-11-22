import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Compass, LoaderCircle, Play, Zap } from 'lucide-react';

interface Road {
  id: string; name: string; source: string; isLive: boolean; sourceTimestamp?: string;
  avgSpeedKmH: number; freeFlowSpeedKmH: number; lengthKm: number;
}
interface SimulationLabProps { initialRoadName?: string; onBackToDashboard: () => void; }
type Scenario = { type: 'traffic_demand' | 'signal_green_time'; direction: 'increase' | 'decrease'; label: string; helper: string };

const scenarios: Scenario[] = [
  { type: 'traffic_demand', direction: 'increase', label: 'Increase Traffic', helper: 'More traffic demand on this road' },
  { type: 'traffic_demand', direction: 'decrease', label: 'Decrease Traffic', helper: 'Less traffic demand on this road' },
  { type: 'signal_green_time', direction: 'increase', label: 'Increase Green Signal Time', helper: 'More effective green time' },
  { type: 'signal_green_time', direction: 'decrease', label: 'Decrease Green Signal Time', helper: 'Less effective green time' },
];
const metricRows = [
  ['speed_kmh', 'Speed', 'km/h'],
  ['congestion_percent', 'Congestion', '%'],
  ['travel_time_minutes', 'Travel time', 'min'],
  ['capacity_index', 'Capacity index', ''],
] as const;
const format = (value: number) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });

function readableApiError(payload: unknown, status: number): string {
  const value = payload as { detail?: unknown; message?: unknown } | null;
  const detail = value && typeof value === 'object' ? value.detail : undefined;
  const message = value && typeof value === 'object' ? value.message : undefined;
  const candidate = detail ?? message ?? payload;
  if (typeof candidate === 'string' && candidate.trim()) return candidate;
  if (Array.isArray(candidate)) {
    const issues = candidate.map((issue: any) => {
      const path = Array.isArray(issue?.loc) ? issue.loc.filter((part: unknown) => !['body', 'query', 'path'].includes(String(part))).join('.') : '';
      const reason = typeof issue?.msg === 'string' ? issue.msg : typeof issue?.message === 'string' ? issue.message : '';
      return [path, reason].filter(Boolean).join(': ');
    }).filter(Boolean);
    if (issues.length) return issues.join('; ');
  }
  if (candidate && typeof candidate === 'object') {
    const nestedMessage = (candidate as { message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage;
    try { return JSON.stringify(candidate); } catch { /* use the status fallback */ }
  }
  return `Request failed (${status})`;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({ initialRoadName, onBackToDashboard }) => {
  const [roads, setRoads] = useState<Road[]>([]);
  const [roadId, setRoadId] = useState('');
  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [changePercent, setChangePercent] = useState('15');
  const [lastUpdated, setLastUpdated] = useState('');
  const [trafficStatus, setTrafficStatus] = useState('');
  const [cacheAgeSeconds, setCacheAgeSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRoads, setLoadingRoads] = useState(true);
  const selectedRoad = useMemo(() => roads.find(road => road.id === roadId), [roads, roadId]);

  useEffect(() => {
    let active = true;
    const loadTraffic = () => fetch('/api/traffic').then(async response => {
      if (!response.ok) throw new Error('Traffic service is unavailable.');
      return response.json();
    }).then(data => {
      if (!active) return;
      const currentRoads: Road[] = (data.roads || []).filter((road: Road) =>
        road.isLive && road.source.includes('TomTom') &&
        Number.isFinite(road.avgSpeedKmH) && road.avgSpeedKmH >= 0 &&
        Number.isFinite(road.freeFlowSpeedKmH) && road.freeFlowSpeedKmH > 0
      );
      setRoads(currentRoads);
      setLastUpdated(data.lastUpdated || '');
      setTrafficStatus(data.status || '');
      setCacheAgeSeconds(Number.isFinite(data.cacheAgeSeconds) ? data.cacheAgeSeconds : null);
      setResult(null);
      setRoadId(currentId => {
        if (currentRoads.some(road => road.id === currentId)) return currentId;
        const preferred = currentRoads.find(road => initialRoadName && road.name.toLowerCase().includes(initialRoadName.toLowerCase())) || currentRoads[0];
        return preferred?.id || '';
      });
      setError(currentRoads.length
        ? (data.status === 'PARTIAL' ? data.errorMessage || 'Some TomTom corridor observations are unavailable.' : '')
        : data.errorMessage || 'No usable current TomTom speed observations are available.');
    });
    const refreshTraffic = () => loadTraffic()
      .catch(e => {
        if (!active) return;
        setRoads([]);
        setRoadId('');
        setResult(null);
        setTrafficStatus('API_ERROR');
        setCacheAgeSeconds(null);
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => { if (active) setLoadingRoads(false); });
    refreshTraffic();
    const refreshInterval = window.setInterval(refreshTraffic, 125_000);
    return () => { active = false; window.clearInterval(refreshInterval); };
  }, [initialRoadName]);

  const baseline = result?.baseline || (selectedRoad ? {
    speed_kmh: selectedRoad.avgSpeedKmH,
    congestion_percent: Math.max(0, (1 - selectedRoad.avgSpeedKmH / selectedRoad.freeFlowSpeedKmH) * 100),
    travel_time_minutes: selectedRoad.avgSpeedKmH > 0 ? selectedRoad.lengthKm / selectedRoad.avgSpeedKmH * 60 : null,
    capacity_index: 100,
  } : null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRoad) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ road_id: roadId, scenario_type: scenario.type, direction: scenario.direction, change_percent: Number(changePercent) }),
      });
      const responseText = await response.text();
      let data: any;
      try { data = responseText ? JSON.parse(responseText) : null; }
      catch { data = responseText; }
      if (!response.ok) throw new Error(readableApiError(data, response.status));
      if (!data || typeof data !== 'object' || !data.estimated || !data.baseline || !data.percent_changes) {
        throw new Error('The What-If API returned an incomplete estimate response.');
      }
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-[#131e33] border border-[#1f2e4d] text-sm text-white focus:outline-none focus:border-purple-500';
  return <div className="flex-1 h-full bg-[#080c14] overflow-y-auto custom-scrollbar p-6 text-slate-100">
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d1524] border border-[#1f2e4d] shadow-xl">
        <div className="flex items-center gap-3.5"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center"><Compass className="text-white" size={24}/></div><div><h1 className="text-xl font-bold tracking-wider text-white">TRAFFIC WHAT-IF LAB</h1><p className="text-xs text-slate-400 mt-1">Explore demand and signal timing changes</p></div></div>
        <button onClick={onBackToDashboard} className="px-4 py-2 rounded-xl bg-[#131e33] border border-[#1f2e4d] text-xs text-slate-300 flex items-center gap-2"><ArrowLeft size={14}/> Back to Command Center</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 p-5 rounded-xl bg-[#0d1524] border border-[#1f2e4d] space-y-5">
          <div><h2 className="text-sm font-semibold text-white">Choose an action</h2><p className="text-xs text-slate-400 mt-1">Select one traffic change to estimate.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">{scenarios.map(item => {
            const active = scenario.type === item.type && scenario.direction === item.direction;
            const Icon = item.direction === 'increase' ? ArrowUpRight : ArrowDownRight;
            return <button key={`${item.type}-${item.direction}`} type="button" aria-pressed={active} onClick={() => { setScenario(item); setResult(null); }} className={`w-full rounded-xl border p-3 text-left transition-colors ${active ? 'bg-purple-950/40 border-purple-500/70 shadow-sm shadow-purple-500/10' : 'bg-[#131e33] border-[#1f2e4d] hover:border-slate-500'}`}>
              <span className="flex items-center gap-2 text-xs font-semibold text-white"><Icon size={15} className={active ? 'text-purple-300' : 'text-slate-400'}/>{item.label}</span><span className="block mt-1 ml-[23px] text-[10px] text-slate-400">{item.helper}</span>
            </button>;
          })}</div>
          <form onSubmit={submit} className="space-y-4 border-t border-[#1f2e4d] pt-4">
            <div><label htmlFor="road-select" className="block text-[11px] text-slate-300 mb-1.5">Road</label><select id="road-select" className={inputClass} value={roadId} onChange={e => { setRoadId(e.target.value); setResult(null); }} disabled={loadingRoads || roads.length === 0} required>
              {roads.length === 0 && <option value="">{loadingRoads ? 'Loading live traffic…' : 'No live TomTom roads available'}</option>}
              {roads.map(road => <option key={road.id} value={road.id}>{road.name}</option>)}
            </select></div>
            <div><label htmlFor="change-percent" className="block text-[11px] text-slate-300 mb-1.5">Percentage change</label><div className="relative"><input id="change-percent" className={`${inputClass} pr-9`} type="number" min="0.1" max={scenario.type === 'signal_green_time' && scenario.direction === 'decrease' ? '99.9' : '100'} step="any" value={changePercent} onChange={e => setChangePercent(e.target.value)} required/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span></div></div>
            <button disabled={loading || loadingRoads || !selectedRoad || !changePercent} className="w-full justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-mono flex items-center gap-2 disabled:opacity-50">{loading ? <LoaderCircle size={14} className="animate-spin"/> : <Play size={14}/>} {loading ? 'Calculating estimate…' : 'Run What-If'}</button>
          </form>
          {error && <div role="alert" className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">{error}</div>}
        </section>

        <section className="lg:col-span-3 space-y-4">
          {selectedRoad && <div className="px-4 py-3 rounded-xl bg-[#0d1524] border border-[#1f2e4d] flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Zap size={14} className={trafficStatus === 'CACHED' ? 'text-amber-400' : 'text-emerald-400'}/><span className="text-xs text-slate-200">TomTom {trafficStatus === 'CACHED' ? `cached observation${cacheAgeSeconds != null ? ` · ${cacheAgeSeconds}s old` : ''}` : trafficStatus === 'PARTIAL' ? 'live observation · partial feed' : 'live observation'}</span></div><span className="text-[10px] text-slate-500">{selectedRoad.sourceTimestamp ? `TomTom response ${new Date(selectedRoad.sourceTimestamp).toLocaleString()}` : lastUpdated ? `TomTom response ${new Date(lastUpdated).toLocaleString()}` : 'TomTom response timestamp unavailable'}</span></div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard title="Current Conditions" roadName={selectedRoad?.name} data={baseline} accent="slate" emptyMessage={loadingRoads ? 'Loading TomTom observations…' : 'Current TomTom speed observations are unavailable.'} />
            <ResultCard title="What-If Estimate" roadName={result?.road?.name} data={result?.estimated} changes={result?.percent_changes} accent="purple" empty={!result} />
          </div>
          {result && <div className="p-4 rounded-xl bg-[#0d1524] border border-[#1f2e4d] space-y-3"><h3 className="text-xs font-semibold text-slate-200">Calculation assumptions</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">{result.assumptions?.map((item: any) => <p key={item.name} className="py-1 text-[10px] text-slate-400"><b className="text-slate-300">{item.name}:</b> {typeof item.value === 'number' ? format(item.value) : item.value} {item.unit}<span className="text-slate-500"> · {item.source}</span></p>)}</div><p className="text-[10px] leading-relaxed text-slate-400">{result.explanation}</p><p className="text-[10px] text-slate-500">Relative demand/capacity indices are normalized to 100; they are not vehicle counts or measured road capacity.</p></div>}
          {!selectedRoad && !loadingRoads && <div className="p-8 text-center rounded-xl bg-[#0d1524] border border-[#1f2e4d]"><p className="text-sm text-slate-300">Current TomTom observations are required to run a What-If estimate.</p></div>}
        </section>
      </div>
    </div>
  </div>;
};

function ResultCard({ title, roadName, data, changes, accent, empty = false, emptyMessage }: { title: string; roadName?: string; data: any; changes?: Record<string, number | null>; accent: 'slate' | 'purple'; empty?: boolean; emptyMessage?: string }) {
  const border = accent === 'purple' ? 'border-purple-500/40' : 'border-[#1f2e4d]';
  return <section className={`min-h-64 p-5 rounded-xl bg-[#0d1524] border ${border}`}>
    <h2 className={`text-sm font-semibold ${accent === 'purple' ? 'text-purple-200' : 'text-slate-100'}`}>{title}</h2>
    {roadName && <p className="mt-1 text-[10px] text-slate-500 truncate">{roadName}</p>}
    {empty || !data ? <div className="h-44 flex items-center justify-center text-center text-xs text-slate-500">{emptyMessage || 'Run a scenario to see the estimated conditions.'}</div> : <div className="mt-5 space-y-4">{metricRows.map(([key, label, unit]) => {
      const value = data[key]; const delta = changes?.[key];
      return <div key={key} className="flex items-center justify-between gap-3 border-b border-[#1f2e4d]/70 pb-3 last:border-0 last:pb-0"><span className="text-xs text-slate-400">{label}</span><span className="text-right text-sm font-semibold text-white">{value == null ? '—' : `${format(value)}${unit ? ` ${unit}` : ''}`}{delta != null && <span className={`block text-[10px] ${delta > 0 ? 'text-amber-300' : delta < 0 ? 'text-emerald-300' : 'text-slate-500'}`}>{delta > 0 ? '+' : ''}{format(delta)}%</span>}</span></div>;
    })}</div>}
    {title === 'Current Conditions' && data && <p className="mt-4 text-[9px] text-slate-500">Traffic demand/capacity index: 100 baseline. TomTom provides speed, not vehicle counts or road capacity.</p>}
    {title === 'What-If Estimate' && data && <p className="mt-4 text-[9px] text-slate-500">Formula-based estimate from TomTom baseline.</p>}
  </section>;
}
