/**
 * Mock place data — DEMO CONTENT ONLY.
 *
 * ⚠️  These records are illustrative only. They are not verified, not sourced
 *     from community reviews, and must never be presented as real or accurate
 *     to users. Every entry carries `_demo: true` to make this explicit.
 *
 * Data model:
 *   id          — stable URL-safe slug
 *   regionId    — references src/data/regions.js id (NOT a town name string)
 *   name        — display name
 *   categoryId  — matches an id from src/data/categories.js
 *   tagline     — one-line hook
 *   description — full description paragraph
 *   location    — sub-region info for display (town, landmark, directions)
 *   access      — practical access details
 *   coordinates — null when unknown; object when approximate
 *   media       — placeholder images (no fabricated photos)
 *   _demo       — MUST remain true; never remove
 */

/**
 * @typedef {Object} PlaceLocation
 * @property {string}  town        - Town or locality within the region
 * @property {string}  landmark    - Nearest well-known reference point
 * @property {string}  directions  - Human-readable directions (illustrative)
 */

/**
 * @typedef {Object} PlaceAccess
 * @property {'easy'|'moderate'|'difficult'|'unknown'} difficulty
 * @property {string}  road        - Road surface description
 * @property {string}  transport   - Transport options
 * @property {string|null} entryFee - Approximate entry cost or null
 * @property {string|null} bestTime - Best time to visit
 */

/**
 * @typedef {Object} PlaceCoordinates
 * @property {number} lat
 * @property {number} lng
 * @property {'approximate'|'exact'} accuracy
 */

/**
 * @typedef {Object} Place
 * @property {string}            id
 * @property {string}            regionId
 * @property {string}            name
 * @property {string}            categoryId
 * @property {string}            tagline
 * @property {string}            description
 * @property {PlaceLocation}     location
 * @property {PlaceAccess}       access
 * @property {PlaceCoordinates|null} coordinates
 * @property {string[]}          tags
 * @property {boolean}           _demo
 */

