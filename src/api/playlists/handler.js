const autoBind = require("auto-bind");

class PlaylistsHandler {
    constructor (service, validator) {

        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler (request, h) {

        this._validator.validatePlaylistsPayload(request.payload);
        const { name } = request.payload;

        const { id: credentialId } = request.auth.credentials;
                        
        const playlistId = await this._service.addPlaylist({
            name,
            owner: credentialId,
        });

        const response = h.response ({
            status: 'success',
            message: `Playlist berhasil ditambahkan`,
            data: {
                playlistId,
            },
        });

        response.code(201);
        return response;
    };

    async getPlaylistsHandler (request) {
        const { id: credentialId } = request.auth.credentials;

        const playlists = await this._service.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            }
        }
    };

    async deletePlaylistHandler (request) {

        const { id } = request.params;
        
        await this._service.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    };
}

module.exports = PlaylistsHandler;