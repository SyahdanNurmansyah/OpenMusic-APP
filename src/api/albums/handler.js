const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor (service, songsService, validator) {
        
        this._service = service;
        this._songService = songsService
        this._validator = validator;

        autoBind(this);
    };

    async postAlbumHandler (request, h) {

        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({ name, year });
        
        const response = h.response ({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            }
        });

        response.code(201);
        return response;
    };

    async getAlbumsHandler () {

        const albums = await this._service.getAlbums();

        return {
            status: 'success',
            data: {
                albums,
            }
        }
    };

    async getAlbumByIdHandler (request) {

        const { id } = request.params;
        const album = await this._service.getAlbumById(id);
        album.songs = await this._songService.getSongs({ albumId: id });

        return {
            status: 'success',
            data: {
                album,
            },
        };
    };

    async putAlbumByIdHandler (request) {

        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;
        await this._service.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    };

    async deleteAlbumByIdHandler (request) {

        const { id } = request.params;
        await this._service.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    };

    async postAlbumLikeHandler (request, h) {

        const { id: albumId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.getAlbumById(albumId);
        await this._service.addAlbumLikeById(albumId, userId);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil disukai',
        });

        response.code(201);
        return response;
    };

    async getLikedAlbumsHamdler (request, h) {

        const { id: albumId } = request.params;
        const { source, likeCounts: likes } = await this._service.getAlbumLikesById(albumId);

        const response = h.response({
            status: 'success',
            data: {  
                likes,
            },
        });

        response.header('X-Data-Source', source);
        response.code(200);
        return response;
    };
    
    async deleteLikeonAlbumHandler (request) {

        const { id: userId  } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._service.deleteLikeonAlbum(albumId, userId);
        return {
            status: 'success',
            message: 'Album berhasil batal disukai',
        };
    };
};

module.exports = AlbumsHandler;