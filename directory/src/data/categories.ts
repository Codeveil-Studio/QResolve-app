export interface Category {
  title: string;
  sub: string;
  slug: string;
  keywords: string[];
}

export const categories: Category[] = [
  {
    title: "Vending & Automated Retail",
    sub: "Machines, kiosks, micro-markets",
    slug: "vending-and-automated-retail",
    keywords: ["vending machine", "kiosk", "micro market", "automated retail", "snack machine", "beverage machine", "coffee machine", "self-service"],
  },
  {
    title: "EV Charger Maintenance",
    sub: "Charging posts, payment terminals",
    slug: "ev-charger-maintenance",
    keywords: ["ev", "electric vehicle", "charger", "charging station", "charging post", "payment terminal", "ev charging", "electric car"],
  },
  {
    title: "Lift Engineers",
    sub: "Passenger, freight, escalators",
    slug: "lift-and-escalator",
    keywords: ["lift", "elevator", "escalator", "passenger lift", "freight lift", "goods lift", "service lift", "moving staircase", "dumbwaiter"],
  },
  {
    title: "HVAC Servicing",
    sub: "Cooling, heating, ventilation",
    slug: "hvac-refrigeration",
    keywords: ["hvac", "air conditioning", "ac", "heating", "ventilation", "cooling", "refrigeration", "chiller", "ahu", "air handler", "duct", "thermostat"],
  },
  {
    title: "Commercial Cleaning",
    sub: "Office, retail, industrial spaces",
    slug: "commercial-cleaning",
    keywords: ["cleaning", "janitorial", "housekeeping", "office cleaning", "industrial cleaning", "deep cleaning", "sanitization", "disinfection", "floor cleaning"],
  },
  {
    title: "Fire Safety",
    sub: "Alarms, extinguishers, compliance",
    slug: "fire-safety-systems",
    keywords: ["fire", "fire alarm", "fire extinguisher", "sprinkler", "smoke detector", "fire suppression", "fire compliance", "fire hydrant", "fire safety audit"],
  },
  {
    title: "Security & Access",
    sub: "CCTV, access control, alarms",
    slug: "security-and-access",
    keywords: ["security", "cctv", "camera", "surveillance", "access control", "biometric", "alarm", "guard", "intrusion detection", "boom barrier"],
  },
  {
    title: "Solar & Energy",
    sub: "Panels, battery, EPC",
    slug: "solar-and-energy",
    keywords: ["solar", "solar panel", "photovoltaic", "battery", "energy", "renewable", "epc", "inverter", "solar rooftop", "net metering"],
  },
  {
    title: "Electrical Services",
    sub: "Testing, installation, emergency",
    slug: "electrical-services",
    keywords: ["electrical", "electrician", "wiring", "switchboard", "transformer", "power", "emergency electrical", "electrical testing", "mcb", "circuit breaker"],
  },
  {
    title: "Plumbing & Water",
    sub: "Pipes, boilers, water treatment",
    slug: "plumbing-and-water",
    keywords: ["plumbing", "plumber", "pipe", "boiler", "water treatment", "drainage", "sewage", "water tank", "tap", "leak", "water heater", "geyser"],
  },
  {
    title: "Car Repair Services",
    sub: "Multi-brand car service & repair",
    slug: "car-repair-services",
    keywords: ["car", "car repair", "car service", "automobile", "vehicle repair", "mechanic", "denting", "painting", "car wash", "garage", "auto repair"],
  },
];

export const citySlugMap: Record<string, string> = {
  "Mumbai": "mumbai",
  "Delhi NCR": "delhi",
  "Bangalore": "bangalore",
  "Hyderabad": "hyderabad",
  "Chennai": "chennai",
  "Pune": "pune",
  "Kolkata": "kolkata",
  "Ahmedabad": "ahmedabad",
};

export const slugify = (text: string) =>
  text.toLowerCase().trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
