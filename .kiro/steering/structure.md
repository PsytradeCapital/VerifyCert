# Project Structure & Organization

## Root Level Architecture

```
verify-cert/
├── contracts/              # Smart contract source code
├── backend/               # Node.js/Express API server
├── frontend/              # React/TypeScript web application
├── scripts/               # Deployment and utility scripts
├── test/                  # Smart contract tests
├── artifacts/             # Compiled contract artifacts (generated)
├── cache/                 # Hardhat compilation cache (generated)
└── node_modules/          # Root dependencies (generated)
```

## Smart Contracts (`/contracts`)
- `Certificate.sol`: Main ERC721 certificate contract with non-transferable NFT logic
- Uses OpenZeppelin standards for security and gas optimization
- Implements role-based access control for authorized issuers

## Backend API (`/backend`)
```
backend/
├── src/
│   ├── routes/            # Express route handlers
│   ├── services/          # Business logic and blockchain interaction
│   ├── middleware/        # Authentication, validation, error handling
│   ├── config/            # Configuration management
│   └── __tests__/         # Backend unit tests
├── public/                # Static assets served by Express
└── package.json           # Backend dependencies and scripts
```

## Frontend Application (`/frontend`)
```
frontend/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Route-level page components
│   ├── services/          # API clients and blockchain interaction
│   └── types/             # TypeScript type definitions
├── public/                # Static assets (favicon, manifest, etc.)
├── build/                 # Production build output (generated)
└── cypress/               # E2E test specifications
```

## Scripts & Deployment (`/scripts`)
- `deploy.js`: Main contract deployment script
- `verify.js`: Contract verification on PolygonScan
- `pre-deploy-check.js`: Pre-deployment validation
- `deployment-status.js`: Check deployment status
- Production deployment scripts for different environments

## Testing Structure (`/test`)
- `Certificate.test.js`: Smart contract unit tests
- `deployment.test.js`: Deployment process tests
- `integration/`: Cross-service integration tests
- Each service has its own test directory following the same structure as source

## Configuration Files

### Environment Management
- `.env.example`: Template for environment variables
- Each service has its own `.env.example` with service-specific variables
- `deployment-config.json`: Network and deployment configuration

### Build Configuration
- `hardhat.config.js`: Smart contract compilation and deployment
- `package.json`: Root-level scripts for orchestrating all services
- Service-specific configs: `tsconfig.json`, `tailwind.config.js`, etc.

## File Naming Conventions

- **Smart Contracts**: PascalCase (e.g., `Certificate.sol`)
- **JavaScript/TypeScript**: camelCase for files, PascalCase for components
- **Configuration**: kebab-case (e.g., `hardhat.config.js`)
- **Environment**: UPPER_SNAKE_CASE for variables
- **Scripts**: kebab-case (e.g., `deploy-production.js`)

## Import/Export Patterns

- Use relative imports within the same service
- Absolute imports from `src/` root in frontend
- Contract artifacts imported via generated paths in `artifacts/`
- Shared contract addresses via `contract-addresses.json` files