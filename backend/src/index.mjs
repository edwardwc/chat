import { Router } from 'itty-router'; // itty is awesome!
import ws from "./routes/ws.js";
import json from "./utils/json";
import handleErrors from "./utils/errors.js";

const router = Router();

router
	.get('/ws', async (req) => {
		const id = req.env.ROOMS.idFromName("index");
		const obj = req.env.ROOMS.get(id)
		return await obj.fetch(req)
	})
	.get('*', () => {
		return json("Couldn't find that path!", 404);
	});

export default { // switch to module worker syntax so we can access env
	async fetch(request, env) {
		request.env = env;
		return router
			.handle(request);
	},
};

export {Chatroom} from "./classes/chatroom";