# Nepal Opportunity Map (Catalyst) — Frontend

> An AI-powered GIS platform that helps entrepreneurs, investors, municipalities, and policymakers discover business opportunities across Nepal using geographic, demographic, agricultural, tourism, infrastructure, and economic data.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x

### 1. Clone & Install Dependencies
```bash
cd nepal-opportunity-map
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. MSW (Mock Service Worker) automatically intercepts API calls in development mode.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts Vite dev server with MSW mock layer |
| `build` | `npm run build` | Compiles TypeScript and builds production bundle |
| `type-check` | `npm run type-check` | Runs TypeScript compiler in strict mode without emitting |
| `lint` | `npm run lint` | Runs ESLint across all `src/` files |
| `lint:fix` | `npm run lint:fix` | Automatically fixes auto-fixable ESLint warnings |
| `format` | `npm run format` | Formats codebase with Prettier |
| `test` | `npm run test` | Runs Vitest unit & component test suite |
| `preview` | `npm run preview` | Previews production build output locally |

---

## 🔑 Environment Variables Reference

| Variable Name | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.nepalopportunitymap.gov.np/v1` | Root URL for backend REST API calls |
| `VITE_MAP_TILE_URL` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | MapLibre raster tile server URL pattern |
| `VITE_MAP_STYLE_URL` | `https://demotiles.maplibre.org/style.json` | MapLibre JSON style sheet URL |
| `VITE_APP_ENV` | `development` | Environment mode (`development` enables MSW mocks) |
| `VITE_ENABLE_AI_RECOMMENDATIONS` | `true` | Feature flag for AI venture cards |

> **Note on PDF Export**: Reports currently generate PDFs client-side using `jsPDF` + `html2canvas`. This should be replaced with a server-side PDF rendering endpoint once the FastAPI backend is online for higher visual fidelity.

---

## 📁 Folder Structure Guide

```
nepal-opportunity-map/
├── .env.example
├── .env.local
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx                # App entry point (MSW initialization)
    ├── App.tsx                 # Core layout shell & router outlet
    ├── routes/                 # React Router v6 definitions & ProtectedRoute
    ├── pages/                  # Page route components (lazy-loaded)
    │   ├── HomePage/
    │   ├── MapExplorerPage/
    │   ├── MunicipalityDetailPage/
    │   ├── ComparePage/
    │   ├── RecommendationsPage/
    │   ├── ReportsPage/
    │   └── auth/
    ├── features/               # Feature-sliced domain modules
    │   ├── map/                # MapLibre container, controls, detail drawer
    │   ├── municipalities/     # Resource profile, asset indicators
    │   ├── recommendations/    # AI venture cards & rationale modals
    │   ├── dashboard/          # Recharts comparative radar & data tables
    │   ├── reports/            # PDF/CSV generator
    │   └── auth/               # Session forms
    ├── components/             # Reusable presentational UI primitives
    │   ├── ui/                 # Button, Card, Badge, Input, Modal, Skeleton...
    │   └── layout/             # Header, Sidebar, PageContainer, Footer
    ├── services/               # API Layer (apiClient, endpoints, feature APIs)
    ├── store/                  # Zustand stores (auth, filter, UI, map)
    ├── types/                  # Shared TypeScript interfaces (Municipality, Rec...)
    ├── constants/              # Enums, map layers, province definitions
    ├── lib/                    # Formatters, queryClient config
    └── test/                   # Vitest setup & MSW handlers
```

---

## ➕ How to Add a New Page / Feature

1. **Define Types**: Add any new interfaces to `src/types/index.ts`.
2. **Add Endpoints**: Register REST paths as named constants in `src/services/endpoints.ts`.
3. **Create API Module**: Add service calls in `src/services/<feature>.api.ts`.
4. **Mock Responses**: Add MSW handlers in `src/test/mocks/handlers.ts`.
5. **Build Feature Module**: Create `src/features/<feature_name>/` with components and an `index.ts` barrel export.
6. **Create Page Component**: Add `src/pages/<FeaturePage>/<FeaturePage>.tsx`.
7. **Register Route**: Lazy-load the page in `src/routes/index.tsx`.
