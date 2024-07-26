# bunserver

To install dependencies:

```bash
bun install
```

```bash
mkdir rsakey
```

```bash
openssl genrsa -out private_key.pem 4096
openssl rsa -pubout -in private_key.pem -out public_key.pem
# convert private key to pkcs8 format in order to import it from Java
openssl pkcs8 -topk8 -in private_key.pem -inform pem -out private_key_pkcs8.pem -outform pem -nocrypt


#cert
#Generate a private key:
openssl genpkey -algorithm RSA -out key.pem
#Generate a CSR (Certificate Signing Request):
openssl req -new -key key.pem -out csr.pem
#Generate a self-signed certificate:
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v0.3.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
