# Discord 回顶按钮 Bot

一个简单的Discord Bot，用户可以通过 `/回顶` 命令获取回到频道/帖子/子区顶部的按钮。

## 功能特性

- 🎯 **斜杠命令**: 使用 `/回顶` 命令触发
- 👁️ **私密回复**: 按钮只有命令发送者能看到
- 📱 **全面支持**: 支持频道、帖子、子区等所有类型
- 🚀 **一键部署**: 支持 Zeabur 一键部署
- 🔒 **安全**: Token 通过环境变量管理

## Zeabur 部署

1. Fork 这个仓库
2. 访问 [Zeabur](https://zeabur.com)
3. 连接 GitHub 并选择这个仓库
4. 设置环境变量: `DISCORD_TOKEN=你的bot_token`

## Discord Bot 设置

1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)
2. 创建新应用并添加 Bot
3. 复制 Bot Token
4. 在 OAuth2 > URL Generator 中选择:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`
5. 邀请 Bot 到服务器

## 本地测试

```bash
npm install
export DISCORD_TOKEN="你的token"
npm start
```

## 使用方法

在任何频道中输入 `/回顶` 即可获得回到顶部按钮！

Created by [skaria1267](https://github.com/skaria1267)
