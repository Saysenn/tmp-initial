# Agent Office: an AI office with agent workers for my projects

A web app where my AI agents "work" in a visual office. Each agent has a name, a role, a desk in a
room and a live status. A Chief of Staff agent runs the team, and every agent shares one brain
(memory). The office talks to the tools my team already uses (Discord, Trello and more), and it
never does anything important without my approval.

Inspiration: the "my own AI office" reel by A Tatay of 5 (O2San HQ, 18 AI agents). We copy the
ideas, the layout and the feel of the UI and UX. All names, art, pixel avatars and the logo are
our own.

---

## 1. Goals

1. **See my AI team at a glance.** Open one page and know who is working, on what, and what is
   waiting for me.
2. **Agents that do real work** for my projects: Jobcreo, Sayon Labs, OtherVerse, PlotTwist, the
   marketing agent, client sites and more.
3. **One shared brain.** Everything important lives in one place (facts, instructions, what the
   team has learned), and every agent reads from it.
4. **A human in charge.** Critical actions (posting, sending, paying, deleting, deploying) wait
   for my go signal.
5. **Lives where the team lives.** Agents post updates, reminders and questions in Discord and
   update Trello cards themselves.
6. **Fun to look at.** It's an office I want to open every day, not another admin table.

**Non-goals for version 1:** voice chat with agents, a mobile app, multi-tenant SaaS, billing.

---

## 2. What the reel shows (the features to copy)

| Moment in the reel | What it means for us |
|---|---|
| "So I created my own AI office, with actual AI employees" + an isometric office map | The home screen is an isometric office with coloured rooms, desks and little pixel agents |
| "18 AI agents, each with their own roles and responsibilities" + a grid of pixel avatars with names | A Team page: an avatar grid, one card per agent |
| "Meet Boss, my Chief of Staff. Siya ang nagko-coordinate" + Command Deck | One orchestrator agent takes requests, splits them into tasks and assigns them |
| Agent cards: GUGEL Deep Researcher, Research Lab, IDLE; MEOW GitHub Crawler, WORKING; SHERLOCK Content QA, QA Desk; JUDITH Finance and Admin, Front Office, DONE | Every agent card shows name, role, room, status and a coloured skill tag |
| Researchers and writers for each client, 3 video editors, a social media manager, a sales agent | Agents are grouped into teams per project or client |
| "They have a shared brain": Important information, Instructions, What they've learned | The Brain: three shelves of shared memory |
| "Connected din sila sa Discord, Trello, and many other tools" + a tree from the logo to tool icons and a "+" | Integrations page with connectors, behind one adapter interface |
| A Trello card "pending since Oct 14" found by an agent | Watchers: agents scan tools for stale items |
| A Discord message from the app: "Hi MJ! Quick check from Elron: is the ... project done? ... Salamat!" | Agents nudge real people in Discord, politely, on my behalf |
| "May AI akong nangungulit sa actual employees ko" (an AI that follows up with my team) | A Follow-ups feature: polite reminders on a schedule, with limits |
| Command Deck: IN PROGRESS, WAITING FOR YOU, DONE, plus a "Needs my go signal" card with an Approve button | An approval inbox: risky actions pause until I click Approve |
| "The goal isn't to replace my team. Reduce repetitive work, keep everything organized, focus on their actual jobs" | Product principles (section 3) |
| "I'm building all of this myself, with the help of AI. Follow for more" | Build in public: Sayon Labs lessons about building it |

---

## 3. Product principles

1. **Reduce repetitive work, keep everything organized, let people focus on their actual jobs.**
2. **Approval first.** Anything that leaves the office, costs money or can't be undone needs my
   go signal.
3. **Show, don't hide.** Every agent action is visible: who, what, when and why, plus the result.
4. **One brain, no copies.** Facts live once in the Brain, and agents never keep private copies.
5. **Polite with humans.** Reminders are kind, short, signed, rate limited and never at night.
6. **Cheap by default.** Use the smallest model that does the job, cache, batch, and stop idle
   agents.

---

## 4. The office (UI and UX)

### 4.1 Visual language

