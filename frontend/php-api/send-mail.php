<?php
declare(strict_types=1);

require_once "Mail.php";
require_once "Mail/mime.php";

// ---- config ----
// TODO: Finalize addresses
$to = "noah.zaranka@icaf.org";
$mailDomain = "icaf.org";
$username = "no-reply@" . $mailDomain;
$from = "ICAF <no-reply@" . $mailDomain . ">";

header("Referrer-Policy: no-referrer");
header("X-Content-Type-Options: nosniff");

function bail(int $code, string $msg = ""): never {
  http_response_code($code);
  if ($msg !== "") {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["error" => $msg], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  } else {
    header("Content-Length: 0");
  }
  exit;
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  header("Allow: POST");
  bail(405);
}

$ct = (string)($_SERVER["CONTENT_TYPE"] ?? "");
if (stripos($ct, "application/x-www-form-urlencoded") !== 0) {
  bail(415, "unsupported_media_type");
}

if ((int)($_SERVER["CONTENT_LENGTH"] ?? 0) > 64 * 1024) {
  bail(413, "payload_too_large");
}

require $_SERVER["DOCUMENT_ROOT"] . "/config/config.php";
$password = $mail_password ?? "";

if (!empty($_POST["website"] ?? "")) {
  bail(400, "bad_request");
}

// ---- limits & helpers ----
const LIMIT_NAME         = 100;
const LIMIT_EMAIL        = 254;
const LIMIT_SUBJECT      = 200;
const LIMIT_MESSAGE      = 5000;
const LIMIT_ORGANIZATION = 500;

