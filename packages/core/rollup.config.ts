import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import lessModules from "rollup-plugin-less-modules";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EMS_CONFIG = defineConfig({
  input: resolve(__dirname, "./index.ts"),
  output: {
    file: "./dist/es/bundle.js",
    format: "es",
  },
  external: "react",
  plugins: [
    commonjs(),
    nodeResolve({
      extensions: [".ts", ".tsx"],
    }),
    typescript(),
    lessModules({
      output: "./dist/es/style.css",
    }),
    // babel({ babelHelpers: "bundled" }),
  ],
});

export default [EMS_CONFIG];
