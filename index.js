const fs = require('fs');
const path = require('path');
const playSound = require('play-sound');
const chalk = require('chalk');
const getTTSWav = require('./getTTSWav')
const Report = require('./report');

const args = process.argv.slice(2)

const audioPlayer = playSound()

const weatherReport = new Report()

function doReport() {
    weatherReport.getFullReport(args[0]).then(async report => {
        console.log(chalk.yellow("Generated weather report! Getting TTS Base64 data..."))

        getTTSWav(report).then(fileContents => {
            console.log(chalk.magentaBright("Generated TTS Base64 data!"))
            fs.writeFileSync(path.join(__dirname, 'report.wav'), fileContents)
            console.log(chalk.green("Base64 written to wav file! Playing..."))

            var process = audioPlayer.play("./report.wav")

            process.on('exit', () => {
                doReport()
            })
        })
    })
}

doReport()
