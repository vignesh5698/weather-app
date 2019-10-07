const express =  require('express');
const bodyParser = require('body-parser');
const path = require('path');
const _ = require('lodash');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'public');

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(publicDirectoryPath));

app.get('/help', (req,res) => {
  res.sendFile(path.join(publicDirectoryPath, 'help.html'));
})


app.get('/about', (req,res) => {
  res.sendFile(path.join(publicDirectoryPath, 'about.html'));
})

app.post('/get_weather', (req,response) => {
  const regions = req.body;
  const response1 = getRegionCoordinates(regions);
  response1.then((regionCoordinates) => {
      const weatherInfo = getWeather(regionCoordinates);
      weatherInfo.then((res) => {
        const regionOne = _.head(res);
        const regionTwo = _.last(res);
        response.render('index',{
          'regionOne':regionOne,
          'regionTwo':regionTwo
        });
      })
  })
})

const getWeather = async (regionCoordinates) => {
  const regionWeather = _.map(regionCoordinates, (regionCoordinate) => {
    const { place, latitude, longitude } = regionCoordinate;
    const getWeatherUri = `https://api.darksky.net/forecast/def8b5e1cdc2ed6a3518ac7373aa41eb/${latitude},${longitude}?units=si&exclude=[hourly,flags]`;
    return axios.get(getWeatherUri)
    .then((res) => {
      const {
        temperature,
        pressure,
        windSpeed,
        humidity,
        dewPoint
      } = res.data.currently;
      const summary = res.data.daily.summary;
      return { place, temperature, pressure, windSpeed, humidity, summary, dewPoint }
    })
    .catch((err) => {
      console.log(err);
    })
  })
  return await Promise.all(regionWeather);
}

const getRegionCoordinates = async (regions) => {
  const coordinatesResponse = _.map(regions, (region) => {
    return axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${region}.json?access_token=pk.eyJ1IjoidmlnbmVzaGU1Njk4IiwiYSI6ImNrMWVzYXNpajBrbXIzamxtZGFuOWZsZTgifQ.GcLYs5cLLFshNCZAYLTh3A`)
      .then((res) => {
        return {
          'place': _.upperFirst(_.head(res.data.query)),
          'longitude': _.head(res.data.features[0].center),
          'latitude': _.last(res.data.features[0].center)
          };
      }).catch((err) => {
        console.log(err);
      })
  })
  return await Promise.all(coordinatesResponse);
}

app.listen(port, () => {
  console.log('Server Starting at 3000...');
})