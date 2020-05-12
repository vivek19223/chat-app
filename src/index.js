const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter =  require('bad-words')
const { addUser,removeUser,getUser,getUsers } = require('./utils/users')

const { generateMessage,generateLocationMessage } = require('./utils/messages')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname,'../public')
app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    console.log('New webSocket Connection.');

    socket.on('join',(option,callback)=>{
        const { error,user } = addUser({id: socket.id, ...option})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsers(user.room)
        })
        callback()
    })


    socket.on('sendMessage',(msg,callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed.')
        }

        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation',({ latitude,longitude },callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${ latitude},${ longitude }`))
        callback()
    })


    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('admin',`${user.username} has left!`));
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsers(user.room)
            })
        }
    })
})


server.listen(port,()=>{
    console.log(`Server is up on port : ${port}`)
})