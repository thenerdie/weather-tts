const key = require('./key.json');
const config = require('./config.json');
const axios = require('axios')

module.exports = axios.create({
    baseURL: 'https://api.openweathermap.org/data/2.5',
    params: {
        "appid": key.key,
        "lat": config.lat,
        "lon": config.lon,
        "units": config.units
    }
})