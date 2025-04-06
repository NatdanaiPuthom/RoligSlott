import hologyBuild from '@hology/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import arcweave from '@hology/arcweave/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  worker: {
    format: 'es'
  },
  esbuild: {
    target: "es2020",
  },
  plugins: [
    /*

      To use the API connection, use the following import in the dialogue-service.ts instead of importing the .json file. 
      import arcweaveProject from 'virtual:arcweave'

    */
    /*arcweave({
      apiKey: 'ADD_YOUR_API_TOKEN_HERE', 
      projectHash: 'YOUR_PROJECT_HASH'
    }),*/
    hologyBuild(),
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { version: "2023-11" }],
          ["module:@preact/signals-react-transform"],
        ],
      },
    }),
  ],
})