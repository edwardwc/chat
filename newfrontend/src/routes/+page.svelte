<script>
    import {onMount, } from "svelte";
    import { fade } from "svelte/transition";


    let loading = true
    let message = "Loading..."
    let currentlySelected = "";

    onMount(async () => {
        const logElem = document.querySelector('#log')
        let sentLastMessage = "cyberpunk"; // this is so we can clump messages together
        const formElem = document.querySelector('#chatform')
        const inputElem = document.querySelector('#text')
        const clientsElem = document.querySelector('#clients')
        const allThemes = ["cyberpunk", "luxury", "halloween", "forest", "aqua"]

        /** @type {WebSocket | null} */
        var socket = null

        function log(msg, sender, you) {
            if (sender === "system") {
                logElem.innerHTML += `<p class="text-center">${msg}</p>`
            } else if (you) {
                let number = Math.floor(Math.random() * (allThemes.length))
                console.log(number)
                let color = allThemes[number];
                console.log(color)
                logElem.innerHTML += `
                <div class="chat chat-end">
                  ` + (!sentLastMessage.includes("you") ? `<div className="chat-header">${sender}</div>` : ``) + `
                  <div class="chat-bubble opacity-100 brightness-200" data-theme="${color}">${msg}</div>
                </div>
                `
                // will add div here
                sentLastMessage = sender;
            } else {
                logElem.innerHTML +=
                    sentLastMessage === sender ? `
                    <div class="chat chat-start max-w-screen-md lg:max-w-4xl pt-0">
                       <div class="chat-bubble">${msg}</div>
                    </div>
                    ` : `
                <div class="chat chat-start max-w-screen-md lg:max-w-4xl">
                       <div class="chat-header">${sender}</div>
                       <div class="chat-bubble" data-theme="">${msg}</div>
                </div>`
                sentLastMessage = sender;
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
                    console.log(1)
                } else if (data.Sender === "update") {
                    clientsElem.innerHTML = data.Message
                    console.log(2)
                } else {
                    log(data.Message, data.Sender, false)
                    console.log(3)
                }
                console.log(4)
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
<html data-theme="{currentlySelected}">
    <div class={"py-5 text-center"}>
        <p transition:fade class={"lg:text-8xl md:text-6xl text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-500" +
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
    <div class="relative text-right lg:px-8 px-1.5 py-5">
        <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn m-1">Style</label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li data-theme="dark" on:click={() => {
                    currentlySelected = "dark"
                }}><a>Normal</a></li>
                <li data-theme="cyberpunk" on:click={() => {
                    currentlySelected = "cyberpunk"
                }}><a>Cyberpunk</a></li>
                <li data-theme="luxury" on:click={() => {
                    currentlySelected = "luxury"
                }}><a>Luxury</a></li>
            </ul>
        </div>
    </div>
    {#if loading}
        <p class={"text-4xl py-20 text-center"}>{message}</p>
        {:else}
        <div class="lg:hover:blur-none">
            <div class={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-solid border-2 border-sky-500 rounded-lg" +
             " opacity-90 py-10 ` + (currentlySelected === "cyberpunk" ? `bg-yellow-400` : `bg-gray-800`)} style={"height: 60vh;"} id="log">
            </div>
            <div>
                <form id="chatform" class="text-right px-12 py-2 lg:flex-none" autocomplete="off">
                    <input type="text" class="input input-bordered w-full max-w-xs" id="text" />
                    <input type="submit" class="px-1.5" id="send" />
                </form>
            </div>
        </div>
    {/if}

</html>