const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: handler.postSongIntoPlaylistHandler,
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
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: handler.deleteSongInPlaylistIdHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
];

module.exports = routes;