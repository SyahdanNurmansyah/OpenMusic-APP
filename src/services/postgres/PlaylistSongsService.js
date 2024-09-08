const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

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
        }

        return result.rows[0].id;
    }
}

module.exports = PlaylistSongsService;