# @webship.co/workspace-jira

Jira for the [Webship Workspace](https://github.com/webship/workspace) dashboard, over the Teamwork
Graph CLI (`twg`): the **JIRA** menu on every site row, the workitems list (open, sprint, mine; a key
jumps straight to it), the one-workitem modal (overview, analyze, do the work with Claude Code in a
screen session, runs and logs, comment and worklog when writes are on), the key badge an agent at work
puts on its card, the New-folder option that files a workitem, live project options on the settings
page, and the `twg` session mounted from the host into the dashboard container.

## Use it

```bash
cd ~/workspace
bash core/scripts/plugins.sh --require github:webship/workspace-jira
bash core/scripts/plugins.sh --activate jira --with-needs
bash core/scripts/plugins.sh --install jira          # then: cd core/workspace-app && ddev restart (the twg mount)
bash core/scripts/plugins.sh --configure jira        # core/config/plugin.jira.settings.yml: site, account, default_project…
```

On the host: `twg login --force` once (the dashboard shares `~/.config/twg`). `scripts/host-install.sh`
installs twg and reports whether it is signed in; `plugins.sh --install` runs its `--check`.

## The items it carries

The workspace is container-based (DDEV by default). Each item lands in the folder of its kind, when
that folder is an active workspace folder, is listed there like any other item, and is installed
into Claude Code from there:

| What | Lands in | What it is for |
| --- | --- | --- |
| The agent `jira-workitem-manager` | `ai-agents/` | Reads and lists workitems with `twg`, files one for the work in a folder and remembers its Jira project. The agent the New folder form asks for |
| The skill `jira-workitems` | `ai-skills/` | The JIRA menu, the scopes and tabs of its window, the `twg` call behind each read, the keys of `plugin.jira.settings.yml`, `.jira-project` |
| The command `/jira-workitem` | `ai-commands/` | `/jira-workitem <KEY> [<project>]`: what a workitem asks for and whether it applies to a project. Read-only |
| The prompt `jira-open-workitems` | `ai-prompts/` | The launch command of a session that lists the open workitems of a Jira project and says which to take next |

The plugin places no `cmd-*.sh`: `twg jira workitem get` and `twg jira workitem query` are the terminal commands, and a wrapper would add nothing to them. The item bodies are plain Markdown any AI command-line assistant can follow; Claude Code is the default shape (frontmatter, the launch command of the prompt).

How the items are laid out and checked: [docs/plugin-items-pattern.md](docs/plugin-items-pattern.md).

## What it needs

On the machine this plugin needs `twg` (https://developer.atlassian.com/cloud/twg-cli/), and its manifest says so (`needs.commands`). The workspace reports it and never installs it:

```bash
bash core/scripts/plugins.sh --check jira      # found, with its version, or missing, with how to install it
webship-workspace doctor                        # the same for the core and every plugin
```

It also needs the AI folders its items are placed in (`needs`): `ai-agents`, `ai-skills`, `ai-commands` and `ai-prompts`. `--require` says so, `--activate` and `--install` stop until the workspace has them, and `--with-needs` adds what is missing first. A kind whose folder is not an active workspace folder is skipped, and the install says so. It needs no sites folder: its menu is on the project rows of whatever folders the workspace has.

## What the package holds

| Path | What it is |
| --- | --- |
| `src/index.ts` | `register(api)`: the row menu, badge, key link, session hooks, settings options, assistant context, New-folder section, actions and fragments |
| `src/lib/twg.ts` | Whether twg is usable (installed, signed in, up to date), the projects it sees, a project's own `.jira-project` |
| `src/lib/sessions.ts` | The runs a workitem has had: noted when a screen starts, read back live or finished |
| `src/lib/task.ts` | The actions: remember a project, and view / analyze / work / watch / comment / worklog with Claude Code |
| `src/lib/workitems.ts` | The list and the modal, as fragments |
| `ddev/docker-compose.twg.yaml` | Mounts the host's `~/.local/bin` (twg follows updates) and `~/.config/twg` (the session) |
| `config/plugin.jira.settings.yml` | The settings template |
| `scripts/host-install.sh` | The host side: twg installed (sha256-verified), signed in |
| `public/jira.css` | The plugin's styles |
| `features/jira.feature` | Browser scenarios, installed into the dashboard's `tests/features/plugins/jira/` |
| `ai/agents/jira-workitem-manager.md` | The agent `jira-workitem-manager` |
| `ai/skills/jira-workitems/` | The skill `jira-workitems` |
| `ai/commands/jira-workitem.md` | The command `/jira-workitem` |
| `ai/prompts/jira-open-workitems.md` | The prompt `jira-open-workitems` |
| `tests/items.test.ts` | The shape of every item, and that it names nothing the plugin does not have |
