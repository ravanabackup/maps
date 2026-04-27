import { Intersection } from './types';

export const INTERSECTIONS: Intersection[] = [
  {
    name: "Capitol Complex / High Court (Sector 1)",
    lat: 30.7554,
    lng: 76.8012,
    cameras: ["PTZ Surveillance", "Fixed CCTV"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "Low-Medium (VIP corridor)",
    green: "15 – 30 sec",
    red: "30 – 60 sec",
    speedLimit: 40
  },
  {
    name: "Matka Chowk (Sector 9/10/16/17)",
    lat: 30.7483,
    lng: 76.7869,
    cameras: ["RLVD", "ANPR", "Overspeed Detection"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "High (Major Arterial)",
    green: "30 – 75 sec",
    red: "60 – 120 sec",
    speedLimit: 50
  },
  {
    name: "Press Light Point (Sector 8/9/17/18)",
    lat: 30.7415,
    lng: 76.7937,
    cameras: ["RLVD", "ANPR", "Fixed CCTV"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "High (Madhya Marg)",
    green: "30 – 75 sec",
    red: "60 – 120 sec",
    speedLimit: 50
  },
  {
    name: "Sector 17/18/21/22 Intersection",
    lat: 30.7331,
    lng: 76.7813,
    cameras: ["RLVD", "ANPR"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "Medium-High (Commercial)",
    green: "20 – 60 sec",
    red: "45 – 90 sec",
    speedLimit: 50
  },
  {
    name: "Transport Light Point (Sector 26/28/Ind. Area)",
    lat: 30.7229,
    lng: 76.8123,
    cameras: ["RLVD", "ANPR", "Overspeed Detection"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "Very High (Heavy Vehicles)",
    green: "40 – 90 sec",
    red: "90 – 150 sec",
    speedLimit: 40
  },
  {
    name: "Iron Market Light Point (Sector 29/30)",
    lat: 30.7165,
    lng: 76.7954,
    cameras: ["RLVD", "ANPR"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "Medium (Dakshin Marg)",
    green: "20 – 50 sec",
    red: "45 – 100 sec",
    speedLimit: 50
  },
  {
    name: "Centra Mall Light Point (Ind. Area Phase 1)",
    lat: 30.7138,
    lng: 76.8031,
    cameras: ["RLVD", "Fixed CCTV"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "Medium",
    green: "20 – 50 sec",
    red: "45 – 90 sec",
    speedLimit: 50
  },
  {
    name: "Tribune Chowk (Sector 29/31/Ind. Area Ph 1/2)",
    lat: 30.7083,
    lng: 76.7961,
    cameras: ["RLVD", "ANPR", "Overspeed Radar"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "Very High (Highway Gateway)",
    green: "45 – 100+ sec",
    red: "100 – 180 sec",
    speedLimit: 60
  },
  {
    name: "Poultry Farm Chowk (Ind. Area Phase 2/Sec 31)",
    lat: 30.6985,
    lng: 76.7912,
    cameras: ["RLVD", "ANPR", "PTZ Surveillance"],
    timing: "Dynamic (ATCS controlled)",
    traffic: "High (Industrial Traffic)",
    green: "30 – 75 sec",
    red: "60 – 120 sec",
    speedLimit: 50
  },
  {
    name: "Housing Board Light Point (Manimajra)",
    lat: 30.7115,
    lng: 76.8322,
    cameras: ["RLVD", "ANPR", "Fixed CCTV"],
    timing: "ATCS Controlled",
    traffic: "High (Panchkula Gateway)",
    green: "45 – 90 sec",
    red: "90 – 160 sec",
    speedLimit: 50
  },
  {
    name: "Kisan Bhawan Chowk (Sector 22/23/35/36)",
    lat: 30.7255,
    lng: 76.7661,
    cameras: ["RLVD", "ANPR", "PTZ"],
    timing: "ATCS Controlled",
    traffic: "High (Commercial Area)",
    green: "30 – 60 sec",
    red: "60 – 120 sec",
    speedLimit: 50
  },
  {
    name: "Sector 34/35/43/44 Intersection",
    lat: 30.7145,
    lng: 76.7589,
    cameras: ["RLVD", "ANPR"],
    timing: "ATCS Controlled",
    traffic: "Medium-High",
    green: "30 – 60 sec",
    red: "60 – 110 sec",
    speedLimit: 50
  },
  {
    name: "Airport Light Point (Zirakpur Road)",
    lat: 30.6765,
    lng: 76.7865,
    cameras: ["Overspeed Radar", "ANPR", "RLVD"],
    timing: "Dynamic",
    traffic: "High (Highway)",
    green: "45 – 90 sec",
    red: "90 – 150 sec",
    speedLimit: 60
  },
  {
    name: "Chawla Chowk (Sector 38/39/40/41)",
    lat: 30.7385,
    lng: 76.7512,
    cameras: ["RLVD", "Fixed CCTV"],
    timing: "ATCS Controlled",
    traffic: "Medium",
    green: "25 – 50 sec",
    red: "50 – 100 sec",
    speedLimit: 50
  },
  {
    name: "Gurdwara Shaheedan Chowk (Mohali/Sec 62)",
    lat: 30.7061,
    lng: 76.7322,
    cameras: ["RLVD", "ANPR"],
    timing: "ATCS Controlled",
    traffic: "High",
    green: "30 – 70 sec",
    red: "60 – 130 sec",
    speedLimit: 50
  },
  {
    name: "Sector 16/17/22/23 (Cricket Stadium Chowk)",
    lat: 30.7389,
    lng: 76.7725,
    cameras: ["RLVD", "ANPR", "PTZ"],
    timing: "ATCS Controlled",
    traffic: "High",
    green: "30 – 60 sec",
    red: "60 – 120 sec",
    speedLimit: 50
  },
  {
    name: "Mohali Border / Vikas Nagar (Phase 6/Sector 56)",
    lat: 30.7289,
    lng: 76.7212,
    cameras: ["ANPR", "Fixed CCTV"],
    timing: "Manual/Timed",
    traffic: "Medium",
    green: "20 – 40 sec",
    red: "40 – 80 sec",
    speedLimit: 40
  },
  {
    name: "Sector 42/43/52/53 (ISBT-43 Corner)",
    lat: 30.7042,
    lng: 76.7441,
    cameras: ["RLVD", "ANPR", "Speed Radar"],
    timing: "ATCS Controlled",
    traffic: "Very High",
    green: "40 – 80 sec",
    red: "80 – 150 sec",
    speedLimit: 50
  }
];

export const WORK_LOCATION = {
  name: "Central Judicial Archives",
  address: "Plot number 841, Industrial Area Phase II, Chandigarh",
  lat: 30.6974,
  lng: 76.7924
};

export const HOME_LOCATION = {
  name: "Home",
  lat: 30.7331,
  lng: 76.7813 // Example home: Sector 17
};
