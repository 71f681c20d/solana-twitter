import * as anchor from "@coral-xyz/anchor";
import { AnchorError } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
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
      .sendTweet('solana', 'People don\'t like to use slow software. #solana')
      .accounts({
        tweet: tweet.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc()

    // After sending the transaction to the blockchain.// Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
    // console.log(tweetAccount);

    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'solana');
    assert.equal(tweetAccount.content, 'People don\'t like to use slow software. #solana');
    assert.ok(tweetAccount.timestamp);
  });

  it('can send a new tweet without a topic', async () => {
    // Call the "SendTweet" instruction.
    const tweet = anchor.web3.Keypair.generate();
    await program.methods
      .sendTweet('', 'coffee?')
      .accounts({
        tweet: tweet.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc()

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.topic, '');
    assert.equal(tweetAccount.content, 'coffee?');
    assert.ok(tweetAccount.timestamp);
  });

  it('can send a new tweet from a different author', async () => {
    // Generate another user and airdrop them some SOL.
    const otherUser = anchor.web3.Keypair.generate();
    // Airdrop some lamports to the other user to pay rent for the tweet
    const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(signature);

    // Call the "SendTweet" instruction on behalf of this other user.
    const tweet = anchor.web3.Keypair.generate();
    await program.methods
      .sendTweet('Solana is fast', 'Published from another author')
      .accounts({
        tweet: tweet.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([otherUser, tweet])
      .rpc()

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'Solana is fast');
    assert.equal(tweetAccount.content, 'Published from another author');
    assert.ok(tweetAccount.timestamp);
  });

  it('cannot provide a topic with more than 50 characters', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const topicWith51Chars = 'x'.repeat(51); // 51 characters long
    try {
      await program.methods
        .sendTweet(topicWith51Chars, 'some tweet body')
        .accounts({
          tweet: tweet.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweet])
        .rpc()
    } catch (_err) {
      assert.isTrue(_err instanceof AnchorError);
      const err: AnchorError = _err;
      const errMsg = 'The provided topic should be 50 characters long maximum.';
      assert.strictEqual(err.error.errorMessage, errMsg);
      assert.strictEqual(err.error.errorCode.number, 6000);
      return;
    }
    assert.fail('The instruction should have failed with a 51-character topic.');
  });

  it('cannot provide content with more than 280 characters', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const contentWith281Chars = 'x'.repeat(281); // 281 characters long
    try {
      await program.methods
        .sendTweet('Some topic', contentWith281Chars)
        .accounts({
          tweet: tweet.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweet])
        .rpc()
    } catch (_err) {
      assert.isTrue(_err instanceof AnchorError);
      const err: AnchorError = _err;
      const errMsg = 'The provided content should be 280 characters long maximum.';
      assert.strictEqual(err.error.errorMessage, errMsg);
      assert.strictEqual(err.error.errorCode.number, 6001);
      return;
    }
    assert.fail('The instruction should have failed with a 281-character content.');
  });

  it('can fetch all tweets', async () => {
    // The previous 5 tests should have created 3 tweet accounts
    const tweetAccounts = await program.account.tweet.all(); // Fetch all accounts sharing the public key of the program account
    assert.equal(tweetAccounts.length, 3); // verify all the accounts were created
  });

  it('can filter tweets by author', async () => {
    const authorPublicKey = program.provider.wallet.publicKey
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset: 8, // Discriminator ends at 8 bytes in the account data
          bytes: authorPublicKey.toBase58(), // The author's public key
        }
      }
    ]);
    // At this point, the program account should have 2 tweet accounts created by the same author; 1 was created from a different author
    assert.equal(tweetAccounts.length, 2);
    // verify the tweets came from the correct author
    assert.ok(tweetAccounts.every(tweetAccount => {
      return tweetAccount.account.author.toBase58() === authorPublicKey.toBase58()
    }))
  });

  it('can filter tweets by topics', async () => {
    const tweetAccounts = await program.account.tweet.all([
      {
        memcmp: {
          offset: 8 + // Discriminator.
            32 + // Author public key.
            8 + // Timestamp.
            4, // Topic string prefix.
          bytes: bs58.encode(Buffer.from('Solana is fast')), // encode string for memcmp
        }
      }
    ]);

    assert.equal(tweetAccounts.length, 2);
    assert.ok(tweetAccounts.every(tweetAccount => {
      return tweetAccount.account.topic === 'Solana is fast'
    }))
  });

});
