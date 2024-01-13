import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Identity } from "@dfinity/agent";
import { useState } from "react";

export default function IIButton() {

    const [newIdentity, setNewIdentity] = useState<Identity | undefined>();

    async function InternetIdentityLogin(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
    
        let authClient = await AuthClient.create();
        await new Promise<void>((resolve) => {
            authClient.login({
                identityProvider:
                    process.env.NEXT_PUBLIC_DFX_NETWORK === "ic"
                        ? "https://identity.ic0.app/#authorize"
                        : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/#authorize`,

            });
        });
        const identity = authClient.getIdentity();
        if (identity) {
            setNewIdentity(identity);
        }
        const agent = new HttpAgent({ identity });
        return agent;
    }
    

    return (
        <div className="flex w-1/2 mb-4">
            {!newIdentity ? <button onClick={async (e) => { await InternetIdentityLogin(e) }} className="btn btn-primary">Login to Internet Identity</button> :
                <span className="badge">{newIdentity.toString()}</span>}
        </div>
    );
};