// Geographical constants for National Capital Territory of Delhi, India

export const DELHI_CENTER: [number, number] = [77.2090, 28.6139]; // [lng, lat]
export const DELHI_INITIAL_ZOOM = 10.2;

// NCT Delhi Bounding Box [minLng, minLat, maxLng, maxLat]
export const DELHI_BOUNDS: [[number, number], [number, number]] = [
  [76.837, 28.404], // Southwest (Najafgarh / Aya Nagar border)
  [77.348, 28.883], // Northeast (Narela / Yamuna border)
];

// NCT Delhi Boundary GeoJSON Polygon
export const delhiBoundaryGeoJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        name: 'National Capital Territory of Delhi',
        type: 'Union Territory / Capital Region',
        areaSqKm: 1484,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            // Northern Border (Narela / Alipur)
            [77.085, 28.878],
            [77.135, 28.865],
            [77.180, 28.840],
            // North-East Yamuna curve (Sonia Vihar / Wazirabad)
            [77.235, 28.790],
            [77.255, 28.735],
            [77.280, 28.720],
            // Eastern Border with UP (Shahdara / Anand Vihar / Ghazipur)
            [77.320, 28.695],
            [77.340, 28.665],
            [77.335, 28.625],
            [77.325, 28.590],
            // South-East Yamuna / Badarpur / Okhla border
            [77.310, 28.530],
            [77.320, 28.490],
            [77.295, 28.470],
            // Southern Ridge / Aya Nagar / Asola Bhatti
            [77.240, 28.475],
            [77.180, 28.460],
            [77.125, 28.465],
            // South-West Gurugram Border (Kapashera / Bijwasan / Najafgarh)
            [77.080, 28.505],
            [77.030, 28.520],
            [76.960, 28.530],
            [76.890, 28.560],
            // Far Western Border (Najafgarh rural / Dhansa)
            [76.840, 28.590],
            [76.845, 28.640],
            [76.890, 28.680],
            // North-West Border (Mundka / Tikri Kalan / Kanjhawala)
            [76.920, 28.720],
            [76.980, 28.760],
            [77.010, 28.820],
            [77.045, 28.860],
            [77.085, 28.878], // closing ring
          ],
        ],
      },
    },
  ],
};
