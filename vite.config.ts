import { defineConfig } from "vite";
const path = require("path");
import react from "@vitejs/plugin-react";
import babel from "vite-babel-plugin";

const { data } = require("./package.json");
const publicPathName = "custom";
const widgetPathName = data.widgetName;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/App.tsx"),
      name: "terminal3d",
      fileName: `t3d`,
      formats: "esm",
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["react"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: "React",
        },
      },
    },
  },
  plugins: [
    react(),
    babel({
      babelConfig: {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
        ],
      },
    }),
  ],
});
