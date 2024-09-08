const autoBind = require("auto-bind");

class PlaylistSongsHandler {
    constructor (service, playlistService, songService, validator) {

        this._service = service;
        this._playlistService = playlistService;
        this._songService = songService
        this._validator = validator;

        autoBind(this);
    }

    async postSongToPlaylistHandler (request, h) {

        this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { id } = request.params;
        const { songId } = request.payload;

        console.log(request.auth.credentials);
        console.log(id);
        console.log(songId);
        
        await this._playlistService.verifyPlaylistOwner(id, credentialId);
        await this._songService.getSongById(songId);
        await this._service.addSongToPlaylist(id, songId);

        const response = h.response ({
            status: 'success',
            message: 'Lagu berhasil ditambah ke playlist',
        });

        response.code(201);
        return response;
    };
};

module.exports = PlaylistSongsHandler;