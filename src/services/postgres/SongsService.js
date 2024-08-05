const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapDBSongsToModel } = require("../../utils");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
    constructor () {
        
        this._pool = new Pool();   
    };
  
    async addSong ({ title, year, genre, performer, duration, albumId }) {
        
        const id = `Song-${nanoid(16)}`;
        const query = {
        text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        values: [id, title, year, genre, performer, duration, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError ('Lagu gagal ditambahkan');
        };

        return result.rows[0].id;
    };
  
    async getSongs ({ title, performer, albumId}) {

        const titleQuery = title ? `%${title}%`: null;
        const performerQuery = performer ? `%${performer}%`: null;
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE ($1::VARCHAR(50) is null or title ILIKE $1::VARCHAR(50)) and ($2::VARCHAR(50) is null or performer ILIKE $2::VARCHAR(50)) and ($3::VARCHAR(50) is null or album_id = $3::VARCHAR(50))',
            values: [titleQuery, performerQuery, albumId],
        };

        const result = await this._pool.query(query);

        return result.rows.map(mapDBSongsToModel)
    };
      
    async getSongById (id) {

        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query)
        
        if (!result.rows.length) {
            throw new NotFoundError ('Lagu tidak ditemukan')
        };

        return mapDBSongsToModel(result.rows[0]);
    };
  
    async editSongById (id, { title, year, genre, performer, duration, albumId }) {

        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError ('Lagu gagal diperbarui. Id tidak ditemukan')
        };
    };
  
    async deleteSongById (id) {

        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError ('Lagu gagal dihapus. Id tidak ditemukan')
        };
    };
};

module.exports = SongsService;