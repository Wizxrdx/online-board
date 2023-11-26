let conn = null; // Declare a variable to store the WebSocket connection

function connectWebSocket() {
    // Close existing connection if any
    if (conn !== null) {
        conn.close();
    }

    conn = new WebSocket('ws://'+window.location.host+':8080');

    conn.onopen = function() {
        // console.log('WebSocket connection established');
        toggleInput(true);
    };

    conn.onclose = function(e) {
        // console.log('WebSocket connection disconnected', e.code);
        toggleInput(false);
        // Retry connection after a delay
        setTimeout(connectWebSocket, 2000);
    };

    conn.onmessage = handleIncomingMessage
}

function toggleInput(state = true) {
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
    var filteredMessage = message.replace(/[^a-zA-Z0-9,./?<>!@#$%^&*():";'{}\s]/g, '');

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
    conn.send(message);
    toggleInput(false);
    setTimeout(toggleInput, 5000);
}

function handleIncomingMessage(event) {
    res = JSON.parse(event.data);
    // console.log(res.status);
    switch (res.status) {
        case 'success':
        case 'receive':
            messageElement = createMessageElement(res.message, res.date, res.view);
            insertNewMessageElement(messageElement);
            break;
        case 'timeout':
        case 'blocked':
            break;
        default:
            console.log('Unknown status:' + res.status);
            break;
    }
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
    messagesUl.insertBefore(messageElement, messagesUl.firstChild);
}

connectWebSocket();