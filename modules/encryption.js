const crypto = require('crypto')
const logging = require('../logging')
const config = require('../config')
const security = config.security()["encryption"]

if (process.versions.openssl <= '1.0.1f') { logging.log("info", "OpenSSL version too old, consider upgrading to avoid heartbleed attacks.") }

const settings = {
    type: security["type"],
    privateKey: security["privateKey"],
    ivLength: security["IVlength"]
}

function generateIV() {  return crypto.randomBytes(settings.ivLength).toString('hex') }

function exposer(type, data, iv) {
    switch (security['enabled']) {
        case true:
            switch (type) {
                case  true:
                    let cipher = crypto.createCipheriv(settings.type, settings.privateKey, iv)
                    let encrypted = cipher.update(data)
                    encrypted = Buffer.concat([encrypted, cipher.final()])
                    return encrypted
                default:
                    let convData = Buffer.from(data)
                    let decipher = crypto.createDecipheriv(settings.type, settings.privateKey, iv)
                    let decrypted = decipher.update(convData)
                    decrypted = Buffer.concat([decrypted, decipher.final()])
                    return decrypted
            }
        default: return data
    }
}

module.exports = { exposer, generateIV }
