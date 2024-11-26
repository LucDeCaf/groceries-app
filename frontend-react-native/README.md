# Groceries App React Native Frontend

## Usage

1. Clone the repo

```sh
git clone https://github.com/LucDeCaf/groceries-app.git
```

2. Install packages using [pnpm](https://pnpm.io/)

```sh
cd groceries-app/frontend-react-native
pnpm install
```

3. Configure your local environment

```env
EXPO_PUBLIC_POWERSYNC_URL=https://foo.powersync.journeyapps.com
EXPO_PUBLIC_SUPABASE_URL=https://foo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=foo.bar.baz
```

4. Run using Expo

```sh
npx expo run:ios
```

or

```sh
npx expo run:android
```

## Development

Ensure you format the project using Prettier before submitting a pull request.

```sh
pnpm format
```
