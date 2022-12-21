<script>
    import {onMount, } from "svelte";
    import { fade } from "svelte/transition";

    let message = "Loading..."
    let currentlySelected = "luxury";

    onMount(async () => {
        const logElem = document.querySelector('#log')
        let sentLastMessage = "cyberpunk"; // this is so we can clump messages together
        const formElem = document.querySelector('#chatform')
        const inputElem = document.querySelector('#text')
        const clientsElem = document.querySelector('#clients')

        /** @type {WebSocket | null} */
        var socket = null

        function log(msg, sender, you) {
            if (sender === "system" || sender === "update") {
                logElem.innerHTML += `<p class="text-center">${msg}</p>`
            } else if (you) {
                logElem.innerHTML += `
                <div class="chat chat-end">
                  ` + (!sentLastMessage.includes("you") ? `<div class="chat-header">${sender}</div>` : ``) + `
                  <div class="chat-bubble opacity-100 brightness-200" data-theme="${currentlySelected}">${msg}</div>
                </div>
                `
                // will add div here
                sentLastMessage = sender;
            } else {
                logElem.innerHTML +=
                    `
                    <div class="chat chat-start max-w-screen-md lg:max-w-4xl pt-0">
                       ` + (sentLastMessage !== sender ? `<div class="chat-header">${sender}</div>` : ``) + `
                       <div class="chat-bubble" data-theme="${currentlySelected}">${msg}</div>
                    </div>
                `
                sentLastMessage = sender;
            }
            logElem.scrollTop += 1000
        }

        (() => {
            const wsUri = `wss://api.rizzle.chat/ws/`

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

</script>
<style>
    #log {
        overflow: auto;
    }
</style>
<html>
    <div class={"py-5 text-center"}>
        <p transition:fade class={"lg:text-8xl text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-500" +
                      " via-purple-500 to-pink-500"}>
            rizzle.chat
        </p>
        <p class={"px-5 text-sm lg:text-xl"}>Encryption at top secret levels with no storage. Not even the operators of this website can see what you send.</p>
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
    <div class="lg:hover:blur-none">
        <div class={"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-solid border-2 border-sky-500 rounded-lg" +
         " opacity-90 py-10 bg-gray-800"} style={"height: 50vh;"} id="log">
        </div>
        <div>
            <form id="chatform" class="text-right px-24 py-2" autocomplete="off">
                <input type="text" class={`input input-bordered w-full max-w-xs m-1 ` + (currentlySelected === "cyberpunk" ? `bg-gray-700 text-yellow-400` : ``)}
                       data-theme="{currentlySelected}" id="text" autofocus required/>
                <button type="submit" data-theme="{currentlySelected}" class="btn btn-success px-10" id="send">
                    Send
                </button>
                <div class="dropdown dropdown-top dropdown-end">
                    <label tabindex="0" class="btn m-1" data-theme="{currentlySelected}">Style</label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li data-theme="luxury" on:click={() => {
                            currentlySelected = "luxury"
                        }}><a>Luxury</a></li>
                        <li data-theme="dark" on:click={() => {
                            currentlySelected = "dark"
                        }}><a>Dark</a></li>
                        <li data-theme="cyberpunk" on:click={() => {
                            currentlySelected = "cyberpunk"
                        }}><a>Cyberpunk</a></li>
                    </ul>
                </div>
            </form>
        </div>
    </div>

</html>