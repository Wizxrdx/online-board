<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle the POST request here
    // Access the submitted data
    $message = urldecode($_POST['message']);
    $res_header = array(
        'status' => 'success',
        'message' => $message,
        'timestamp' => time(),
        'views' => 1
    );

    // Perform any necessary operations with the data
    echo json_encode($res_header);
    exit;
} else {
    readfile('index.html');
}
?>