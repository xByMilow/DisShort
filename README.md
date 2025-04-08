Klar! Hier ist der komplette **kopierbare** `README.md`-Code für dein Projekt — einfach markieren und einfügen:

---

```markdown
# DisShort — Custom Discord Invite Shortener Bot

DisShort is a powerful Discord bot that lets users create custom short invite links like `di.scord.me/<code>` that redirect to their Discord servers. Manage your links, update them, or delete your data — all via simple and intuitive slash commands.

---

## 🌐 Features

- 🎯 Create custom short links: `di.scord.me/<yourcode>`
- ✏️ Update invite links with autocomplete
- 📋 View all your created short links
- 🗑️ Delete all stored data at any time
- 🌐 Express.js web redirect server
- ⚡ Built-in slash command support

---

## 🧠 Requirements

- **Node.js** (v18 or higher recommended)
- **MySQL server** (e.g., MariaDB)
- **A registered Discord bot**
- **A domain** (e.g., `di.scord.me`) with DNS and/or reverse proxy setup

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

### 🚀 Run the Bot

```bash
node index.js
```

---

## 🌍 Web Redirect Server

- The Express server listens on port **7430**
- Any GET request to `http://localhost:7430/<code>` will:
  - Look up the short code in the database
  - Redirect the user to the associated `discord.gg/<invite>` link

---

## 💬 Available Slash Commands

### `/url_create`
Create a new short URL  
**Arguments:**
- `code` – your custom shortlink (letters only, max. 16 characters)
- `invite` – your full Discord invite (e.g., `https://discord.gg/example`)

---

### `/myurls`
List all shortlinks you've created

---

### `/url_change`
Update the destination of an existing shortlink  
**Arguments:**
- `shortlink` – select one of your links (autocomplete enabled)
- `invite` – new invite code (only the code, not the full URL)

---

### `/deletemydata`
Delete all links and data associated with your Discord account

---

## 📌 Notes

- Only **letters** are allowed in short codes (`A–Z`, `a–z`)
- **Duplicate codes** are not allowed
- Invite links are validated using Discord’s API

---

## 🔐 Security & Privacy

- Users can delete their data at any time via `/deletemydata`
- No personal data is stored beyond the Discord user ID

---

## 📄 License

MIT License
```

---