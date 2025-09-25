require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('回顶')
        .setDescription('显示回到顶部按钮')
        .toJSON()
];

client.once('clientReady', async () => {
    console.log(`✅ Bot已登录: ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log('🔄 开始注册斜杠命令...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ 斜杠命令注册成功!');
    } catch (error) {
        console.error('❌ 注册斜杠命令失败:', error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.replied || interaction.deferred) {
            return;
        }
        if (interaction.isCommand()) {
            const { commandName } = interaction;

            if (commandName === '回顶') {
                await interaction.deferReply({ flags: 64 });

                const channel = interaction.channel;
                let jumpUrl = null;
                let buttonLabel = '📌 回到顶部';

                try {
                    if (channel.isThread()) {
                        // 对于帖子/线程，获取起始消息
                        const starterMessage = await channel.fetchStarterMessage();
                        if (starterMessage) {
                            jumpUrl = `https://discord.com/channels/${interaction.guildId}/${channel.id}/${starterMessage.id}`;
                            buttonLabel = '📌 回到帖子顶部';
                        }
                    } else {
                        // 对于普通频道，尝试获取最早的消息
                        const messages = await channel.messages.fetch({
                            limit: 1,
                            after: '0'
                        });

                        if (messages.size > 0) {
                            const firstMessage = messages.first();
                            jumpUrl = `https://discord.com/channels/${interaction.guildId}/${channel.id}/${firstMessage.id}`;
                        }
                    }
                } catch (error) {
                    console.error('获取跳转链接失败:', error);
                }

                if (jumpUrl) {
                    // 使用链接按钮，用户点击后直接跳转
                    const topButton = new ButtonBuilder()
                        .setLabel(buttonLabel)
                        .setStyle(ButtonStyle.Link)
                        .setURL(jumpUrl)
                        .setEmoji('⬆️');

                    const row = new ActionRowBuilder()
                        .addComponents(topButton);

                    await interaction.editReply({
                        content: '点击按钮直接跳转到顶部 ⬆️',
                        components: [row]
                    });

                    console.log(`📝 用户 ${interaction.user.tag} 使用了 /回顶 命令 (链接按钮)`);
                } else {
                    // 如果无法获取跳转链接，提供手动指南
                    const manualButton = new ButtonBuilder()
                        .setCustomId('manual_top_guide')
                        .setLabel('📖 查看回顶指南')
                        .setStyle(ButtonStyle.Secondary);

                    const row = new ActionRowBuilder()
                        .addComponents(manualButton);

                    const channelType = channel.isThread() ? '帖子' : '频道';

                    await interaction.editReply({
                        content: `⚠️ 无法自动生成跳转链接\n\n**手动回到${channelType}顶部:**\n⬆️ 向上滑动屏幕\n🔄 或下拉刷新${channelType}`,
                        components: [row]
                    });

                    console.log(`📝 用户 ${interaction.user.tag} 使用了 /回顶 命令 (手动指南)`);
                }
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId === 'manual_top_guide') {
                const channel = interaction.channel;
                const channelType = channel.isThread() ? '帖子' : '频道';
                const channelName = channel.name;

                await interaction.reply({
                    content: `📱 **${channelType}导航指南:**
⬆️ 向上滑动屏幕回到顶部
🔄 下拉刷新${channelType}
📍 当前${channelType}: ${channelName}
💡 提示: 快速双击顶部状态栏也可回到顶部`,
                    flags: 64
                });

                console.log(`🖱️ 用户 ${interaction.user.tag} 查看了回顶指南`);
            }
        }
    } catch (error) {
        console.error('❌ 处理交互时发生错误:', error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '⚠️ 处理请求时发生错误，请稍后重试。',
                flags: 64
            });
        }
    }
});

client.on('error', error => {
    console.error('❌ Discord客户端错误:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ 未处理的Promise拒绝:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ 错误: 请设置 DISCORD_TOKEN 环境变量');
    process.exit(1);
}

client.login(token);
