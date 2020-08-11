const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{

    console.log('New web socket connection')
    socket.on('join',({username, room})=>{
        socket.join(room)
        socket.to(room).emit('message',generateMessage('Welcome'))
        socket.broadcast.to(room).emit('message',generateMessage(`${username} has joined`));
    

    })

    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        //hardcode room name
        io.to('1').emit('message',generateMessage(message))
        callback('Delivered')
        

        
    })

    socket.on('sendLocation',(coords, callback)=>{
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect',()=>{
        io.emit('message',generateMessage('User disconnected'))
    })
})




server.listen(port,()=>{
    console.log(`Server up on port ${port}`)

})