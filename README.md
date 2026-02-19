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

CTA_ROUTE = "https://data.cityofchicago.org/resource/8pix-ypme.json?$query=SELECT%0A%20%20%60stop_id%60%2C%0A%20%20%60direction_id%60%2C%0A%20%20%60stop_name%60%2C%0A%20%20%60station_name%60%2C%0A%20%20%60station_descriptive_name%60%2C%0A%20%20%60map_id%60%2C%0A%20%20%60ada%60%2C%0A%20%20%60red%60%2C%0A%20%20%60blue%60%2C%0A%20%20%60g%60%2C%0A%20%20%60brn%60%2C%0A%20%20%60p%60%2C%0A%20%20%60pexp%60%2C%0A%20%20%60y%60%2C%0A%20%20%60pnk%60%2C%0A%20%20%60o%60%2C%0A%20%20%60location%60%2C%0A%20%20%60%3A%40computed_region_awaf_s7ux%60%2C%0A%20%20%60%3A%40computed_region_6mkv_f3dw%60%2C%0A%20%20%60%3A%40computed_region_vrxf_vc4k%60%2C%0A%20%20%60%3A%40computed_region_bdys_3d7i%60%2C%0A%20%20%60%3A%40computed_region_43wa_7qmu%60%0AWHERE%20%60blue%60%20%3D%3D%20TRUE%0AORDER%20BY%20%60station_name%60%20ASC%20NULL%20LAST"
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