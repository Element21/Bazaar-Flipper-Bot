const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs-extra')
const ObjectsToCsv = require('objects-to-csv');

let profit
let outputArr = new Array();

(async () => {
    await axios.get('https://api.hypixel.net/skyblock/bazaar')
        .then((response) => {
            // console.log(response.data)
            for (let item in response.data.products) {
                if (response.data.products[item].sell_summary[0] !== undefined && response.data.products[item].buy_summary[0] !== undefined) {
                    if (response.data.products[item].buy_summary[0].pricePerUnit - response.data.products[item].sell_summary[0].pricePerUnit > 0) {
                        profit = response.data.products[item].buy_summary[0].pricePerUnit - response.data.products[item].sell_summary[0].pricePerUnit // Sell price minus buy price = total profit per item
                        // console.log(chalk.redBright('FOUND A PROFITABLE FLIP!'))
                        // console.log(chalk.blueBright(`Item: ${item}`))
                        // Buy and sell arrays are switched (who thought that was a good idea)
                        // console.log(chalk.blueBright(`Highest sell price: ${response.data.products[item].buy_summary[0].pricePerUnit}`))
                        // console.log(chalk.blueBright(`Cheapest buy price: ${response.data.products[item].sell_summary[0].pricePerUnit}`))
                        // console.log(chalk.greenBright(`Profit: ${profit}`))
                        // Put that juicy data to the array
                        outputArr.push({ 'name': item, 'sell_price': response.data.products[item].buy_summary[0].pricePerUnit, 'buy_price': response.data.products[item].sell_summary[0].pricePerUnit, 'profit': profit })
                    }
                }
            }
            // Sort by highest profit
            (async () => {
                const csv = new ObjectsToCsv(outputArr.sort((a, b) => (a.profit < b.profit) ? 1 : -1));
                await csv.toDisk('./stonks.csv')
                await fs.writeFileSync('./stonks.txt', JSON.stringify(outputArr.sort((a, b) => (a.profit < b.profit) ? 1 : -1)))
            })();
        })
        .catch((err) => {
            throw err;
        });
})();