- **Theme:** dark by default, near black (#141416) with a faint dot grid and soft glows on rooms.
  A light theme is available too.
- **Accent:** one warm orange (like the reel) for the key words and buttons, plus one colour per
  room.
- **Type:** a bold rounded sans for headings, a clean sans for the body, and a pixel or mono font
  for the logo, agent names and status chips (GUGEL, IDLE).
- **Art:** isometric 2.5D rooms with pixel desks, screens, plants and a glowing centre "Brain"
  hologram. Agents are 16-bit pixel people (16x24, scaled up crisp).
- **Motion:**
  - small idle animations (typing, sipping, walking between rooms);
  - things fade and sharpen in from a slight blur;
  - panels slide in from the side;
  - numbers count up;
  - everything respects `prefers-reduced-motion`.
- **Layout:** a browser-app feel. A thin top bar holds the logo (pixel wordmark) and the page
  name ("Command Deck", "The Brain", "Human Studio").

### 4.2 Pages

1. **Office (home)**
   - **The map:** the isometric map fills the screen. Each room is labelled: Front Office,
     Command Deck, The Brain (centre), Research Lab, QA Desk, Writers' Room, Ops Room, Growth
     Studio, Pantry, Human Studio.
   - **Agents on the map:**
     - They sit at their desks and walk to another room when they hand work over, for example
       Writer to QA Desk.
     - A speech bubble shows the current task in 3 to 5 words.
     - A status dot (idle, working, waiting, done, error) floats above each head.
   - **Hover or click an agent** to open its card. **Click a room** to see its agents and queue.
   - **Corner widgets:** "3 waiting for you" (opens the approval inbox), "12 tasks today", "cost
     today $1.84".
2. **Command Deck** (a board plus the activity feed)
   - **Columns:** Inbox, In progress, Waiting for you, Done. Task cards show title, project tag,
     agent avatar, age and the next step.
   - **"Waiting for you" cards** show what the agent wants to do, a preview of it, the risk, and
     Approve, Edit, Reject and Ask why buttons.
   - **Right rail:** the live activity log, for example "Meow opened 3 issues on jobcreo", "Boss
     assigned 2 tasks to Tess".
   - **Command bar on top:** "Ask Boss…". Type a request in plain words and Boss turns it into
     tasks.
3. **Team**
   - **The avatar grid** (like the "18 AI agents" moment): avatar, name and role. Filter by
     team, project or status.
   - **Agent page:**
     - profile: name, role, room, skills, tools allowed and model;
     - the current task;
     - history and stats (tasks done, approval rate, average time, cost);
     - its own instructions;
     - buttons to pause, resume, edit or retire.
   - **Add agent:** pick a template (Researcher, Writer, QA, Video Editor, Social Manager, Sales,
     Finance, GitHub Crawler, DevOps, Support), name it, pick an avatar, room, tools and limits.
4. **The Brain**
   - **Three shelves, like the reel:** Important information (facts), Instructions (rules and
     playbooks), What we learned (lessons from past tasks, added by agents, approved by me).
   - **Each item:** title, body (markdown), project tags, source, owner, last used by, and
     confidence.
   - **Search, with "which agents read this".** Proposed edits from agents wait for my approval.
5. **Approvals** (the "Needs my go signal" inbox)
   - **One list of pending actions,** sorted by urgency. Each shows the agent, the action, a full
     preview (the exact message, post, diff or payment), the reason, and the cost or risk.
   - **Actions:** Approve, Edit then approve, Reject with a note (the note becomes a lesson),
     Always allow this kind of action (a standing rule with limits).
   - **Push notification** to my phone (Discord DM or web push) with a one-tap open.
6. **Integrations**
   - **A tree diagram:** our logo at the top, lines to Discord, Trello, GitHub, Gmail, Google
     Drive, YouTube, Facebook and a "+".
   - **Each connector:** status, the account connected, what agents may do with it (read,
     write, ask first), the last sync and errors.
7. **Human Studio**
   - **The real team:** names, roles, Discord handles, Trello members, working hours and their
     follow-up settings.
   - **Shows what agents asked each person,** and their replies.
8. **Settings:** models and budgets, quiet hours, the approval rules, audit log, backups.

### 4.3 Key flows

1. **Ask Boss**
   1. I type "Check if the Solender AI ad is done and update Trello".
   2. Boss plans: find the card, then check its status, then ask the owner on Discord, then move
      the card.
   3. Boss assigns the steps to Meow and the Front Office agent.
   4. Each step shows live on the Deck. The Discord message waits in Approvals, unless a standing
      rule allows "polite status check".
2. **Stale item watcher:** every morning the Ops agent scans Trello for cards stuck more than X
   days. Each stale card becomes a follow-up task, "pending since Oct 14".
3. **Follow-up:** the agent sends "Hi MJ! Quick check from Elron: is the ... project done? If
   it's done, just reply here and we'll move the card to Done. Salamat!", signed "Sent by
   [Office] for Elron". When MJ replies "done", the agent moves the card and logs it.
4. **Content pipeline** (my projects)
   1. A Researcher (Gugel-like) finds topics and sources.
   2. A Writer drafts.
   3. Sherlock (QA) checks facts and tone.
   4. A Video Editor agent renders.
   5. The Social Manager queues the post.
   6. I approve.
   7. It posts.

   This is today's marketing agent, shown as people in an office.
5. **GitHub crawler:** Meow watches my repos, summarises new issues and PRs, drafts replies and
   labels, and opens tasks for the DevOps agent.
6. **Finance:** Judith collects invoices from email, matches payments and drafts reminders.
   Payments are never made by an agent.

### 4.4 States and details

- **Agent statuses:** IDLE (grey), WORKING (blue, animated), WAITING FOR YOU (orange, pulsing),
  DONE (green, fades after 1 h), BLOCKED or ERROR (red, with the reason), PAUSED (striped).
- **Every list** has loading skeletons, an empty state with one clear next action, and an error
  state with retry.
- **Keyboard:**
  - `/` opens the command bar, `a` approves the focused item, `j`/`k` move;
  - the office map is navigable by Tab, with each agent a button;
  - there's an "List view" toggle for screen readers.
- **Mobile:**
  - The map becomes a scrollable room list.
  - Approvals is the first tab.
  - Cards stack in one column, with no horizontal scroll.

---

## 5. Agents (the starting team)

| Name (ours) | Role | Room | Tools | Needs approval for |
|---|---|---|---|---|
| Boss | Chief of Staff: plans, assigns, reports to me | Command Deck | All, read; task board, write | Nothing it does itself; it routes approvals |
| Gugel | Deep Researcher | Research Lab | Web search, fetch, Brain | Adding to "What we learned" |
| Meow | GitHub Crawler | Research Lab | GitHub (read, comment drafts) | Comments, labels, PRs |
| Sherlock | Content QA | QA Desk | Brain, media checks | None (it only reviews) |
| Judith | Finance and Admin | Front Office | Email (read), sheets | Any email or payment step |
| Writers (per project) | Scripts, posts, docs | Writers' Room | Brain, docs | Publishing |
| Video Editors (3) | Render and cut videos | Growth Studio | Render pipeline, storage | Posting |
| Social Manager | Schedules and posts | Growth Studio | Platform accounts (via my browser flow) | Every post |
| Sales | Leads and follow-ups | Front Office | CRM, email drafts | Every send |
| Ops / DevOps | Watchers, deploys, logs | Ops Room | Trello, Discord, servers (read), CI | Deploys, restarts, deletes |

Each agent is defined by a config entry, not code: name, avatar, room, role prompt, tools,
model, budget, schedule and approval rules.

---

## 6. Architecture (my stack)

Follows my project rules: Next.js plus plain JS, Postgres, a modular monolith, configs in
`src/configs/`, the repository pattern, adapters for every outside service, and no TypeScript.

- **Web app:** Next.js (App Router). Pages: office, deck, team, brain, approvals, integrations,
  studio, settings.
- **Office map:** a React component that renders the isometric scene in a `<canvas>` (PixiJS),
  or as SVG layers. Agents are sprites with simple state machines (sit, type, walk, wave).
- **Worker:** a long-running Node process (launchd on my Mac, like the marketing agent) that
  runs agent turns from a Postgres-backed queue (pg-boss), with retries, backoff and a dead
  letter list.
- **Agent runtime:** each agent turn is a Claude call. The options are the Claude Agent SDK, or
  `claude -p` with allowed tools and MCP servers. Every call goes through one adapter with
  timeouts, a circuit breaker, a cost meter and per-agent budgets. Model per agent: Haiku for
  watchers, Sonnet for writers, Opus for Boss planning.
- **Tools:** MCP servers (Discord, Trello, GitHub, Gmail, Drive, filesystem, browser), wrapped
  so every write goes through the approval gate.
- **Brain:** a Postgres table of notes with full-text search plus embeddings (pgvector), with an
  optional Obsidian vault sync so I can read and edit it as markdown.
- **Live updates:** Server-Sent Events from `/api/v1/office/stream`, so the map and Deck move in
  real time.
- **Discord bot:** posts updates, sends follow-ups, receives replies and DMs me approvals with
  buttons.

### 6.1 Folders

```
src/
  app/(app)/office, deck, team, brain, approvals, integrations, studio, settings
  app/api/v1/office/stream/route.js        # SSE
  app/api/v1/discord/interactions/route.js # button clicks, replies
  features/
    agents/      service.js repository.js jobs.js components/ prompts/
    tasks/       service.js repository.js components/
    approvals/   service.js repository.js components/
    brain/       service.js repository.js components/
    integrations/providers/{discord,trello,github,gmail}.js factory.js
    office/      components/office-map.jsx sprites/ rooms.js
  configs/agents.js rooms.js approvals.js models.js budgets.js integrations.js
  lib/queue/ lib/claude.js (adapter + breaker) lib/events.js
worker/index.js
```

### 6.2 Data model (Postgres)

| Table | Key columns |
|---|---|
| `agents` | id, slug, name, role, room, avatar, model, tools[], budget_daily, schedule, status, paused |
| `tasks` | id, title, project, created_by (me/agent), assignee_agent_id, status (inbox, in_progress, waiting, done, failed), parent_id, plan jsonb, result jsonb, due_at |
| `task_steps` | id, task_id, agent_id, kind, input, output, cost_usd, started_at, finished_at, error |
| `approvals` | id, task_id, agent_id, action (send_discord, post, email, deploy, delete, pay), preview jsonb, risk, status (pending, approved, rejected, edited), decided_by, decided_at, note |
| `approval_rules` | id, action, scope (project, person, channel), limits (per day, hours), expires_at |
| `brain_notes` | id, shelf (info, instructions, learned), title, body, tags[], source, embedding, approved, updated_by |
| `people` | id, name, role, discord_id, trello_id, timezone, quiet_hours, follow_up_limit |
| `follow_ups` | id, person_id, task_id, message, channel, sent_at, reply, status |
| `integrations` | id, provider, account, scopes, status, last_sync_at, error |
| `activity` | id, at, agent_id, verb, object, summary |
| `costs` | day, agent_id, model, tokens_in, tokens_out, usd |

ACID writes in transactions; idempotency keys on every outgoing send (a follow-up never sends
twice); outbox table for Discord/Trello writes after commit.

### 6.3 The approval gate

1. An agent calls a write tool, for example `discord.send`.
2. The wrapper checks `approval_rules`. With no matching rule, it creates an `approvals` row with
   a full preview and pauses the task as **waiting**.
3. I get a Discord DM or web push and approve in the app or in Discord.
4. The outbox sends the action exactly once, then the task resumes.
5. A rejection with a note saves the note as a "What we learned" draft.

### 6.4 Safety and limits

- **Secrets** stay only in server env, and agents never see raw keys.
- **Per-agent tool allow lists and daily budgets.** When the money runs out, the agent pauses
  itself and tells Boss.
- **Prompt-injection defence:** content from Discord, email or web pages is data, never
  instructions. Agents can't change their own rules or approvals.
- **Human follow-ups:** at most N per person per day, never in their quiet hours, always signed,
  with an easy "stop" reply.
- **Full audit log.** Pause-all is one big button.

---

## 7. Build plan

| Phase | What ships | Done when |
|---|---|---|
| 0. Skeleton | Next.js app, Postgres schema, worker and queue, the Claude adapter with budgets | One agent can run a task from the command bar and log it |
| 1. Command Deck | Tasks board, activity feed, Boss planning into subtasks, SSE live updates | I ask Boss for something and watch the cards move |
| 2. Approvals + Discord | Approval gate, Approvals inbox, Discord bot DMs with Approve buttons, outbox | A Discord message is sent only after I approve it, once |
| 3. Brain | Three shelves, search, agent reads, proposed "learned" notes, optional Obsidian sync | Agents cite Brain notes in their work |
| 4. Office map | Isometric rooms, pixel agents, statuses, speech bubbles, click to open cards | The map matches what's happening on the Deck in real time |
| 5. Integrations | Trello watcher (stale cards), GitHub crawler, Gmail read, the integrations tree page | "Pending since Oct 14" style nudges work end to end |
| 6. My projects | Plug in the marketing agent pipeline as office agents (Writers, Editors, Social Manager) | Jobcreo/Sayon Labs videos flow through the office |
| 7. Polish | Light theme, mobile, keyboard, reduced motion, costs page, backups | Daily use without opening the old dashboards |

## 8. Open questions

1. **Name of the office.** Our own name and pixel wordmark, for example "Sayon HQ".
2. **Which person is "Elron"?** Who agents speak for in follow-ups (me, or a named teammate).
3. **Discord server and channels** for updates versus approvals.
4. **Budget per day** across all agents.
5. **Local-first:** run on my Mac like the marketing agent, or deploy to a small server so it
   runs while the Mac sleeps.
