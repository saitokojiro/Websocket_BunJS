export let method = {
    GET: "GET",
    POST: "POST",
};

export let headers = new Headers({
    "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    'Access-Control-Allow-Credentials': 'true',
    "Content-Type": "application/json; charset=UTF-8"
})


