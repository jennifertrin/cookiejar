import React from 'react';

interface AddressCardProps {
    ethereum_address: string;
    listOfAddresses: string[];
}

export default function AddressCard({ ethereum_address, listOfAddresses }: AddressCardProps) {
    return (
        <div className="card w-full bg-primary text-primary-content">
            <div className="card w-1/2 bg-primary text-primary-content">
                <div className="card-body">
                    <h2 className="card-title">Cookie Jar Created!</h2>
                    <p>Ethereum Address: {ethereum_address}</p>
                    <div>
                        <p>Addresses that can take from the jar:</p>
                        {listOfAddresses.map((address, index) => (
                            <div key={index}>
                                <p className="card-body">{address}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};