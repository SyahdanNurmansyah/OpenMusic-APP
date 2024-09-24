require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');
const path = require('path');
const Inert = require('@hapi/inert');

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

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validators/collaborations');

// PlaylistSongActivities
const playlistSongActivities = require('./api/playlistSongActivities');
const PlaylistSongsActivitiesService = require('../src/services/postgres/PlaylistSongActivitiesService');
const PlaylistSongActivitiesValidator = require('../src/validators/PlaylistSongActivities');

// Exports
const exportSongs = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validators/exports');

// Upload
const uploadCover = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadCoverAlbumsValidator = require('./validators/uploads');

// Redis
const CacheService = require('./services/redis/CacheService');

const init = async () => {

    const cacheService = new CacheService()
    const albumService = new AlbumsService(cacheService);
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService(cacheService);
    const playlistsService = new PlaylistsService(collaborationsService);
    const playlistSongsService = new PlaylistSongsService();
    const playlistSongActivitiesService = new PlaylistSongsActivitiesService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

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
        },
        {
            plugin: Inert,
        },
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
                playlistsService,
                songsService,
                validator: PlaylistSongsValidator,
            }
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                usersService,
                validator: CollaborationsValidator,
            }
        },
        {
            plugin: playlistSongActivities,
            options: {
                service: playlistSongActivitiesService,
                playlistsService,
                validator: PlaylistSongActivitiesValidator,
            }
        },
        {
            plugin: exportSongs,
            options: {
                service: ProducerService,
                validator: ExportsValidator,
            }
        },
        {
            plugin: uploadCover,
            options: {
                service: storageService,
                validator: UploadCoverAlbumsValidator,
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