exports.up = (pgm) => {
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },

        title: {
            type: 'VARCHAR(50)',
            notNull: true,
        },

        year: {
            type: 'INT',
            notNull: true,
        },

        genre: {
            type: 'VARCHAR(20)',
            notNull: true,
        },

        performer: {
            type: 'VARCHAR(50)',
            notNull: true,
        },

        duration: {
            type: 'INT',
            notNull: false,
        },

        album_id: {
            type: 'VARCHAR(50)',
            },
        });

        pgm.addConstraint(
            'songs',
            'fk_songs.album_id_albums.id',
            'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE'
        )
    };

exports.down = (pgm) => {
    pgm.dropTable('songs');
};