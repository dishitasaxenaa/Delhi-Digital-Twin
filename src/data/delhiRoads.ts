import { RoadSegment } from '../types';

export const delhiRoads: RoadSegment[] = [
  {
    id: 'ROAD-RR-S',
    name: 'Ring Road (South Section: Dhaula Kuan - AIIMS - Ashram)',
    corridor: 'Mahatma Gandhi Marg South',
    type: 'Ring Road',
    coordinates: [
      [77.1610, 28.5912], // Dhaula Kuan
      [77.1720, 28.5750], // Moti Bagh
      [77.1900, 28.5700], // Bhikaji Cama Place
      [77.2080, 28.5680], // AIIMS / Safdarjung
      [77.2280, 28.5670], // South Extension
      [77.2420, 28.5685], // Lajpat Nagar
      [77.2580, 28.5710], // Ashram Chowk
    ],
    congestionLevel: 'Severe',
    avgSpeedKmH: 14,
    speedLimitKmH: 60,
    travelTimeMin: 48,
    normalTimeMin: 18,
    lengthKm: 11.2,
    activeIncidentsCount: 2,
    flowVehiclesPerHour: 4850,
  },
  {
    id: 'ROAD-RR-W',
    name: 'Ring Road (West Section: Punjabi Bagh - Rajouri Garden - Naraina)',
    corridor: 'Mahatma Gandhi Marg West',
    type: 'Ring Road',
    coordinates: [
      [77.1310, 28.6750], // Punjabi Bagh
      [77.1260, 28.6530], // Raja Garden
      [77.1350, 28.6360], // Rajouri Garden / Tagore Garden
      [77.1420, 28.6180], // Mayapuri Flyover
      [77.1500, 28.6010], // Naraina
      [77.1610, 28.5912], // Dhaula Kuan
    ],
    congestionLevel: 'High',
    avgSpeedKmH: 22,
    speedLimitKmH: 60,
    travelTimeMin: 32,
    normalTimeMin: 15,
    lengthKm: 9.8,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 3900,
  },
  {
    id: 'ROAD-RR-N',
    name: 'Ring Road (North Section: Azadpur - Model Town - ISBT Kashmere Gate)',
    corridor: 'Mahatma Gandhi Marg North',
    type: 'Ring Road',
    coordinates: [
      [77.1780, 28.7060], // Azadpur Chowk
      [77.1950, 28.7010], // Model Town
      [77.2150, 28.6940], // Majnu Ka Tila
      [77.2290, 28.6810], // Chandgiram Akhara
      [77.2340, 28.6690], // ISBT Kashmere Gate
      [77.2450, 28.6560], // Shanti Van / Rajghat
    ],
    congestionLevel: 'High',
    avgSpeedKmH: 20,
    speedLimitKmH: 60,
    travelTimeMin: 30,
    normalTimeMin: 14,
    lengthKm: 8.9,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 4200,
  },
  {
    id: 'ROAD-RR-E',
    name: 'Ring Road (East Bypass: Rajghat - Sarai Kale Khan - Ashram)',
    corridor: 'Yamuna Bypass / Mahatma Gandhi Marg East',
    type: 'Ring Road',
    coordinates: [
      [77.2450, 28.6560], // Shanti Van
      [77.2490, 28.6380], // ITO East / IP Power Station
      [77.2550, 28.6140], // Pragati Maidan / Bhairon Marg
      [77.2580, 28.5880], // Sarai Kale Khan ISBT
      [77.2580, 28.5710], // Ashram Chowk
    ],
    congestionLevel: 'Severe',
    avgSpeedKmH: 16,
    speedLimitKmH: 60,
    travelTimeMin: 38,
    normalTimeMin: 16,
    lengthKm: 9.4,
    activeIncidentsCount: 2,
    flowVehiclesPerHour: 4600,
  },
  {
    id: 'ROAD-ORR-S',
    name: 'Outer Ring Road (South: IIT Flyover - Nehru Place - Modi Mill)',
    corridor: 'Outer Ring Road South',
    type: 'Ring Road',
    coordinates: [
      [77.1580, 28.5480], // Munirka Flyover
      [77.1880, 28.5440], // IIT Gate
      [77.2140, 28.5420], // Panchsheel Flyover
      [77.2380, 28.5470], // Chirag Delhi
      [77.2530, 28.5510], // Nehru Place Flyover
      [77.2710, 28.5580], // Modi Mill / Kalkaji
      [77.2880, 28.5630], // Okhla Flyover
    ],
    congestionLevel: 'High',
    avgSpeedKmH: 24,
    speedLimitKmH: 70,
    travelTimeMin: 28,
    normalTimeMin: 14,
    lengthKm: 11.5,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 4300,
  },
  {
    id: 'ROAD-ORR-N',
    name: 'Outer Ring Road (North: Mukarba Chowk - Burari - Wazirabad)',
    corridor: 'Outer Ring Road North',
    type: 'Ring Road',
    coordinates: [
      [77.1530, 28.7250], // Mukarba Chowk
      [77.1850, 28.7290], // Bhalaswa Interchange
      [77.2100, 28.7270], // Burari Crossing
      [77.2340, 28.7180], // Signature Bridge Approach / Wazirabad
    ],
    congestionLevel: 'Moderate',
    avgSpeedKmH: 38,
    speedLimitKmH: 70,
    travelTimeMin: 15,
    normalTimeMin: 10,
    lengthKm: 8.2,
    activeIncidentsCount: 0,
    flowVehiclesPerHour: 3200,
  },
  {
    id: 'ROAD-BP-ELEV',
    name: 'Barapullah Elevated Corridor (Sarai Kale Khan to INA Market)',
    corridor: 'Barapullah Phase I & II',
    type: 'Flyover',
    coordinates: [
      [77.2580, 28.5880], // Sarai Kale Khan
      [77.2450, 28.5820], // Jangpura
      [77.2310, 28.5770], // JLN Stadium
      [77.2160, 28.5720], // Tyagraj Nagar
      [77.2080, 28.5680], // INA / Safdarjung
    ],
    congestionLevel: 'Moderate',
    avgSpeedKmH: 42,
    speedLimitKmH: 60,
    travelTimeMin: 9,
    normalTimeMin: 6,
    lengthKm: 5.8,
    activeIncidentsCount: 0,
    flowVehiclesPerHour: 2800,
  },
  {
    id: 'ROAD-NH48-EXP',
    name: 'NH-48 (Delhi - Gurugram Expressway: Dhaula Kuan to Rajokri)',
    corridor: 'Airport Expressway / National Highway 48',
    type: 'Expressway',
    coordinates: [
      [77.1610, 28.5912], // Dhaula Kuan
      [77.1420, 28.5680], // Delhi Cantt / Subroto Park
      [77.1200, 28.5440], // Mahipalpur Underpass
      [77.1020, 28.5280], // Shiv Murti
      [77.0870, 28.5080], // Rajokri Border (Delhi-Gurugram)
    ],
    congestionLevel: 'Severe',
    avgSpeedKmH: 18,
    speedLimitKmH: 80,
    travelTimeMin: 44,
    normalTimeMin: 14,
    lengthKm: 13.5,
    activeIncidentsCount: 2,
    flowVehiclesPerHour: 5600,
  },
  {
    id: 'ROAD-NH44-GTK',
    name: 'NH-44 (GT Karnal Road: Mukarba Chowk to Singhu Border)',
    corridor: 'Grand Trunk Road North Corridor',
    type: 'Expressway',
    coordinates: [
      [77.1530, 28.7250], // Mukarba Chowk
      [77.1460, 28.7600], // Swaroop Nagar
      [77.1350, 28.8100], // Alipur
      [77.1310, 28.8450], // Bakoli
      [77.1260, 28.8780], // Singhu Border (Delhi-Haryana)
    ],
    congestionLevel: 'Low',
    avgSpeedKmH: 58,
    speedLimitKmH: 80,
    travelTimeMin: 18,
    normalTimeMin: 16,
    lengthKm: 17.8,
    activeIncidentsCount: 0,
    flowVehiclesPerHour: 3400,
  },
  {
    id: 'ROAD-DME-MEERUT',
    name: 'Delhi-Meerut Expressway (Akshardham to UP Gate / Ghazipur)',
    corridor: 'NH-9 / Delhi-Meerut Expressway Phase 1',
    type: 'Expressway',
    coordinates: [
      [77.2790, 28.6180], // Akshardham Temple Junction
      [77.2980, 28.6250], // Mayur Vihar Phase 2
      [77.3170, 28.6310], // Patparganj / Max Hospital
      [77.3380, 28.6380], // UP Gate / Ghazipur Border
    ],
    congestionLevel: 'Low',
    avgSpeedKmH: 64,
    speedLimitKmH: 90,
    travelTimeMin: 9,
    normalTimeMin: 8,
    lengthKm: 8.7,
    activeIncidentsCount: 0,
    flowVehiclesPerHour: 4100,
  },
  {
    id: 'ROAD-DND-FLY',
    name: 'Delhi-Noida Direct (DND) Flyway',
    corridor: 'Yamuna River Crossing Toll Expressway',
    type: 'Expressway',
    coordinates: [
      [77.2560, 28.5800], // Ashram / Maharani Bagh Link
      [77.2720, 28.5820], // Yamuna Main Bridge
      [77.2910, 28.5850], // Mayur Vihar Toll Gate
      [77.3120, 28.5880], // Noida Sector 15A Border
    ],
    congestionLevel: 'Moderate',
    avgSpeedKmH: 52,
    speedLimitKmH: 70,
    travelTimeMin: 8,
    normalTimeMin: 6,
    lengthKm: 6.2,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 4700,
  },
  {
    id: 'ROAD-VIKAS-MARG',
    name: 'Vikas Marg (ITO Bridge to Anand Vihar ISBT)',
    corridor: 'East Delhi Trans-Yamuna Arterial',
    type: 'Arterial',
    coordinates: [
      [77.2460, 28.6300], // ITO Yamuna Bridge
      [77.2650, 28.6320], // Laxmi Nagar Metro Station
      [77.2840, 28.6360], // Nirman Vihar / Preet Vihar
      [77.3020, 28.6420], // Karkardooma Court
      [77.3150, 28.6476], // Anand Vihar ISBT
    ],
    congestionLevel: 'Severe',
    avgSpeedKmH: 12,
    speedLimitKmH: 50,
    travelTimeMin: 42,
    normalTimeMin: 16,
    lengthKm: 8.1,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 3800,
  },
  {
    id: 'ROAD-ROHTAK-NH9',
    name: 'Rohtak Road (NH-9: Punjabi Bagh to Tikri Border)',
    corridor: 'West Delhi Rohtak Corridor',
    type: 'Arterial',
    coordinates: [
      [77.1310, 28.6750], // Punjabi Bagh
      [77.0980, 28.6790], // Peera Garhi Chowk
      [77.0650, 28.6810], // Nangloi
      [77.0270, 28.6835], // Mundka
      [76.9750, 28.6880], // Ghevra
      [76.9200, 28.6920], // Tikri Border (Delhi-Haryana)
    ],
    congestionLevel: 'Severe',
    avgSpeedKmH: 15,
    speedLimitKmH: 60,
    travelTimeMin: 55,
    normalTimeMin: 22,
    lengthKm: 18.2,
    activeIncidentsCount: 2,
    flowVehiclesPerHour: 4050,
  },
  {
    id: 'ROAD-MATHURA-RD',
    name: 'Mathura Road (Ashram Chowk to Badarpur Border)',
    corridor: 'South-East Delhi Industrial Radial',
    type: 'Arterial',
    coordinates: [
      [77.2580, 28.5710], // Ashram Chowk
      [77.2680, 28.5520], // Ishwar Nagar / Holy Family
      [77.2820, 28.5320], // Okhla Industrial Area
      [77.2960, 28.5130], // Sarita Vihar Underpass
      [77.3040, 28.4980], // Mohan Cooperative
      [77.3120, 28.4830], // Badarpur Border (Delhi-Faridabad)
    ],
    congestionLevel: 'High',
    avgSpeedKmH: 21,
    speedLimitKmH: 60,
    travelTimeMin: 35,
    normalTimeMin: 15,
    lengthKm: 11.4,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 4400,
  },
  {
    id: 'ROAD-MB-ROAD',
    name: 'Mehrauli-Badarpur (MB) Road',
    corridor: 'South Delhi Cross-Connector',
    type: 'Sub-Arterial',
    coordinates: [
      [77.1850, 28.5180], // Qutub Minar / Mehrauli
      [77.2080, 28.5170], // Saket / Press Enclave
      [77.2400, 28.5140], // Sangam Vihar / Batra Hospital
      [77.2650, 28.5100], // Khanpur
      [77.2900, 28.5060], // Tughlakabad Fort
      [77.3120, 28.4830], // Badarpur Border
    ],
    congestionLevel: 'Severe',
    avgSpeedKmH: 13,
    speedLimitKmH: 50,
    travelTimeMin: 52,
    normalTimeMin: 20,
    lengthKm: 12.8,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 3600,
  },
  {
    id: 'ROAD-DWARKA-EXP',
    name: 'Dwarka Expressway / UER-II (Shiv Murti to Dwarka Sec 21)',
    corridor: 'Western Express Bypass / UER-II',
    type: 'Expressway',
    coordinates: [
      [77.1020, 28.5280], // Shiv Murti Junction
      [77.0680, 28.5360], // Sector 25 IICC Yashobhoomi
      [77.0520, 28.5520], // Sector 21 Metro Terminal
      [77.0380, 28.5790], // Sector 28 Dwarka
      [77.0150, 28.6180], // Najafgarh-Bijwasan Link
    ],
    congestionLevel: 'Low',
    avgSpeedKmH: 68,
    speedLimitKmH: 90,
    travelTimeMin: 12,
    normalTimeMin: 11,
    lengthKm: 13.9,
    activeIncidentsCount: 0,
    flowVehiclesPerHour: 3100,
  },
  {
    id: 'ROAD-NAJAFGARH-RD',
    name: 'Najafgarh Road (Moti Nagar - Tilak Nagar - Uttam Nagar)',
    corridor: 'West Delhi Blue Line Corridor',
    type: 'Arterial',
    coordinates: [
      [77.1420, 28.6570], // Moti Nagar
      [77.1200, 28.6480], // Raja Garden
      [77.0980, 28.6380], // Tilak Nagar
      [77.0650, 28.6250], // Uttam Nagar East
      [77.0350, 28.6180], // Nawada / Dwarka Mor
      [76.9920, 28.6120], // Najafgarh Firni Road
    ],
    congestionLevel: 'High',
    avgSpeedKmH: 18,
    speedLimitKmH: 50,
    travelTimeMin: 48,
    normalTimeMin: 20,
    lengthKm: 14.6,
    activeIncidentsCount: 1,
    flowVehiclesPerHour: 3700,
  },
];
