const PlaylistSongsActivitiesHandler = require("./handler");
const routes = require("./routes");

module.exports = {
    name: 'PlaylistSongActivities',
    version: '1.0.0',
    register: async (server, {
        service,
        playlistsService,
        validator
    }) => {
        const playlistSongActivities = new PlaylistSongsActivitiesHandler(
            service,
            playlistsService,
            validator
        )

        server.route(routes(playlistSongActivities));
    },
};