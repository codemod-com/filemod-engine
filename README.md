# filemod

The monorepo for the **filemod** project.

**filemod** is a toolkit for executing filemods over directories.

A filemod is like a codemod, but changes the placement of files based on file path patterns.

## Installation

    pnpm install

## Linting and Testing

    pnpm turbo run lint # check linting rules
    pnpm turbo run test # run all the tests

    pnpm run lint:eslint:write
    pnpm run lint:prettier:write

## Usage

Check the README [here](./packages/filemod/README.md)
