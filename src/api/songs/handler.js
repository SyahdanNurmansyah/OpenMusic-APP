const autoBind = require("auto-bind");

class SongsHandler {
    constructor (songsService, songsValidator) {
        
        this._songService = songsService;
        this._songValidator = songsValidator;

        autoBind(this)
    }

    async postSongHandler (request, h) {
        
        this._songValidator.validateSongPayload(request.payload);
        const {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        } = request.payload;

        const songId = await this._songService.addSong({
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        });

        const response = h.response ({
            status: 'success',
            message: 'Lagu berhasil ditambahkan',
            data: {
                songId,
            },
        });

        response.code(201);
        return response;
    };

    async getSongsHandler (request) {

        const { title, performer } = request.query
        const songs = await this._songService.getSongs({ title, performer });

        return {
            status: 'success',
            data: {
                songs,
            },
        };
    };

    async getSongByIdHandler (request) {

        const { id } = request.params;
        const song = await this._songService.getSongById(id);

        return {
            status: 'success',
            data: {
                song,
            },
        };
    };

    async putSongByIdHandler (request) {

        this._songValidator.validateSongPayload(request.payload);
        const { id } = request.params;
        await this._songService.editSongById(id, request.payload);

        return {
            status: 'success',
            message: 'Lagu berhasil diperbarui',
        }
    }

    async deleteSongByIdHandler (request) {
        
        const { id } = request.params;
        await this._songService.deleteSongById(id);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    };
};

module.exports = SongsHandler;