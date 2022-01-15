const axios = require("axios")
const { execSync } = require("child_process")

const handlebars = require("handlebars")

const { format } = require("date-fns")
const getDirection = require('degrees-to-direction');

function parseTimestamp(time) {
    return new Date(time * 1000)
}

handlebars.registerHelper("round", number => {
    return Math.floor(number + 0.5)
})

handlebars.registerHelper("windDirectionFromDegrees", degrees => {
    const abbreviationToWindDirectionMap = {
        "W": "west",
        "E": "east",
        "N": "north",
        "S": "south",
    }

    const dirAbbreviation = getDirection(degrees)

    let out = []

    for (let i = 0; i < dirAbbreviation.length; i++) {
        out.push(abbreviationToWindDirectionMap[dirAbbreviation.charAt(i)])
    }

    return out.join(" ")
})

handlebars.registerHelper("greaterThan", (a, b) => {
    return a > b
})

handlebars.registerHelper("add", (a, b) => {
    return a + b
})

handlebars.registerHelper("subtract", (a, b) => {
    return a - b
})

handlebars.registerHelper("multiply", (a, b) => {
    return a * b
})

handlebars.registerHelper("convertCelcius", celcius => {
    return celcius * 9 / 5 + 32
})

handlebars.registerHelper("now", () => {
    const now = Date.now()
    return format(now, "h:mm a 'on' MMMM d yyyy")
})

handlebars.registerHelper("timefull", (timestamp) => {
    return format(parseTimestamp(timestamp), "h:mm a 'on' MMMM d yyyy")
})

handlebars.registerHelper("time", (timestamp) => {
    return format(parseTimestamp(timestamp), "h:mm a")
})

handlebars.registerHelper("weekday", (timestamp) => {
    return format(parseTimestamp(timestamp), "EEEE")
})

const fs = require("fs")

const config = require("./config.json");
const { setInterval } = require("timers/promises");
const { off } = require("process");

const templateStringNow = fs.readFileSync("./reports/weather.hbs").toString()
const templateNow = handlebars.compile(templateStringNow)

const templateStringForecast = fs.readFileSync("./reports/forecast.hbs").toString()
const templateForecast = handlebars.compile(templateStringForecast)

let lastReport

let attempts = 0

let forecast

let coordinates

async function getCoordinates() {
    const { data } = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
        params: {
            q: config.owm.city,
            appid: config.owm.token
        }
    })

    coordinates = {
        lat: data[0].lat,
        lon: data[0].lon
    }
}

async function updateForecast() {
    const { data } = await axios.get("https://api.openweathermap.org/data/2.5/onecall", {
        params: {
            ...coordinates,
            appid: config.owm.token,
            units: "imperial"
        }
    })

    const { daily } = data

    forecast = daily
}

setInterval(() => {
    attempts = 0
}, 60000)

async function doReport() {
    try {
        if (attempts > 5)
            throw new Error("Too many failed attempts!")

        const { data } = await axios.get(`https://swd.weatherflow.com/swd/rest/observations/station/${config.station_id}`, {
            params: {
                device_id: config.device_id,
                token: config.token
            }
        })
        
        const report = `${templateNow(data)} ${templateForecast({ forecast: forecast })}`

        console.log(report)
        
        // execSync(`echo \"${report}\" | festival --tts`)
        
        lastReport = report
    } catch(error) {
        attempts += 1
        console.log(error)
        execSync(`echo \"${lastReport}\" | festival --tts`)
    }
}

async function main() {
    await getCoordinates()
    await updateForecast()

    doReport()
}

main()
