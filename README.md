# 🔗 Replit Subdomain Connector

A web application for team members to connect **sher.dev** subdomains to their Replit projects.

## Features

- **Step 1: Availability Check** - Real-time subdomain availability verification
- **Step 2: Replit Records** - Easy input for TXT and A records from Replit
- **Step 3: Confirmation** - Automatic DNS record creation with success confirmation

## Tech Stack

- **Frontend:** React 18
- **Backend:** Node.js + Express
- **DNS Management:** DigitalOcean API
- **Deployment:** DigitalOcean App Platform

## Getting Started

### Prerequisites

- Node.js 18+
- DigitalOcean API token with domain management access
- sher.dev domain configured in DigitalOcean

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Development

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

Frontend will run on `http://localhost:3000`  
Backend API will run on `http://localhost:3001`

### Environment Variables

Create `server/.env`:

```env
DO_API_TOKEN=your_digitalocean_api_token
PORT=3001
```

## API Endpoints

### POST /api/check-availability

Check if a subdomain is available.

**Request:**
```json
{
  "subdomain": "myapp"
}
```

**Response:**
```json
{
  "available": true,
  "subdomain": "myapp.sher.dev"
}
```

### POST /api/create-records

Create TXT and A records for the subdomain.

**Request:**
```json
{
  "subdomain": "myapp",
  "txtValue": "replit-verify=abc123...",
  "aValue": "35.123.45.67"
}
```

**Response:**
```json
{
  "success": true,
  "subdomain": "myapp.sher.dev",
  "url": "https://myapp.sher.dev",
  "records": {
    "txt": { ... },
    "a": { ... }
  }
}
```

## Deployment

This app is deployed on DigitalOcean App Platform with automatic deployments from the main branch.

### Manual Deployment

```bash
# Build frontend
cd client
npm run build

# Deploy to DigitalOcean
# (Configured via GitHub integration)
```

## How to Use

1. **Enter Subdomain:** Type your desired subdomain (e.g., "myapp" for myapp.sher.dev)
2. **Check Availability:** The form verifies it's not already taken
3. **Add Replit Records:** 
   - In Replit, go to your project settings → Custom Domain
   - Copy the TXT verification record
   - Copy the A record IP address
   - Paste both into the form
4. **Create Records:** Submit the form to automatically create DNS records
5. **Go Live:** Return to Replit and verify your custom domain

## License

Proprietary - Sher Agency
