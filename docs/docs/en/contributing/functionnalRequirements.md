# Functional requirements
| Component | Requirement | Solution | Link |
|-----------|-------------|----------|------|
| Workspaces | Edit automations | Through **graph design** or DSUL view | [Basic syntax.md](https://gitlab.com/prisme.ai/dsul/-/blob/main/specifications/Basic%20syntax.md) and [DSUL Swagger](https://gitlab.com/prisme.ai/dsul/-/blob/main/specifications/swagger.yml) |
| Workspaces | Identify and display only triggers / workflows from a specific automation | Through each **Automation object** (including **Triggers** and **Workflows**) | [Application.md](https://gitlab.com/prisme.ai/dsul/-/blob/main/specifications/Application.md) |
| Workspaces | Edit multiple automations concurrently | The frontend editor sends only the content of the current automation in its update request. The backend takes care of merging it with the rest of the workspace. | TODO : API swagger link |
| Workspaces | Reuse an intention between workspaces | Share an app that configures an **NLU Builder** sub-app with intentions. Install this app in a workspace configuring the **NLU Switcher** app, which listens for **NLU Builder** events to receive intentions. | TODO : Detailed explanation link |
| Workspaces | Configure your workspace and its apps | Apps configurations and constants | [Config & Constants](https://gitlab.com/prisme.ai/dsul/-/blob/main/specifications/WIP%20Configuration%20and%20Constants.md) |
| Workspaces/Runtime | Emit an event | Keyword : **emit** | [Basic syntax.md](https://gitlab.com/prisme.ai/dsul/-/blob/main/specifications/Basic%20syntax.md) |
| Runtime | Persistent contexts | **Global** context shared by all sessions in a workspace, user context shared by all sessions of the same user, **session** context preserved throughout each session | TODO : Add a link once implemented. |
| Prisme.ai Messenger | "say \*" responses without a native implementation | One workflow by type of response given by the Prisme.ai Messenger app | [Workflows can directly be called by their names](https://gitlab.com/prisme.ai/dsul/-/blob/main/specifications/Basic%20syntax.md) |
| Conversational Apps | Slot filling | See link | TODO : Add a link to a section detailing the expected behaviour or a DSUL example. |
| Conversational Apps | Say question | See link | TODO : Add a link to a section detailing the expected behaviour or a DSUL example. |

# 
