# Maestro E2E Flows

Mobile equivalent of the web Playwright suite. Each `.yaml` file is a single
user journey that drives the iOS Simulator (or Android Emulator / a real
device) against a built copy of the app.

## One-time setup

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify
maestro --version
```

## Running flows

The app must already be installed on a booted simulator/device. Use a normal
debug build:

```bash
npx expo run:ios   # builds + boots the simulator + installs the app
```

Then in another terminal:

```bash
npm run e2e          # all flows
npm run e2e:smoke    # tagged "smoke" only
npm run e2e:eu       # single flow
```

## Flows

| File | What it covers |
|------|----------------|
| `calculator-eu.yaml` | EU import (Germany → Madrid) — golden path, asserts result screen renders. |
| `calculator-noneu.yaml` | Non-EU import (USA → Madrid) — checks transport/insurance fields and that duty + VAT line items appear on the result. |
| `language-switch.yaml` | LanguageSwitcher rerenders all copy when EN → ES → FR → EN. |
| `daily-limit-gate.yaml` | Free-tier 5/day limit triggers the limit-reached alert on the 6th calculate. |

## How elements are targeted

- **Inputs and buttons** — by `testID`. Stable across translations.
  - `price-input`, `transport-input`, `insurance-input`, `co2-input`
  - `calculate-button`, `reset-button`
  - `vehicle-manual-toggle`, `manual-value-input`, `manual-value-confirm`
  - `result-total`
- **Static labels / chips / pills** — by visible text. Flows force English
  via `tapOn: "EN"` at the start so text matchers don't break in other locales.

## Tips

- Open Maestro Studio for visual debugging:
  `maestro studio`
- Record a flow by interacting with the app:
  `maestro record .maestro/new-flow.yaml`
- Run with verbose logs when something is flaky:
  `maestro test --verbose .maestro/calculator-eu.yaml`

## Caveats

- The `daily-limit-gate.yaml` flow assumes a non-Pro RevenueCat state. If
  you've sandbox-purchased Pro on the simulator, uninstall the app first:
  `xcrun simctl uninstall booted com.gio-khimsho.ImportEspana`
- AdMob banners do not render in the iOS Simulator, so flows do not assert
  ad placements.
