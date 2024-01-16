import { backend } from '@/declarations/backend';
import React, { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import Web3 from 'web3'

interface ClaimButtonProps {
    githubLink: string,
}

export default function ClaimButton({ githubLink }: ClaimButtonProps) {
    const [nonce, setNonce] = useState<string | undefined>();

    const { address } = useAccount();

    function getCurrentDateTime(): string {
        const now = new Date();

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(now);

        return formattedDate.replace(/\//g, '-');
    }

    const currentDateTime = getCurrentDateTime();

    useEffect(() => {
        async function getNonce() {
            if (!address) return;
            const web3 = new Web3('https://rpc.ankr.com/eth_sepolia');
            const nonce = await web3.eth.getTransactionCount(address)
            if (nonce) {
                setNonce(nonce.toString());
            }
        }
        getNonce();
    }, [address])


    const message = `localhost:4943 wants you to sign in with your Ethereum account:
    ${address}
    
    Cookie Jar
    
    URI: localhost:4943
    Version: 1
    Chain ID: 11155111
    Nonce: ${nonce}
    Issued At: ${currentDateTime}`;

    const { signMessageAsync } = useSignMessage({
        message
    })


    if (!address) return;

    async function claim() {
        if (!message || !address || !nonce) return;
        const signature = await signMessageAsync();
        const repoResult = await extractOwnerAndRepo(githubLink);
        if (repoResult) {
            const result = await backend.verify_signature_and_repo(repoResult?.owner, repoResult?.repoName, address, message, signature);
            console.log('result', result)
            return result;
        }
    }

    return (
        <button className="btn btn-info px-16" onClick={() => claim()}>Claim from Cookie Jar</button>
    );
};

function extractOwnerAndRepo(githubLink: string): { owner: string; repoName: string } | null {
    const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
    const match = githubLink.match(regex);

    if (!match) return null;

    const [_, owner, repoName] = match;
    return { owner, repoName };
}