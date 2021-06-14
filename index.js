const axios = require('axios')
const fs = require('fs-extra')
const ObjectsToCsv = require('objects-to-csv')
const term = require('terminal-kit').terminal

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
                        // Buy and sell arrays are switched (who thought that was a good idea)
                        // Put that juicy data to the array
                        outputArr.push({ 'name': item, 'sell_price': response.data.products[item].buy_summary[0].pricePerUnit, 'buy_price': response.data.products[item].sell_summary[0].pricePerUnit, 'buy_orders': response.data.products[item].quick_status.buyOrders, 'sell_orders': response.data.products[item].quick_status.sellOrders, 'profit': profit })
                    }
                }
            }
            // Render loop (terminal-kit) + Writeout loop
            (async () => {
                // Sort by highest profit AND highest sell orders
                let sortedArr = outputArr.sort((a, b) => (a.profit < b.profit && a.sell_orders < b.sell_orders && a.buy_orders > b.buy_orders) ? 1 : -1)
                // Make some fancy tables to sort data
                let items = sortedArr.map(x => [x.name, x.sell_price, x.buy_price, x.buy_orders, x.sell_orders, x.profit])
                items.unshift(['Item Name', 'Sell Price', 'Buy Price', 'Buy Orders', 'Sell Orders', 'Profit'])
                term.table(items
                    , {
                        hasBorder: true,
                        contentHasMarkup: true,
                        borderChars: 'lightRounded',
                        fit: true   // Activate all expand/shrink + wordWrap
                    })
                // Write data out to file as backup
                const csv = new ObjectsToCsv(sortedArr)
                await csv.toDisk('./stonks.csv')
                await fs.writeFileSync('./stonks.txt', JSON.stringify(sortedArr))
            })();
        })
        .catch((err) => {
            throw err;
        });
})();
