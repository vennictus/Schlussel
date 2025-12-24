# Schlussel

[![Version](https://img.shields.io/badge/version-v1.0.0-blue)]()
[![Platform](https://img.shields.io/badge/platform-Node.js-green)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)]()

A minimal object storage server built with Node.js and TypeScript.

Schlussel provides a simple HTTP API to store, retrieve, list, and delete binary objects using filesystem-backed persistence. Keys are path-like strings, allowing arbitrary nesting.

---

## Tech Stack

* **Node.js**
* **TypeScript**
* **Express**
* **Local Filesystem**

---

## Features

* Upload objects by key
* Download objects by key
* List objects by prefix (recursive)
* Delete objects by key
* Binary-safe storage
* Filesystem-backed persistence
* Path traversal protection
* Supports arbitrarily nested keys

---

## API Overview

### Upload Object

```
PUT /objects/<key>
```

Stores raw bytes at the given key.

```bash
curl -X PUT \
  --data-binary @package.json \
  http://localhost:4000/objects/example/path/package.json
```

---

### Get Object

```
GET /objects/<key>
```

Fetches the object stored at the key.

```bash
curl http://localhost:4000/objects/example/path/package.json
```

---

### List Objects by Prefix

```
GET /objects?prefix=<prefix>
```

Returns all object keys under the given prefix.

```bash
curl "http://localhost:4000/objects?prefix=example/path/"
```

Response:

```json
{
  "keys": [
    "example/path/package.json",
    "example/path/config/tsconfig.json"
  ]
}
```

---

### Delete Object

```
DELETE /objects/<key>
```

Deletes the object stored at the given key.

```bash
curl -X DELETE \
  http://localhost:4000/objects/example/path/package.json
```

Note: empty directories may remain on disk and are ignored by listings.

---

## Data Layout

All objects are stored under the `data/` directory. Keys map directly to filesystem paths.

```
data/
  example/
    path/
      file.txt
```

---

## Running Locally

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npx ts-node src/server.ts
```

Server runs on:

```
http://localhost:4000
```

---

## Usage

Schlussel is intended to be used as an internal object storage service for local systems and learning projects. It is currently used as the storage layer for **Rohr**, a static site deployment pipeline.

---

## License

MIT CREATIVE LICENSE
