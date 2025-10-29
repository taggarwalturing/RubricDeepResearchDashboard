# Amazon Review Dashboard

A modern, responsive dashboard application built with React, TypeScript, and Tailwind CSS to visualize and analyze Amazon review quality metrics and performance statistics.

## Features

- **📊 Key Metrics Dashboard**: View total conversations, pass rate, fail rate, and average quality scores at a glance
- **📈 Performance Overview**: Analyze quality metrics across reviewers, trainers, and domains with filterable data table
- **📉 Quality Dimensions Distribution**: Visualize pass/fail distribution across quality metrics with interactive bar charts
- **🔄 Mock API Support**: Built-in mock API for development without backend dependency
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts
- **⚡ Real-time Data Fetching**: Async data loading with proper loading states and error handling
- **🎨 Modern UI**: Clean, professional interface with custom design system
- **♿ Accessible**: ARIA labels, semantic HTML, and keyboard navigation support
- **🔒 Type Safety**: Full TypeScript implementation with strict type checking
- **🏗️ Production Ready**: Configuration-based architecture with centralized constants

## Tech Stack

- **React 19** - UI library with latest features
- **TypeScript 5.9** - Static type checking
- **Vite 7** - Lightning-fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router 7** - Client-side routing
- **Recharts 3** - Composable charting library
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - Component variant management
- **clsx + tailwind-merge** - Conditional className management

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── charts/              # Chart components
│   │   │   └── quality-line-chart.tsx
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── filterable-data-table.tsx
│   │   │   ├── filterable-pie-chart.tsx
│   │   │   └── metric-card.tsx
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── accordion.tsx
│   │   │   ├── card.tsx
│   │   │   ├── error-message.tsx
│   │   │   ├── icons.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── section-header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── tabs.tsx
│   │   └── error-boundary.tsx   # Global error boundary
│   ├── config/                  # Application configuration
│   │   └── app.config.ts        # Environment-based configuration
│   ├── constants/               # Application constants
│   │   └── app.constants.ts     # Static content, styles, and magic strings
│   ├── data/                    # Mock data
│   │   └── mock-api-data.ts     # Mock API data loader
│   ├── hooks/                   # Custom React hooks
│   │   └── use-api.hook.ts      # Data fetching hook
│   ├── lib/                     # Utility functions
│   │   └── utils.ts             # Helper functions (cn, etc.)
│   ├── pages/                   # Page components
│   │   └── dashboard.tsx        # Main dashboard page
│   ├── services/                # API service layer
│   │   ├── api.service.ts       # Real API service
│   │   └── mock-api.service.ts  # Mock API service
│   ├── types/                   # TypeScript type definitions
│   │   └── api.type.ts          # API response types
│   ├── utils/                   # Utility functions
│   │   └── transform.ts         # Data transformation utilities
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   ├── router.tsx               # Route configuration
│   └── index.css                # Global styles and CSS variables
├── mockApiResponse/             # Mock API JSON data
│   ├── overall.json
│   ├── by-reviewer.json
│   ├── by-trainer-level.json
│   └── task-level.json
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Architecture

### Configuration (`src/config/app.config.ts`)

The application uses environment variables for configuration:

```typescript
interface AppConfig {
  apiBaseUrl: string      // API base URL
  apiTimeout: number      // API request timeout (ms)
  appName: string         // Application name
  isDevelopment: boolean  // Development mode flag
  isProduction: boolean   // Production mode flag
  useMockApi: boolean     // Use mock API instead of real backend
}
```

### Constants (`src/constants/app.constants.ts`)

All static content, styles, and magic values are centralized:

- **APP_CONTENT**: Application text, error messages, navigation labels
- **STATISTICS_CONTENT**: Dashboard content (titles, descriptions, metrics)
- **API_ENDPOINTS**: API endpoint paths
- **SPINNER_SIZES**: Loading spinner size variants
- **HTTP_STATUS**: HTTP status code constants
- **LAYOUT**: Reusable layout classes (spacing, padding, grid)
- **TYPOGRAPHY**: Text style classes
- **TABLE_STYLES**: Table component styles
- **ICON_SIZES**: Icon size variants

**Benefits:**
- ✅ Single source of truth for all content
- ✅ Easy internationalization (i18n) support
- ✅ Type-safe constant values with `as const`
- ✅ Eliminates magic strings and numbers
- ✅ Consistent styling across components

### Custom Hooks

#### `useApi` Hook

A powerful custom hook for data fetching with automatic cleanup:

```typescript
const { data, error, isLoading } = useApi({
  fetchFn: getPreDeliveryOverview,
  enabled: true, // optional
})
```

**Features:**
- ✅ Automatic abort on unmount
- ✅ Loading state management
- ✅ Error handling
- ✅ TypeScript generics for type safety
- ✅ Conditional fetching with `enabled` flag

