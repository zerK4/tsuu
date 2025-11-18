# 🎣 Hooktunnel CLI (tsuu)

<p align="center">
  <strong>The ultimate webhook tunnel for local development</strong>
</p>

<p align="center">
  Forward webhooks to your localhost or test production integrations safely — all through a simple CLI
</p>

---

## 🚀 What is Hooktunnel?

Hooktunnel (tsuu) is a developer tool that solves the webhook testing problem. It creates secure tunnels to forward webhooks from production services (Stripe, GitHub, Shopify, etc.) directly to your local development environment — or even to remote staging/production servers for integration testing.

Think **ngrok, but specialized for webhooks** with bidirectional forwarding capabilities.

### Why "tsuu" (通)?

The Japanese character 通 (tsuu) means "to pass through" or "to transmit" — exactly what this tool does with your webhooks. It also means "expert" or "connoisseur," reflecting developers who master webhook integration.

---

## ✨ Features

- 🔄 **Bidirectional Forwarding** — Forward webhooks both inbound (cloud → localhost) and outbound (localhost → production)
- 🎯 **Multiple Endpoints** — Manage different webhook sources separately
- 🔐 **Secure Authentication** — API key-based authentication with encrypted storage
- 📊 **Beautiful CLI Output** — Color-coded logs, status badges, and real-time statistics
- ⚡ **WebSocket Connection** — Real-time webhook delivery with automatic reconnection
- 🎨 **Developer Experience First** — Intuitive commands, helpful error messages, detailed logging
- 🔍 **Request Inspection** — See full headers, payloads, and response times
- 📈 **Performance Metrics** — Track success rates, response times, and request counts
- 🌐 **Flexible Routing** — Override target URLs per connection for testing different environments

---

## 📦 Installation

### Via bun (Recommended)

```bash
bun install -g @hooktunnel/tsuu
```

### Via npm

```bash
npm install -g @hooktunnel/tsuu
```

### Via yarn

```bash
yarn global add @hooktunnel/tsuu
```

### Via pnpm

```bash
pnpm add -g @hooktunnel/tsuu
```

---

## 🎯 Quick Start

### 1. Create an Account

