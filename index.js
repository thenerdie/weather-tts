const axios = require("axios")
const { execSync } = require("child_process")

const handlebars = require("handlebars")

const { format } = require("date-fns")
const getDirection = require('degrees-to-direction');

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

handlebars.registerHelper("convertCelcius", celcius => {
    return celcius * 9 / 5 + 32
})

handlebars.registerHelper("now", () => {
    const now = Date.now()
    return format(now, "h m a 'on' MMMM d yyyy")
})

const fs = require("fs")

const config = require("./config.json")

const templateString = fs.readFileSync("./reports/weather.hbs").toString()
const template = handlebars.compile(templateString)

let lastReport

let attempts = 0

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
        
        const report = template(data)
        
        execSync(`echo \"${report}\" | festival --tts`)
        
        lastReport = report
    } catch(error) {
        attempts += 1
        console.log(error)
        execSync(`echo \"${lastReport}\" | festival --tts`)
    }
}

doReport()
