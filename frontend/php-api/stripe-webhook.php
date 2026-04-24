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
        $mailSubject = "Welcome to ICAF! Your Magazine Subscription is Active";
        
        $textBody = "Thank you for subscribing to ChildArt Magazine!\n\n"
                  . "We are so grateful for your support in fostering children's creativity and empathy.\n\n"
                  . "WHAT TO EXPECT\n"
                  . "You will receive a new issue of ChildArt via email every quarter. Keep an eye on your inbox for our upcoming editions.\n\n"
                  . "MANAGE SUBSCRIPTION\n"
                  . "To update your payment method or manage your subscription, visit our Customer Portal:\n"
                  . "$portal_link\n\n"
                  . "Best wishes,\n"
                  . "The ICAF Team";

        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f9; color: #333333;'>
            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                <tr>
                    <td style='padding: 20px 0;'>
                        <table align='center' border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                            <tr>
                                <td align='center' style='padding: 40px 20px; background-color: #134380;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>ICAF</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 40px 30px;'>
                                    <h2 style='color: #134380; margin-top: 0;'>Thank you for subscribing to ChildArt Magazine!</h2>
                                    <p style='font-size: 16px; line-height: 1.6;'>We are so grateful for your support in fostering children's creativity and empathy through the arts.</p>
                                    
                                    <div style='margin: 30px 0; padding: 25px; background-color: #f9f9f9; border-left: 4px solid #134380;'>
                                        <p style='margin-top: 0; font-weight: bold;'>What to Expect</p>
                                        <p style='font-size: 15px; margin-bottom: 0;'>As a subscriber, you will receive a new issue of ChildArt delivered directly to your email inbox every quarter. We look forward to sharing these creative journeys with you!</p>
                                    </div>

                                    <p style='font-size: 14px; color: #666666;'>To manage your billing details or subscription status, please visit our <a href='$portal_link' style='color: #134380; text-decoration: underline;'>Secure Customer Portal</a>.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 20px 30px; background-color: #f4f7f9; text-align: center;'>
                                    <p style='font-size: 12px; color: #999999; margin: 0;'>&copy; " . date("Y") . " International Child Art Foundation.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";

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