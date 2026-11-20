export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  targetCorridor: string;
  interventionType: 'Road Closure & Diversion' | 'Adaptive Signal Tuning' | 'Heavy Vehicle Restriction' | 'Odd-Even Scheme';
  status: 'Ready for SUMO Engine' | 'Draft' | 'Queued';
  baselineMetric: {
    avgSpeed: string;
    congestionRate: string;
    estAQIImpact: string;
  };
  projectedMetric: {
    avgSpeed: string;
    congestionRate: string;
    estAQIImpact: string;
  };
}

export const readyScenarios: SimulationScenario[] = [
  {
    id: 'SIM-SCEN-01',
    title: 'Ashram Underpass Full Maintenance Closure',
    description: 'Simulates complete diversion of south-bound Ring Road traffic via Barapullah and DND during peak hours (08:00 - 11:00).',
    targetCorridor: 'Ring Road (Ashram Chowk to Lajpat Nagar)',
    interventionType: 'Road Closure & Diversion',
    status: 'Ready for SUMO Engine',
    baselineMetric: {
      avgSpeed: '14 km/h',
      congestionRate: '92%',
      estAQIImpact: '391 (Very Poor)',
    },
    projectedMetric: {
      avgSpeed: '22 km/h (Bypass)',
      congestionRate: '68%',
      estAQIImpact: '354 (-9.4% PM2.5)',
    },
  },
  {
    id: 'SIM-SCEN-02',
    title: 'Vikas Marg & ITO Adaptive Signal Splitting',
    description: 'Dynamic green phase expansion (+25s on East-West trans-Yamuna axis) to flush evening peak accumulation.',
    targetCorridor: 'Vikas Marg - ITO Junction',
    interventionType: 'Adaptive Signal Tuning',
    status: 'Ready for SUMO Engine',
    baselineMetric: {
      avgSpeed: '12 km/h',
      congestionRate: '88%',
      estAQIImpact: '382 (Very Poor)',
    },
    projectedMetric: {
      avgSpeed: '19 km/h',
      congestionRate: '61%',
      estAQIImpact: '348 (-8.9% NO2)',
    },
  },
  {
    id: 'SIM-SCEN-03',
    title: 'NH-48 Mahipalpur Heavy Commercial Vehicle Night Window',
    description: 'Restricting freight carriers >7.5T to 23:00 - 05:00 window, routing airport passenger transport seamlessly.',
    targetCorridor: 'NH-48 (Dhaula Kuan to Rajokri)',
    interventionType: 'Heavy Vehicle Restriction',
    status: 'Ready for SUMO Engine',
    baselineMetric: {
      avgSpeed: '18 km/h',
      congestionRate: '84%',
      estAQIImpact: '320 (Very Poor)',
    },
    projectedMetric: {
      avgSpeed: '36 km/h',
      congestionRate: '42%',
      estAQIImpact: '260 (-18.7% PM2.5)',
    },
  },
];
