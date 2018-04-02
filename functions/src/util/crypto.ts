import { createCipher, createDecipher } from 'crypto';

const algo = 'aes-256-cbc';

export const crypto = {
    encrypt(text, key) {
        const cipher = createCipher(algo, key);
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    },

    decrypt(text, key) {
        const decipher = createDecipher(algo, key);
        return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
    },
};