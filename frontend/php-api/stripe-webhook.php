<?php
declare(strict_types=1);

require_once "Mail.php";
require_once "Mail/mime.php";

// 1. LOAD CONFIG
require $_SERVER["DOCUMENT_ROOT"] . "/config/config.php";

// 2. CONFIGURATION
$smtp_password = $mail_password ?? "";
$webhook_secret = $stripe_secret ?? "";
$mailDomain = "icaf.org";
$username = "no-reply@" . $mailDomain;
$from = "ICAF <no-reply@" . $mailDomain . ">";

// Service Links & IDs
$portal_link = "https://billing.stripe.com/p/login/4gM6oJffa1Rvfgia62abK00";
$magazine_access_link = "https://icaf.org/access";
$magazine_payment_link_id = "plink_1Sde45PpM1RM3Nq1RZVUt2sx"; 

// 3. SECURITY CHECKS
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit;
}

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

function verifyStripeSignature(string $payload, string $sig_header, string $secret): bool {
    if (empty($sig_header) || empty($payload)) return false;
    
    $signed_payload = [];
    $items = explode(',', $sig_header);
    foreach ($items as $item) {
        [$key, $value] = explode('=', $item, 2);
        $signed_payload[trim($key)] = trim($value);
    }
    
    if (!isset($signed_payload['t']) || !isset($signed_payload['v1'])) return false;
    if (time() - (int)$signed_payload['t'] > 300) return false; 
    
    $signed_string = $signed_payload['t'] . '.' . $payload;
    $expected_sig = hash_hmac('sha256', $signed_string, $secret);
    
    return hash_equals($expected_sig, $signed_payload['v1']);
}

if (!verifyStripeSignature($payload, $sig_header, $webhook_secret)) {
    http_response_code(400); 
    exit();
}

// 4. PROCESS EVENT
$event = json_decode($payload, true);

if (($event['type'] ?? '') === 'checkout.session.completed') {
    
    // Filter: Ensure this payment came from the Magazine Payment Link
    $incoming_link_id = $event['data']['object']['payment_link'] ?? '';
    
    if ($incoming_link_id !== $magazine_payment_link_id) {
        // Ignore events from other payment links
        http_response_code(200);
        exit;
    }

    $customer_email = $event['data']['object']['customer_details']['email'] 
                   ?? $event['data']['object']['email'] 
                   ?? null;

    if ($customer_email) {
        $mailSubject = "Welcome! Your Magazine Subscription is Active";
        
        $textBody = "Thank you for subscribing!\n\n"
                  . "We are so grateful for your support.\n"
                  . "You can access the full magazine archive here:\n"
                  . "$magazine_access_link \n\n"
                  . "Please bookmark this link!\n\n"
                  . "To manage your subscription, visit our Customer Portal: $portal_link";

        $htmlBody = "<html><body>"
                  . "<h2>Thank you for subscribing!</h2>"
                  . "<p>We are so grateful for your support.</p>"
                  . "<p>You can access the full magazine archive at the link below:</p>"
                  . "<p><a href='$magazine_access_link' style='background:#134380;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>View Magazines</a></p>"
                  . "<p><strong>Please bookmark this link!</strong></p>"
                  . "<hr>"
                  . "<p><small>To manage your subscription, please visit the <a href='$portal_link'>Stripe Portal</a>.</small></p>"
                  . "</body></html>";

        $mime = new Mail_mime(["eol" => "\r\n"]);
        $mime->setTXTBody($textBody);
        $mime->setHTMLBody($htmlBody);

        $body = $mime->get([
            "text_charset" => "UTF-8",
            "html_charset" => "UTF-8",
            "head_charset" => "UTF-8",
        ]);

        $headers = $mime->headers([
            "From"         => $from,
            "To"           => $customer_email,
            "Subject"      => $mailSubject,
            "MIME-Version" => "1.0",
        ]);

        $smtp = Mail::factory("smtp", [
            "host"     => "ssl://smtp.ionos.com",
            "port"     => 465,
            "auth"     => true,
            "username" => $username,
            "password" => $smtp_password,
            "timeout"  => 10,
            "persist"  => false,
        ]);

        $smtp->send($customer_email, $headers, $body);
    }
}

// 5. RESPOND TO STRIPE
http_response_code(200);
?>