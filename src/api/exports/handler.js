const autoBind = require("auto-bind");

class ExportSongsHandler {
    constructor(service, playlistsService, validator) {

        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postExportSongsHandler (request, h) {

        this._validator.validateExportSongsPayload(request.payload);

        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

        const message = {
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._service.sendMessage('export:songs', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        });

        response.code(201);
        return response;
    }
};

module.exports = ExportSongsHandler;