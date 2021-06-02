const ffplay = require('ffplay')
const chalk = require('chalk');
const exportTTSWav = require('./exportTTSWav')
const Report = require('./report');

const args = process.argv.slice(2)

const weatherReport = new Report()

async function doReport() {
    weatherReport.getFullReport(args[0]).then(async report => {
        console.log(chalk.yellow("Generated weather report! Getting audio data..."))

        exportTTSWav(report).then(fileName => {
            console.log(chalk.green("Audio data written to wav file! Playing..."))

            const player = new ffplay(`./${fileName}`)

            player.proc.on('exit', () => {
                doReport()
            })
        }).catch(err => {
            console.log(chalk.red(err));
            doReport()
        })
    }).catch(() => {
        console.log(chalk.red("Could not get report data!"))

        const report = `Weather information is not available at this time.`

        exportTTSWav(report).then(fileName => {
            console.log(chalk.green("Audio data written to wav file! Playing..."))

            const player = new ffplay(`./${fileName}`)

            player.proc.on('exit', () => {
                doReport()
            })
        })
    })
}

doReport()
