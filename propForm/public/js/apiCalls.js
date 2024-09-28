const socket = new WebSocket('ws://localhost:443'),
    globalChat = document.querySelector('.globalChat form'),
    input = document.querySelector('input[type="text"]'),
    chat = document.querySelector('.chat')
var eve = 1
socket.addEventListener('open', e => {
    console.log('we are connected')
})
socket.addEventListener('message', res => {
    let elem = document.createElement('div'),
        result = JSON.parse(res.data),
        user = document.createElement('div'),
        userData = document.createElement('div')
    elem.classList.add('msg')
    user.classList.add('username')
    userData.classList.add('userData')
    user.innerText = result.username
    userData.innerText = result.msg
    elem.appendChild(user)
    elem.appendChild(userData)
    if (result.username == sessionStorage.getItem('username')) {
        elem.style.alignSelf = 'flex-end'
        user.style.right = 0
        user.style.left = 'unset'
        elem.style.borderRadius = '10px 0 0 10px'
    }
    chat.append(elem)
})
globalChat.addEventListener('submit', e => {
    e.preventDefault()
    var obj = {
        msg: input.value,
        username: sessionStorage.getItem('username')
    }
    socket.send(JSON.stringify(obj))
})