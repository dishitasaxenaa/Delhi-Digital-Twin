import { HourlyMetric, CitySummary } from '../types';

export const hourlyTrendsData: HourlyMetric[] = [
  { time: '00:00', aqi: 310, congestion: 18, speed: 48, pm25: 245 },
  { time: '02:00', aqi: 325, congestion: 12, speed: 52, pm25: 260 },
  { time: '04:00', aqi: 340, congestion: 15, speed: 50, pm25: 275 },
  { time: '06:00', aqi: 365, congestion: 32, speed: 42, pm25: 295 },
  { time: '08:00', aqi: 395, congestion: 78, speed: 19, pm25: 330 },
  { time: '09:00', aqi: 415, congestion: 88, speed: 15, pm25: 355 },
  { time: '10:00', aqi: 428, congestion: 84, speed: 17, pm25: 370 },
  { time: '11:00', aqi: 390, congestion: 68, speed: 24, pm25: 320 },
  { time: '12:00', aqi: 360, congestion: 62, speed: 26, pm25: 290 },
  { time: '13:00', aqi: 348, congestion: 66, speed: 25, pm25: 278 }, // Current simulated hour
  { time: '14:00', aqi: 335, congestion: 64, speed: 27, pm25: 265 },
  { time: '15:00', aqi: 345, congestion: 70, speed: 23, pm25: 280 },
  { time: '16:00', aqi: 370, congestion: 79, speed: 20, pm25: 310 },
  { time: '17:00', aqi: 405, congestion: 89, speed: 14, pm25: 345 },
  { time: '18:00', aqi: 432, congestion: 92, speed: 13, pm25: 380 },
  { time: '19:00', aqi: 440, congestion: 91, speed: 13, pm25: 390 },
  { time: '20:00', aqi: 425, congestion: 82, speed: 18, pm25: 370 },
  { time: '21:00', aqi: 395, congestion: 65, speed: 24, pm25: 335 },
  { time: '22:00', aqi: 360, congestion: 45, speed: 32, pm25: 295 },
  { time: '23:00', aqi: 330, congestion: 28, speed: 41, pm25: 265 },
];

export const correlationData = [
  { time: '06:00', trafficVolume: 2400, aqiValue: 365, exhaustFactor: 42 },
  { time: '08:00', trafficVolume: 5200, aqiValue: 395, exhaustFactor: 76 },
  { time: '10:00', trafficVolume: 5600, aqiValue: 428, exhaustFactor: 88 },
  { time: '12:00', trafficVolume: 3800, aqiValue: 360, exhaustFactor: 61 },
  { time: '14:00', trafficVolume: 3900, aqiValue: 335, exhaustFactor: 58 },
  { time: '16:00', trafficVolume: 4800, aqiValue: 370, exhaustFactor: 72 },
  { time: '18:00', trafficVolume: 6100, aqiValue: 432, exhaustFactor: 94 },
  { time: '20:00', trafficVolume: 5300, aqiValue: 425, exhaustFactor: 83 },
  { time: '22:00', trafficVolume: 3100, aqiValue: 360, exhaustFactor: 52 },
];

export const initialCitySummary: CitySummary = {
  overallAQI: 348,
  overallAQICategory: 'Very Poor',
  avgCongestionPercent: 66,
  avgSpeedKmH: 25.2,
  highPollutionZonesCount: 7, // Bawana, Anand Vihar, Mundka, Jahangirpuri, Okhla, Narela, Wazirpur
  highCongestionRoadsCount: 6, // Ring Road S, Ring Road E, NH-48, Vikas Marg, Rohtak Rd, MB Rd
  activeIncidentsCount: 8,
  reportingStationsCount: 28,
  totalStationsCount: 28,
  lastUpdated: 'Live Simulated Sync (10s interval)',
};

export const highPollutionHotspots = [
  { name: 'Bawana Industrial', aqi: 456, category: 'Severe', primary: 'Industrial + Biomass' },
  { name: 'Anand Vihar ISBT', aqi: 442, category: 'Severe', primary: 'Inter-state Diesel Buses' },
  { name: 'Mundka Industrial', aqi: 435, category: 'Severe', primary: 'Road Dust + Trucks' },
  { name: 'Jahangirpuri', aqi: 428, category: 'Severe', primary: 'Vehicular Gridlock' },
  { name: 'Okhla Phase 2', aqi: 418, category: 'Severe', primary: 'Industrial Emissions' },
];

export const highCongestionCorridors = [
  { name: 'Vikas Marg (ITO to Anand Vihar)', speed: '12 km/h', delay: '+26 min', level: 'Severe' },
  { name: 'Mehrauli-Badarpur Road', speed: '13 km/h', delay: '+32 min', level: 'Severe' },
  { name: 'Ring Road South (Dhaula Kuan - Ashram)', speed: '14 km/h', delay: '+30 min', level: 'Severe' },
  { name: 'Rohtak Road (NH-9)', speed: '15 km/h', delay: '+33 min', level: 'Severe' },
  { name: 'Yamuna Bypass (Ring Road East)', speed: '16 km/h', delay: '+22 min', level: 'Severe' },
];
