# FoodBridge

A simple full-stack Food Rescue Platform for a Software Engineering laboratory project.

## Technology
- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- SQLite

## Features
- User registration and login
- Donor / Volunteer / NGO roles
- Food donation listing
- Food donation browsing
- Search and category filter
- Claim donation
- Donation status
- Dashboard statistics
- User profile
- Points-based gamification
- SQLite database

## Run the project

Open this folder in VS Code.

Open the terminal in the project folder:

```bash
npm install
npm start
```

Then open:

http://localhost:3000

## Demo accounts

Donor:
donor@foodbridge.com
Password: 1234

Volunteer:
volunteer@foodbridge.com
Password: 1234

NGO:
ngo@foodbridge.com
Password: 1234

## Main API endpoints

POST /api/register
POST /api/login
GET /api/donations
POST /api/donations
PUT /api/donations/:id/claim
PUT /api/donations/:id/complete
GET /api/stats
GET /api/users/:id/activity

## Architecture

Browser
   ↓
HTML / CSS / JavaScript
   ↓
Express REST API
   ↓
SQLite Database

## Important

This is intentionally simplified for a college lab project. Passwords are stored as plain text and authentication uses localStorage. This is NOT suitable for production.
