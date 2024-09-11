const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: handler.postSongToPlaylistHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: handler.getSongsInPlaylistIdHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
];

module.exports = routes;