const autoBind = require("auto-bind");

class AuthenticationsHandler {
    constructor (authenticationsService, usersService, tokenManager, validator) {

        this._authenticationsService = authenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        autoBind(this);
    }

    async postAuthenticationsHandler(request, h) {
        this._validator.validatePostAuthenticationPayload(request.payload);

        // Dapatkan nilai username dan password dari payload, dan gunakan nilainya tersebut untuk memeriksa apakah kredensial yang dikirimkan pada request sesuai.

        const { username, password } = request.payload;
        const id = await this._usersService.verifyUserCredential(username, password);

        // verifyUserCredential mengembalikan nilai id dari user, maka tampung pada variabel id.
    
        const accessToken = this._tokenManager.generateAccessToken({ id });
        const refreshToken = this._tokenManager.generateRefreshToken({ id });

        // Menyimpan refreshToken ke database agar dikenali.

        await this._authenticationsService.addRefreshToken(refreshToken);

        const response = h.response ({
            status: 'success',
            message: 'Authentication berhasil ditambahkan',
            data: {
                accessToken,
                refreshToken,
            },
        });

        response.code(201);
        return response;;
    };

    async putAuthenticationsHandler (request) {
        this._validator.validatePutAuthenticationPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authenticationsService.verifyRefreshToken(refreshToken);
        const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);

        const accessToken = await this._tokenManager.generateAccessToken({ id });

        return {
            status: 'success',
            message: 'Refresh token berhasil diperbarui',
            data: {
                accessToken,
            },
        };
    };

    async deleteAuthenticationsHandler (request) {
        this._validator.validateDeleteAuthenticationPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authenticationsService.verifyRefreshToken(refreshToken);
        await this._authenticationsService.deleteRefreshToken(refreshToken);

        return {
            status: 'success',
            message: 'Refresh token berhasil dihapus',
        };
    };
};

module.exports = AuthenticationsHandler;