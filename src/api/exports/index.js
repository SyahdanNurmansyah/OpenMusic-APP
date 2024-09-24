const PlaylistsService = require('../../services/postgres/PlaylistsService');
const ExportSongsHandler = require('./handler');
const routes = require('./routes');

const playlistsService = new PlaylistsService();

module.exports = {
    name: 'exports',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const exportSongsHandler = new ExportSongsHandler(
            service,
            playlistsService,
            validator
        );

        server.route(routes(exportSongsHandler));
    }
}