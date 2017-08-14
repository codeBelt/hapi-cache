'use strict';

const Hapi = require('hapi');
require('fetch-everywhere');

const server = new Hapi.Server({debug: {request: ['error']}});
server.connection({ port: 3000, host: 'localhost' });

server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        reply('Hello, world!');
    }
});


const fetchData = async (endpoint, next) => {
    console.log(`fetchData`);
    const response = await fetch(endpoint);
    let data = null;

    if (response.status === 200) {
        const json = await response.json();

        data = json.results[0];
    }

    return next(null, data);
};
server.method('fetchData', fetchData, {
    cache: {
        expiresIn: 30 * 1000,
        generateTimeout: 1000
    }
});
server.route({
    path: '/recipes-ideas/cms/{path*}',
    method: 'GET',
    handler: (request, reply) =>  {
        const selectEverythingBeforeRegex = new RegExp('(.*?)/recipes-ideas/cms');
        const endpoint = request.url.path.replace(selectEverythingBeforeRegex, 'https://randomuser.me/api');

        server.methods.fetchData(endpoint, async (error, cachedData) => {
            if (error) {
                return reply(error);
            }

            reply(cachedData);
        });
    }
});


server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
