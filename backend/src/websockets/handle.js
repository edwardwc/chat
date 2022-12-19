import clientNameGenerator from "../utils/names";

const handle = async (ws, env) => {
    ws.accept();

    // give this client a name
    const name = clientNameGenerator();

    await env.COOL_DB.prepare(
        `INSERT INTO rooms (room, users) VALUE ('index', ?)`
    )
        .bind(name)
        .all();



    ws.addEventListener("message", event => {
        try {
            broadcastMessage("index", event.data, name) // rooms to be added soon
        } catch (err) {

        }
    })
}

export default handle