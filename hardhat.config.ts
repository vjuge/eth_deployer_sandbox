import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-preprocessor";
import fs from "fs";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  paths: {
    cache: "./cache_hardhat",
  },
  preprocess: {
    eachLine: (hre) => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          for (const [from, to] of getRemappings()) {
            if (line.includes(from)) {
              line = line.replace(from, to);
              break;
            }
          }
        }
        return line;
      },
    }),
  },
};

export default config;

function getRemappings() {
 return fs
     .readFileSync("remappings.txt", "utf8")
     .split("\n")
     .filter(Boolean)
     .map((line) => line.trim().split("="));
}