function clamp_utf8(string $s, int $n): string {
  return mb_strlen($s, "UTF-8") > $n ? mb_substr($s, 0, $n, "UTF-8") : $s;
}
function header_safe(string $s): string {
  if (preg_match("/\r|\n/", $s)) bail(422, "invalid_chars");
  return $s;
}
function is_valid_email(string $email): bool {
  return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
function h(string $s): string {
  return htmlspecialchars($s, ENT_QUOTES, "UTF-8");
}

/**
 * Send an email (text + HTML) and return JSON { ok: true } on success.
 */
function send_mail_json(string $replyTo, string $mailSubject, string $textBody, string $htmlBody): void {
  global $to, $from, $username, $password;

  $mime = new Mail_mime(["eol" => "\r\n"]);
  $mime->setTXTBody($textBody);
  $mime->setHTMLBody($htmlBody);

  $body    = $mime->get([
    "text_charset" => "UTF-8",
    "html_charset" => "UTF-8",
    "head_charset" => "UTF-8",
  ]);
  $headers = $mime->headers([
    "From"         => $from,
    "To"           => $to,
    "Reply-To"     => $replyTo,
    "Subject"      => $mailSubject,
    "MIME-Version" => "1.0",
  ]);

  $smtp = Mail::factory("smtp", [
    "host"     => "ssl://smtp.ionos.com",
    "port"     => 465,
    "auth"     => true,
    "username" => $username,
    "password" => $password,
    "timeout"  => 10,
    "persist"  => false,
  ]);

  $result = $smtp->send($to, $headers, $body);

  if (\PEAR::isError($result)) {
    bail(500, "send_failed");
  }

  header("Content-Type: application/json; charset=UTF-8");
  echo json_encode(["ok" => true], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

$type = (string)($_POST["type"] ?? "");

// ---- subscribe ----
if ($type === "subscribe") {
  $email = clamp_utf8(trim((string)($_POST["email"] ?? "")), LIMIT_EMAIL);
  if (!is_valid_email($email)) {
    exit("invalid_request");
  }

  $subject = "{$email} would like to subscribe to the ICAF newsletter";
  $headers = [
    "From"         => $from,
    "To"           => $to,
    "Subject"      => $subject,
    "Content-Type" => "text/html; charset=UTF-8",
  ];
  $smtp = Mail::factory("smtp", [
    "host"     => "ssl://smtp.ionos.com",
    "port"     => 465,
    "auth"     => true,
    "username" => $username,
    "password" => $password,
    "timeout"  => 10,
    "persist"  => false,
  ]);
  $result = $smtp->send($to, $headers, $subject);
  if (\PEAR::isError($result)) {
    echo "<p>An error occurred while sending the email. Please try again later.</p>";
    exit;
  }
  echo "success";
  exit;
}

// shared basic fields for all non-subscribe types
$name  = clamp_utf8(trim((string)($_POST["name"] ?? "")),  LIMIT_NAME);
$email = clamp_utf8(trim((string)($_POST["email"] ?? "")), LIMIT_EMAIL);

// ---- volunteer ----
if ($type === "volunteer") {
  $expertise    = clamp_utf8(trim((string)($_POST["expertise"] ?? "")),    LIMIT_MESSAGE);
  $contribution = clamp_utf8(trim((string)($_POST["contribution"] ?? "")), LIMIT_MESSAGE);
  $motivation   = clamp_utf8(trim((string)($_POST["motivation"] ?? "")),   LIMIT_MESSAGE);
  $message      = clamp_utf8(trim((string)($_POST["message"] ?? "")),      LIMIT_MESSAGE);

  if ($name === "" || !is_valid_email($email) || $contribution === "" || $motivation === "") {
    bail(422, "invalid_input");
  }

  header_safe($name);
  header_safe($email);

  $mailSubject = "New volunteer interest from {$name}";

  $textBody = "Volunteer Interest\n"
            . "Name: {$name}\n"
            . "Email: {$email}\n\n"
            . "Area of expertise:\n{$expertise}\n\n"
            . "What they would like to do:\n{$contribution}\n\n"
            . "Why they want to join ICAF:\n{$motivation}\n\n"
            . "Combined message:\n{$message}\n";

  $htmlBody = "<h2>Volunteer Interest</h2>"
            . "<p><strong>Name:</strong> " . h($name) . "<br>"
            . "<strong>Email:</strong> " . h($email) . "</p>"
            . "<p><strong>Area of expertise:</strong><br>" . nl2br(h($expertise)) . "</p>"
            . "<p><strong>What they would like to do:</strong><br>" . nl2br(h($contribution)) . "</p>"
            . "<p><strong>Why they want to join ICAF:</strong><br>" . nl2br(h($motivation)) . "</p>"
            . "<div><strong>Combined message:</strong><br>" . nl2br(h($message)) . "</div>";

  send_mail_json($email, $mailSubject, $textBody, $htmlBody);
}

// ---- business ----
if ($type === "business") {
  $organization = clamp_utf8(trim((string)($_POST["organization"] ?? "")), LIMIT_ORGANIZATION);
  $subject      = clamp_utf8(trim((string)($_POST["subject"] ?? "")),      LIMIT_SUBJECT);
  $message      = clamp_utf8(trim((string)($_POST["message"] ?? "")),      LIMIT_MESSAGE);

  if ($name === "" || !is_valid_email($email) || $organization === "" || $subject === "" || $message === "") {
    bail(422, "invalid_input");
  }

  header_safe($name);
  header_safe($email);
  header_safe($subject);

  $mailSubject = "Business inquiry from {$name}: {$subject}";

  $textBody = "Business Inquiry\n"
            . "Name: {$name}\n"
            . "Email: {$email}\n"
            . "Organization: {$organization}\n"
            . "Subject: {$subject}\n\n"
            . "Message:\n{$message}\n";

  $htmlBody = "<h2>Business Inquiry</h2>"
            . "<p><strong>Name:</strong> " . h($name) . "<br>"
            . "<strong>Email:</strong> " . h($email) . "<br>"
            . "<strong>Organization:</strong> " . h($organization) . "</p>"
            . "<p><strong>Subject:</strong> " . h($subject) . "</p>"
            . "<div><strong>Message:</strong><br>" . nl2br(h($message)) . "</div>";

  send_mail_json($email, $mailSubject, $textBody, $htmlBody);
}

// ---- contact-us ----
$subject = clamp_utf8(trim((string)($_POST["subject"] ?? "")), LIMIT_SUBJECT);
$message = clamp_utf8(trim((string)($_POST["message"] ?? "")), LIMIT_MESSAGE);

if ($type !== "contact-us") {
  bail(422, "unsupported_type");
}

if ($name === "" || $subject === "" || $message === "" || !is_valid_email($email)) {
  bail(422, "invalid_input");
}

header_safe($name);
header_safe($subject);
header_safe($email);

$replyTo     = $email;
$mailSubject = "Message from {$name}: {$subject}";

$textBody = "Contact Message\n"
          . "Name: {$name}\n"
          . "Email: {$email}\n"
          . "Subject: {$subject}\n\n"
          . "Message:\n{$message}\n";

$htmlBody = "<h2>Contact Message</h2>"
          . "<p><strong>Name:</strong> " . h($name) . "<br>"
          . "<strong>Email:</strong> " . h($email) . "</p>"
          . "<p><strong>Subject:</strong> " . h($subject) . "</p>"
          . "<div><strong>Message:</strong><br>" . nl2br(h($message)) . "</div>";

send_mail_json($replyTo, $mailSubject, $textBody, $htmlBody);
