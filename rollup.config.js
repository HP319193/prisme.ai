import fs from "fs";
import { exec as syncExec } from "child_process";
import util from "util";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import cjs from "@rollup/plugin-commonjs";
import ts from "rollup-plugin-typescript2";
import images from "@rollup/plugin-image";
import autoprefixer from "autoprefixer";
import postcss from "rollup-plugin-postcss";

const exec = util.promisify(syncExec);

const root = "./packages";
const packages = fs.readdirSync(root);

const build = async () =>
  (
    await Promise.all(
      packages.map(async (name) => {
        const pkg = require(`${root}/${name}/package.json`);
        if (pkg.scripts && pkg.scripts.build) {
          await exec(`cd ${root}/${name} && ${pkg.scripts.build}`);
        }
        try {
          const config = fs.readFileSync(`${root}/${name}/rollup.config.js`);
          return JSON.parse(config);
        } catch (e) {
          const tsconfig = `${root}/${name}/tsconfig.json`;
          if (!fs.existsSync(`${root}/${name}/tsconfig.json`)) return;
          return {
            input: `${root}/${name}/index.ts`,
            output: {
              dir: `${root}/${name}/dist`,
              format: "cjs",
              exports: "named",
              preserveModules: true,
              preserveModulesRoot: root,
            },
            external: [
              ...Object.keys(pkg.dependencies || {}),
              "react-native",
              "react-native-svg",
            ],
            plugins: [
              peerDepsExternal({
                packageJsonPath: `${root}/${name}/package.json`,
              }),
              images(),
              cjs(),
              postcss({
                plugins: [autoprefixer()],
                sourceMap: true,
                minimize: true,
                extract: "styles.css",
              }),
              ts({ tsconfig }),
            ],
          };
        }
      })
    )
  ).filter(Boolean);

export default build;
