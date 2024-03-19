/**
 * Archor workspace Vue Component
 */

import { computed } from 'vue'
import { useAnchorWallet } from 'solana-wallets-vue';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
// import { AnchorProvider } from '@project-serum/anchor';
import idl from '../../../solana-twitter/target/idl/solana_twitter.json';

const programID = new PublicKey(idl.metadata.address);
let workspace = null;

export const useWorkspace = () => workspace;

export const initWorkspace = () => {
    const wallet = useAnchorWallet();
    const connection = new Connection('http://127.0.0.1:8899');
    // Mutate Provider when wallet or connection changes
    const provider = computed(() => new AnchorProvider(connection, wallet.value)); 
    // Mutate Program when provider changes
    const program = computed(() => new Program(idl, programID, provider.value));


    workspace = {
        wallet,
        connection,
        provider,
        program,
    };
}
