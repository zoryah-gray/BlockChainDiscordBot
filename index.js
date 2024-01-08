const config = require('./config.json')
const { Client, GatewayIntentBits } = require('discord.js')
const { ethers, JsonRpcProvider } = require('ethers')
const provider = new JsonRpcProvider(config.rpc)

const ERC20ABI = require('./ETC20ABI.json')
const USDC = new ethers.Contract("", ERC20ABI, provider)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
})
client.login(config.token)

client.on('ready', async () => {
    console.log('bot started')
})

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return
    console.log(`Message from ${msg.author.username}: ${msg.content}`)
    const content = msg.content.toLowerCase()

    if (content == '!ping') {
        msg.channel.send('pong!')
    } else if (content == '!balance') {
        try {
            const wei = await provider.getBalance(config.owner)
            const eth = Number(ethers.formatUnits(wei))
            msg.channel.send(`you have ${eth} ETH`)
        } catch (error) {
            console.error(error);
            msg.channel.send('something went wrong');
        }
        
    } else if (content == '!usdc') {
        try{
            // const ERC20ABI = require('./ETC20ABI.json')
            // const USDC = new ethers.Contract("", ERC20ABI, provider)
            output = Number(await USDC.balanceOf(config.owner))
            msg.channel.send(`you have ${output / 1e6} USDC`)
        } catch (error){
            console.error(error);
            msg.channel.send('something went wrong')
        }
    } else if (content == '!send') {
        const args = content.split(" ")
        const to = args[1]
        const amount = args[2]
        try{
            const wallet = new ethers.Wallet(config.key, provider)
            const tx = await USDC.connect(wallet).transfer(to, amount * 1e6)
            msg.channel.send('pending...')
            await tx.wait()
            msg.channel.send(`you successfully send ${amount} USDC to ${to} https://goerli.etherscan.io/tx/${tx.hash}`)
            
        } catch (error){
            console.error(error);
            msg.channel.send('something went wrong')
        }
    }

})