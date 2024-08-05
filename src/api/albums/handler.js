const autoBind = require("auto-bind");

class AlbumsHandler {
    constructor (albumsService, songsService, albumsValidator) {
        
        this._albumService = albumsService;
        this._songService = songsService
        this._albumValidator = albumsValidator;

        autoBind(this);
    };

    async postAlbumHandler (request, h) {

        this._albumValidator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._albumService.addAlbum({ name, year });
        
        const response = h.response ({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            }
        });

        response.code(201);
        return response;
    }

    async getAlbumsHandler () {

        const albums = await this._albumService.getAlbums();

        return {
            status: 'success',
            data: {
                albums,
            }
        }
    };

    async getAlbumByIdHandler (request) {

        const { id } = request.params;
        const album = await this._albumService.getAlbumById(id);
        album.songs = await this._songService.getSongs({ albumId: id });

        return {
            status: 'success',
            data: {
                album,
            },
        };
    };

    async putAlbumByIdHandler (request) {

        this._albumValidator.validateAlbumPayload(request.payload);
        const { id } = request.params;
        await this._albumService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler (request) {

        const { id } = request.params;
        await this._albumService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }
    
}

module.exports = AlbumsHandler;