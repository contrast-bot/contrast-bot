import { SlashCommandBuilder, EmbedBuilder, type CommandInteraction } from "discord.js"

export const data = new SlashCommandBuilder().setName("donate").setDescription("Support the Contrast Bot developers")

export async function execute(interaction: CommandInteraction) {
  const donateUrl = process.env.DONATE_URL || "https://ko-fi.com/pilot2254"

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("💖 Support Contrast Bot")
    .setDescription(
      "Help us keep Contrast Bot running and support future development!\n\n" +
        "Your donations help us:\n" +
        "• Keep the bot online 24/7\n" +
        "• Add new features and games\n" +
        "• Fix bugs and improve performance\n" +
        "• Cover hosting and development costs\n\n" +
        "Every donation, no matter how small, is greatly appreciated! ❤️",
    )
    .addFields(
      { name: "🔗 Donation Link", value: `[Click here to donate](${donateUrl})`, inline: false },
      { name: "💝 Thank You!", value: "Your support means the world to us!", inline: false },
    )
    .setFooter({ text: "Contrast Bot • Made with ❤️" })
    .setTimestamp()

  await interaction.reply({ embeds: [embed], flags: 64 })
}
