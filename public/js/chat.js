const socket = io()


//Elements
$messageForm = document.querySelector('#message-form')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')
$locationShare = document.querySelector('#send_location')
$messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username,room } = Qs.parse(location.search, { ignoreQueryPrefix:true })

//autoScrollig
const autoscroll = ()=>{
    //New Message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //console.log($newMessage.offsetHeight)

    //Visible Height
    const VisibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //Check the distance till scrolled
    const scrollOffset = $messages.scrollTop + VisibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

//socket.on('location',{ latt, long})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //Disable the button
    $messageFormButton.setAttribute("disabled",'disabled');
    const value = e.target.elements.message.value
    socket.emit('sendMessage',value,(error)=>{
        //Enable the button, Clear the form and set the focus.
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus();

        if(error){
            return console.log(error)
        }
        console.log('Delieverd.!!')
    })
})

document.querySelector('#send_location').addEventListener('click',()=>{
    //Disable the send location button
    $locationShare.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!!')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
    
        socket.emit('sendLocation',{ latitude,longitude },()=>{
            //Enable location share
            $locationShare.removeAttribute('disabled')
            console.log("Location sent.");
        })
    })
})

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username ,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.on('locationMessage',(url)=>{   
    console.log(url)
    const html = Mustache.render(urlTemplate,{
        username : url.username,
        url:url.url,
        createdAt : moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.emit('join', { username,room },(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({ room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})