require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

// Albums
const albums = require('./api/albums');
const AlbumsValidator = require('./validators/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validators/songs');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validators/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validators/authentications');
const TokenManager = require('./tokenize/TokenManager');

// Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validators/playlists');

// SongToPlaylist
const playlistSongs = require('./api/playlistSongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validators/playlistSongs');

const init = async () => {
    
    const songsService = new SongsService();
    const albumService = new AlbumsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const playlistsService = new PlaylistsService();
    const playlistSongsService = new PlaylistSongsService();

    const server = Hapi.server ({
        port: process.env.PORT,
        host: process.env.HOST,
        debug: {
            request: ['error'],
        },
        
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // Register plugin eksternal

    await server.register ([
        {
            plugin: Jwt,
        }
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },

        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    })

    await server.register ([
        {
            plugin: albums,
            options: {
                service: albumService,
                songsService: songsService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            }
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            }
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator,
            }
        },
        {
            plugin: playlistSongs,
            options: {
                service: playlistSongsService,
                playlistService: playlistsService,
                songService: songsService,
                validator: PlaylistSongsValidator,
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