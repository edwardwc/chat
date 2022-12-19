const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');

const clientNameGenerator = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        length: 2
    });
}

export default clientNameGenerator;
