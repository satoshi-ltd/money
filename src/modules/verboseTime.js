const ZERO = '0';

export const verboseTime = (time) => `${(ZERO + time.getHours()).slice(-2)}:${(ZERO + time.getMinutes()).slice(-2)}`;
