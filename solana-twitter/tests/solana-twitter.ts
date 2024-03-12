import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

describe("solana-twitter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  // Initialize solana-twitter program
  const program = anchor.workspace.SolanaTwitter;

  it('can send a new tweet', async () => {
    // Before sending the transaction to the blockchain.
    const tweet = anchor.web3.Keypair.generate();

    await program.methods
      .sendTweet('Solana is fast', 'People don\'t like to use slow software. #solana')
      .accounts({
        tweet: tweet.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc()

    // After sending the transaction to the blockchain.// Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    console.log(tweetAccount);

    assert.ok(tweetAccount.author.equals(program.provider.publicKey));
  });

});
