const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor (cacheService) {
        
        this._pool = new Pool();
        this._cacheService = cacheService
    };

    async addAlbum ({ name, year }) {
        
        const id = `Album-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError ('Album gagal ditambahkan');
        };

        return result.rows[0].id;
    };

    async getAlbums () {

        const result = await this._pool.query('SELECT * FROM albums');
        return result.rows;
        
    };

    async getAlbumById (id) {

        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan')
        };

        return result.rows[0];
    };

    async editAlbumById (id, { name, year }) {

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album gagal diperbarui. Id tidak ditemukan');
        };
    };

    async deleteAlbumById (id) {

        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError ('Album gagal dihapus. Id tidak ditemukan');
        };
    };

    async updateCoverAlbumById(albumId, coverUrl) {

        const query = {
            text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2',
            values: [coverUrl, albumId]
        }

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Sampul album gagal diunggah. Id tidak ditemukan');
        }
    }

    async addAlbumLikeById (albumId, userId) {

        const isAlbumLikedQuery = {
            text: 'SELECt * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(isAlbumLikedQuery);

        if (result.rowCount) {
            throw new InvariantError ('Album hanya bisa disukai satu kali')
        }

        const id = `FavoriteAlbumId-${nanoid(16)}`;
        
        const addAlbumLikedQuery = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId]
        }

        await this._pool.query(addAlbumLikedQuery);

        await this._cacheService.delete(`user_album_likes:${id}`);
    }

    async getAlbumLikesById (id) {

        try {
            const source = 'cache';
            const likeCounts = await this._cacheService.get(`user_album_likes:${id}`);
            
            return {
                source,
                likeCounts: +likeCounts
            }
        }   catch (error) {
            
            await this.getAlbumById(id);
            
            const source = 'server';
            const query = {
                text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
                values: [id],
            }
    
            const result = await this._pool.query(query);
            const likeCounts = result.rowCount;

            await this._cacheService.set(`user_album_likes:${id}`, likeCounts)
            
            return {
                source,
                likeCounts,
            };
        };
    };

    async deleteLikeonAlbum (id, userId) {

        await this.getAlbumById(id);

        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, id]
        }

        const result = await this._pool.query(query);
        
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus album disukai')
        };

        await this._cacheService.delete(`user_album_likes:${id}`);
    };
};

module.exports = AlbumsService;