# solana-twitter
Twitter clone on solana

## About the App
This repo contains:
- Backend Anchor application with unit tests, preconfigured for localhost solana validator
- Frontend VueJS app with compatibility with Phantom and Solflare wallets

## Running Locally
- Start a local solana cluster with `$ cd solana-twitter && solana-test-validator --reset`
- (Optional) generate some tweets by running the unit tests:
    - `$ anchor build`
    - `$ anchor deploy`
    - `$ anchor run test`
- Airdrop some SOL to your local wallet with `$ solana airdrop 100 <pubkey> --url localhost`
- Run Vue frontend app with `$ cd app && yarn serve`
- Navigate to the local endpoint, connect your wallet, and enjoy!

### Notes
- The wallet must already be created in your browser wallet in order to connect
- Posting requires signing a transaction. You will need to airdrop in order to pay for the transaction
- The anchor unit tests will create a few tweets as part of the test logic. If you don't want to have mock data in your local cluster, run `$ anchor test`
- You will need to have all prerequisite dependencies installed in order to run the app

