# Project management TypeScript app

## Prerequisites
- Node.js

## Requirements

To do like modular drag and drop typescript application without any dependencies or frameworks. 
The app splited to the components inherited from the base Component class.
Reactive UI. Components communicate via the state shared, listeners call handlers on state changed.
Projects can be managed by drag and drop between projects list.

## Features, patterns and concepts used

- Typescript
  - Generics
  - Namespaces
- OOP
- Decorators
- State
- Drag and drop

## Run the app locally

To run the app locally with the lite-server just clone the repo and run the commands from the root folder:

```sh
npm install
npm run build
npm run start
```

### Utils included

Browsersync started with the lite-server, after you run `npm run start` visit the `http://localhost:3001/` to check this out.

[More info](http://localhost:3001/help)