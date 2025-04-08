Of course! Here's your polished, professional `README.md` rewritten in **clean and fluent English** — same content, just more natural and streamlined for a GitHub audience:

---

# DisShort

**DisShort** is a powerful Discord bot that lets users create custom short invite links like `di.scord.me/<code>`, which redirect to their Discord servers. Manage your links, update them, or delete your data — all through easy-to-use slash commands right in Discord.

---

## 🌟 Features

- 🎯 Create custom short links: `di.scord.me/<yourcode>`
- ✏️ Update invite links with autocomplete support
- 📋 View a list of all your created short links
- 🗑️ Delete all your data at any time
- 🌐 Express.js-based web redirect server
- ⚡ Full support for Discord slash commands

---

## 🧰 Requirements

- **Node.js** (v18 or later recommended)
- **MySQL database** (e.g., MariaDB)
- **A registered Discord bot**
- **A domain name** (e.g., `di.scord.me`) with DNS or reverse proxy configured

---

## ⚙️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Bot

```json
{
  "BOT_TOKEN": "",
  "CLIENT_ID": "",
  "domain": "",
  "db": {
    "host": "localhost",
    "user": "",
    "password": "",
    "database": ""
  }
}
```

---

### 🚀 Run the Bot

```bash
node index.js
```

---

## 🌍 Web Redirect Server

- The Express server runs on **port 7430**
- Any GET request to `http://localhost:7430/<code>` will:
  - Look up the short code in the database
  - Redirect the user to the associated `discord.gg/<invite>` link

---

## 💬 Slash Commands

### `/url_create`
Create a new short link  
**Arguments:**
- `code` – your custom code (letters only, max 16 characters)
- `invite` – your full Discord invite link (e.g., `https://discord.gg/example`)

---

### `/myurls`
List all short links you've created

---

### `/url_change`
Update the destination of an existing short link  
**Arguments:**
- `shortlink` – choose one of your existing links (with autocomplete)
- `invite` – new invite code (just the code, not the full URL)

---

### `/deletemydata`
Delete all links and data associated with your Discord account

---

## 📌 Notes

- Only **letters** are allowed in short codes (`A–Z`, `a–z`)
- **Duplicate codes** are not allowed
- Invite links are validated using Discord’s API

---

## 🔐 Privacy & Data

- Users can delete their data anytime via `/deletemydata`
- No personal data is stored besides the Discord user ID

---