Visit [hooktunnel.dev](https://hooktunnel.dev) and sign up for a free account.

### 2. Generate an API Key

Go to your [API Keys Dashboard](https://hooktunnel.dev/dashboard/api-keys) and create a new key.

### 3. Authenticate CLI

```bash
tsuu login
```

Paste your API key when prompted (format: `whl_...`).

### 4. Create an Endpoint

In the [Hooktunnel dashboard](https://hooktunnel.dev/dashboard), create a new endpoint and configure:

- **Name**: e.g., "Stripe Webhooks"
- **Slug**: e.g., "stripe-webhooks"
- **Target URL**: e.g., "api/webhooks/stripe"

### 5. Start Forwarding

```bash
tsuu connect --port 3000 --endpoint stripe-webhooks
```

### 6. Use Your Relay URL

Configure your webhook provider to send webhooks to:

```
https://hooktunnel.dev/r/<your-user-id>/stripe-webhooks
```

That's it! Webhooks will now flow through Hooktunnel to your localhost. 🎉

---

## 📖 Usage

### Commands

#### `tsuu login`

Authenticate with your Hooktunnel account.

```bash
tsuu login
```

**What it does:**

- Prompts for your API key
- Validates the key with Hooktunnel servers
- Stores credentials securely in `~/.hooktunnel/config.json`

---

#### `tsuu connect`

Start the webhook tunnel and forward requests to your local or remote server.

```bash
tsuu connect [options]
```

**Options:**

| Option              | Alias | Description                               | Default                      |
| ------------------- | ----- | ----------------------------------------- | ---------------------------- |
| `--port <port>`     | `-p`  | Port to forward webhooks to               | ``                           |
| `--endpoint <slug>` | `-e`  | Specific endpoint to listen to            | All endpoints                |
| `--target <path>`   | `-t`  | Override target path from endpoint config | Endpoint's configured target |
| `--host <host>`     | `-h`  | Custom host to forward to                 | `http://localhost`           |

**Examples:**

```bash
# Connect to all endpoints on port 3000
tsuu connect --port 3000

# Connect to specific endpoint
tsuu connect --endpoint stripe-webhooks --port 8080

# Override target URL for testing
tsuu connect --endpoint stripe-webhooks --target api/v2/webhooks --port 3000

# Forward to remote server instead of localhost
tsuu connect --host https://staging.myapp.com --endpoint github-webhooks
```

---

#### `tsuu list`

Display all configured endpoints in your account.

```bash
tsuu list
```

**Output includes:**

- Endpoint name and slug
- Relay URL for webhook providers
- Active/inactive status
- Number of webhooks received today

---

#### `tsuu help`

Show comprehensive help with examples.

```bash
tsuu help
```

---

## 🎪 Use Cases

### 1. **Local Webhook Development**

Test Stripe, PayPal, or any webhook integration locally without deploying:

```bash
# Start your local server
npm run dev

# In another terminal, start hooktunnel
tsuu connect --port 3000 --endpoint stripe-webhooks

# Configure Stripe to send webhooks to your relay URL
# https://hooktunnel.dev/r/<user-id>/stripe-webhooks
```

### 2. **Production Integration Testing**

Forward webhooks from localhost to your staging/production API:

```bash
# Test how production will handle webhooks
tsuu connect --host https://api.production.com --endpoint test-integration
```

### 3. **Multi-Environment Testing**

Test the same webhook across different environments:

```bash
# Terminal 1: Dev
tsuu connect --port 3000 --endpoint shopify

# Terminal 2: Staging
tsuu connect --host https://staging.myapp.com --endpoint shopify

# Terminal 3: Production
tsuu connect --host https://api.myapp.com --endpoint shopify
```

### 4. **Debugging Production Issues**

Replay production webhooks locally to debug:

```bash
# View webhook history in dashboard, then forward to local
tsuu connect --port 3000 --endpoint production-webhooks
```

---

## 🎨 CLI Output Examples

### Successful Connection

```
✨ Connected to hooktunnel

╭────────────────────────────────────────────────────────────╮
│ Connection Details                                         │
│                                                            │
│ 📍 Endpoint:     stripe-webhooks                          │
│ 🔗 Relay URL:    https://hooktunnel.dev/r/user123/stripe │
│ 🎯 Forwarding:   http://localhost:3000/api/webhooks      │
│ 👤 User:         dev@example.com                          │
╰────────────────────────────────────────────────────────────╯

✓ Ready to receive webhooks
  Press Ctrl+C to stop
```

### Webhook Reception

```
 🎣 INCOMING WEBHOOK  at 14:32:15
┌──────────────────────────────────────────────────────────┐
│  POST  /api/webhooks/stripe
│ → http://localhost:3000/api/webhooks/stripe
│
│ ←  200  42ms (OK)
│    Size: 1.23 KB
└──────────────────────────────────────────────────────────┘
```

### Statistics Display

```
────────────────────────────────────────────────────────────
📊 Stats: 47 requests │ 45 success │ 2 failed │ 95.7% success rate │ 38ms avg │ 142s uptime
────────────────────────────────────────────────────────────
```

---

## 🔧 Configuration

Configuration is stored in `~/.hooktunnel/config.json`:

```json
{
  "apiKey": "whl_xxxxxxxxxxxxxxxxxxxxx",
  "user": {
    "id": "user_123456",
    "email": "dev@example.com"
  },
  "authenticatedAt": "2024-11-18T10:30:00.000Z"
}
```

**File Permissions:** Automatically set to `0600` (read/write for owner only) for security.

---

## 🌐 Environment Variables

| Variable  | Description          | Default                      |
| --------- | -------------------- | ---------------------------- |
| `WS_URL`  | WebSocket server URL | `wss://pluto.hooktunnel.dev` |
| `API_URL` | API server URL       | `https://hooktunnel.dev/api` |

**Custom Server Example:**

```bash
export WS_URL=wss://custom.hooktunnel.dev
export API_URL=https://custom.hooktunnel.dev/api
tsuu connect
```

---

## 🐛 Troubleshooting

### Authentication Failed

**Problem:** API key not recognized

**Solutions:**

1. Verify you copied the complete API key (starts with `whl_`)
2. Generate a new key at [dashboard/api-keys](https://hooktunnel.dev/dashboard/api-keys)
3. Check that the key hasn't been revoked

### Connection Failed

**Problem:** Cannot connect to hooktunnel server

**Solutions:**

1. Check your internet connection
2. Verify the hooktunnel server is online
3. Check firewall settings (WebSocket port may be blocked)
4. Try reconnecting: `tsuu connect`

### Webhooks Not Forwarding

**Problem:** Connected but webhooks aren't reaching localhost

**Solutions:**

1. Verify your local server is running on the specified port
2. Check that the target URL path is correct
3. Review endpoint configuration in the dashboard
4. Look for errors in the CLI output

### Invalid API Key Format

**Problem:** "Invalid API key format" error

**Solution:** Ensure the API key starts with `whl_` — this is the required prefix.

---

## 🏗️ Architecture

```
┌─────────────────┐
│ Webhook Provider│
│  (Stripe, etc.) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────┐
│   Hooktunnel Cloud Server   │
│  (hooktunnel.dev)           │
└────────┬────────────────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│   tsuu CLI      │
│  (Your Machine) │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Local Server   │
│  or Remote API  │
└─────────────────┘
```

---

## 🎯 What Makes Hooktunnel Different

Hooktunnel is purpose-built for webhook development, offering features specifically designed for this use case:

- **Webhook-First Design** - Built specifically for webhook testing workflows
- **Bidirectional Forwarding** - Test both receiving and sending webhooks
- **Multiple Named Endpoints** - Organize different webhook sources separately
- **Beautiful Developer Experience** - Color-coded logs, real-time stats, intuitive CLI
- **Webhook History & Replay** - Review and resend past webhooks (Web UI)
- **Flexible Routing** - Forward to localhost or remote servers dynamically

### When to Use Hooktunnel

**Use Hooktunnel when:**

- You're primarily testing webhooks (Stripe, GitHub, Shopify, etc.)
- You need to manage multiple webhook endpoints
- You want beautiful, informative CLI output
- You need to test webhook flows in different environments

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🔗 Links

- 🌐 **Website:** [hooktunnel.dev](https://hooktunnel.dev)
- 📚 **Documentation:** [hooktunnel.dev/docs](https://hooktunnel.dev/docs)

---

## 💡 Tips & Tricks

### Multiple Terminals for Different Endpoints

Run multiple instances simultaneously:

```bash
# Terminal 1: Stripe webhooks
tsuu connect --endpoint stripe --port 3000

# Terminal 2: GitHub webhooks
tsuu connect --endpoint github --port 4000

# Terminal 3: Shopify webhooks
tsuu connect --endpoint shopify --port 5000
```

### Testing Error Handling

Use the target override to send webhooks to a broken endpoint:

```bash
tsuu connect --target api/broken-endpoint --port 3000
```

### Quick Local Testing

No endpoint configured yet? Connect to all endpoints:

```bash
tsuu connect --port 3000
```

---

<p align="center">
  Made with ❤️ by developers, for developers
</p>

<p align="center">
  通 (tsuu) — Passing webhooks through, one tunnel at a time
</p>
