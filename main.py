import discord
import os
from discord.ext import commands, tasks
import datetime

TOKEN = os.environ.get("DISCORD_BOT_TOKEN")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user} (ID: {bot.user.id})")
    print("Bot is ready and online!")
    send_message.start()


# 🔥 المهمة بتاعت الرسالة
@tasks.loop(minutes=1)
async def send_message():
    now = datetime.datetime.now()

    # ⏰ الساعة 9:20 بالليل
    if now.hour == 21 and now.minute == 50:
        channel = bot.get_channel(1342503298455961700)
        if channel:
            await channel.send("بافلي فاكر نفسه بني ادم 😂")


@bot.command(name="hello")
async def hello(ctx):
    await ctx.send(f"Hello, {ctx.author.mention}! 👋")


@bot.command(name="ping")
async def ping(ctx):
    latency = round(bot.latency * 1000)
    await ctx.send(f"Pong! Latency: {latency}ms")


@bot.command(name="info")
async def info(ctx):
    embed = discord.Embed(
        title="Bot Info",
        description="A simple Discord bot built with discord.py",
        color=discord.Color.blue(),
    )
    embed.add_field(name="Prefix", value="!", inline=True)
    embed.add_field(name="Commands", value="hello, ping, info, roll, say", inline=True)
    embed.set_footer(text=f"Requested by {ctx.author}")
    await ctx.send(embed=embed)


@bot.command(name="roll")
async def roll(ctx, sides: int = 6):
    import random
    result = random.randint(1, sides)
    await ctx.send(f"🎲 You rolled a **{result}** (d{sides})")


@bot.command(name="say")
async def say(ctx, *, message: str):
    await ctx.message.delete()
    await ctx.send(message)


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        await ctx.send("Unknown command. Use `!info` to see available commands.")
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"Missing argument: {error.param.name}")
    else:
        await ctx.send(f"An error occurred: {str(error)}")


if not TOKEN:
    print("ERROR: DISCORD_BOT_TOKEN environment variable is not set.")
else:
    bot.run(TOKEN)
