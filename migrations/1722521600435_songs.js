/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
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
            notNull: false,
            references: '"albums"',
            onDelete: 'SET NULL',
        }
    });

    pgm.createIndex('songs', 'album_id')
    };

/**
* @param pgm {import('node-pg-migrate').MigrationBuilder}
* @param run {() => void | undefined}
* @returns {Promise<void> | void}
*/
exports.down = (pgm) => {
    pgm.dropTable('songs');
};