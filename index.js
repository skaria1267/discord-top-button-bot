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

client.once('ready', async () => {
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
                    ephemeral: true
                });
                
                console.log(`📝 用户 ${interaction.user.tag} 使用了 /回顶 命令`);
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId === 'go_to_top') {
                const channel = interaction.channel;
                let jumpUrl = '';
                
                if (channel.isThread()) {
                    jumpUrl = `https://discord.com/channels/${interaction.guildId}/${channel.id}`;
                } else {
                    jumpUrl = `https://discord.com/channels/${interaction.guildId}/${channel.id}`;
                }
                
                await interaction.reply({
                    content: `🔗 [点击这里回到顶部](${jumpUrl})`,
                    ephemeral: true
                });
                
                console.log(`🖱️ 用户 ${interaction.user.tag} 点击了回到顶部按钮`);
            }
        }
    } catch (error) {
        console.error('❌ 处理交互时发生错误:', error);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '⚠️ 处理请求时发生错误，请稍后重试。',
                ephemeral: true
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
