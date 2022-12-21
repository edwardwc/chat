import json from "../utils/json";

const ws = async (req) => {
    //let id = req.env.rooms.newUniqueId();
    let id = req.env.ROOMS.idFromName("index");
    let obj = req.env.ROOMS.get(id)
    return await obj.fetch(req)
}

export default ws;