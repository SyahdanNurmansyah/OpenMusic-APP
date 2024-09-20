const InvariantError = require("../../exceptions/InvariantError");
const { PlaylistSongActivitiesPayloadSchema } = require("./schema")

const PlaylistSongActivitiesValidator = {
    validatePlaylistSongsActivitiesPayload: (payload) => {
        const validatorResult = PlaylistSongActivitiesPayloadSchema.validate(payload);

        if (validatorResult.error) {
            throw new InvariantError(validatorResult.error.message);
        };
    },
};

module.exports = PlaylistSongActivitiesValidator;