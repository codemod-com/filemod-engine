# filemod-engine

The monorepo for the **filemod-engine** project.

**filemod-engine** is a toolkit for executing filemods over directories.

A filemod is like a codemod, but changes the placement of files based on file path patterns.

## Installation

    pnpm install

## Linting and Testing

    pnpm turbo run lint # check linting rules
    pnpm test # run all the tests

    pnpm run lint:eslint:write
    pnpm run lint:prettier:write

## Usage

    cd ./packages/filemod-engine
    pnpm link --global

    filemod-engine --help

### Usage with a declarative filemod

    filemod-engine transform [*.yml] [rootDirectoryPath]

In order to use a declarative filemod, one needs to be written. Such codemods are written in YAML, like this:

```
version: 1
posix: true
includePattern: '**/pages/**/*.{js,jsx,ts,tsx}'
excludePatterns:
    - '**/node_modules/**'
    - '**/pages/api/**'
deleteRules:
    fileRoot:
        - '_app'
        - '_document'
        - '_error'
replaceRules:
    - replaceDirectoryName:
          - 'pages'
          - 'app'
    - appendDirectoryName:
          - '@fileRoot'
          - fileRootNot: 'index'
    - replaceFileRoot: 'page'
tests:
    - - 'move'
      - '/opt/project/pages/index.tsx'
      - '/opt/project/app/page.tsx'
```

You need to define the following properties:
* `version`: 1
* `posix` (for now we support only POSIX platforms)
* `includePattern` - the glob pattern to run against the root directory path
* `excludePattern` - the glob pattern to run against the root directory path for exclusion of file paths
* `deleteRules` - the union of rules that tell whether to remove the files or not
* `replaceRules` - the ordered list of rules that modify the filePath
* `tests` - the set of tests for patterns

### How to work on paths?

Any path is split into the following elements:
* `pathRoot`
* `directoryNames`
* `fileRoot`
* `fileExtension`

For instance, a path like `opt/project/pages/index.tsx` has the following properties (defined using pseudocode):
* `pathRoot = "/"`
* `directoryNames = ["", "project", "pages"]`
* `fileRoot = "index"`
* `fileExtension = "tsx"`



### Usage with an imperative codemod
