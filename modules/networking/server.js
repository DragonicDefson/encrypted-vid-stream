const prefix = "[Server]"
const { WebSocketServer } = require('ws')
const logging = require('../../logging')
const config = require('config')
const networkOptions = config.get('application.networking')
const security = require('../encryption')
const fs = require('fs')
const path = require('path')
let vector = ""
let filePath = path.join(__dirname, "../../downloads/test.mp4")

module.exports = () => {

    const socketServer = new WebSocketServer({ port: networkOptions['port'], host: networkOptions['host']  })

    socketServer.on('connection', (ws) => {
        ws.on('error', (error) => {
            logging.log('error', error)
        })
    
        ws.on('message', (data) => {
            if (data.toString().startsWith('iv:')) { vector = data.toString().split(':')[1] }

            let readStream = fs.createReadStream(filePath)

            readStream.on('close', () => { logging.log('info', `${prefix}: Stream to file closed`); logging.log('info', `${prefix}: Sending data from: ${filePath}`) })
        
            readStream.on('data', (chunk) => { ws.send(security.exposer(true, chunk, vector)) })
    
            readStream.on('error', (error) => { logging.log('error', `${prefix}: Error occurred: ${error.message}`) })
        })
    })
}
