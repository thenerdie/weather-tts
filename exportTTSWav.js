const fs = require('fs')
const say = require('say');

module.exports = async (text, name = "report.wav") => {
    return await new Promise((resolve, reject) => {
        say.export(text, "Microsoft Zira Desktop", 0.9, name, err => {
            if (err) {
                reject(err);
            } else {
                resolve(name)
            }
        })
    })
}