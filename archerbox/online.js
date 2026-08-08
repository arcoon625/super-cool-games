/* global firebase */
(function () {
  const config = window.RUMBLE_RIVALS_FIREBASE_CONFIG;
  const version = window.RUMBLE_RIVALS_GAME_VERSION || "online-1";
  const ROOM_LENGTH = 6;
  const ROOM_TTL_MS = 15 * 60 * 1000;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const listeners = new Set();
  let app = null;
  let database = null;
  let auth = null;
  let user = null;
  let roomCode = null;
  let roomListener = null;
  let roomRef = null;
  let currentRoom = null;

  function configured() {
    return Boolean(config && config.apiKey && config.authDomain && config.databaseURL && config.projectId && config.appId);
  }

  function emit(event) {
    listeners.forEach((listener) => listener(event));
  }

  function cleanNickname(value) {
    const name = String(value || "").trim().replace(/\s+/g, " ").replace(/[^a-zA-Z0-9 _-]/g, "");
    if (name.length < 3 || name.length > 12) throw new Error("Choose a nickname with 3 to 12 letters or numbers.");
    return name;
  }

  function cleanCode(value) {
    const code = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== ROOM_LENGTH) throw new Error("Friend codes have 6 letters or numbers.");
    return code;
  }

  function makeCode() {
    let code = "";
    for (let index = 0; index < ROOM_LENGTH; index += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  async function ready() {
    if (!configured()) throw new Error("Online play needs Archer to finish the free Firebase setup first.");
    if (user) return user;
    if (!app) {
      app = firebase.apps?.length ? firebase.app() : firebase.initializeApp(config);
      database = firebase.database(app);
      auth = firebase.auth(app);
    }
    const signedIn = await auth.signInAnonymously();
    user = signedIn.user;
    return user;
  }

  function isActive(room) {
    return room && room.expiresAt > Date.now() && !["finished", "abandoned"].includes(room.status);
  }

  function listenToRoom(code) {
    if (roomRef && roomListener) roomRef.off("value", roomListener);
    roomCode = code;
    roomRef = database.ref(`rumbleRivalsRooms/${code}`);
    roomListener = roomRef.on("value", (snapshot) => {
      currentRoom = snapshot.val();
      emit({ type: "room", code, room: currentRoom });
    }, () => emit({ type: "error", message: "The online room disconnected. Check your internet and try again." }));
  }

  async function watchDisconnect(role) {
    if (!roomRef || !user) return;
    const playerRef = roomRef.child(`players/${user.uid}`);
    await playerRef.onDisconnect().update({ connected: false });
    if (role === "host") await roomRef.child("status").onDisconnect().set("abandoned");
  }

  // The published Firebase rules approve each protected room field separately.
  // Writing them one at a time also keeps a failed field from hiding the useful
  // Firebase error behind one large rejected update.
  async function writeRoomFields(ref, fields) {
    for (const [path, value] of Object.entries(fields)) await ref.child(path).set(value);
  }

  async function createRoom(nickname) {
    const host = await ready();
    const name = cleanNickname(nickname);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const code = makeCode();
      const ref = database.ref(`rumbleRivalsRooms/${code}`);
      const now = Date.now();
      // Claim only the host slot first. Firebase can safely approve this tiny
      // transaction before the rest of the room is filled in.
      const claim = await ref.child("hostUid").transaction((currentHost) => currentHost ? undefined : host.uid);
      if (claim.committed) {
        await writeRoomFields(ref, {
          hostName: name,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          expiresAt: now + ROOM_TTL_MS,
          [`players/${host.uid}`]: { name, slot: "p1", connected: true },
          status: "waiting"
        });
        listenToRoom(code);
        await watchDisconnect("host");
        return { code, uid: host.uid, role: "host", room: (await ref.once("value")).val() };
      }
    }
    throw new Error("Could not make a fresh room code. Please try again.");
  }

  async function joinRoom(codeInput, nickname) {
    const guest = await ready();
    const code = cleanCode(codeInput);
    const name = cleanNickname(nickname);
    const ref = database.ref(`rumbleRivalsRooms/${code}`);
    const beforeJoining = (await ref.once("value")).val();
    if (!isActive(beforeJoining) || beforeJoining.guestUid || !beforeJoining.hostUid) {
      throw new Error("That room is unavailable, full, or expired.");
    }
    const guestSlot = await ref.child("guestUid").transaction((currentGuest) => currentGuest ? undefined : guest.uid);
    if (!guestSlot.committed || guestSlot.snapshot.val() !== guest.uid) throw new Error("Another friend just joined that room. Ask for a new code.");
    await writeRoomFields(ref, { guestName: name, [`players/${guest.uid}`]: { name, slot: "p2", connected: true } });
    listenToRoom(code);
    await watchDisconnect("guest");
    return { code, uid: guest.uid, role: "guest", room: (await ref.once("value")).val() };
  }

  async function updateRoom(changes) {
    if (!roomRef) throw new Error("No friend room is open.");
    await writeRoomFields(roomRef, changes);
  }

  function slot() {
    if (!user || !currentRoom) return null;
    return currentRoom.hostUid === user.uid ? "p1" : currentRoom.guestUid === user.uid ? "p2" : null;
  }

  async function setHostSetup(setup) {
    if (slot() !== "p1") throw new Error("Only the friend who made the room can choose the arena.");
    await updateRoom({
      stageId: setup.stageId,
      settings: { ...setup.settings, gameVersion: version },
      hostFighter: setup.hostFighter,
      hostWeaponLevel: Number(setup.hostWeaponLevel) || 0,
      status: currentRoom?.guestUid ? "lobby" : "waiting"
    });
  }

  async function setGuestFighter(fighter, weaponLevel = 0) {
    if (slot() !== "p2") throw new Error("Only the joining friend can choose Player 2's fighter.");
    await updateRoom({ guestFighter: fighter, guestWeaponLevel: Number(weaponLevel) || 0 });
  }

  async function startMatch() {
    if (slot() !== "p1" || !currentRoom?.hostFighter || !currentRoom?.guestFighter) return;
    await updateRoom({
      matchId: `${roomCode}-${Date.now().toString(36)}`,
      startedAt: firebase.database.ServerValue.TIMESTAMP,
      state: null,
      result: null,
      status: "playing"
    });
  }

  async function sendInput(input) {
    const playerSlot = slot();
    if (!playerSlot || !roomRef || currentRoom?.status !== "playing") return;
    await roomRef.child(`inputs/${playerSlot}`).set({ ...input, sentAt: firebase.database.ServerValue.TIMESTAMP });
  }

  function onInput(playerSlot, callback) {
    if (!roomRef) return () => {};
    const ref = roomRef.child(`inputs/${playerSlot}`);
    const listener = ref.on("value", (snapshot) => callback(snapshot.val() || {}));
    return () => ref.off("value", listener);
  }

  async function publishState(state) {
    if (slot() !== "p1" || !roomRef || currentRoom?.status !== "playing") return;
    await roomRef.child("state").set(state);
  }

  async function publishResult(result) {
    if (slot() !== "p1" || !roomRef) return;
    await roomRef.child("status").onDisconnect().cancel();
    await updateRoom({ result, status: "finished" });
  }

  async function leave() {
    if (!roomRef || !user) return;
    const playerSlot = slot();
    try {
      await roomRef.child(`players/${user.uid}`).update({ connected: false });
      if (playerSlot === "p1" && currentRoom?.status !== "finished") await roomRef.child("status").set("abandoned");
    } catch { /* Leaving should never stop the rest of the game. */ }
    if (roomListener) roomRef.off("value", roomListener);
    roomCode = null; roomRef = null; roomListener = null; currentRoom = null;
  }

  window.RumbleOnline = {
    configured,
    ready,
    createRoom,
    joinRoom,
    setHostSetup,
    setGuestFighter,
    startMatch,
    sendInput,
    onInput,
    publishState,
    publishResult,
    leave,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getRoom: () => currentRoom,
    getUid: () => user?.uid || null,
    getCode: () => roomCode,
    getSlot: slot,
    version
  };
}());
