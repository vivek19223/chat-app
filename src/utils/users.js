const users = []

const addUser = ( { id,username,room })=>{
    //claen the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error : 'Username and room are required!'
        }
    }

    //check the existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error : 'Username is in use!'
        }
    }

    //store user
    const user = { id,username,room }
    users.push(user)
    return { user }
}

//remove user by id
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)
    
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

//getUser by ID
const getUser = (id)=>{
    const user = users.find(user=> user.id === id)
    return user
}

//getUsers in a room
const getUsers = (room)=>{
    room = room.trim().toLowerCase()
    const members = users.filter(user=> user.room === room)
    return members
}

module.exports = { addUser,removeUser,getUser,getUsers }