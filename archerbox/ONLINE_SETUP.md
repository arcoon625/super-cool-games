# Turn on Rumble Rivals online friend battles

The game code is ready. These one-time Firebase steps connect it to the internet for free.

## 1. Make a Web App

1. Open [Firebase Console](https://console.firebase.google.com/) and choose the **archerbox** project.
2. Click the **gear** next to Project Overview, then **Project settings**.
3. Scroll to **Your apps** and click the **web** button (`</>`).
4. Name it `Rumble Rivals Web`, then click **Register app**.
5. Firebase will show a `firebaseConfig` object. Copy the whole object.
6. Open `archerbox/firebase-config.js`, replace `null` with that object, and save it.

It should look like this (your values will be different):

```js
window.RUMBLE_RIVALS_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "archerbox-1d42a",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

This configuration is safe to put in the game. Do **not** add passwords, service-account files, private keys, or Admin SDK keys.

## 2. Turn on the two free Firebase features

1. In Firebase, click **Authentication**, click **Get started**, then open **Sign-in method**.
2. Click **Anonymous**, turn it on, and save.
3. Click **Realtime Database**, click **Create Database**, choose a nearby location, then choose **Locked mode**.
4. Open the **Rules** tab in Realtime Database.
5. Copy everything from `archerbox/firebase-rules.json` into the Firebase Rules editor and click **Publish**.

## 3. Put it online

Commit and push `firebase-config.js` and the online game files. GitHub Pages will publish them at `https://super-cool-games.com/archerbox/`.

## 4. Test with a friend

1. Both friends open the latest Rumble Rivals page.
2. One friend presses **Find a Friend**, chooses a nickname, and makes a room code.
3. That friend shares the six-character code and chooses the arena/fighter.
4. The other friend presses **Enter Code**, types the code and their nickname, then chooses Player 2.
5. The host starts the battle automatically. Both players use Arrow Keys plus A, S, Q, W, and E on their own device.

If the game says the online setup is not ready, recheck that the configuration object was pasted into `firebase-config.js` and that Anonymous Authentication and Realtime Database are both enabled.