### Data Transformation

The application automatically transforms API responses from `snake_case` to `camelCase` using the `transform.ts` utility, ensuring consistent naming conventions throughout the codebase.

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- (Optional) Backend API running on http://localhost:8000

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd RubricDeepResearchDashboard/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=Amazon Review Dashboard

# Mock API (set to 'true' for development without backend)
VITE_USE_MOCK_API=true

# Backend server URL for proxy
VITE_BACKEND_URL=http://localhost:8000
```

4. **Start the development server:**
```bash
npm run dev
```

The application will be available at **http://localhost:5173**

### Development Modes

#### With Mock API (No Backend Required)

Set `VITE_USE_MOCK_API=true` in your `.env` file to use mock data:

```env
VITE_USE_MOCK_API=true
```

This mode uses static JSON files from `mockApiResponse/` directory, perfect for:
- Frontend development without backend
- Testing UI components
- Demos and presentations

#### With Real Backend API

Set `VITE_USE_MOCK_API=false` and configure the API URL:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Ensure your backend API is running and accessible.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

### API Endpoints

The dashboard connects to the following REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pre-delivery/overview` | GET | Overall quality metrics and conversation count |
| `/pre-delivery/by-reviewer` | GET | Quality metrics grouped by reviewer |
| `/pre-delivery/by-trainer` | GET | Quality metrics grouped by trainer level |
| `/pre-delivery/by-domain` | GET | Quality metrics grouped by domain |

### Response Format

All endpoints return data in `snake_case` format, which is automatically transformed to `camelCase`:

```typescript
// API Response (snake_case)
{
  "conversation_count": 1000,
  "quality_dimensions": [
    {
      "name": "Dimension Name",
      "pass_count": 50,
      "not_pass_count": 10,
      "average_score": 4.5
    }
  ]
}

// Transformed (camelCase)
{
  conversationCount: 1000,
  qualityDimensions: [
    {
      name: "Dimension Name",
      passCount: 50,
      notPassCount: 10,
      averageScore: 4.5
    }
  ]
}
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the Vite application:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Base URL for API requests | `http://localhost:8000/api/v1` | Yes |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` | No |
| `VITE_APP_NAME` | Application name displayed in UI | `Amazon Review Dashboard` | No |
| `VITE_USE_MOCK_API` | Use mock API (`true`/`false`) | `true` | No |
| `VITE_BACKEND_URL` | Backend URL for Vite proxy | `http://localhost:8000` | No |

**Note:** Create a `.env` file from `.env.example` and configure these variables before running the application.

## Production Deployment

### Building for Production

```bash
# Type check and build
npm run build

# Preview production build locally
npm run preview
```

The optimized production build will be created in the `dist/` directory.

### Production Environment Configuration

1. **Create `.env.production` file:**
```env
VITE_API_BASE_URL=https://api.production.com/api/v1
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Amazon Review Dashboard
VITE_USE_MOCK_API=false
VITE_BACKEND_URL=https://api.production.com
```

2. **Build with production environment:**
```bash
npm run build
```

### Deployment Options

#### Option 1: Static Hosting (Recommended)

Deploy the `dist/` folder to:
- **Vercel**: `vercel deploy` (zero-config)
- **Netlify**: Drag & drop `dist/` folder or use CLI
- **AWS S3 + CloudFront**: Upload to S3 bucket with CloudFront CDN
- **GitHub Pages**: Use `gh-pages` branch deployment
- **Azure Static Web Apps**: Connect your repository

#### Option 2: Docker Container

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t rubric-dashboard-frontend .
docker run -p 80:80 rubric-dashboard-frontend
```

#### Option 3: Node.js Server

Use a simple Express server to serve the static files:
```bash
npm install -g serve
serve -s dist -l 3000
```

### Performance Optimization

- ✅ **Code Splitting**: Routes are lazy-loaded automatically
- ✅ **Tree Shaking**: Unused code is eliminated during build
- ✅ **Asset Optimization**: Images and CSS are minified
- ✅ **Gzip Compression**: Enable on your server/CDN
- ✅ **Caching Headers**: Configure long-term caching for assets

## Design Principles & Best Practices

### Code Quality

- ✅ **Functional Programming**: Pure functions and declarative code patterns
- ✅ **Component Composition**: Small, focused, reusable components
- ✅ **Type Safety**: Strict TypeScript with no `any` types
- ✅ **Error Handling**: Proper error boundaries and user-friendly error messages
- ✅ **Configuration-Based**: Centralized constants, no magic values
- ✅ **Single Responsibility**: Each component/function has one clear purpose

### User Experience

- ✅ **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- ✅ **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- ✅ **Loading States**: Smooth loading indicators for async operations
- ✅ **Error Recovery**: Clear error messages with actionable feedback
- ✅ **Performance**: Code splitting, lazy loading, optimized renders

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `MetricCard`, `FilterableDataTable` |
| **Files** | kebab-case | `metric-card.tsx`, `use-api.hook.ts` |
| **Functions** | camelCase | `getPreDeliveryOverview()` |
| **Constants** | UPPER_SNAKE_CASE | `APP_CONTENT`, `SPINNER_SIZES` |
| **Booleans** | Auxiliary verbs | `isLoading`, `hasError`, `shouldRender` |
| **Types/Interfaces** | PascalCase | `ApiResponse`, `MetricCardProps` |
| **CSS Classes** | utility-based | Tailwind utility classes |

## Code Organization Best Practices

### Adding New Content

1. Add text content to `src/constants/app.constants.ts`:
```typescript
export const NEW_FEATURE_CONTENT = {
  title: "New Feature",
  description: "Feature description",
} as const
```

2. Import and use in components:
```typescript
import { NEW_FEATURE_CONTENT } from "../constants/app.constants"

