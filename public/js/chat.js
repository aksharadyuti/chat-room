const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('#submit')
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML

const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        url
    })
    $messages.insertAdjacentHTML('beforeend',html)
})
document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    $messageFormInput.value = ''

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        if(error){
            return console.log(error)
        }
        console.log('Message delivered');
    })

})

document.querySelector('#send-location').addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your user')
    }
    else{
        navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },()=>{
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location shared');
            })

        })
    }
})

