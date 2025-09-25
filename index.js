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
                const topButton = new ButtonBuilder()
                    .setCustomId('go_to_top')
                    .setLabel('📌 回到顶部')
                    .setStyle(ButtonStyle.Primary);
                
                const row = new ActionRowBuilder()
                    .addComponents(topButton);
                
                await interaction.reply({
                    content: '点击下方按钮回到顶部 ⬆️',
                    components: [row],
                    flags: 64
                });
                
                console.log(`📝 用户 ${interaction.user.tag} 使用了 /回顶 命令`);
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId === 'go_to_top') {
                const channel = interaction.channel;
                
                try {
                    let jumpContent = '';
                    
                    if (channel.isThread()) {
                        // 对于帖子/线程，获取起始消息
                        const starterMessage = await channel.fetchStarterMessage();
                        if (starterMessage) {
                            const jumpUrl = `https://discord.com/channels/${interaction.guildId}/${channel.id}/${starterMessage.id}`;
                            jumpContent = `🧵 **帖子顶部直达:**\n🔗 [点击跳转到帖子开头](${jumpUrl})`;
                        } else {
                            jumpContent = `🧵 **帖子导航:**\n⬆️ 向上滑动回到帖子开头\n📍 当前帖子: ${channel.name}`;
                        }
                    } else {
                        // 对于普通频道，尝试获取最早的消息
                        try {
                            const messages = await channel.messages.fetch({ 
                                limit: 1,
                                after: '0'
                            });
                            
                            if (messages.size > 0) {
                                const firstMessage = messages.first();
                                const jumpUrl = `https://discord.com/channels/${interaction.guildId}/${channel.id}/${firstMessage.id}`;
                                jumpContent = `📍 **频道顶部直达:**\n🔗 [点击跳转到最早消息](${jumpUrl})\n⬆️ 或向上滑动屏幕`;
                            } else {
                                jumpContent = `📍 **频道导航:**\n⬆️ 向上滑动回到频道顶部\n🔄 或下拉刷新频道\n📋 频道: #${channel.name}`;
                            }
                        } catch (fetchError) {
                            jumpContent = `📍 **回到顶部指南:**\n⬆️ 向上滑动屏幕回到顶部\n🔄 或下拉刷新频道\n📋 频道: #${channel.name}`;
                        }
                    }
                    
                    await interaction.reply({
                        content: jumpContent,
                        flags: 64
                    });
                    
                    console.log(`🖱️ 用户 ${interaction.user.tag} 点击了回到顶部按钮`);
                    
                } catch (error) {
                    console.error('处理跳转失败:', error);
                    
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
                }
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
