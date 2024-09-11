const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongsService {
    constructor () {

        this._pool = new Pool();
    }

    async addSongToPlaylist ( playlistId, songId ) {

        const id = `SongToPlaylist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };
        
        console.log(id);

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError ('Gagal menambahkan lagu ke dalam playlist')
        };

        return result.rows[0].id;
    };

    async getSongsByPlaylistId( playlistId ) {

        const playlistQuery = {
            text: `SELECT playlists.*, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1`,
            values: [playlistId]
        };

        const playlistQueryResult = await this._pool.query(playlistQuery);

        if (!playlistQueryResult.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        };

        const playlist = playlistQueryResult.rows[0];

        const songsQuery = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_id = $1',
            values: [playlistId]
        };

        const songsQueryResult = await this._pool.query(songsQuery);

        if (!songsQueryResult.rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        };

        const songs = songsQueryResult.rows;

        const playlistSongsResult = {
            ...playlist,
            songs,
        };

        return playlistSongsResult;
    };

    async deletePlaylistSongsId ( playlistId, songId ) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId]
        };

        const result = await this._pool.query(query);
        
        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus dari playlist')
        };

        return result.rows[0].id;
    };
};

module.exports = PlaylistSongsService;