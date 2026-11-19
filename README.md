# City Picker

Compare 17 cities for remote work. Enter an annual salary in USD and drag the eight priorities into your preferred order. The browser remembers your salary, priority order and hidden cities.

## How the estimates work

The city records were committed on November 9, 2025. Their monthly costs cover two adults and a small dog. Click a savings grade to see the original note and source links.

Each city has its own assumed monthly take-home in the original $100,000 salary scenario. Entering half that salary halves the assumed take-home in every city. The app rounds monthly take-home to the nearest dollar, subtracts that city’s monthly costs, and multiplies by 12. The result is an estimated annual surplus or shortfall. These are historical scenario assumptions. For example, Austin’s reference take-home is $12,000 per month.

The smallest annual balance across the 17 cities gets a savings grade of 1 and the largest gets 10. Grades between them increase linearly with the dollar balance and are rounded to one decimal. If every balance is equal the common grade is 5.5. At zero income a better grade means a smaller shortfall. Hidden cities still count in this comparison.

Each priority weighs twice as much as the next (128, 64, 32, 16, 8, 4, 2, 1 shares out of 255). The weighted average of the eight grades is multiplied by 10 for the overall score out of 100. Tied scores keep the dataset order. Hidden cities appear at the bottom.

## Run and check

Use Node.js 20.9 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:3000/. To exercise the salary field, drag ordering, source notes, shortfalls and reloads in a fresh browser, run the following commands.

```sh
npx playwright install chromium
npm test
```

The tests start a local server. Set `CITY_PICKER_URL` to a running site's full entry URL, including its trailing slash, to test a deployed copy. `npm run lint` and `npm run build` check the source and production build.
