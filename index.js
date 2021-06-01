const fs = require('fs');
const path = require('path');
const playSound = require('play-sound');
const chalk = require('chalk');
const exportTTSWav = require('./exportTTSWav')
const Report = require('./report');

const args = process.argv.slice(2)

const audioPlayer = playSound()

const weatherReport = new Report()

async function doReport() {
    weatherReport.getFullReport(args[0]).then(async report => {
        console.log(chalk.yellow("Generated weather report! Getting audio data..."))

        exportTTSWav(report).then(fileName => {
            console.log(chalk.green("Audio data written to wav file! Playing..."))

            var process = audioPlayer.play(`./${fileName}`)

            process.on('exit', () => {
                doReport()
            })
        })
    })
}

doReport()
