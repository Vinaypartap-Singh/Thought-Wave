// Generate an AES-GCM key (used for encryption and decryption)
async function generateKey() {
    return await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 }, // Algorithm and key length
        true, // Key is extractable (for sharing or reuse)
        ["encrypt", "decrypt"] // Key usage
    );
}


// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    if (typeof window !== 'undefined') {
        // For client-side (browser)
        let binary = ''
        const bytes = new Uint8Array(buffer)
        const length = bytes.byteLength
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return window.btoa(binary)
    } else {
        // For server-side (Node.js)
        const bufferNode = Buffer.from(buffer)
        return bufferNode.toString('base64')
    }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    if (typeof window !== 'undefined') {
        // For client-side (browser)
        const binaryString = window.atob(base64)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes.buffer
    } else {
        // For server-side (Node.js)
        const bufferNode = Buffer.from(base64, 'base64')
        return bufferNode.buffer
    }
}

// Helper function to import a key (base64 -> CryptoKey)
async function importKey(base64Key: string): Promise<CryptoKey> {
    const keyBuffer = base64ToArrayBuffer(base64Key); // Convert base64 key to ArrayBuffer
    return crypto.subtle.importKey(
        "raw",  // Raw key format
        keyBuffer, // Key data
        { name: "AES-GCM" }, // Algorithm
        false, // Key is not extractable
        ["encrypt", "decrypt"] // Key usage
    );
}

// Encryption function
// async function encryptMessage(base64Key: string, message: string) {
//     const encoder = new TextEncoder();
//     const encodedMessage = encoder.encode(message);

//     const iv = crypto.getRandomValues(new Uint8Array(12)); // Random initialization vector (IV)

//     const key = await importKey(base64Key); // Import the key from base64

//     const encrypted = await crypto.subtle.encrypt(
//         { name: "AES-GCM", iv },
//         key,
//         encodedMessage
//     );

//     return {
//         iv, // Initialization vector
//         encryptedData: new Uint8Array(encrypted), // Encrypted message
//     };
// }


async function encryptMessage(keyBuffer: ArrayBuffer, message: string) {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Random initialization vector (IV)

    const key = await crypto.subtle.importKey(
        "raw", // Raw key format
        keyBuffer, // The ArrayBuffer key
        { name: "AES-GCM" }, // Algorithm for AES-GCM
        false, // Key is not extractable
        ["encrypt", "decrypt"] // Key usage
    );

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


async function decryptMessage(encryptionKeyBuffer: ArrayBuffer, ivBuffer: ArrayBuffer, encryptedDataBuffer: ArrayBuffer) {
    try {
        // Import the encryption key as a CryptoKey
        const key = await crypto.subtle.importKey(
            "raw",
            encryptionKeyBuffer,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // Decrypt the message using the key and IV
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBuffer },
            key,
            encryptedDataBuffer
        );

        // Convert decrypted data back to text
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error("Error decrypting message:", error);
        throw new Error("Failed to decrypt message.");
    }
}


export { arrayBufferToBase64, base64ToArrayBuffer, decryptMessage, encryptMessage, generateKey };

