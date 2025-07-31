# Contrast Bot
**A versatile Discord bot built with TypeScript and Discord.js**

> [!IMPORTANT]
> ContrastBot is currently offline due to maintenance issues and bugs. As a high school student with limited time, I'm working through code organization challenges. The project isn't abandoned - if you'd like to help get ContrastBot back online, please contribute bug fixes and improvements via pull request to the dev branch.

> [!TIP]
> **Branch Structure**
> - **Main** - Production release branch
> - **Beta** - Testing branch (merges to main when stable)  
> - **Dev** - Development branch (submit all PRs here please)

```mermaid
gitGraph
    commit id: "initial commit"
    branch beta
    branch dev
    checkout dev
    commit id: "feature-1"
    commit id: "feature-2"
    commit id: "feature-3"
    checkout beta
    merge dev id: "dev to beta"
    checkout dev
    commit id: "feature-4"
    checkout beta
    merge dev id: "dev to beta-2"
    checkout main
    merge beta id: "beta to main"
    checkout dev
    commit id: "and so on..."
```
