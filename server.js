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





// const add = (a, b, next) => {
//     console.log(`add`);
//
//     return next(null, Number(a) + Number(b));
// };
// server.method('sum', add, {
//     cache: {
//         expiresIn: 30 * 1000,
//         generateTimeout: 100
//     }
// });
// server.route({
//     path: '/add/{a}/{b}',
//     method: 'GET',
//     handler: function (request, reply) {
//         server.methods.sum(request.params.a, request.params.b, (err, result) => {
//
//             if (err) {
//                 return reply(err);
//             }
//             reply(result);
//         });
//     }
// });






const fetchData = async (endpoint, next) => {

    console.log(`fetchData`);
    const response = await fetch(endpoint);
    let data = await response.json();
    data = data.results[0];

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

        server.methods.fetchData(endpoint, async (error, cachedResponse) => {
            let response = cachedResponse;
            let data = null;

            if (!response) {
                response = await fetch(endpoint);
                response = await response.json();
                response = data.results[0];

                console.log(`hey`);
            }

            if (error) {
                return reply(error);
            }

            reply(response);
        });
    }
});

// server.route({
//     method: 'GET',
//     path: '/recipes-ideas/cms/{path*}',
//     handler: async (request, reply) => {
//         const selectEverythingBeforeRegex = new RegExp('(.*?)/recipes-ideas/cms');
//         const endpoint = request.url.path.replace(selectEverythingBeforeRegex, 'https://randomuser.me/api');
//
//         console.log(`endpoint`, endpoint);
//         console.log(`endpoint`, 'https://randomuser.me/api/?inc=gender,name,nat');
//
//         const response = await fetch(endpoint);
//         let data = null;
//
//         if (response.status === 200) {
//             const json = await response.json();
//
//             data = json.results[0];
//         }
//
//         reply(data);
//     }
// });

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
