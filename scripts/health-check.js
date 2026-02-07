const http = require('http');

http.get('http://localhost:3000', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk.toString().substring(0, 100)}...`);
    });
    res.on('end', () => {
        process.exit(res.statusCode === 200 ? 0 : 1);
    });
}).on('error', (e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
});
