import discord
import requests
import re

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.channel.name == 'ktor_tests':
        print(f'Forwarding message from {message.channel.name}: {message.content}')

        match = re.match(r"Category: (.+)", message.content.strip(), re.IGNORECASE)
        if match:
            category_name = match.group(1).strip()
            category_endpoint = f'http://127.0.0.1:8080/categories/{category_name}'
            response = requests.get(category_endpoint)
            if response.status_code == 200:
                category_details = response.json()
                await message.channel.send(f'Details for {category_name}: {category_details}')
            else:
                await message.channel.send(f'Failed to fetch details for category: {category_name}')
        elif 'categories' in message.content.lower():
            ktor_categories_endpoint = 'http://127.0.0.1:8080/categories'
            response = requests.get(ktor_categories_endpoint)
            if response.status_code == 200:
                categories = response.json()
                category_names = ', '.join([cat['name'] for cat in categories])
                await message.channel.send(f'Available categories: {category_names}')
            else:
                await message.channel.send('Failed to fetch categories from the server.')
        else:
            ktor_endpoint = 'http://127.0.0.1:8080/message'
            requests.post(ktor_endpoint, json={'content': message.content})

#client.run('')
