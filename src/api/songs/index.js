const routes = require('./routes')
const SongsHandler = require("./handler");

module.exports = {
    
    name: 'songs',
    version: '1.0.0',
    register: async (server, { songsService, songsValidator }) => {
        const songHandler = new SongsHandler(songsService, songsValidator);

        server.route(routes(songHandler));
    },
};