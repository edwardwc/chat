const $log = document.querySelector('#log')
const $form = document.querySelector('#chatform')
const $input = document.querySelector('#text')
const $clients = document.querySelector('#clients')

/** @type {WebSocket | null} */
var socket = null

function log(msg, type = 'status') {
    $log.innerHTML += `<p class="msg msg--${type}">${msg}</p>`
    $log.scrollTop += 1000
}

(() => {
    const { location } = window

    const proto = location.protocol.startsWith('https') ? 'wss' : 'ws'
    const wsUri = `${proto}://rizzle.chat/ws/`

    log('Connecting...')
    socket = new WebSocket(wsUri)

    socket.onopen = () => {
        log('Connected')
        socket.send("/users")
    }

    socket.onmessage = (ev) => {
        const data =  JSON.parse(ev.data)
        if (data.Sender.includes("(you)")) {
            log(data.Sender + ": " + data.Message)

        } else if (data.Sender === "system") {
            log(data.Sender + ": " + data.Message, 'info');
            socket.send("/users");
        } else if (data.Sender === "update") {
            $clients.innerHTML = data.Message
        } else {
            log(JSON.parse(ev.data).Sender + ": " + JSON.parse(ev.data).Message, 'message')
        }
    }

    socket.onclose = () => {
        log('Disconnected')
        socket = null
    }
})()


$form.addEventListener('submit', (ev) => {
    ev.preventDefault()

    const text = $input.value

    socket.send(text)

    $input.value = ''
    $input.focus()
})
