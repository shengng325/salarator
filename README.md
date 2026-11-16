# Singapore / Malaysia salary comparison

Open `index.html` in your browser. It is a self-contained page with no dependencies, backend, API keys, tracking, or build step.

All value inputs accept arithmetic using `+`, `-`, `*`, `/` and parentheses, for example `(8000 * 13) / 12`. Expressions calculate live and remain saved after refresh.

Enter either gross monthly salary in SGD or MYR using its currency selector. Values are converted to local currency before calculating tax and contributions. All inputs and currency selections are saved locally for your next visit. Switch Malaysia between resident progressive income tax and the approved Returning Expert Programme 15% rate. Results include after-tax salary, employee contributions, take-home pay, employer contributions, and total compensation. Switch results between monthly and annual, and expand the assumptions to edit the illustrative exchange rate.

## Assumptions

Singapore always includes CPF: full rates, age 55 or below, using the 2026 monthly ordinary-wage ceiling. Malaysia assumes a Malaysian citizen below 60. Malaysia EPF contributions are percentage estimates rather than exact statutory contribution-table amounts. Malaysia tax uses the published YA 2025 schedule; Singapore uses resident rates from YA 2024 onward. Both include the basic reliefs documented on the page; extra annual reliefs can be entered separately. REP is calculated on chargeable income and requires approval. Bonuses, SOCSO, EIS and other payroll deductions are excluded.

Total pay after tax incl CPF/EPF means take-home pay plus employee and employer retirement contributions (gross minus income tax plus employer contribution). Employee contributions are already included in gross salary and must not be counted twice.

## GitHub Pages

1. Push `index.html` to the root of your GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select your branch and **/ (root)**, then save.
4. Visit the URL GitHub provides when deployment finishes.

## Calculation checks

Run `node calculator.test.cjs` and `node calculator-ui.test.cjs` (Node.js, no packages required).

Official calculation sources are linked in the page. Estimates are for comparison, not payroll or tax filing.
