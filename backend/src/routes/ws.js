import json from "../utils/json";
import handle from "../websockets/handle";

const ws = async (req) => {
    if (req.headers.get("Upgrade") !== "websocket") {
        return json("Expected upgrade", 426)
    }

    const ws = new WebSocketPair();
    const [client, server] = Object.values(ws);

    await handle(server, req.env)

    return new Response(null, {
        status: 101,
        webSocket: client
    });
}

export default ws;