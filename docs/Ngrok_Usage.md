# Ngrok Usage Guide

`ngrok` is a powerful tool that creates a secure tunnel to your local machine, allowing you to expose your local development server to the internet. This is particularly useful for testing features that require a public URL, such as payment webhooks (e.g., Stripe) or social logins.

## 1. Installation

1.  **Download ngrok:** Go to the ngrok download page and get the version for your operating system.
2.  **Unzip the file:** Unzip the downloaded package. This will give you a single executable file.
3.  **(Optional) Add to PATH:** For easier access, move the `ngrok` executable to a directory that is in your system's PATH.

## 2. Connect Your Account

To use more advanced features, you should connect your ngrok account.

1.  Sign up for a free account on the ngrok website.
2.  Find your authtoken on your dashboard.
3.  Run the following command in your terminal:
    ```bash
    ngrok config add-authtoken <YOUR_AUTHTOKEN>
    ```

## 3. How to Use

### Exposing Your Backend Server

Your backend server runs on port `5000` by default. To expose it, run:

```bash
ngrok http 5000
```

`ngrok` will start and display a UI in your terminal with a public URL.

```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://random-string.ngrok.io -> http://localhost:5000
```

The `https://random-string.ngrok.io` URL is now a public mirror of your local server.

### Use Case: Testing Stripe Webhooks

1.  Start your local server: `npm run dev`.
2.  Start ngrok: `ngrok http 5000`.
3.  Copy the `https://...ngrok.io` URL.
4.  In your Stripe Dashboard, go to "Developers" -> "Webhooks".
5.  Add a new endpoint and paste the ngrok URL, followed by your webhook route (e.g., `https://random-string.ngrok.io/api/payments/webhook`).
6.  Select the events you want to listen for.
7.  Now, when Stripe sends a webhook event, it will be forwarded to your local application.

## 4. Web Interface

While ngrok is running, you can open `http://127.0.0.1:4040` in your browser to access a web interface. This interface allows you to inspect all HTTP traffic passing through the tunnel in real-time, which is incredibly useful for debugging.
