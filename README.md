This app is hosted at https://friendstomeet-155ac.web.app/
The frontend is in `/schedule-selector` and the backend is in `/firebase/functions`

To clone and run this code, you must have your own firebase account. 
Enter into a directory and run `firebase login` and  `firebase init`, you must also create your own firebase config files using the API keys in your firebase account. 

To run the frontend locally, cd into schedule-selector and run `npm start`
To run the backend locally, cd into firebase/functions and run firebase emulators:start, but be warned that when the emulator is running it only has access to temporary emulated databases that start out empty when the emulator starts. 

