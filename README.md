# Survey Showdown

Static survey board for GitHub Pages. No build step.

## Publish

1. Create a GitHub repository.
2. Upload every file in this folder (keep `css/` and `js/` folders).
3. Settings → Pages → Deploy from branch → `main` and `/ (root)`.
4. Open `https://YOUR_USER.github.io/YOUR_REPO/`.

Pages link to each other with relative paths:

- `index.html` home
- `board.html` the live board
- `admin.html` question editor

## Play

On the board: keys 1–9 and 0 reveal (0 is answer 10), Space strikes, S awards team A, Shift+S awards team B, N next, M mute, F fullscreen.

Questions are stored in the browser. Use Download JSON / Import JSON to move them between computers.

## Optional Supabase

Run this in the SQL editor, then paste the project URL and anon key on the Questions page.

```sql
create table surveys (
  id text primary key,
  question text not null,
  answers jsonb not null
);

alter table surveys enable row level security;
create policy "public read" on surveys for select using (true);
create policy "public insert" on surveys for insert with check (true);
create policy "public update" on surveys for update using (true);
create policy "public delete" on surveys for delete using (true);
```

The anon key can write every row. Fine for a private event; lock the policies down if the site is public.
