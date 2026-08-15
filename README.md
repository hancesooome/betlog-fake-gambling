<div align="center">

<img src="https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/icon.png" alt="BETLOG Logo" width="120" />

# 🎰 BETLOG

### *Real Games. Fake Money. Real Lessons.*

<br/>

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)](LICENSE)

<br/>

> **Gusto mo bang magkaroon ng maraming pera?**
>
> ***Magtrabaho ka tol.***

<br/>

[🎮 Play Demo](#-getting-started) · [📖 Read the Docs](#-available-games) · [🤝 Contribute](#-contributing) · [⚖️ Legal](#️-legal-notice)

</div>

---

## 🚨 Important Disclaimer

<div align="center">

| ❌ No Real Money | ❌ No Deposits | ❌ No Withdrawals |
|:---:|:---:|:---:|
| ❌ No Prizes | ❌ No Crypto | ❌ No Betting |

</div>

> **BETLOG is NOT a gambling platform.**
>
> Everything inside BETLOG uses **fictional credits** — worthless, non-transferable, and intentionally so. This is a parody and educational project exploring game design, psychology, and web development.

---

## 🧠 The Concept

```
Most gambling apps ask:   "How can we keep users playing?"
BETLOG asks:              "How long until the user realizes the house always wins?"
```

BETLOG looks and feels exactly like a premium online casino — *by design*. The deeper you go, the more it reminds you that fictional money is all you'll ever win here. It's satire wrapped in slot-machine aesthetics.

---

## 🎮 Available Games

### 🃏 Baccarat — *Live Casino*

> A live-dealer inspired baccarat experience with real Baccarat third-card rules.

| Feature | Status |
|---|:---:|
| Player / Banker / Tie betting | ✅ Live |
| Chip selection (₱10 – ₱1,000) | ✅ Live |
| Proper 3rd-card Baccarat rules | ✅ Live |
| Roadmap tracking (P / B / T) | ✅ Live |
| Result history | ✅ Live |
| Live chat simulation | ✅ Live |
| Win/Loss toast notifications | ✅ Live |
| AI Dealer commentary | 🔜 Planned |
| Progressive reality checks | 🔜 Planned |

---

### 🎟️ Sports Parlays — *Coming Soon*

> Build prediction tickets using fictional credits and watch fake odds unfold.

| Feature | Status |
|---|:---:|
| Match & team selection | 🔜 Planned |
| Combined odds calculator | 🔜 Planned |
| Fake payout tracker | 🔜 Planned |
| Sports API integration | 🔜 Planned |

---

### 🍭 BETLOG Bonanza — *Coming Soon*

> A colorful cascade-style slot game with multipliers and fictional winnings.

| Feature | Status |
|---|:---:|
| Cascading symbols | 🔜 Planned |
| Multiplier combos | 🔜 Planned |
| Fake jackpot events | 🔜 Planned |

---

## 💼 The Cashout System

Think you won? **Try cashing out.**

```
╔══════════════════════════════════════════════╗
║         BETLOG CASHOUT SYSTEM v1.0           ║
╠══════════════════════════════════════════════╣
║  Your Balance:  ₱12,500 CR                  ║
║  Withdrawal:    ₱12,500                      ║
╠══════════════════════════════════════════════╣
║  Processing...  ████████████░░░  80%         ║
╠══════════════════════════════════════════════╣
║  ❌  TRANSACTION FAILED                      ║
║                                              ║
║  Fictional money cannot be withdrawn.        ║
║                                              ║
║  Here's what you get instead:               ║
║  → Resume Template (PDF)                    ║
║  → Top Job Listings This Week               ║
║  → Career Advice Articles                   ║
╚══════════════════════════════════════════════╝

               Nice try, tol.
```

Possible "cashout rewards":
- 📄 Resume templates
- 💼 Job board links
- 📚 Career advice articles
- 🔔 Gentle reality checks

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|:---:|---|
| ⚛️ React | 19 | UI Framework |
| 🔷 TypeScript | 5.8 | Type Safety |
| ⚡ Vite | 6 | Build Tool & Dev Server |
| 🎨 Tailwind CSS | 4 | Utility-first Styling |
| 🎞️ Motion | 12 | Animations |
| 🔲 Lucide React | 0.546 | Icon Library |

### Backend *(Planned)*

| Technology | Purpose |
|---|---|
| 🟢 Node.js + Express | API Server |
| 🔐 Supabase | Auth & Database |
| 🤖 Google GenAI | AI Dealer Service |

### State Management

| Technology | Purpose |
|---|---|
| React Context | Local UI State |
| Zustand *(planned)* | Global Game State |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>=18`
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/hancesooome/betlog-fake-gambling.git
cd betlog-fake-gambling

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev

# App will be available at:
# http://localhost:3000
```

### Build & Preview

```bash
# Type check
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
betlog-casino/
├── 📂 src/
│   ├── 📂 components/
│   │   ├── 🎰 HomePage.tsx        # Main landing page & game lobby
│   │   └── 🃏 BaccaratPage.tsx    # Live Baccarat game
│   ├── 📄 App.tsx                 # Root app & view routing
│   ├── 🎨 index.css               # Global styles & design tokens
│   └── 📄 main.tsx                # Entry point
├── 📂 assets/                     # Static assets & images
├── 📄 index.html                  # HTML template
├── 📄 vite.config.ts              # Vite configuration
├── 📄 tsconfig.json               # TypeScript config
└── 📄 package.json
```

---

## 🎯 Philosophy

BETLOG is built on a simple psychological experiment:

1. **You see** a stunning, polished casino interface
2. **You play** with chips that feel real
3. **You win** (sometimes) — and get excited
4. **You try to cash out** — and reality hits
5. **You realize** the house always wins

> The best way to understand why gambling is a trap is to experience it — safely, with nothing real at stake.

---

## 🤝 Contributing

Contributions are welcome! BETLOG is a learning project and a community experiment.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

**Contribution ideas:**
- 🎮 New game modes (Slots, Roulette, Crash)
- 🤖 AI dealer commentary integration
- 💬 Anti-gambling tips & awareness messages
- 🌐 Localization (Tagalog, Bisaya, Ilocano, etc.)
- 📊 Statistics dashboard & analytics

---

## ⚖️ Legal Notice

<div align="center">

**BETLOG is a parody and educational project.**

No real-money gambling services are offered, implied, or facilitated through this application.
All credits, winnings, and balances are entirely fictional and have no monetary value whatsoever.

*This project is intended for entertainment, satire, and educational purposes only.*

</div>

---

<div align="center">

Made with ❤️ and a healthy fear of gambling addiction.

**Wala pa ring totoong pera.**

<br/>

[![Star this repo](https://img.shields.io/github/stars/hancesooome/betlog-fake-gambling?style=social)](https://github.com/hancesooome/betlog-fake-gambling)

</div>
