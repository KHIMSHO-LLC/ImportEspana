# ImportEspana — Mobile App

## Stack
- **Framework:** Expo ~54 / React Native 0.81.5 / React 19
- **Language:** TypeScript (strict)
- **Router:** expo-router v6 (file-based)
- **State:** useState + React Context + AsyncStorage
- **Icons:** lucide-react-native
- **Monetization:** react-native-purchases (RevenueCat) + react-native-google-mobile-ads
- **PDF:** expo-print + expo-sharing
- **I18n:** expo-localization (auto-detect) + custom LanguageContext
- **New Architecture:** enabled
- **React Compiler:** disabled

## Build & Run
```bash
npx expo start              # dev server
npx expo run:ios            # local iOS build
npx expo run:android        # local Android build
eas build --profile production  # store build
eas update --channel production # OTA update
```

## App Screens (app/)
| Screen | File | Purpose |
|--------|------|---------|
| Calculator | `index.tsx` (937 lines) | Main input form — EU/NonEU, country, price, CO2, dates |
| Results | `result.tsx` (545 lines) | Breakdown of taxes/fees, PDF download, rewarded ads |
| History | `history.tsx` (464 lines) | Past calculations from AsyncStorage |
| Paywall | `paywall.tsx` | RevenueCat subscription modal |
| Root Layout | `_layout.tsx` | Stack nav, header logo, Pro badge, providers |

## Context Providers
- `LanguageContext`: en/es/ru/de/fr, stored in AsyncStorage (@app_language)
- `RevenueCatContext`: Pro subscription status, purchase/restore, entitlement: "pro"

## Key Hooks
- `useCalculationLimit`: 5 free calcs/day, resets daily, stored in AsyncStorage (daily_calculations)

## Key Utilities
- `utils/taxCalculator.ts`: Core business logic — depreciation table, registration tax (IEDMT), ITP, NonEU duty (10%) + VAT (21%), fees
- `utils/generatePdf.ts`: Generates + shares PDF via expo-print/expo-sharing

## Data Storage (AsyncStorage keys)
| Key | Content |
|-----|---------|
| @app_language | Selected language |
| daily_calculations | `{ date, count }` — resets each day |
| @import_history | Array of up to 50 CalculationResult objects |

## Constants
- `Colors.ts`: brand blue #0066FF, gold #FFD700
- `ItpRates.ts`: 19 Spanish regions, 3%–8%
- `RevenueCat.ts`: API key, entitlement ID, package IDs
- `Ads.ts`: Google Mobile Ads unit IDs
- `translations.ts`: 5-language strings

## Types (types/index.ts)
- `Country`: Germany | France | Italy | Belgium | Netherlands | USA | UAE | Japan | Korea
- `ImportType`: EU | NonEU
- `CalculationInput` / `CalculationResult`: shared shape with web

## ⚠️ Live App Rules
- App is live on App Store (v1.1.0, build 5) — breaking changes require new EAS build
- `eas.json` uses `autoIncrement: true` on production channel
- OTA updates via Expo Updates (project: 3a93fcfd-b8ed-4b00-a6e1-2641bfa41930)
- RevenueCat API key in constants/RevenueCat.ts is the **test key** — verify before production use

## Future: Supabase
When added: replace AsyncStorage history with Supabase, add auth, sync data across devices. Keep `taxCalculator.ts` pure — no network calls inside it.
