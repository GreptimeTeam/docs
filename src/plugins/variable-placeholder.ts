import type {Node} from 'unist'
import {visit} from 'unist-util-visit'
import {VFile} from 'vfile'
import * as fs from 'fs';
import * as path from 'path';

interface Options {
  replacements: Record<string, string>;
}

interface Variables {
  [key: string]: string;
}

interface VariablesMap {
  [docVersion: string]: Variables;
}

function getVariables(path: string, variablesMap: VariablesMap): Variables | undefined {

  // Extract the version from paths like 'version-0.9'
  const versionMatch = path.match(/version-(\d+\.\d+)/);
  if (versionMatch) {
    const docVersion = versionMatch[1];
    return variablesMap[docVersion];
  }

  // If no match, return undefined
  return variablesMap['nightly'];
}

const plugin = (options: Options) => {
  const variablesDirectory = path.resolve(__dirname, '../../variables');
  const variablesMap: VariablesMap = {};

  // Read all files in the variables directory
  fs.readdirSync(variablesDirectory).forEach(file => {
    // Only consider TypeScript files that match the pattern "variables-{doc-version}.ts"
    const match = file.match(/^variables-(.+)\.ts$/);
    if (match) {
      const docVersion = match[1];

      // Dynamically import the variables from the file
      const { variables } = require(path.join(variablesDirectory, file));

      // Add the variables to the variablesMap with the docVersion as the key
      variablesMap[docVersion] = variables;
    }
  });

  const transformer = async (ast: Node, file: VFile) => {
    visit(ast, ['text', 'code', 'link'], (node) => {
      // Replace all occurrences of VAR::varName with the value of varName
      let value: string;
      switch (node.type) {
        case "link":
          value = (node as any).url;
          break;

        case "text":
        case "code":
          value = (node as any).value;
          break;
      }
      
      value = value.replace(/VAR::([A-Z_]+)/ig, (match, varName) => {
        const variables = getVariables(file.path, variablesMap);
        if (variables !== undefined) {
          return variables[varName] || match;
        }
      });

      switch (node.type) {
        case "link":
          (node as any).url = value;
          break;

        case "text":
        case "code":
          (node as any).value = value;
          break;
      }
    });
  };
  return transformer;
};

export default plugin;

