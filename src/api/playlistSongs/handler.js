const autoBind = require("auto-bind");

class PlaylistSongsHandler {
    constructor (
        service,
        playlistsService,
        songsService,
        validator
    )
    {
        this._service = service;
        this._playlistsService = playlistsService;
        this._songsService = songsService;
        this._validator = validator;

        autoBind(this);
    }

    async postSongIntoPlaylistHandler (request, h) {

        this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        console.log(request.auth.credentials);
        console.log(playlistId);
        console.log(songId);
        
        await this._playlistsService.verifyPlaylistAccess( playlistId, credentialId );
        await this._songsService.getSongById( songId );
        await this._service.addSongIntoPlaylist( playlistId, songId );

        const response = h.response ({
            status: 'success',
            message: 'Lagu berhasil ditambah ke playlist',
        });

        response.code(201);
        return response;
    };

    async getSongsInPlaylistIdHandler (request, h) {

        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;

        console.log(playlistId)
    
        await this._playlistsService.verifyPlaylistAccess( playlistId, credentialId);

        const playlist = await this._service.getSongsByPlaylistId( playlistId );

        const response = h.response ({
            status: 'success',
            data: {
                playlist,
             },
        });

        console.log(playlist);
        response.code(200);
        return response;
    };

    async deleteSongInPlaylistIdHandler (request) {

        this._validator.validatePlaylistSongsPayload(request.payload);
        
        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess( playlistId, credentialId );
        await this._service.deleteSongInPlaylistById( playlistId, songId );

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus'
        };
    };
};

module.exports = PlaylistSongsHandler;