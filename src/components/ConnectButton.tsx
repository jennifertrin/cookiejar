import React from 'react';

export default function ConnectButton() {
    return (
        <div className="flex mb-4">
            <w3m-button balance="show" size="md" label="Connect Wallet" loadingLabel="Connecting..." />
        </div>
    )
}
