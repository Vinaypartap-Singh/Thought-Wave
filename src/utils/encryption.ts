// Generate an AES-GCM key (used for encryption and decryption)
async function generateKey() {
    return await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 }, // Algorithm and key length
        true, // Key is extractable (for sharing or reuse)
        ["encrypt", "decrypt"] // Key usage
    );
}


async function encryptMessage(key: any, message: any) {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Random initialization vector (IV)

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedMessage
    );

    return {
        iv, // Initialization vector
        encryptedData: new Uint8Array(encrypted), // Encrypted message
    };
}


async function decryptMessage(key: any, encryptedData: any, iv: any) {
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted); // Original message
}


export { decryptMessage, encryptMessage, generateKey };
