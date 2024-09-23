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
  { name: "Oliver Twist", email: "oliver.twist@example.com", imagePath: "/assets/profiles/Person3.jpeg", password: "password123", friends: [], interests: ["reading", "adventure", "history", "gardening"] },
  { name: "Emma Woodhouse", email: "emma.woodhouse@example.com", imagePath: "/assets/profiles/Person1.jpeg", password: "happyface!", friends: [], interests: ["fashion", "matchmaking", "gardening", "reading"] },
  { name: "Liam Neeson", email: "liam.neeson@example.com", imagePath: "/assets/profiles/Person4.jpeg", password: "taken123", friends: [], interests: ["acting", "martial arts", "travel", "adventure"] },
  { name: "Sophia Loren", email: "sophia.loren@example.com", imagePath: "/assets/profiles/Person2.jpeg", password: "starpower!", friends: [], interests: ["cinema", "fashion", "photography", "travel"] },
  { name: "Noah Centineo", email: "noah.centineo@example.com", imagePath: "/assets/profiles/Person8.jpeg", password: "lovestory", friends: [], interests: ["romance", "social media", "fitness", "acting"] },
  { name: "Ava Gardner", email: "ava.gardner@example.com", imagePath: "/assets/profiles/Person5.jpeg", password: "classicmovie!", friends: [], interests: ["cinema", "photography", "fashion", "fitness"] },
  { name: "Milo Thatch", email: "milo.thatch@example.com", imagePath: "/assets/profiles/Person11.jpeg", password: "adventure!", friends: [], interests: ["history", "adventure", "travel", "photography"] },
  { name: "Isabella Swan", email: "isabella.swan@example.com", imagePath: "/assets/profiles/Person6.jpeg", password: "vampirelove", friends: [], interests: ["romance", "reading", "adventure", "gardening"] },
  { name: "Ethan Hunt", email: "ethan.hunt@example.com", imagePath: "/assets/profiles/Person12.jpeg", password: "missionimpossible!", friends: [], interests: ["martial arts", "travel", "adventure", "acting"] },
  { name: "Zoe Saldana", email: "zoe.saldana@example.com", imagePath: "/assets/profiles/Person10.jpeg", password: "grootfan!", friends: [], interests: ["acting", "fitness", "social media", "martial arts"] },
  { name: "Susan Mall", email: "admin@example.com", imagePath: "/assets/profiles/Person14.jpeg", password: "admin", friends: [], interests: ["gardening", "history", "reading", "social media"] }
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