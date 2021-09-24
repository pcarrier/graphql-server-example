import { ApolloServer, gql } from 'apollo-server';

const typeDefs = gql`
    type Query {
        artist(id: ID!): Artist
        album(id: ID!): Album
        findAlbums(name: String!): [Album!]!
        find(searchString: String!): [SearchResult!]!
    }

    interface SearchResult {
      iconURL: String!
    }
    
    type Artist implements SearchResult {
        name: String!
        albums: [Album!]!
        iconURL: String!
    }
    
    type Album implements SearchResult{
        id: ID!
        """
        Year of release
        """
        year: Int!
        name: String!
        coverArt: String!
        iconURL: String!
    }`;

const artists = [
    { id: '4Z8W4fKeB5YxbusRsdQVPb', name: 'Radiohead' },
]
const albums = [
    { artistId: artists[0].id, name: 'In rainbows', id: 'a', year: 2007, coverArt: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Radiohead_-_In_Rainbows.png/220px-Radiohead_-_In_Rainbows.png' },
]
  
const resolvers = {
    Artist: {
        albums: (artist) => albums.filter(album => album.artistId === artist.id),
    },
    Query: {
      artist: (_, args) => artists.find(artist => artist.id === args.id),
    },
  };

const server = new ApolloServer({ typeDefs, resolvers });

const queries = [
    gql`
    query AlbumsFromArtist($artistID: ID!) {
        artist(id: $artistID) {
          albums {
            id
            year
            name
            coverArt
          }
        }
    }`,
    gql`
    fragment AlbumView on Album {
      id year name coverArt
    }
    fragment ArtistView on Artist {
        name
    }
    query Album($artistID: ID!) {
        album(id: $artistID) {
            ...AlbumView
        }
    }`,
    gql`
    query FindFromString($str: String!) {
        find(searchString: $name) {
            iconURL
            ...AlbumView
            ...ArtistView
        }
    }`,
]

queries.forEach(query => {
    server.executeOperation({query, variables: {artistID: artists[0].id}})
        .then((res) => {console.log(JSON.stringify(res))})
        .catch((error) => console.error(error));
});
