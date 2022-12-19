<script>
    import {onMount} from "svelte";

    let loading = true
    let message = "Loading..."
    const messages = [];

    onMount(() => {
        const logElem = document.querySelector('#log')
        const uMsg = document.querySelector('#uMessage')
        const oMsg = document.querySelector('#otherMessage')
        const formElem = document.querySelector('#chatform')
        const inputElem = document.querySelector('#text')
        const clientsElem = document.querySelector('#clients')

        /** @type {WebSocket | null} */
        var socket = null

        function log(msg, sender, you) {
            if (sender === "system") {
                logElem.innerHTML += `<p class="text-center">${msg}</p>`
            } else if (you) {
                uMsg.innerHTML += `
                <div class="chat-bubble">${msg}</div>
                `
            } else {
                oMsg.innerHTML += `
                       <div class="chat-bubble">${msg}</div>
                    `
            }
            logElem.scrollTop += 1000
        }

        (() => {
            const wsUri = `wss://rizzle.chat/ws/`

            log('Connecting...', 'system', false)
            socket = new WebSocket(wsUri)

            socket.onopen = () => {
                log('Connected', 'system', false)
                socket.send("/users")
            }

            socket.onmessage = (ev) => {
                const data = JSON.parse(ev.data)
                if (data.Sender.includes("(you)")) {
                    log(data.Message, data.Sender, true);
                } else if (data.Sender === "update") {
                    clientsElem.innerHTML = data.Message
                } else {
                    log(data.Message, data.Sender, false)
                }
            }

            socket.onclose = () => {
                log('Disconnected')
                socket = null
            }
        })()


        formElem.addEventListener('submit', (ev) => {
            ev.preventDefault()

            const text = inputElem.value

            socket.send(text)

            inputElem.value = ''
            inputElem.focus()
        })
    })
    loading = false

</script>
<style>
    #log {
        overflow: auto;
    }
</style>
<html>
    <div class={"py-5 text-center"}>
        <p class={"lg:text-8xl md:text-6xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-500" +
                      " via-purple-500 to-pink-500"}>
            rizzle.chat
        </p>
        <p>Encryption top secret clearance levels with no storage. Not even the operators of this website can see what you send.</p>
        <!-- underlined text soonland
            <button type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-2 py-1.5 lg:px-3
            lg:py-2 lg:text-sm text-xs font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none
            focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            What is rizzle?
            </button>
            */
        -->
    </div>
    {#if loading}
        <p class={"text-4xl py-20 text-center"}>{message}</p>
        {:else}
        <div class={"mx-auto h-96 max-w-7xl px-4 sm:px-6 lg:px-8 border-solid border-2 border-sky-500 rounded-lg" +
         " opacity-90 bg-gray-800 py-20"} id="log">
            <div class="chat chat-start" id="otherMessage" />
            <div class="chat chat-end" id="uMessage" />
        </div>
    {/if}

</html>