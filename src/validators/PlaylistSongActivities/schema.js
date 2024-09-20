const Joi = require('joi');

const PlaylistSongActivitiesPayloadSchema = Joi.object({
    playlistId: Joi.string().required(),
});

module.exports = { PlaylistSongActivitiesPayloadSchema }