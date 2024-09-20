const autoBind = require("auto-bind");

class PlaylistSongsActivitiesHandler {
    constructor (
        service,
        playlistsService,
        validator
    )
    {
        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async getPlaylistSongsActivitiesHandler (request, h) {

        this._validator.validatePlaylistSongsActivitiesPayload(request.payload);
        
        const { id: credentialId} = request.auth.credentials;
        const { id: playlistId} = request.params;
        
        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        
        const activities = await this._service.getPlaylistSongActivities(playlistId);
        
        const response = h.response ({
            status: 'success',
            data: {
                playlistId,
                activities,
            }
        });

        response.code(200);
        console.log(playlistId, activities);
        return response;
    };
};

module.exports = PlaylistSongsActivitiesHandler;