function NewFeature() {
  return <h1>{NEW_FEATURE_CONTENT.title}</h1>
}
```

### Adding Configuration

1. Add to `.env.example`:
```env
VITE_NEW_CONFIG=value
```

2. Update `src/config/app.config.ts`:
```typescript
interface AppConfig {
  // ... existing config
  newConfig: string
}

function getConfig(): AppConfig {
  return {
    // ... existing config
    newConfig: import.meta.env.VITE_NEW_CONFIG || "default",
  }
}
```

## Contributing

When contributing, please follow these guidelines:

1. Use functional components with TypeScript interfaces
2. Follow the established naming conventions
3. Add all text content to constants
4. Add all configuration to config files
5. Implement proper error handling with early returns
6. Write descriptive variable names
7. Keep components small and focused
8. Use Tailwind CSS for styling

## Development Workflow

### Adding New Features

1. **Create component** in appropriate directory
2. **Define types** in `src/types/api.type.ts`
3. **Add constants** in `src/constants/app.constants.ts`
4. **Implement logic** with proper error handling
5. **Test responsiveness** on different screen sizes
6. **Run linter**: `npm run lint`
7. **Build test**: `npm run build`

### Code Review Checklist

- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] No hardcoded strings (use constants)
- [ ] No `any` types (use proper types)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Accessibility attributes added (ARIA labels)
- [ ] Component is properly typed

## Troubleshooting

### 🔴 API Connection Issues

**Symptom:** "Failed to fetch" or network errors

**Solutions:**
1. Enable mock API: Set `VITE_USE_MOCK_API=true` in `.env`
2. Check backend is running: `curl http://localhost:8000/health`
3. Verify API URL in `.env`: `VITE_API_BASE_URL`
4. Check browser console for CORS errors
5. Verify backend CORS allows `http://localhost:5173`

### 🔴 Build Errors

**Symptom:** Build fails with TypeScript or dependency errors

**Solutions:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
rm -rf node_modules/.vite

# Check TypeScript errors
npm run build

# Check for type errors only
npx tsc --noEmit
```

### 🔴 Styling Issues

**Symptom:** Styles not applying or looking broken

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart dev server: `npm run dev`
4. Check Tailwind config: `tailwind.config.js`
5. Verify `index.css` imports Tailwind directives

### 🔴 Environment Variables Not Working

**Symptom:** Config values showing as undefined

**Solutions:**
1. Ensure variable has `VITE_` prefix
2. Restart dev server after changing `.env`
3. Check `.env` file is in project root
4. Verify no syntax errors in `.env` file

## Testing

While the project doesn't currently include automated tests, here are recommended areas to test:

### Manual Testing Checklist

- [ ] Dashboard loads with mock data
- [ ] All metric cards display correct values
- [ ] Filterable table switches between views (Overall, Reviewers, Trainers, Domains)
- [ ] Quality distribution chart renders correctly
- [ ] Table is scrollable horizontally on small screens
- [ ] Sidebar opens/closes on mobile
- [ ] Loading spinners appear during data fetch
- [ ] Error messages display when API fails
- [ ] Page is responsive on mobile, tablet, desktop

### Future Testing Recommendations

- **Unit Tests**: Vitest for utility functions and hooks
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Type Checking**: `npm run build` (TypeScript)

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE 11 (not supported)

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Follow** code style and naming conventions
4. **Add** all text content to constants (no hardcoded strings)
5. **Ensure** TypeScript strict mode compliance
6. **Test** on multiple screen sizes
7. **Commit** changes: `git commit -m 'Add amazing feature'`
8. **Push** to branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

## License

This project is private and proprietary.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
