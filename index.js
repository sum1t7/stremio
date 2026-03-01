const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const streamMap = require("./stream.json");

const manifest = {
  id: "org.local.autoembed",
  version: "1.0.0",
  name: "AutoEmbed Local",
  description: "Streams from local IMDb mapping",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [],
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async function (args) {
  if (!args?.id) {
    return { streams: [] };
  }

  const imdbIdMatch = String(args.id).match(/tt\d+/i);
  const imdbId = imdbIdMatch
    ? imdbIdMatch[0].toLowerCase()
    : String(args.id).toLowerCase();
  const streamEntry = streamMap[imdbId];

  if (!streamEntry || !streamEntry.url) {
    return { streams: [] };
  }

  return {
    streams: [
      {
        title: streamEntry.title || `IMDb ${imdbId}`,
        url: streamEntry.url,
      },
    ],
  };
});

serveHTTP(builder.getInterface(), { port: 7000 });

 