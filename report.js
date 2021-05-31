const weather = require('./weather');
const getDirection = require('degrees-to-direction')
const fs = require('fs')
const { DateTime } = require('luxon')

module.exports = class Report {
    getWindDirectionString(dir) {
        const abbreviationToWindDirectionMap = {
            "W": "west",
            "E": "east",
            "N": "north",
            "S": "south",
        }

        const dirAbbreviation = getDirection(dir)

        let out = []

        for (let i = 0; i < dirAbbreviation.length; i++) {
            out.push(abbreviationToWindDirectionMap[dirAbbreviation.charAt(i)])
        }

        return out.join(" ")
    }

    getCurrentWeather({ current, daily }) {
        let report = [""]

        report.push(`Here is the current weather for the vicinity.`)

        const description = current.weather[0].description

        if (description.endsWith("s")) {
            report.push(`It is currently ${current.temp.toFixed(0)} degrees, dew point ${current.dew_point.toFixed(0)} degrees, with ${description}.`)
        } else {
            report.push(`It is currently ${current.temp.toFixed(0)} degrees, dew point ${current.dew_point.toFixed(0)} degrees, with a ${description}.`)
        }
        report.push(`Winds were ${this.getWindDirectionString(current.wind_deg)} at ${current.wind_speed} miles per hour.`)
        report.push(`Relative humidity was ${current.humidity} percent, and visibility was ${(current.visibility / 1609).toFixed(1)} miles.`)
        
        const sunrise = new Date(daily[0].sunrise * 1000).toLocaleString().match(".+/.+/.+, (.+):.+ (.+)")
        const sunset = new Date(daily[0].sunset * 1000).toLocaleString().match(".+/.+/.+, (.+):.+ (.+)")

        report.push(`Sunrise is at ${sunrise[1]} ${sunrise[2]}, and sunset is at ${sunset[1]} ${sunset[2]}.`)

        return report.join(" ")
    }

    getHourlyWeather({ hourly }) {
        let report = [""]

        report.push("Here is the five hour weather forecast for the vicinity.")

        hourly.slice(0, 4).forEach(item => {
            const time = new Date(item.dt * 1000)
            const timeMatch = time.toLocaleString().match(".+/.+/.+, (.+):.+:.+ (.+)")

            const timeString = timeMatch[1].concat(" ").concat(timeMatch[2])

            report.push(`${timeString}.`)
            report.push(`Conditions will be ${item.weather[0].description}, with a temperature of ${item.temp.toFixed(0)} degrees, dew point ${item.dew_point.toFixed(0)}.`)
            report.push(`It will feel like ${item.feels_like.toFixed(0)} degrees.`)
            report.push(`Winds will be ${this.getWindDirectionString(item.wind_deg)} at ${item.wind_speed} miles per hour.`)
            report.push(`Chance of rain ${(item.pop * 100).toFixed(0)} percent.`)

            if (item.uvi > 3) {
                report.push(`UV index ${item.uvi.toFixed(1)}.`)
            }
        })

        return report.join(" ")
    }

    getDailyWeather({ daily }) {
        let report = []

        report.push("Here is the daily forecast for the vicinity.")

        daily.forEach(day => {
            const time = DateTime.fromSeconds(day.dt)

            report.push(`${time.weekdayLong}.`)
            report.push(`Morning temperature of ${day.temp.morn} degrees.`)
            report.push(`High of ${day.temp.max.toFixed(0)} degrees. It will feel like ${day.feels_like.day.toFixed(0)} degrees.`)
            report.push(`Evening temperature of ${day.temp.eve.toFixed(0)} degrees.`)
            report.push(`Conditions will be ${day.weather[0].description}, with a ${day.rain?.toFixed(0) || 0} percent chance of rain, and a UV index of ${day.uvi.toFixed(1)}.`)
            report.push(`Relative humidity ${day.humidity} percent.`)

            report.push(`${time.weekdayLong} night.`)

            report.push(`Low of ${day.temp.min.toFixed(0)} degrees. It will feel like ${day.feels_like.night.toFixed(0)} degrees.`)
        })

        return report.join(" ")
    }

    async getFullReport(stationName = "unknown") {
        const response = await weather.get("/onecall")
        const data = response.data

        const current = this.getCurrentWeather(data)
        const hourly = this.getHourlyWeather(data)
        const daily = this.getDailyWeather(data)

        const preface = `You are listening to station ${stationName}. This is a station broadcasting weather information on a loop.
            This station is not affiliated with NOAA weather radio, a governmental broadcast featuring similar products. Thank you for listening to ${stationName}.`

        fs.writeFileSync("weatherReport.txt", current.concat(hourly).concat(daily))

        return preface.concat(current).concat(hourly).concat(daily)
    }
}