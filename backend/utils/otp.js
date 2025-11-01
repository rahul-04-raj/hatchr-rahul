const otp = {
    generate: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    getExpiry: (minutesValid = 10) => {
        return new Date(Date.now() + minutesValid * 60 * 1000);
    },

    isExpired: (expiryDate) => {
        return new Date() > new Date(expiryDate);
    },

    isValid: (stored, provided, expiryDate) => {
        if (!stored || !provided) return false;
        if (otp.isExpired(expiryDate)) return false;
        return stored === provided.toString();
    }
};

module.exports = otp;
