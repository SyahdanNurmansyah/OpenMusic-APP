const autoBind = require("auto-bind");

class CollaborationsHandler {
    constructor (
        collaborationsService,
        playlistsService,
        usersService,
        validator
    )
    {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._usersService = usersService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {

        this._validator.validateCollaborationPayload(request.payload);
        
        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        console.log(request.auth.credentials);
        console.log(playlistId);
        console.log(userId);

        await this._playlistsService.verifyPlaylistOwner( playlistId, credentialId );
        await this._usersService.getUserById( userId );

        const collaborationId = await this._collaborationsService.addCollaboration( playlistId, userId );

        const response = h.response ({
            status: 'success',
            message: 'Kolaborasi berhasil ditambahkan',
            data: {
                collaborationId,
            },
        });

        response.code(201);
        console.log(collaborationId);
        return response;
    };

    async deleteCollaborationHandler(request) {

        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsService.verifyPlaylistOwner( playlistId, credentialId );
        await this._collaborationsService.deleteCollaboration( playlistId, userId );

        return {
            status: 'success',
            message: 'Kolaborasi berhasil dihapus',
        };
    };
};

module.exports = CollaborationsHandler;