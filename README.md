# Email Verifier

A Node.js-based API for verifying email addresses, including format validation, MX record checks, SMTP verification, and disposable email detection.

## Features
- **Email Format Validation**: Checks if the email address is syntactically valid.
- **MX Record Lookup**: Ensures the domain has valid mail exchange (MX) records.
- **SMTP Verification**: Attempts to connect to the mail server to verify if the email address is accepted.
- **Disposable Email Detection**: Blocks emails from known disposable email providers using a comprehensive blocklist.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd email-verifier
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Start the server
```bash
npm run dev
```
The server will run on [http://localhost:3001](http://localhost:3001).

### API Endpoints

#### `POST /verify`
Verifies an email address for format, domain, MX records, and SMTP acceptance.

- **Request Body:**
  ```json
  { "email": "user@example.com" }
  ```
- **Response:**
  - `200 OK` with verification result, or `400` with error reason.

#### `POST /api/verify-smtp`
Performs SMTP-level verification and disposable email detection.

- **Request Body:**
  ```json
  { "email": "user@example.com" }
  ```
- **Response:**
  - `200 OK` with detailed SMTP verification result, or `400/500` with error reason.

## Example Response
```json
{
  "valid": true,
  "reason": "SMTP: Email accepted by server",
  "mx_domain": "mx.example.com",
  "mx_record": { "priority": 10, "exchange": "mx.example.com" },
  "catch_all": false,
  "disposable": false
}
```

## Blocklist
- Disposable email domains are blocked using the `disposable_email_blocklist.json` file.

## License

ISC
