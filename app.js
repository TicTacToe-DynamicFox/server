const express = require("express")
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const cors = require("cors")
const PORT = process.env.PORT || 3000

let rooms = 0
app.use(cors())
app.use(express.static('.'))

io.on('connection', (socket) => {

    //
    socket.on('createGame', (data) => {
        socket.join(`room-${++rooms}`);
        socket.emit('newGame', { name: data.name, room: `room-${rooms}` });
    })

    //
    socket.on('joinGame', (data) => {
        let room = io.nsps['/'].adapter.rooms[data.room]
        if (room.length === 1 && room) {
            socket.join(data.room)
            socket.broadcast.to(data.room).emit('player1', {})
            socket.emit('player2', { name: data.name, room: data.room })
        } else {
            socket.emit('err', {
                message: 'Sorry, The room is full!'
            })
        }
    })

    //
    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        })
    })

    //
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data)
    })

})


server.listen(PORT, () => console.log(`SERVER LISTENING ON PORT ${PORT}`))