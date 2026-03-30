const fs = require('fs');

fs.writeFile('example.txt', 'Hello, this is a file created using fs module.', (err) => {
    if (err) {
        console.error('Error writing file:', err);
        return;
    }
    console.log('File written successfully.');

    fs.readFile('example.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        console.log('File content:');
        console.log(data);
    });
});
