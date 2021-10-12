var [path] = process.argv.slice(2);

const fs = require("fs-extra");

const { resolve } = require("path");
const { readdir } = require("fs-extra").promises;

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

function updateInfoFile(file_location) {
  if (file_location.includes("info.yml")) {
    fs.readFile(file_location, function (err, data) {
      if (err) throw err;
      if (!data.includes("core_version_requirement")) {
        fs.appendFile(
          file_location,
          "\ncore_version_requirement: ^8.8.0 || ^9\n",
          function (err) {
            if (err) throw err;
          }
        );
      }
      if (data.includes("core: 8.x")) {
        const data = fs
          .readFileSync(file_location, "utf-8")
          .replace("core: 8.x", "");
        fs.writeFileSync(file_location, data, "utf-8");
      }
    });
  }
}

(async () => {
  for await (const file_location of getFiles(path)) {
    updateInfoFile(file_location);
  }
})();

// core_version_requirement: ^8.8.0 || ^9
