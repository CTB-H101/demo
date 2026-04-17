# Campus Food Truck Swarm System

A lightweight React + TypeScript app for campus food truck discovery and recommendation, inspired by swarm behavior (crowd reinforcement and pheromone evaporation).

## Tech Stack

- React + TypeScript + Vite
- Leaflet + OpenStreetMap tiles
- React Router (`/` and `/admin`)
- `localStorage` persistence only
- Vitest + Playwright tests

## Core Behavior

- Users are placed by browser geolocation; fallback center is `42.3744, -71.1169`
- Trucks are scored in real time:

```txt
score = alpha * distance + beta * queue_time - gamma * inventory
```

- `distance`: Haversine distance in kilometers
- `queue_time`: `crowd * 2.5` minutes
- Lower score is better

Default weights:

- `alpha = 1.0`
- `beta = 1.35`
- `gamma = 0.85`

Crowd decay model:

```txt
crowd = crowd * (1 - 0.06)  // every 30 seconds
```

Compensation decay is also applied at startup based on elapsed time since each truck's `lastUpdated`.

## Features

- Leaflet map with user marker and truck markers
- Recommended truck highlighting
- Queue interactions:
  - `I'm waiting here` (+crowd)
  - `Leave queue` (-crowd, floored at 0)
- Each truck has a dish menu with item names and prices
- Top 1 recommendation + Top 3 ranked list with live updates
- Admin panel (`/admin`) to add, edit, and delete trucks
- Admin system configuration for ranking and decay parameters
- Admin menu configuration supports `Dish Name | Price` per line
- Full persistence in browser `localStorage` key: `ctb_food_trucks_v1`

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scripts

```bash
npm run dev         # development server
npm run build       # type check + production build
npm run preview     # preview production build
npm run test        # unit tests with coverage
npm run test:e2e    # Playwright e2e tests
npm run test:all    # unit + e2e
```

## GitHub Pages

- This repo is configured for automatic GitHub Pages deployment via:
  - `.github/workflows/deploy-pages.yml`
- On every push to `main`, GitHub Actions builds `dist` and deploys it.
- For this repo (`CTB-H101/demo`), the site URL is:
  - `https://ctb-h101.github.io/demo/`

If you open `https://ctb-h101.github.io/src/main.tsx`, it will always be 404 because `src` is source code, not deployed build output.

## Initial Data

The app seeds four trucks:

- Harvard Burger Truck
- Cambridge Taco Express
- Redwood Sushi Cart
- Boston Fried Chicken Spot
