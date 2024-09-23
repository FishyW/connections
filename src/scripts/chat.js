import { app } from "./fire.js";
import { getDatabase, onValue, ref } from 'https://www.gstatic.com/firebasejs/10.13/firebase-database.js';


const db = getDatabase(app);

export function initChat() {
    // const starCountRef = ref(db);
    // onValue(starCountRef, (snapshot) => {
    // const data = snapshot.val();
    // console.log(data);
    // });
}

initChat();

