const mapDBAlbumsToModel = ({
    id,
    name,
    year,
}) => ({
    id,
    name,
    year,
});

const mapDBSongsToModel = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
}) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
});

module.exports = {
    mapDBAlbumsToModel,
    mapDBSongsToModel,
}