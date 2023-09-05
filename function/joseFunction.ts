
import * as jose from "jose";


let publicKey = async () => {
    const foo = Bun.file("./rsakey/public_key.pem");
    return await foo.text();
};

let privateKey = async () => {
    try {
        const foo = Bun.file("./rsakey/private_key_pkcs8.pem");
        return await foo.text();
    } catch (error) {
        console.log(error);
    }
};


export let joseGroupeVerify: any = async (token: string) => {
    try {
        const alg = "RS256";

        let pubK: string = await publicKey();
        const secret = await jose.importSPKI(pubK, alg);

        let { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
            //issuer: 'urn:example:issuer',
            //audience: 'urn:example:audience',
        });
        //console.log(payload)
        //console.log(protectedHeader)
        return { payload: payload, protectedHeader: protectedHeader, status: true };
    } catch (error) {
        console.log("invalid token");
        return {
            payload: "",
            protectedHeader: "",
            response: "invalid token",
            status: false,
        };
        //console.log(error)
    }
};

//joseGroupeVerify(jwtkeys)

export let joseGroupeSign: any = async (user: jose.JWTPayload) => {
    try {
        const alg: string = "RS256";

        let prK: string = await privateKey();

        //console.log(prK)
        //console.log(user)
        const secret = await jose.importPKCS8(prK, alg);

        const jwt = await new jose.SignJWT(user)
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setIssuer("urn:example:issuer")
            .setAudience("urn:example:audience")
            .setExpirationTime("2h")
            .sign(secret);

        //console.log(jwt)
        return await jwt;
    } catch (error) {
        console.log(error);
        console.log("error token");
    }
};