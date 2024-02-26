export const verboseMonth = (timestamp = new Date(), { MONTHS = {} }) => MONTHS[new Date(timestamp).getMonth()];
