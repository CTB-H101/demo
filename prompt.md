# Campus Food Truck Swarm System (ACO-inspired) — Vibe Coding Prompt

Build a lightweight, fully working web application for a campus food truck discovery and recommendation system inspired by swarm intelligence (ant colony behavior abstraction).

The system must prioritize simplicity, fast development, and zero complex backend dependencies.

---

## 1. Tech Stack (STRICT REQUIREMENT)

Frontend:
- React + TypeScript (Vite preferred)

Map:
- Leaflet.js (NO Mapbox, NO API keys required)
- OpenStreetMap tiles

Backend:
- None required
- Use localStorage for persistence ONLY

Routing:
- Haversine distance approximation (NO external routing API)

---

## 2. Core Concept

Food trucks are modeled as "food nodes" in a swarm system.

User behavior creates a dynamic feedback field:
- Each food truck has a "crowd level"
- Crowd represents pheromone strength (swarm analogy)
- Users influence crowd by interacting with trucks

The system recommends the best food truck using a weighted scoring model.

---

## 3. Data Model

Each food truck object:

{
  id: string,
  name: string,
  lat: number,
  lng: number,
  inventory: number,
  crowd: number,
  lastUpdated: number
}

---

## 4. Core Features

### 4.1 Map View
- Leaflet map centered on user location
- Show all food trucks as markers
- Highlight recommended truck
- Show user position marker

---

### 4.2 GPS Location
- Use browser geolocation API
- If denied, fallback to campus center coordinate

---

## 5. Food Truck Interaction

Clicking a truck shows:
- Name
- Inventory
- Crowd level
- Estimated wait time
- Button: "I'm waiting here" (+crowd)
- Button: "Leave queue" (-crowd)

Crowd changes must update recommendation in real time.

---

## 6. Recommendation System

System ranks all trucks using:

score = α * distance + β * queue_time - γ * inventory

Where:
- distance = Haversine distance (user → truck)
- queue_time = crowd * 2.5 minutes
- inventory increases attractiveness (reduces score)

Default weights:
- α = 1.0
- β = 1.35
- γ = 0.85

System always recommends lowest score truck.

---

## 7. Swarm Feedback Mechanism (KEY FEATURE)

Simulated pheromone system:

- crowd increases when user clicks "I'm waiting here"
- crowd decreases automatically over time:

crowd = crowd * (1 - decay_rate)

decay_rate = 0.06 every 30 seconds

This simulates pheromone evaporation.

---

## 8. Recommendation Panel

UI shows:
- Best recommended food truck (Top 1 highlighted)
- Top 3 ranked list
- Live updates on interaction

---

## 9. Admin Panel (/admin)

Simple control panel:
- Add food truck
- Edit inventory
- Edit crowd manually
- Delete food truck

No authentication required.

---

## 10. State Management

Use:
- React state (primary)
- localStorage persistence

---

## 11. INITIAL DATA (HARDCODED MOCK)

Use the following dataset as initial food trucks:

const FOOD_TRUCKS = [
  {
    id: "ft1",
    name: "Harvard Burger Truck",
    lat: 42.37442,
    lng: -71.11695,
    inventory: 9,
    crowd: 4,
    lastUpdated: Date.now()
  },
  {
    id: "ft2",
    name: "Cambridge Taco Express",
    lat: 42.37255,
    lng: -71.11880,
    inventory: 6,
    crowd: 7,
    lastUpdated: Date.now()
  },
  {
    id: "ft3",
    name: "Redwood Sushi Cart",
    lat: 42.37610,
    lng: -71.11420,
    inventory: 10,
    crowd: 2,
    lastUpdated: Date.now()
  },
  {
    id: "ft4",
    name: "Boston Fried Chicken Spot",
    lat: 42.37330,
    lng: -71.11290,
    inventory: 5,
    crowd: 5,
    lastUpdated: Date.now()
  }
];

---

## 12. MAP CENTER

Default map center:

lat: 42.3744
lng: -71.1169

---

## 13. OUTPUT REQUIREMENTS

Generate a fully working project including:

- React + TypeScript (Vite)
- Leaflet map integration
- Food truck state system
- Recommendation algorithm module
- Admin panel page (/admin)
- localStorage persistence layer
- Clean README with setup instructions

---

## 14. SYSTEM BEHAVIOR GOAL

The system should clearly demonstrate:

- Dynamic adaptation to user feedback
- Swarm-inspired crowd reinforcement
- Real-time ranking changes
- Intuitive map-based decision making

This is a simplified swarm intelligence system:
NOT full ant colony optimization, but inspired by pheromone-based node reinforcement.