import admin from 'firebase-admin';
import { DocumentReference, getFirestore  } from "firebase-admin/firestore";
import { v5 as uuidv5 } from 'uuid';

import serviceAccount from "./secrets/connections-6ef2a-firebase-adminsdk-tu2v7-538bc83069.json"

const SEED = 'e8a8b275-1e95-42be-b210-1dfae124f388';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as object)
});
const db = getFirestore(app);

function genUUID(name: string) {
    return uuidv5(name, SEED);
}

// Sample data to populate Firestore
const users = [
  { name: "Oliver Twist", email: "oliver.twist@example.com", password: "password123", friends: [] },
  { name: "Emma Woodhouse", email: "emma.woodhouse@example.com", password: "happyface!", friends: [] },
  { name: "Liam Neeson", email: "liam.neeson@example.com", password: "taken123", friends: [] },
  { name: "Sophia Loren", email: "sophia.loren@example.com", password: "starpower!", friends: [] },
  { name: "Noah Centineo", email: "noah.centineo@example.com", password: "lovestory", friends: [] },
  { name: "Ava Gardner", email: "ava.gardner@example.com", password: "classicmovie!", friends: [] },
  { name: "Milo Thatch", email: "milo.thatch@example.com", password: "adventure!", friends: [] },
  { name: "Isabella Swan", email: "isabella.swan@example.com", password: "vampirelove", friends: [] },
  { name: "Ethan Hunt", email: "ethan.hunt@example.com", password: "missionimpossible!", friends: [] },
  { name: "Zoe Saldana", email: "zoe.saldana@example.com", password: "grootfan!", friends: [] },
  {name: "Susan Mall", email: "admin@example.com", password: "admin", friends: []}
];

const userFriends = [
  { email: "admin@example.com", friends: ['zoe.saldana@example.com', 'oliver.twist@example.com', 'emma.woodhouse@example.com', 'liam.neeson@example.com', 'noah.centineo@example.com'] },
  { email: "oliver.twist@example.com", friends: ['emma.woodhouse@example.com', 'noah.centineo@example.com', 'sophia.loren@example.com'] },
  { email: "emma.woodhouse@example.com", friends: ['liam.neeson@example.com', 'sophia.loren@example.com', 'ava.gardner@example.com'] },
  { email: "liam.neeson@example.com", friends: ['ava.gardner@example.com', 'milo.thatch@example.com', 'isabella.swan@example.com', 'ethan.hunt@example.com'] },
  { email: "sophia.loren@example.com", friends: ['isabella.swan@example.com', 'ethan.hunt@example.com'] },
  { email: "noah.centineo@example.com", friends: ['liam.neeson@example.com', 'zoe.saldana@example.com'] },
  { email: "ava.gardner@example.com", friends: ['milo.thatch@example.com', 'zoe.saldana@example.com'] },
  { email: "milo.thatch@example.com", friends: ['noah.centineo@example.com', 'sophia.loren@example.com', 'admin@example.com'] },
  { email: "isabella.swan@example.com", friends: ['ethan.hunt@example.com', 'admin@example.com'] },
  { email: "ethan.hunt@example.com", friends: ['admin@example.com', 'liam.neeson@example.com'] },
  { email: "zoe.saldana@example.com", friends: ['admin@example.com', 'milo.thatch@example.com'] }
];

const emailToRefs: Map<string, DocumentReference> = new Map();

for (const user of users) {
  const userRef = db.collection("users")
    .doc(genUUID(user.email));
  
  emailToRefs.set(user.email, userRef);
  await userRef.set(user);
}
console.log("Inserted users.")


// assign friends
for (const {email, friends} of userFriends) {
  const friendsRef = friends.map(email => emailToRefs.get(email));
  await db.collection("users")
    .doc(genUUID(email))
    .update({friends: friendsRef});
}

console.log("Updated friends.")