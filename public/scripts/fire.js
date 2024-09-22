import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.13/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDc5S2UA-0RaKswKNfKVbWbtHO8RSF5V9A",
  authDomain: "neptune-736f4.firebaseapp.com",
  projectId: "neptune-736f4",
  storageBucket: "neptune-736f4.appspot.com",
  messagingSenderId: "416252320821",
  appId: "1:416252320821:web:8e06dd5fdc6a65ebc5a57c"
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
export async function convertToGraph(userEmail) {
  const userDb = await getUsers(db);
  const outOb = {nodes: [], links: []};
  let foundUser = null;

  // Find user with same userEmail
  for (const user of userDb) {
      if (user[0] === userEmail) {
          foundUser = { id: user[0], data: user[1] };
          break;
      }
  }

  // If user is not found, return an empty graph
  if (!foundUser) {
      return outOb;
  }

  // Add the found user to nodes
  outOb.nodes.push({
      id: foundUser.id,
      name: foundUser.data.name,
      interests: foundUser.data.interests
  });

  // Iterate through the friends list if it exists
  if (Array.isArray(foundUser.data.friends)) {
      for (const friend of foundUser.data.friends) {
          let friendData = null;

          // Find friend in the database
          for (const user of userDb) {
              if (user[0] === friend.email) {
                  friendData = { id: user[0], data: user[1] };
                  break;
              }
          }

          // If the friend was found, add to nodes and create a link
          if (friendData) {
              outOb.nodes.push({
                  id: friendData.id,
                  name: friendData.data.name,
                  interests: friendData.data.interests
              });

              outOb.links.push({
                  source: foundUser.id,
                  target: friendData.id
              });
          }
      }
  }

  return outOb;
}

// counts shared interests between two users
function count(user1, user2) {
  let count = 0;

  for (const interest1 of user1[1].interests) {
    for (const interest2 of user2[1].interests) {
      if (interest1 == interest2) {
        count++;
      }
    }
  }
  return count;
}

// recommendation system
// return top 5 candidates with interests similar to user
// such that degree = 2
// returns [[end_id, mid_id], [[]]]...] ordered from most to least compatible
export async function recommendation(userEmail) {
  const userDb = await getUsers(db);
    const outAr = []
    const foundUser = []

    // Find user with same userEmail
    for (const user of userDb) {
      if (user[0] == userEmail) {
        foundUser.push(user[0])
        foundUser.push(user[1])
        break
      }
    }


    // Iterate through friends of friends to find users with n shared interests
    for (let n = 3; n >= 0; n--) {
      for (const friendOb of foundUser[1].friends) {
        let friend = []

        // Find friend in db
        for (const user of userDb) {
          if (user[0] == friendOb.email) {
            friend.push(user[0])
            friend.push(user[1])
          }
        }

        // Iterate through second gen friends to find common interests
        for (const friend2Ob of friend[1].friends) {
          let friend2 = []

          //find friend2 in db
          for (const user of userDb) {
            if (user[0] == friend2Ob.email) {
              friend2.push(user[0])
              friend2.push(user[1])
            }
          }

          // If shared interest count is n, add to outAr
          if((count(foundUser, friend2) == n) && (foundUser[0] != friend2[0])) {
            
            // Check if friend2 is already in outAr
            let dupeCheck = false
            for (const element of outAr) {
              if (element[0] == friend2[0]) {
                dupeCheck = true
              }
            }

            // Check if friend2 is already a friend of user
            for (const fri of foundUser[1].friends) {
              if (friend2[0] == fri.email) {
                dupeCheck = true
              }
            }

            if (dupeCheck == false) {
              outAr.push([friend2[0], friend[0]])
            }
          }

          // Check and exit if outAr has hit 5 people
          if (outAr.length == 5) {
            return outAr
          }
        }
        
      }
    }
    
    return outAr
  }

  // return user based on user email
 export async function returnUser(email) {
    const userDb = await getUsers(db);

    for (const user of userDb) {
      if (user[0] == email) {
        return user
      }
    }
  }

// Return profile info in format [picture, name, note, [interests]]
export async function returnProfile(email) {
  const user = await returnUser(email);
  const outAr = [];
  outAr.push(user[1].picture)
  outAr.push(user[1].name)
  outAr.push(user[1].note)
  outAr.push(user[1].interests)

  return outAr;
}

export async function login() {
    const x = await getUsers(db);
    console.log(await getUsers(db));

    console.log(await recommendation("amelia.johnson@gmail.com"))
}