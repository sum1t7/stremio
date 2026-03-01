const http = require("http");
const streamMap = require("./stream.json");

const PORT = process.env.PORT || 7000;

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

function getStreamsById(rawId) {
  if (!rawId) {
    return [];
  }

  const imdbIdMatch = String(rawId).match(/tt\d+/i);
  const imdbId = imdbIdMatch
    ? imdbIdMatch[0].toLowerCase()
    : String(rawId).toLowerCase();
  const streamEntry = streamMap[imdbId];

  if (!streamEntry || !streamEntry.url) {
    return [];
  }

  return [
    {
      title: streamEntry.title || `IMDb ${imdbId}`,
      url: streamEntry.url,
    },
  ];
}

const server = http.createServer((req, res) => {
  const path = (req.url || "/").split("?")[0];

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (path === "/" || path === "") {
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        message: "Stremio addon server is running",
        manifest: "/manifest.json",
      }),
    );
  }

  if (path === "/manifest.json") {
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(manifest));
  }

  const streamMatch = path.match(/^\/stream\/([^/]+)\/([^/]+)\.json$/i);
  if (streamMatch) {
    const [, type, id] = streamMatch;

    if (!manifest.types.includes(type)) {
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ streams: [] }));
    }

    const streams = getStreamsById(decodeURIComponent(id));
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ streams }));
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () => {
  console.log(`Stremio addon listening on http://localhost:${PORT}`);
  console.log(`Manifest: http://localhost:${PORT}/manifest.json`);
});
