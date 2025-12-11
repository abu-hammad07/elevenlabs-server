// import crypto from "crypto";
// import readline from "readline";

// // ---------------- APP KEY ----------------
// const APP_KEY = "base64:xdlSYeyb0V+okdWOqrG+ERTkhnpnU103zzOCECjbAYA=";
// const key = Buffer.from(APP_KEY.replace("base64:", ""), "base64");

// // PKCS7 Padding
// function pkcs7Pad(buffer) {
//     const pad = 16 - (buffer.length % 16);
//     return Buffer.concat([buffer, Buffer.alloc(pad, pad)]);
// }

// function pkcs7Unpad(buffer) {
//     const pad = buffer[buffer.length - 1];
//     return buffer.slice(0, buffer.length - pad);
// }

// // ---------------- ENCRYPT ----------------
// function laravelEncrypt(plaintext) {
//     const iv = crypto.randomBytes(16);

//     const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//     const encrypted = Buffer.concat([
//         cipher.update(pkcs7Pad(Buffer.from(plaintext))),
//         cipher.final(),
//     ]);

//     const iv_b64 = iv.toString("base64");
//     const value_b64 = encrypted.toString("base64");

//     const mac = crypto
//         .createHmac("sha256", key)
//         .update(iv_b64 + value_b64)
//         .digest("hex");

//     const payload = {
//         iv: iv_b64,
//         value: value_b64,
//         mac: mac,
//         tag: "",
//     };

//     return Buffer.from(JSON.stringify(payload)).toString("base64");
// }

// // ---------------- DECRYPT ----------------
// function laravelDecrypt(encoded) {
//     try {
//         const decodedJSON = Buffer.from(encoded, "base64").toString("utf8");
//         const data = JSON.parse(decodedJSON);

//         const iv = Buffer.from(data.iv, "base64");
//         const encrypted = Buffer.from(data.value, "base64");

//         const macCheck = crypto
//             .createHmac("sha256", key)
//             .update(data.iv + data.value)
//             .digest("hex");

//         if (macCheck !== data.mac) {
//             return "❌ MAC verification failed (Wrong APP_KEY)";
//         }

//         const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
//         const decrypted = Buffer.concat([
//             decipher.update(encrypted),
//             decipher.final(),
//         ]);

//         return pkcs7Unpad(decrypted).toString("utf8");

//     } catch (e) {
//         return "❌ Invalid hash format!";
//     }
// }

// // ---------------- MENU ----------------
// console.log("\n=== Laravel Crypto Tool (Node.js ESM) ===\n");

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// rl.question("Type 'encrypt' or 'decrypt': ", (choice) => {
//     if (choice === "encrypt") {
//         rl.question("Enter string to encrypt: ", (text) => {
//             console.log("\n✔ Encrypted Hash:\n");
//             console.log(laravelEncrypt(text));
//             rl.close();
//         });

//     } else if (choice === "decrypt") {
//         rl.question("Enter encrypted hash: ", (hash) => {
//             console.log("\n✔ Decrypted Value:\n");
//             console.log(laravelDecrypt(hash));
//             rl.close();
//         });

//     } else {
//         console.log("❌ Invalid choice.");
//         rl.close();
//     }
// });
























import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ---------------- APP KEY ----------------
const APP_KEY = process.env.APP_KEY;

if (!APP_KEY) throw new Error("❌ APP_KEY missing in .env");
if (!APP_KEY.startsWith("base64:")) throw new Error("❌ APP_KEY must start with 'base64:'");

const key = Buffer.from(APP_KEY.replace("base64:", ""), "base64");

// PKCS7 padding...
function pkcs7Pad(buffer) {
    const pad = 16 - (buffer.length % 16);
    return Buffer.concat([buffer, Buffer.alloc(pad, pad)]);
}

function pkcs7Unpad(buffer) {
    const pad = buffer[buffer.length - 1];
    return buffer.slice(0, buffer.length - pad);
}

// ENCRYPT / DECRYPT functions...
export function laravelEncrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(pkcs7Pad(Buffer.from(plaintext))),
        cipher.final(),
    ]);
    const iv_b64 = iv.toString("base64");
    const value_b64 = encrypted.toString("base64");
    const mac = crypto.createHmac("sha256", key)
                      .update(iv_b64 + value_b64)
                      .digest("hex");
    const payload = { iv: iv_b64, value: value_b64, mac, tag: "" };
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function laravelDecrypt(encoded) {
    try {
        const decodedJSON = Buffer.from(encoded, "base64").toString("utf8");
        const data = JSON.parse(decodedJSON);
        const iv = Buffer.from(data.iv, "base64");
        const encrypted = Buffer.from(data.value, "base64");
        const macCheck = crypto.createHmac("sha256", key)
                               .update(data.iv + data.value)
                               .digest("hex");
        if (macCheck !== data.mac) return "❌ MAC verification failed (Wrong APP_KEY)";
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return pkcs7Unpad(decrypted).toString("utf8");
    } catch {
        return "❌ Invalid hash format!";
    }
}