/** @type {Place[]} */
export const MOCK_PLACES = [
  // ── FOOD ──────────────────────────────────────────────────────────────────
  {
    id: "demo-kfc-malappuram",
    regionId: "malappuram-kerala",
    name: "Demo Biriyani Corner",
    categoryId: "food",
    tagline: "A legendary spot for Malabar-style biriyani",
    description:
      "This illustrative eatery represents the kind of local biriyani stall that LOCALAY will surface once community members start adding places. The Malabar biriyani — fragrant with small-grain rice, slow-cooked meat, and fried onions — is a defining dish of the region. No fabricated ratings or reviews are shown here.",
    location: {
      town: "Malappuram Town",
      landmark: "Near KSRTC Bus Stand",
      directions: "Exit the bus stand main gate, turn left, walk 200 m.",
    },
    access: {
      difficulty: "easy",
      road: "Paved main road",
      transport: "Walking distance from bus stand, auto-rickshaws available",
      entryFee: null,
      bestTime: "Lunch hours, 12 pm – 2 pm",
    },
    coordinates: null,
    tags: ["biriyani", "street food", "lunch"],
    _demo: true,
  },
  {
    id: "demo-ipha-tea-stall",
    regionId: "malappuram-kerala",
    name: "Demo Hillside Tea Stall",
    categoryId: "food",
    tagline: "Chai and snacks with a paddy-field view",
    description:
      "This is a placeholder entry for the kind of small, roadside tea stall that dotted the hills of Malappuram. LOCALAY aims to surface these unsung spots through community contributions. Content is illustrative only.",
    location: {
      town: "Tirur",
      landmark: "NH 66 junction",
      directions: "Take NH 66 northbound, stall is on the right side after the bridge.",
    },
    access: {
      difficulty: "easy",
      road: "National highway",
      transport: "Bus routes from Malappuram town stop nearby",
      entryFee: null,
      bestTime: "Morning and evening",
    },
    coordinates: { lat: 10.913, lng: 75.921, accuracy: "approximate" },
    tags: ["chai", "snacks", "roadside"],
    _demo: true,
  },

  // ── NATURE ────────────────────────────────────────────────────────────────
  {
    id: "demo-paddy-panorama",
    regionId: "malappuram-kerala",
    name: "Demo Paddy Panorama",
    categoryId: "nature",
    tagline: "Vast terraced paddy fields stretching to the horizon",
    description:
      "This illustrative listing represents the type of scenic paddy landscape found across central Malappuram district. Actual coordinates are not confirmed and will be updated when a community member verifies them. Content is demo only.",
    location: {
      town: "Perinthalmanna",
      landmark: "Malappuram–Palakkad Road",
      directions: "6 km east of Perinthalmanna town centre. Look for the water tower on the left.",
    },
    access: {
      difficulty: "easy",
      road: "Paved district road, partially narrow",
      transport: "State bus routes from Perinthalmanna",
      entryFee: null,
      bestTime: "June–September (planting season) or November–December (harvest)",
    },
    coordinates: { lat: 10.975, lng: 76.232, accuracy: "approximate" },
    tags: ["paddy", "scenic", "countryside", "photography"],
    _demo: true,
  },
  {
    id: "demo-riverbank-grove",
    regionId: "malappuram-kerala",
    name: "Demo Riverbank Grove",
    categoryId: "nature",
    tagline: "Shaded bamboo grove along the Bharathapuzha bank",
    description:
      "A placeholder for the kind of quiet riverside spots communities treasure but which rarely appear on maps. Once LOCALAY launches community submissions, spots like this will be documented with access details and honest notes. This entry is demo only.",
    location: {
      town: "Tirur",
      landmark: "Old Tirur bridge",
      directions: "From Tirur town, head south on the river road for 1.5 km.",
    },
    access: {
      difficulty: "moderate",
      road: "Unpaved riverside path for the last 500 m",
      transport: "Auto-rickshaws reach the trailhead; walk the rest",
      entryFee: null,
      bestTime: "Early morning or late afternoon",
    },
    coordinates: { lat: 10.914, lng: 75.924, accuracy: "approximate" },
    tags: ["river", "bamboo", "peaceful", "nature walk"],
    _demo: true,
  },

  // ── VIEWPOINTS ────────────────────────────────────────────────────────────
  {
    id: "demo-hilltop-vista",
    regionId: "malappuram-kerala",
    name: "Demo Hilltop Vista",
    categoryId: "viewpoints",
    tagline: "360-degree view over the district at dusk",
    description:
      "Illustrative listing for an elevated viewpoint in the Nilambur hills. This type of spot provides sweeping views of the Western Ghats foothills and surrounding valleys. Coordinates are not confirmed. Content is demo only.",
    location: {
      town: "Nilambur",
      landmark: "Forest Department checkpoint",
      directions: "14 km from Nilambur town on the Ooty road. Turn left at the checkpoint.",
    },
    access: {
      difficulty: "moderate",
      road: "Partly ghat road with hairpin bends",
      transport: "Private vehicle or jeep; no regular bus service",
      entryFee: "₹20 (illustrative — not verified)",
      bestTime: "Sunset, October–March",
    },
    coordinates: { lat: 11.275, lng: 76.228, accuracy: "approximate" },
    tags: ["sunset", "hills", "western ghats", "photography"],
    _demo: true,
  },
  {
    id: "demo-fort-walls",
    regionId: "malappuram-kerala",
    name: "Demo Fort Walls Viewpoint",
    categoryId: "viewpoints",
    tagline: "Historic ramparts overlooking the old town",
    description:
      "Placeholder for a heritage viewpoint on the old fort walls. LOCALAY will document these historical vantage points with community context once place submissions open. No fabricated history is provided here. Content is demo only.",
    location: {
      town: "Malappuram Town",
      landmark: "Kottakkunnu Hill",
      directions: "Kottakkunnu is signposted from the town centre. Walk to the upper terrace.",
    },
    access: {
      difficulty: "easy",
      road: "Paved path to the top",
      transport: "Walking distance from Malappuram town centre",
      entryFee: null,
      bestTime: "Morning or evening",
    },
    coordinates: { lat: 11.052, lng: 76.074, accuracy: "approximate" },
    tags: ["heritage", "historic", "hill", "town view"],
    _demo: true,
  },

  // ── WATERFALLS ────────────────────────────────────────────────────────────
  {
    id: "demo-cascade-falls",
    regionId: "malappuram-kerala",
    name: "Demo Cascade Falls",
    categoryId: "waterfalls",
    tagline: "Seasonal waterfall active from June to October",
    description:
      "This illustrative waterfall listing is typical of the monsoon-fed falls found in the Nilambur forest belt. The falls are seasonal and may dry up by February. Access details and safety information here are illustrative — community members must verify before visiting. Demo content only.",
    location: {
      town: "Nilambur",
      landmark: "Teak Museum Road",
      directions: "8 km from Nilambur, turn onto the forest track after the museum.",
    },
    access: {
      difficulty: "moderate",
      road: "Forest track, suitable for 4WD in monsoon",
      transport: "No public transport; private vehicle required",
      entryFee: "₹50 entry to the forest area (illustrative — not verified)",
      bestTime: "July–September when water levels are high",
    },
    coordinates: { lat: 11.312, lng: 76.187, accuracy: "approximate" },
    tags: ["waterfall", "monsoon", "forest", "nature"],
    _demo: true,
  },
  {
    id: "demo-stream-pool",
    regionId: "malappuram-kerala",
    name: "Demo Stream Pool",
    categoryId: "waterfalls",
    tagline: "A calm rock pool fed by a small cascade",
    description:
      "An illustrative listing for a small, community-favourite swimming spot fed by a natural stream. Exact location is not confirmed. Community members are expected to add verified access notes when place submissions open. Demo content only.",
    location: {
      town: "Wandoor",
      landmark: "Wandoor Forest Range",
      directions: "From Wandoor town, take the forest road 3 km north.",
    },
    access: {
      difficulty: "moderate",
      road: "Unpaved forest road",
      transport: "Private vehicle; auto-rickshaws available from Wandoor",
      entryFee: null,
      bestTime: "October–January",
    },
    coordinates: null,
    tags: ["stream", "swimming", "forest", "cool"],
    _demo: true,
  },

  // ── TREKS ─────────────────────────────────────────────────────────────────
  {
    id: "demo-ridge-trail",
    regionId: "malappuram-kerala",
    name: "Demo Ridge Trail",
    categoryId: "treks",
    tagline: "A half-day ridge walk with Western Ghats views",
    description:
      "This placeholder represents a category of forest ridge treks in the Nilambur area that offer sweeping views of the Ghats. Trail markings are not verified and should be confirmed locally before attempting. Content is demo only — no safety recommendations are implied.",
    location: {
      town: "Nilambur",
      landmark: "Nedumkayam Rainforest",
      directions: "Entry from Nedumkayam checkpoint, 22 km from Nilambur.",
    },
    access: {
      difficulty: "difficult",
      road: "No road; footpath only",
      transport: "Private vehicle to trailhead; guided groups advisable",
      entryFee: "Forest permit required (illustrative — not verified)",
      bestTime: "November–February (dry season)",
    },
    coordinates: { lat: 11.175, lng: 76.152, accuracy: "approximate" },
    tags: ["trekking", "forest", "ghats", "guided"],
    _demo: true,
  },
  {
    id: "demo-village-loop",
    regionId: "malappuram-kerala",
    name: "Demo Village Loop Walk",
    categoryId: "treks",
    tagline: "An easy loop through paddy fields and old houses",
    description:
      "An illustrative easy walking route through rural Malappuram, representing the kind of gentle cultural walk community members will document. Route is not verified. Content is demo only.",
    location: {
      town: "Kottakkal",
      landmark: "Arya Vaidya Sala junction",
      directions: "Start from the Arya Vaidya Sala main gate and follow the circular lane.",
    },
    access: {
      difficulty: "easy",
      road: "Village lanes, mostly flat",
      transport: "Kottakkal is well-connected by bus from Malappuram",
      entryFee: null,
      bestTime: "Early morning",
    },
    coordinates: { lat: 11.002, lng: 76.009, accuracy: "approximate" },
    tags: ["walking", "village", "cultural", "easy"],
    _demo: true,
  },

  // ── EXPERIENCES ────────────────────────────────────────────────────────────
  {
    id: "demo-craft-market",
    regionId: "malappuram-kerala",
    name: "Demo Weekly Craft Market",
    categoryId: "experiences",
    tagline: "Traditional crafts, produce, and local artisans",
    description:
      "This is a placeholder for the kind of weekly local market that LOCALAY will document with community help — stall schedules, specialties, and access notes. No fabricated vendors or prices are listed. Content is demo only.",
    location: {
      town: "Malappuram Town",
      landmark: "Town Square (Chemmad Road end)",
      directions: "From the KSRTC stand walk north on Chemmad Road, market on the right.",
    },
    access: {
      difficulty: "easy",
      road: "Town centre, paved",
      transport: "Walking distance from town centre",
      entryFee: null,
      bestTime: "Sunday mornings, 7 am – 12 pm (illustrative — not verified)",
    },
    coordinates: null,
    tags: ["market", "crafts", "local", "weekly"],
    _demo: true,
  },
  {
    id: "demo-harvest-festival",
    regionId: "malappuram-kerala",
    name: "Demo Harvest Festival",
    categoryId: "experiences",
    tagline: "Annual community celebration after the paddy harvest",
    description:
      "Illustrative listing for a seasonal community event. LOCALAY will surface verified cultural events once community submissions open. Dates and details here are entirely fictional. Content is demo only.",
    location: {
      town: "Perinthalmanna",
      landmark: "Perinthalmanna Town Ground",
      directions: "Signposted from the main junction in Perinthalmanna.",
    },
    access: {
      difficulty: "easy",
      road: "Town centre",
      transport: "Buses from Malappuram town (45 min)",
      entryFee: null,
      bestTime: "December–January (post-harvest season, illustrative)",
    },
    coordinates: null,
    tags: ["festival", "cultural", "seasonal", "community"],
    _demo: true,
  },
];
