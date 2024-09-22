const AlbumsService = require("../../services/postgres/AlbumsService");
const UploadCoverAlbum = require("./handler");
const routes = require('./routes');

const albumsService = new AlbumsService()

module.exports = {
    name: 'UploadCoverAlbums',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const uploadsAlbumCoverHandler = new UploadCoverAlbum(service, albumsService, validator);

        server.route(routes(uploadsAlbumCoverHandler));
    },
};