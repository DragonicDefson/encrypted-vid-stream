const prefix = "[Client]"
const path = require('path')
const express = require('express')
const application = express()
const { WebSocket } = require('ws')
const logging = require('../logging')
const config = require('config')
const networkOptions = config.get('application.networking')
const security = require('./encryption')

module.exports = () => {

    application.listen(80, '127.0.0.1', () => {
        logging.log('info', "[Api]: look at this, i'm online!")
    })

    application.get('/data', (request, response) => {
        let req = `[data]-[request]:${networkOptions['host']}:${networkOptions['port']}`
        let iv = security.generateIV()
        let options = { perMessageDeflate: false }
        let remoteHost = `ws://${req.split(':')[1]}:${req.split(':')[2]}`
        const socketClient = new WebSocket(remoteHost, options)

        socketClient.on('open', () => {
            logging.log('info', `${prefix}: [Client]->[Server{${remoteHost}}] connected`)
            socketClient.send(`iv:${iv}`, () => {
                logging.log('info', `${prefix}: IV sent to server, waiting for encrypted data response from: ${remoteHost}`)
            })
        })
        
        socketClient.on('message', (data) => { response.write(security.exposer(false, data, iv)) })

        socketClient.on('error', (error) => { logging.log('error', `${prefix}: Socket failed: ${error.message}`) })
    })

    application.get('/', (request, response) => {
        response.sendFile(path.join(__dirname, '../index.html'))
    })
}
