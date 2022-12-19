import { Router } from 'itty-router'; // itty is awesome!
import ws from "./routes/ws";
import json from "./utils/json";

const router = Router();

router
	.get('/ws', ws)
	.get('*', () => {
		return json("Couldn't find that path!", 404);
	});

export default { // switch to module worker syntax so we can access env
	async fetch(request, env) {
		request.env = env;
		return router
			.handle(request)
			.then((response) => {
				// allow our frontend to query the data
				response.headers.set("Access-Control-Allow-Origin", "*");
				return response;
			});
	},
};
