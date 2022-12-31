<script>
    import {onMount, } from "svelte";
    import { fade } from "svelte/transition";

    let message = "Loading..."
    let currentlySelected = "luxury";
    let someoneElseTyping = false;

    onMount(async () => {
        const logElem = document.querySelector('#log')
        let typing = false;
        let name = "";
        let currentlyTyping = []; // list of clients who are currently typing
        let sentLastMessage = "cyberpunk"; // this is so we can clump messages together
        const formElem = document.querySelector('#chatform')
        const typingElem = document.querySelector('#typing')
        const inputElem = document.querySelector('#text')

        /** @type {WebSocket | null} */
        var socket = null

        function log(msg, sender, you) {
            if (sender === "system" || sender === "update") {
                logElem.innerHTML += `<p class="text-center">${msg}</p>`
            } else if (you) {
                logElem.innerHTML += `
                <div class="chat chat-end">
                  ` + (sentLastMessage !== name ? `<div class="chat-header">${sender}</div>` : ``) + `
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

        const checkEntries = async () => { // this checks typing entries to make sure they haven't expired
            while (true) {
                currentlyTyping = currentlyTyping.filter(typer => typer.expiryTime > Date.now())
                if (currentlyTyping.length === 1) {
                    typingElem.innerHTML = currentlyTyping[0].name + " is typing..."
                } else if (currentlyTyping.length > 1 && currentlyTyping.length <= 4) { // TODO: refactor this for better english
                    let fullString = "";
                    for (let i = 0; i < currentlyTyping.length-1; i++) { // do all except the last element
                        fullString += (currentlyTyping[i].name + ", ")
                    }
                    fullString += ("and " + currentlyTyping[currentlyTyping.length-1].name + " are typing...")
                    typingElem.innerHTML = fullString;
                } else if (currentlyTyping.length > 4) {
                    typingElem.innerHTML = "Multiple users are typing";
                } else {
                    typingElem.innerHTML = ""
                }
                await new Promise(r => setTimeout(r, 50)); // check every 50ms
            }
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
                if (data.Sender === "update") {
                    if (data.Type === "name") {
                        name = data.Message;
                    }
                    if (data.Type === "typing") {
                        if (data.Message !== name) { // make sure the alert isn't for us
                            // first, we check if it's already here. if it is, we update the expiry time
                            // if not, we add it with an expiry time 5 seconds from now
                            for (let i = 0; i < currentlyTyping.length; i++) {
                                if (data.Message === currentlyTyping[i].name) {
                                    currentlyTyping[i].expiryTime = Date.now() + 5000; // add 5k milliseconds to the timeout
                                    return
                                }
                            }

                            // if not, let's make a new obj and push it
                            currentlyTyping.push({
                                name: data.Message, // name of the typer
                                expiryTime: Date.now() + 5000, // the time this typing will end!
                            })
                        }
                    }
                } else {
                    currentlyTyping = currentlyTyping.filter(typer => typer.name !== data.Sender)
                    log(data.Message.replaceAll(/[^\w. ]/gi, (c) => {return `&#${c.charCodeAt(0)};`}), data.Sender, (data.Sender === name));
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

        inputElem.addEventListener('keyup', async () => {
            if (!typing) {
                typing = true
                await sendTypingIndicator()
                typing = false
            }
        })

        const sendTypingIndicator = async () => {
            socket.send("/typing")
            await new Promise(r => setTimeout(r, 4000));
        }
        await checkEntries()
    })

</script>
<style>
    #log {
        overflow: auto;
    }
</style>
<html data-theme="dark">
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
         " opacity-90 py-10 bg-gray-800"} style={"height: 60vh;"}>
            <div class="mx-auto" style={"height: 48vh;"} id="log"></div>
            <p class="text-center bottom-0 insert-y-0 pt-2 text-gray-500" id="typing"></p>
        </div>
        <div>
            <form id="chatform" class="text-right px-24 py-2" autocomplete="off">
                <input type="text" class={`input input-bordered w-full max-w-xs m-1 px-4` + (currentlySelected === "cyberpunk" ? `bg-gray-700 text-yellow-400` : ``)}
                       data-theme="{currentlySelected}" id="text" autofocus required/>
                <button type="submit" data-theme="{currentlySelected}" class="btn btn-success lg:px-10" id="send">
                    Send
                </button>
                <div class="dropdown dropdown-top dropdown-end">
                    <label tabindex="0" class="btn m-1" data-theme="{currentlySelected}">Style</label>
                    <ul tabindex="0" class="dropdown-content menu shadow bg-base-100 rounded-box w-52">
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