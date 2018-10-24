# cli-generator

Generate command line interface projects with unit testing and linting.

[![Build Status](https://travis-ci.org/nandiheath/cli-generator.svg?branch=master)](https://travis-ci.org/nandiheath/cli-generator)
[![Coverage Status](https://coveralls.io/repos/github/nandiheath/cli-generator/badge.svg?branch=master)](https://coveralls.io/github/nandiheath/cli-generator?branch=master)

## Usage

```shell-script
npm install -g cli-generator

cli-gen
```

---

## Configurations

### Project name

the folder that you would like your project store

### Eslint config

bundle with 2 preset:

- default
- airbnb

### Entry Point

The name of the entry point of the project (default cli.js)

---

## To Run

```shell-script
cd [project_name]
npm install
./[entry-point].js
```
