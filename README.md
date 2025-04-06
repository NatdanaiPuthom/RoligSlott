# hology-arcweave-game-jam
This project is created for use in the Hology + Arcweave game jam. 

### To get started 

1. Install Nodejs version 20 or later  (unless already installed.
2. Download and install Hology Engine
3. Using Git, clone the sample project template (https://github.com/hologyengine/hology-arcweave-game-jam)
4. Install dependencies by running `npm install` in the terminal. 
5. Start Hology and open the cloned project in the Hology launcher.

### Play testing

Start the game using either of the these two methods

* Click the play button in the editor on the top right side of the top bar or by running 
* Run `npm run dev` in the terminal

Open the url [http://localhost:5173/](http://localhost:5173/) 

#### Using your own Arcweave project

The URL will by default show the example project. To use your own project, you need to specify your project's hash in the URL like below. 

[http://localhost:5173/?project=7rEY74j0P3](http://localhost:5173/?project=7rEY74j0P3) 


### Deploying your game

To include your own changes to the project in your submission, you need upload the game to Itch.io in your submission. 

First we need to ensure that your project uses your arcweave project data. There are two ways of doing this.

First, you can change the default project hash specified the file `src/services/dialogue-service.ts` in the variable `defaultProjectHash` to your own. Now when the game starts, it will fetch the data from your project instead without needing to specify a query parameter in the URL. 

Another approach for this involves embedding the arcweave data in your project by  exporting the data as JSON in Arcweave. Replace the contents of the file `src/arcweave.json` in this code base with the exported JSON data. Then change the code in `src/services/dialogue-service.ts` to return the `arcweaveProject` in the function `getProjectData` instead of fetching it via the API.  

Once you have made the coded changes using either approach, follow this guide for how to distribute your game on Itch.io. 
https://docs.hology.app/release/distribution/upload-to-itch.io