import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANQSkCgKoYnyNNoyrvnAbaxx5iflfV5pE",
  authDomain: "connections-6ef2a.firebaseapp.com",
  projectId: "connections-6ef2a",
  storageBucket: "connections-6ef2a.appspot.com",
  messagingSenderId: "967863821211",
  appId: "1:967863821211:web:c10d6632a25a5430a8773e",
  measurementId: "G-5C6F6T8QYV"
};

export const app = initializeApp(firebaseConfig);


const db = getFirestore(app);

let userArray = null;

async function getUsers(db) {

    if (userArray !== null) {
        return userArray;
    }
    const docRef = collection(db, "users");
    const querySnapshot = await getDocs(docRef);

    const array = [];
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        array.push([doc.id, doc.data()])
      });

    userArray = array;

    return array;
}

// return the connection graph
// returns {"nodes": [{id: <id>, "name": <name>, "interests": <interest>}], "links": [{"source": <id1>, "target": <id2>}]}
export async function convertToGraph(user) {
  
  const outOb = {nodes: [], links: []};

  // Add the found user to nodes
  outOb.nodes.push({
      id: user.email,
      name: user.name,
      interests: user.interests,
      object: user
  });

  // Iterate through the friends list if it exists
  for (const friendDoc of user.friends) {
      const friend = await convertToFriendObject(friendDoc);

    // If the friend was found, add to nodes and create a link
      outOb.nodes.push({
          id: friend.email,
          name: friend.name,
          interests: friend.interests,
          object: friend
      });

      outOb.links.push({
          source: user.email,
          target: friend.email
      });
  }


  return outOb;
}

// counts shared interests between two users
function count(user1, user2) {
  let count = 0;

  for (const interest1 of user1.interests) {
    for (const interest2 of user2.interests) {
      if (interest1 == interest2) {
        count++;
      }
    }
  }
  return count;
}

export async function convertToFriendObject(friend) {
  return (await getDoc(friend)).data()
}

// recommendation system
// return top 5 candidates with interests similar to user
// such that degree = 2
// returns [[end_id, mid_id], [[]]]...] ordered from most to least compatible
export async function recommendation(user) {
    let candidatesMap = new Map();
    const friends = await Promise.all(user.friends.map(async friendDoc => 
        await convertToFriendObject(friendDoc)));

    for (const friend of friends) {
      const friend2Docs = friend.friends;

      const friends2 = await Promise.all(friend2Docs
        .map(async friend => (await convertToFriendObject(friend))));

      for (const friend of friends2) {
        if (friend.email == user.email) {
          continue;
        }
        if (friends.find(elem => elem.email == friend.email)) {
          continue;
        }
        candidatesMap.set(friend.email, friend);
      }
    }
    const candidates = [...candidatesMap.values()];
    const sorted = candidates.sort((a,b) => 
      count(user, b) - count(user, a) 
    );

    return sorted
  }


  async function retrieveQuery(q) {
    const arr = [];
    const snapshot = await getDocs(q);
    snapshot.forEach((item) => {
      arr.push(item.data());
    })
    return arr;
  }

  // return user based on user email
  // user can be undefined if email is not found
 export async function returnUser(emailTarget) {
    const docsRef = collection(db, "users");
    const q = query(docsRef, where("email", "==", emailTarget));
    const [user, ..._rest] = await retrieveQuery(q);
    return user;
  }

// // Return profile info in format [picture, name, note, [interests]]
export async function returnProfile(email) {
  const user = await returnUser(email);
  const outAr = [];
  outAr.push(user.picture)
  outAr.push(user.name)
  outAr.push(user.note)
  outAr.push(user.interests)

  return outAr;
}

export async function login() {
    const x = await getUsers(db);
    console.log(await getUsers(db));

    console.log(await recommendation("amelia.johnson@gmail.com"))
}