import path from "path";
import fs from "fs";

const resolve = require("resolve").sync;
import getYArgs from "../core/yargs";
import helpers from "../helpers";

const args = getYArgs().argv;

function format(i) {
  return parseInt(i, 10) < 10 ? "0" + i : i;
}

function getCurrentYYYYMMDDHHmms() {
  const date = new Date();
  return [
    date.getUTCFullYear(),
    format(date.getUTCMonth() + 1),
    format(date.getUTCDate()),
    format(date.getUTCHours()),
    format(date.getUTCMinutes()),
    format(date.getUTCSeconds()),
    format(date.getUTCMilliseconds())
  ].join("");
}

function getCurrentMtomTime() {
  const date = new Date();
  return [
    date.getUTCFullYear(),
    format(date.getUTCMonth() + 1),
    format(date.getUTCDate()),
    format(date.getUTCHours()),
    format(date.getUTCMinutes()),
    format(date.getUTCSeconds() + 20)
  ].join("");
}

module.exports = {
  getPath(type) {
    type = type + "s";

    let result = args[type + "Path"] || path.resolve(process.cwd(), type);

    if (path.normalize(result) !== path.resolve(result)) {
      // the path is relative
      result = path.resolve(process.cwd(), result);
    }

    return result;
  },

  getFileName(type, name, options) {
    return this.addFileExtension(
      [getCurrentYYYYMMDDHHmms(), name ? name : "unnamed-" + type].join("-"),
      options
    );
  },

  getMtomMigrationFile(type, name, options) {
    return this.addFileExtension(
      [getCurrentMtomTime(), name ? name : "unnamed-" + type].join("-"),
      options
    );
  },

  getFileExtension() {
    return "js";
  },

  addFileExtension(basename, options) {
    return [basename, this.getFileExtension(options)].join(".");
  },

  getMigrationPath(migrationName) {
    return path.resolve(
      this.getPath("migration"),
      this.getFileName("migration", migrationName)
    );
  },

  getControllerPath(modelName) {
    return path.resolve(
      this.getPath("controller"),
      this.addFileExtension(modelName + "Controller")
    );
  },

  getRoutesPath(modelName) {
    return path.resolve(
      this.getPath("route"),
      this.addFileExtension(
        helpers.migration.getTableName(modelName).toLowerCase()
      )
    );
  },

  getRoutesIndexPath(modelName) {
    return path.resolve(
      this.getPath("route"),
      this.addFileExtension(modelName.toLowerCase())
    );
  },

  getMtomMigrationPath(migrationName) {
    return path.resolve(
      this.getPath("migration"),
      this.getMtomMigrationFile("migration", migrationName)
    );
  },

  getSeederPath(seederName) {
    return path.resolve(
      this.getPath("seeder"),
      this.getFileName("seeder", seederName)
    );
  },

  getModelsPath() {
    return args.modelsPath || path.resolve(process.cwd(), "models");
  },

  getModelIndex() {
    return path.resolve(this.getModelsPath(), this.addFileExtension("index"));
  },

  getModelPath(modelName) {
    return path.resolve(
      this.getModelsPath(),
      this.addFileExtension(modelName.toLowerCase())
    );
  },

  resolve(packageName) {
    let result;

    try {
      result = resolve(packageName, { basedir: process.cwd() });
      result = require(result);
    } catch (e) {
      try {
        result = require(packageName);
      } catch (err) {}
    }

    return result;
  },

  existsSync(pathToCheck) {
    if (fs.accessSync) {
      try {
        fs.accessSync(pathToCheck, fs.R_OK);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return fs.existsSync(pathToCheck);
    }
  }
};
