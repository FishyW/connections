// Select tab options
const connectionsTab = document.getElementById('connections-tab');
const chatTab = document.getElementById('chat-tab');


// Select views
const connectionsView = document.getElementById('connections-view');
const chatView = document.getElementById('chat-view');

// Function to switch tabs
function switchTab(selectedTab) {
    // Remove 'selected' class from all tabs
    connectionsTab.classList.remove('selected');
    chatTab.classList.remove('selected');
    
    // Hide all views
    connectionsView.classList.remove('active');
    chatView.classList.remove('active');
    
    // Add 'selected' class to the clicked tab and show corresponding view
    if (selectedTab === 'connections') {
        connectionsTab.classList.add('selected');
        connectionsView.classList.add('active');
    } else if (selectedTab === 'chat') {
        chatTab.classList.add('selected');
        chatView.classList.add('active');
    }
}

// Add event listeners to tabs
connectionsTab.addEventListener('click', () => switchTab('connections'));
chatTab.addEventListener('click', () => switchTab('chat'));
