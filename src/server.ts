import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.raw({ type: "*/*", limit: "500mb" }));

const DATA_ROOT = path.join(process.cwd(), "data");

const resolveSafePath = (key: string) => {
  const resolvedPath = path.resolve(DATA_ROOT, key);

  if (!resolvedPath.startsWith(DATA_ROOT)) {
    throw new Error("Invalid object key (path traversal detected)");
  }

  return resolvedPath;
};


//    Utility: recursively list all files under a directory

const listFilesRecursive = async (
  dir: string,
  base: string,
  result: string[]
) => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await listFilesRecursive(fullPath, base, result);
    } else {
      // return path relative to DATA_ROOT
      result.push(path.relative(base, fullPath).replace(/\\/g, "/"));
    }
  }
};
const pruneEmptyDirs = async (dir: string) => {
  if (dir === DATA_ROOT) return;

  const files = await fs.promises.readdir(dir);
  if (files.length === 0) {
    await fs.promises.rmdir(dir);
    await pruneEmptyDirs(path.dirname(dir));
  }
};


//    PUT object
//    PUT /objects/<key>

app.put(/^\/objects\/(.+)/, async (req, res) => {
  try {
    const key = req.params[0];
    const filePath = resolveSafePath(key);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(400);
  }
});



//    GET object
//    GET /objects/<key>

app.get(/^\/objects\/(.+)/, async (req, res) => {
  try {
    const key = req.params[0];
    const filePath = resolveSafePath(key);

    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }

    res.sendFile(filePath);
  } catch {
    res.sendStatus(400);
  }
});



//    LIST objects by prefix
//    GET /objects?prefix=<prefix>

app.get("/objects", async (req, res) => {
  try {
    const prefix = req.query.prefix as string;
    if (!prefix) return res.status(400).json({ error: "prefix required" });

    const targetDir = resolveSafePath(prefix);

    if (!fs.existsSync(targetDir)) {
      return res.json({ keys: [] });
    }

    const keys: string[] = [];
    await listFilesRecursive(targetDir, DATA_ROOT, keys);
    res.json({ keys });
  } catch {
    res.status(400).json({ error: "invalid prefix" });
  }
});


//    DELETE object
//    DELETE /objects/<key>

app.delete(/^\/objects\/(.+)/, async (req, res) => {
  try {
    const key = req.params[0];
    const filePath = resolveSafePath(key);

    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }

    await fs.promises.unlink(filePath);
    await pruneEmptyDirs(path.dirname(filePath));
    res.sendStatus(204);
  } catch {
    res.sendStatus(400);
  }
});




app.listen(4000, () => {
  console.log("Schlüssel object storage running on :4000");
});
