# Connections
An application that allows users to view their connectivity graph. This was originally a hackathon project called "Neptune".

## Installation

Install `http-server`

```sh
npm install -g http-server
```

## Running 

Run the app...

```sh
http-server -c-1 src
```

## Population Script
To populate the script, `populate.ts` is used. Bun is used as the runtime engine to run the typescript code.

## Tailwind
This project uses tailwind. If the tailwind configuration is changed, run

```sh
npx tailwindcss -i ./src/styles/tailwind.css -o ./src/styles/output.css 
```