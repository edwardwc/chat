import json from "../utils/json";
import handleErrors from "../utils/errors";
import clientNameGenerator from "../utils/names";
import {regularMessage, systemMessage, updateMessage} from "../utils/messages";

export class Chatroom {
    constructor(controller, env) {
        // `controller.storage` provides access to our durable storage. It provides a simple KV
        // get()/put() interface.
        this.storage = controller.storage;

        // `env` is our environment bindings (discussed earlier).
        this.env = env;

        // We will put the WebSocket objects for each client, along with some metadata, into
        // `sessions`.
        this.sessions = [];

        // We keep track of the last-seen message's timestamp just so that we can assign monotonically
        // increasing timestamps even if multiple messages arrive simultaneously (see below). There's
        // no need to store this to disk since we assume if the object is destroyed and recreated, much
        // more than a millisecond will have gone by.
        this.lastTimestamp = 0;
    }

    async fetch(req) {
        return await handleErrors(req, async () => {
            if (req.headers.get("Upgrade") !== "websocket") {
                return json("Expected upgrade", 426)
            }

            const ws = new WebSocketPair();
            const [client, server] = Object.values(ws);

            const name = this.createName();

            this.sessions.push({
                name,
                server
            })

            await this.handleSession(server, name)

            return new Response(null, {
                status: 101,
                webSocket: client
            });
        })
    }

    async handleSession(ws, name) {
        ws.accept();

        ws.send(updateMessage("name", name))
        this.broadcast(systemMessage(`New user ${name} has joined! There are now ${this.sessions.length} users in this chat.`))

        ws.addEventListener("message", async msg => {
            try {
                if (msg.data) { // make sure the message actually exists
                    if (msg.data.charAt(0) === "/") { // it is a command
                        if (msg.data.includes("typing")) { // the user is typing
                            this.broadcast(updateMessage("typing", name))
                        } else if (msg.data.includes("count")) {
                            ws.send(updateMessage("count", this.sessions.length))
                        } else if (msg.data.includes("users")) {
                            let totalStr = "";
                            for (let i = 0; i < this.sessions.length; i++) {
                                if (i === this.sessions.length-1) {
                                    totalStr += this.sessions[i].name
                                } else {
                                    totalStr += (this.sessions[i].name + ", ")
                                }
                            }
                            ws.send(updateMessage("users", totalStr))
                        }
                    } else {
                        const userMessage = regularMessage(name, msg.data)
                        this.broadcast(userMessage)
                    }
                }
            } catch (err) {
                ws.send(systemMessage("An unexpected error occurred when trying to send your message"))
            }
        })

        let closeOrErrorHandler = () => {
            this.sessions = this.sessions.filter((user) => {
                return user.name !== name;
            })
            this.broadcast(systemMessage(`User ${name} has disconnected, there are now ${this.sessions.length} users connected`))
        }

        ws.addEventListener("close", closeOrErrorHandler);
        ws.addEventListener("error", closeOrErrorHandler);
    }

    broadcast(message) {
        for (let i = 0; i < this.sessions.length; i++) { // TODO: needs to flag when shit doesnt work like its supposed to
            this.sessions[i].server.send(message)
        }
    }

    createName() {
        const name = clientNameGenerator()
        for (let i = 0; i < this.sessions.length; i++) {
            if (this.sessions[i].name === name) {
                // failed, run it again
                return this.createName()
            }
        }
        return name;
    }
}