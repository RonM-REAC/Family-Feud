# Family Feud Survey Board

A full-screen Family Feud style survey board for your live event.  
Questions & answers live in **Supabase** so you can edit them anytime.  
Hosted for free on **GitHub Pages**.

---

## Features

- Classic 8-answer board with big flashy reveal animation
- Keyboard controls (perfect for a host laptop + projector)
- Team scores + strikes
- Admin page to add / edit / delete questions
- Sample questions included so it works immediately
- Pure static site → works offline after first load

---

## Quick Start

### 1. Create a Supabase project (free)

1. Go to [https://supabase.com](https://supabase.com) and create a project
2. In the SQL Editor, run this:

```sql
create table questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answers text[] not null default '{}',
  points int[] not null default '{}',
  created_at timestamptz default now()
);

-- Allow public read + write (simple for an event – tighten later if needed)
alter table questions enable row level security;

create policy "Public read" on questions
  for select using (true);

create policy "Public insert" on questions
  for insert with check (true);

create policy "Public update" on questions
  for update using (true);

create policy "Public delete" on questions
  for delete using (true);
```

3. Go to **Project Settings → API**
4. Copy the **Project URL** and the **anon public** key

### 2. Put your keys in the project

Open `js/config.js` and replace the two placeholders:

```js
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 3. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all the files in this folder (or push via git)
3. Go to **Settings → Pages**
4. Source: **Deploy from a branch** → choose `main` (or `master`) and `/ (root)`
5. Wait ~1 minute. Your board will be live at:
   `https://YOUR_USERNAME.github.io/REPO_NAME/`

---

## How to use at the event

### Open two tabs

- **Board** → `index.html` (put this on the projector / big screen)
- **Admin** → `admin.html` (on the host laptop)

### Keyboard controls (on the Board)

| Key          | Action                          |
|--------------|---------------------------------|
| `1` – `8`    | Reveal that answer (+ ding)     |
| `Space` or `X` | Add a strike (buzzer + big X) |
| `R`          | Reset strikes                   |
| `N` or `→`   | Next question                   |
| `←`          | Previous question               |
| `S`          | Award points to Team 1 (+ chime)|
| `Shift + S`  | Award points to Team 2 (+ chime)|
| `M`          | Mute / unmute sounds            |
| `F`          | Toggle fullscreen               |

You can also **click** any answer slot to reveal it.

**Sounds** are generated live with the Web Audio API (no external files). There is a 🔊 button in the bottom-right corner (or press `M`).

### Tips for a smooth show

1. Open the board and press **F** for fullscreen
2. Hide the controls hint automatically goes away in fullscreen
3. Have a second person on the Admin page ready to fix typos if needed
4. Pre-load all your questions the day before

---

## File structure

```
family-feud-board/
├── index.html          ← The big game board
├── admin.html          ← Add / edit questions
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── config.js       ← Put your Supabase keys here
│   ├── sounds.js       ← Web Audio sound effects
│   ├── game.js
│   └── admin.js
└── README.md
```


---

## Security note

The RLS policies above allow anyone with the anon key to read/write questions.  
This is fine for a private event.  
If you later want to lock it down, add authentication and change the policies.

---

Enjoy the game!  
Survey says... have fun 🎉
