const autoBind = require("auto-bind");

class UploadCoverAlbum {
    constructor(service, albumsService, validator) {

        this._service = service;
        this._albumsService = albumsService
        this._validator = validator;

        autoBind(this);
    }

    async postAlbumCoverHandler (request, h) {

        const { id: albumId } = request.params;
        const { cover } = request.payload;

        if (!cover || !cover.hapi) {
            const response = h.response ({
                status: 'fail',
                message: 'Cover gagal diupload'
            });

            response.code(400);
            return response;
        };

        this._validator.validateCoverAlbums(cover.hapi.headers);
    
        const filename = await this._service.writeFile(cover, cover.hapi);
        const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
        
        await this._albumsService.updateCoverAlbumById(albumId, coverUrl);

        const response = h.response ({
            status: 'success',
            message: 'Sampul berhasil diunggah',
            cover: {
                fileLocation: coverUrl,
            },
        });

        response.code(201);
        return response;
    }
};

module.exports = UploadCoverAlbum;