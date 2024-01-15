import React, { useState } from 'react';
import { useAccount } from 'wagmi'
import ConnectButton from './ConnectButton';
import InitiateClaim from './InitiateClaim';

interface AddressCardProps {
    ethereum_address: string;
    listOfAddresses: string[];
}

export default function AddressCard({ ethereum_address, listOfAddresses }: AddressCardProps) {
    const [open, setOpen] = useState<boolean>(false);
    const { address } = useAccount();

    return (
        <div className="card w-full bg-primary text-primary-content flex flex-col">
            <div className="card w-full bg-primary text-primary-content">
                <div className="card-body">
                    <h2 className="card-title mb-4">Cookie Jar Created!</h2>
                    <div className="mb-2">
                        <span className="font-bold">Ethereum Address:</span><p>{ethereum_address}</p>
                    </div>
                    <div>
                        <p className="font-bold">Addresses that can take from the jar:</p>
                        {listOfAddresses.map((address, index) => (
                            <li key={index}>
                                {address.toLowerCase()}
                            </li>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full pr-5 ml-auto mb-4">
                {address ? <InitiateClaim open={open} setOpen={setOpen} /> : <ConnectButton />}
            </div>
        </div>
    );
};