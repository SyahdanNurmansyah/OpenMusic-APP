const autoBind = require("auto-bind");

class PlaylistSongsHandler {
    constructor (service, playlistService, songService, validator) {

        this._service = service;
        this._playlistService = playlistService;
        this._songService = songService;
        this._validator = validator;

        autoBind(this);
    }

    async postSongToPlaylistHandler (request, h) {

        this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        console.log(request.auth.credentials);
        console.log(playlistId);
        console.log(songId);
        
        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._songService.getSongById(songId);
        await this._service.addSongToPlaylist(playlistId, songId);

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
    
        await this._playlistService.verifyPlaylistOwner( playlistId, credentialId);

        const playlist = await this._service.getSongsByPlaylistId( playlistId );

        const response = h.response ({
            status: 'success',
            data: {
                playlist,
             },
        });

        response.code(200);
        return response;
    };

    async deletePlaylistSongsIdHandler (request) {

        await this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._playlistService.verifyPlaylistOwner( playlistId, credentialId );
        await this._service.deletePlaylistSongsId( playlistId, songId );

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus'
        };
    };
};

module.exports = PlaylistSongsHandler;