const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {    
    name: 'playlistSongs',
    version: '1.0.0',
    register: async (server, {
        service,
        playlistService,
        songService,
        validator
    }) => {
        const playlistSongsHandler = new PlaylistSongsHandler(
            service,
            playlistService,
            songService,
            validator
        );

        server.route(routes(playlistSongsHandler));
    }
}