const fs = require('fs');
const path = require('path');
const getTTSWav = require('./getTTSWav')
const Report = require('./report');

const weatherReport = new Report()

weatherReport.getFullReport().then(async report => {
    getTTSWav(report).then(fileContents => {
        fs.writeFile(path.join(__dirname, 'report.wav'), fileContents, () => {})
    })
})