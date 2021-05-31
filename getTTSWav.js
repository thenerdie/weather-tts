const fs = require('fs')
const googleTTS = require('google-tts-api');

module.exports = async text => {
    const base64 = await googleTTS.getAllAudioBase64(text)

    return Buffer.from(base64.map(element => {
        return element.base64
    }).join(""), 'base64')
}