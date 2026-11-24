# Open Transit Chicago

View website here => https://open-transit-chicago.netlify.app/

# Project details
This project is a CTA train tracker that helps users stay updated on train arrivals, locations, and service alerts throughout Chicago. It provides a simple, responsive interface for checking train information and planning commutes.

This project is built using Astro and SolidJS. Astro handles the overall application structure, routing, and page rendering, while SolidJS powers interactive and reactive UI components, providing a fast and responsive user experience.

- Astro => https://astro.build/
- SolidJS => https://www.solidjs.com/

# First time installation
In the ```/client``` directory, install npm client packages in the command line
```
npm i
```

In the ```/client/.env``` file, add the following code.
> Note that you may have to add a ".env" file as it usually ignored upon cloning this repo.
> > You also must have a CTA API key. Don't have  CTA API key?
> > Apply here https://www.transitchicago.com/developers/traintrackerapply/
```
PUBLIC_API_DEV="http://127.0.0.1:5173/api"
PUBLIC_API_PROD="<YOUR PRODUCTION APP URL>/api"

# Server Side
CTA_KEY = "<CTA API PRIVATE KEY>"

CTA_ARRIVALS = "https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?outputType=JSON"
CTA_FOLLOW = "http://lapi.transitchicago.com/api/1.0/ttfollow.aspx?outputType=JSON"

CTA_ALERT_ROUTE_STATUS = "http://www.transitchicago.com/api/1.0/routes.aspx?type=rail&outputType=JSON"
CTA_ALERT_DETAILED = "http://lapi.transitchicago.com/api/1.0/alerts.aspx?outputType=JSON"

# https://www.maptiler.com/
# Not required yet
PUBLIC_WEATHER_API_KEY="<MAPTILER API KEY>"
```

# Running the client
In the ```/client``` directory, start the client server in the command line.

Runs at http://127.0.0.1:5173
```
npm run dev
```