const key = require('./key.json');
const axios = require('axios')

module.exports = axios.create({
    baseURL: 'https://api.openweathermap.org/data/2.5',
    params: {
        "appid": key.key,
        "lat": 28.5,
        "lon": -81.3,
        "units": "imperial"
    }
})