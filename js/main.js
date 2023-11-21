let conn = null; // Declare a variable to store the WebSocket connection

function connectWebSocket() {
    // Close existing connection if any
    if (conn !== null) {
        conn.close();
    }

    conn = new WebSocket('ws://'+window.location.host+':8080');

    conn.onopen = function() {
        console.log('WebSocket connection established');
        toggleInput(true);
    };

    conn.onclose = function() {
        console.log('WebSocket connection closed');
        toggleInput(false);
        // Retry connection after a delay
        setTimeout(connectWebSocket, 2000);
    };

    conn.onerror = function() {
        // Retry connection after a delay
        setTimeout(connectWebSocket, 5000);
    };

    conn.onmessage = function(e) {
        console.log('Received message:', event.data);
    };
}

function toggleInput(state) {
    if (state) {
        document.getElementById("input-box").removeAttribute("disabled");
    } else {
        document.getElementById("input-box").setAttribute("disabled", "disabled");
    }
}

function handleKeyDown(event) {
    // You can access the input value using document.querySelector('.content-input').value
    var message = document.querySelector('.content-input').value;
    // Filter non-alphanumeric characters using regular expressions
    var filteredMessage = message.replace(/[^a-zA-Z0-9,./?<>!@#$%^&*():";'{}]/g, '');

    // Trim the filtered message to remove leading and trailing spaces
    filteredMessage = filteredMessage.trim();

    if (event.keyCode === 13 && filteredMessage !== '') {
        // Enter key pressed
        // Call your JavaScript function here
        // For example, you can call a function named "submitMessage"
        submitMessage(filteredMessage);
    }
}

function submitMessage(message) {
    // Your code to submit the message goes here
    // Make a POST request to the API endpoint
    fetch('index.php', {
        method: 'POST',
        body: 'message='+message,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
        .then(response => response.json().then(
            data => {
                // Handle the response from the API if needed
                if (data['status'] == 'success') {
                    li = createMessageElement(data['message'], data['timestamp'], data['views']);
                    insertNewMessageElement(li);
                } else if (data['status'] == 'timeout') {
                    alert('You have sent too many messages in a short period of time. Please try again later.');
                } else {
                    console.log('Error:', data);
                }
            }))
        .catch(error => {
            console.error('Error:', error);
        });
}

function createMessageElement(messageContent, timestamp, views) {
    // template
    // <li>
    // 	<p>test</p>
    // 	<div class="footer-wrapper">
    // 		<p class="left-footer" id="footer">02:48 - October 22, 2022</p>
    // 		<p class="right-footer" id="footer"><i class="material-icons" id="small">visibility</i>396</p>
    // 	</div>
    // </li>

    const formattedDate = new Date(timestamp * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Create the <li> element
    const li = document.createElement('li');

    // Create the <p> element for the message content
    const p = document.createElement('p');
    p.textContent = messageContent;

    // Create the <div> element for the footer wrapper
    const footerWrapper = document.createElement('div');
    footerWrapper.classList.add('footer-wrapper');

    // Create the <p> element for the left footer
    const leftFooter = document.createElement('p');
    leftFooter.classList.add('left-footer');
    leftFooter.setAttribute("id", "footer");
    leftFooter.textContent = formattedDate;

    // Create the <p> element for the right footer
    const rightFooter = document.createElement('p');
    rightFooter.classList.add('right-footer');
    rightFooter.setAttribute("id", "footer");
    rightFooter.innerHTML = `<i class="material-icons" id="small">visibility</i>${views}`;

    // Append the <p> element to the <li> element
    li.appendChild(p);

    // Append the <p> elements to the <div> element
    footerWrapper.appendChild(leftFooter);
    footerWrapper.appendChild(rightFooter);

    // Append the <div> element to the <li> element
    li.appendChild(footerWrapper);

    // Return the <li> element
    return li;
}

function insertNewMessageElement(messageElement) {
    // Append the new <li> element to the <ul> element with class "messages"
    const messagesUl = document.querySelector('.messages');
    messagesUl.appendChild(messageElement);
}


// CRUD operations do not edit
function getMessagesListElement() {
    // Call the API endpoint to get the list of messages
    fetch('/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Add any request payload if required
    })
        .then(response => response.json())
        .then(data => {
            // Process the list of messages
            const messages = data.messages;

            // Create a new <ul> element to hold the messages
            const ul = document.createElement('ul');

            // Iterate over the messages and create <li> elements
            messages.forEach(message => {
                const li = insertNewMessageElement(message);
                ul.appendChild(li);
            });
        });
}

connectWebSocket();