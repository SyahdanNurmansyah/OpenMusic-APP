const { Pool } = require("pg");

class PlaylistSongsActivitiesService {
    constructor () {

        this._pool = new Pool();
    }

    async getPlaylistSongActivities (id) {

        const query = {
            text: `SELECT users.username, songs.title, action, time FROM playlist_activities            
            LEFT JOIN users ON users.id = playlist_activities.user_id
            LEFT JOIN songs ON songs.id = playlist_activities.song_id
            WHERE playlist_id = $1`,
            values: [id]
        };

        const result = await this._pool.query(query);
        return result.rows;;
    }
};

module.exports = PlaylistSongsActivitiesService;