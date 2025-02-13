export let method = {
    GET: "GET",
    POST: "POST",
};

export let headers = new Headers({
    "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Origin,Content-Type, Authorization, Accept",
    'Access-Control-Allow-Credentials': 'true',
    "Content-Type": "application/json; charset=UTF-8"
})


export let headersSecurity = new Headers({
    "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Origin,Content-Type, Authorization, Accept",
    'Access-Control-Allow-Credentials': 'true',
    "Content-Type": "application/json; charset=UTF-8",

    'Content-Security-Policy': "default-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
})

const fixedDelay = 1000;
export async function delayedResponse(response) {
    return new Promise(resolve => {
        setTimeout(() => resolve(response), fixedDelay);
    });
}

const minDelay = 500;
const maxDelay = 1500;

export async function randomDelayedResponse(response) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    return new Promise(resolve => {
        setTimeout(() => resolve(response), delay);
    });
}

let UserIpMap = new Map()
let MaxAttempt = 3;
let TimerAttempt = 15 * 60 * 1000

let RateLimite = (req) => {
    return (e) => {
        const ip = req.header.get("x-forwarded-for") || req.remoteAddr;
        const now = Date.now()
        if (!UserIpMap.has(ip)) {
            UserIpMap.set(ip, { count: 1, timestamp: now });
            return true;
        } else {
            const { count, timestamp } = UserIpMap.get(ip);
            if (now - timestamp < TimerAttempt) {
                if (count >= MaxAttempt) {
                    return false;
                } else {
                    UserIpMap.set(ip, { count: count + 1, timestamp });
                    return true;
                }
            } else {
                UserIpMap.set(ip, { count: 1, timestamp: now });
                return true;
            }
        }
    }

}

export let checkPassword = async (password, checkPassword) => {
    try {
        const hash = await Bun.password.verify(password, checkPassword)
        return hash
    } catch (error) {
        console.log(error)
    }
}

let matchForm = (EmailName, EmailNameCheck, Password, PasswordCheck) => {
    if (EmailName !== EmailNameCheck) {
        if (Password !== PasswordCheck) {
            return { error: "email & password invalid", isValid: false }
        }
        return { error: "email invalid", isValid: false }
    }
    if (Password !== PasswordCheck) {
        if (EmailName !== EmailNameCheck) {
            return { error: "email & password invalid", isValid: false }
        }
        return { error: "password invalid", isValid: false }
    }
    return { error: "information match", isValid: true }
}