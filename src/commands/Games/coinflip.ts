import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { botInfo } from "../../utils/bot-info"
import { placeBet, processWin, GAME_TYPES } from "../../utils/gambling-manager"
import { getOrCreateUserEconomy } from "../../utils/economy-manager"

// Slash command definition
export const data = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("Flips a coin - with optional betting!")
  .addStringOption((option) =>
    option
      .setName("choice")
      .setDescription("Your prediction")
      .setRequired(false)
      .addChoices({ name: "🪙 Heads", value: "heads" }, { name: "💿 Tails", value: "tails" }),
  )
  .addIntegerOption((option) =>
    option
      .setName("bet")
      .setDescription("Amount to bet (optional)")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(1000000),
  )

// Slash command execution
export async function execute(interaction: ChatInputCommandInteraction) {
  const userChoice = interaction.options.getString("choice")
  const betAmount = interaction.options.getInteger("bet")

  // Generate result
  const result = Math.random() < 0.5 ? "heads" : "tails"
  const resultEmoji = result === "heads" ? "🪙" : "💿"
  const resultText = result === "heads" ? "Heads" : "Tails"

  // Determine if user won (only if they made a prediction)
  const isWin = userChoice ? userChoice === result : null

  try {
    // Handle betting if specified
    let isBetting = false
    if (betAmount) {
      if (!userChoice) {
        return interaction.reply({
          content: "❌ You must choose heads or tails when betting!",
          ephemeral: true,
        })
      }

      const betResult = await placeBet(interaction.user.id, interaction.user.username, betAmount, GAME_TYPES.COINFLIP)

      if (!betResult.success) {
        return interaction.reply({
          content: `❌ ${betResult.message}`,
          ephemeral: true,
        })
      }
      isBetting = true
    }

    // Calculate winnings (2x multiplier for coinflip wins)
    let winnings = 0
    if (isBetting && betAmount && isWin) {
      winnings = betAmount * 2
    }

    // Process winnings if betting and won
    if (isBetting && betAmount && isWin) {
      await processWin(interaction.user.id, interaction.user.username, betAmount, winnings, GAME_TYPES.COINFLIP)
    }

    // Get updated balance
    const economy = await getOrCreateUserEconomy(interaction.user.id, interaction.user.username)

    // Create result embed
    const embed = createCoinflipEmbed(
      interaction.user.username,
      userChoice,
      result,
      resultEmoji,
      resultText,
      isWin,
      isBetting,
      betAmount || 0,
      winnings,
      economy.balance,
    )

    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({
      content: "❌ An error occurred while flipping the coin!",
      ephemeral: true,
    })
  }
}

// Helper function to create coinflip result embed
function createCoinflipEmbed(
  username: string,
  userChoice: string | null,
  result: string,
  resultEmoji: string,
  resultText: string,
  isWin: boolean | null,
  isBetting: boolean,
  betAmount: number,
  winnings: number,
  newBalance: number,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`${resultEmoji} Coin Flip`)
    .setColor(isWin === true ? botInfo.colors.success : isWin === false ? botInfo.colors.error : botInfo.colors.primary)
    .setFooter({ text: `Flipped by ${username}` })
    .setTimestamp()

  if (userChoice) {
    const userEmoji = userChoice === "heads" ? "🪙" : "💿"
    const userText = userChoice === "heads" ? "Heads" : "Tails"

    embed.addFields(
      { name: "🤔 Your Choice", value: `${userEmoji} ${userText}`, inline: true },
      { name: "🎰 Result", value: `${resultEmoji} ${resultText}`, inline: true },
      { name: "📊 Outcome", value: isWin ? "🏆 You Win!" : "❌ You Lose!", inline: true },
    )

    if (isWin) {
      embed.setDescription("🎉 **Correct prediction!** 🎉")
    } else {
      embed.setDescription("❌ **Better luck next time!**")
    }

    // Add betting information if applicable
    if (isBetting) {
      if (isWin) {
        embed.addFields(
          { name: "💰 Bet Amount", value: `${betAmount.toLocaleString()} coins`, inline: true },
          { name: "🎊 Winnings", value: `${winnings.toLocaleString()} coins`, inline: true },
          { name: "📈 Profit", value: `${(winnings - betAmount).toLocaleString()} coins`, inline: true },
        )
      } else {
        embed.addFields({ name: "💸 Lost", value: `${betAmount.toLocaleString()} coins`, inline: true })
      }
      embed.addFields({ name: "💵 New Balance", value: `${newBalance.toLocaleString()} coins`, inline: true })
    } else {
      embed.addFields({
        name: "💡 Tip",
        value: "Add a bet next time to win coins! Correct predictions pay 2x your bet!",
        inline: false,
      })
    }
  } else {
    embed.setDescription(`The coin landed on **${resultText}**!`)
    embed.addFields({
      name: "💡 Tip",
      value: "Choose heads or tails and add a bet to make it more exciting! Correct predictions pay 2x!",
      inline: false,
    })
  }

  return embed
}
