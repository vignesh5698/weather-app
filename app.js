const express =  require('express');
const bodyParser = require('body-parser');
const path = require('path');
const _ = require('lodash');
const axios = require('axios');

const app = express();
const publicDirectoryPath = path.join(__dirname,'public');

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(publicDirectoryPath));

app.get('/help', (req,res) => {
  res.sendFile(path.join(publicDirectoryPath, 'help.html'));
})


app.get('/about', (req,res) => {
  res.sendFile(path.join(publicDirectoryPath, 'about.html'));
})

app.post('/get_weather', (req,res) => {
  const regions = req.body;
  const regionCoordinates = getRegionCoordinates(regions);
  regionCoordinates.then((res) => {
    console.log(res);
  })
  res.sendFile(path.join(publicDirectoryPath, 'show_weather.html'));
})

const getRegionCoordinates = async (regions) => {
  const coordinatesResponse = _.map(regions, (region) => {
    return axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${region}.json?access_token=pk.eyJ1IjoidmlnbmVzaGU1Njk4IiwiYSI6ImNrMWVzYXNpajBrbXIzamxtZGFuOWZsZTgifQ.GcLYs5cLLFshNCZAYLTh3A`)
      .then((res) => {
        return [res.data.query, res.data.features[0].center];
      }).catch((err) => {
        console.log(err);
      })
  })
  return await Promise.all(coordinatesResponse);
}

app.listen(3000, () => {
  console.log('Server Starting at 3000...');
})