# Open Transit Chicago

View website here => https://open-transit-chicago.netlify.app/

# First time installation
Install netlify globally using npm
https://docs.netlify.com/deploy/deploy-overview/
```
npm i -g netlify-cli
```

In the ```/client``` directory, install npm client packages in the command line
```
npm i
```

In the ```/client/.env``` file, add the following code.
> Note that you may have to add a ".env" file as it usually ignored upon cloning this repo.
```
PUBLIC_API_DEV="http://127.0.0.1:8888/api"
```

In the ```/server``` directory, install server packages in the command line
```
npm i
```


In the ```/server/.env``` file, add the following code.
> Note that you may have to add a ".env" file as it usually ignored upon cloning this repo.
>
> > You also must have a CTA API key. Don't have  CTA API key?
> > Apply here https://www.transitchicago.com/developers/traintrackerapply/
```
CTA_KEY="<CTA API KEY GOES HERE>"
CORS_ORIGIN="*"

CTA_ARRIVALS = "https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?outputType=JSON"
CTA_FOLLOW = "http://lapi.transitchicago.com/api/1.0/ttfollow.aspx?outputType=JSON"

CTA_ALERT_ROUTE_STATUS = "http://www.transitchicago.com/api/1.0/routes.aspx?type=rail&outputType=JSON"
CTA_ALERT_DETAILED = "http://lapi.transitchicago.com/api/1.0/alerts.aspx?outputType=JSON"
```

# Run client & server
In the ```/client``` directory, start the client server in the command line.

Runs at http://127.0.0.1:5173
```
npm run dev
```

In the ```/server``` directory, start the backend server in the command line.

 Runs at http://127.0.0.1:8888
```
npx netlify dev
```