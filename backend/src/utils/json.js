const json = (message, status) => {
    let response = new Response(JSON.stringify({
        success: status ? status === 200 : true,
        message
    }), { status: status || 200 });
    response.headers.set("Content-Type", "application/json");
    return response;
}

export default json