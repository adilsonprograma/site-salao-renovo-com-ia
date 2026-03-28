const fs = require("node:fs");
const path = require("node:path");
const { sendText } = require("./http");

const rootDirectory = process.cwd();

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp"
};

function resolveStaticPath(pathname) {
    const normalizedPath = pathname === "/" ? "/index.html" : pathname;
    const decodedPath = decodeURIComponent(normalizedPath);
    const filePath = path.normalize(path.join(rootDirectory, decodedPath));

    if (!filePath.startsWith(rootDirectory)) {
        return "";
    }

    return filePath;
}

function serveStaticFile(filePath, request, response) {
    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            sendText(response, 404, "Arquivo nao encontrado.");
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType = contentTypes[extension] || "application/octet-stream";

        response.writeHead(200, {
            "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600",
            "Content-Type": contentType
        });

        if (request.method === "HEAD") {
            response.end();
            return;
        }

        fs.createReadStream(filePath).pipe(response);
    });
}

module.exports = {
    resolveStaticPath,
    serveStaticFile
};
