require('dotenv').config();

const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

// Album
const albums = require('./api/albums');
const AlbumsValidator = require('./validators/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

// Song
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validators/songs');

const init = async () => {

    const albumService = new AlbumsService();
    const songsService = new SongsService();

    const server = Hapi.server ({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register ([
        {
            plugin: albums,
            options: {
                albumsService: albumService,
                songsService: songsService,
                albumsValidator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                songsService: songsService,
                songsValidator: SongsValidator,
            }
        },
    ]);

    server.ext ('onPreResponse', (request, h) => {

        const { response } = request;

         // Penanganan client error secara internal
         if (response instanceof Error) {
            if (response instanceof ClientError) {
                const newResponse = h.response ({
                    status: 'fail',
                    message: response.message,
                });

                newResponse.code(response.statusCode);
                return newResponse;
            }

            // Mempertahankan penanganan client error oleh Hapi secara nantive, serperti 404, etc.
            if (!response.isServer) {
                return h.continue;
            }

            // Penanganan server error sesaui kebutuhan
            const newResponse = h.response ({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami',
            });

            newResponse.code(500);
            return newResponse;
        };

        // Jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();