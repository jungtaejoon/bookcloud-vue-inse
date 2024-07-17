export default function extractAndConcatenateNumbers(text) {
    const regex = /\d+/g;
    const matches = text.match(regex);
    return matches ? matches.join('') : '';
}
