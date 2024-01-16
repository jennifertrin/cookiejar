import React, { useState } from 'react';
import { backend } from "../declarations/backend"
import AddressCard from './AddressCard';
import LoadingCard from './LoadingCard';
import { ListOfAddresses } from '@/declarations/backend/backend.did';

export default function Form() {
    const [inputValues, setInputValues] = useState<string[]>(['']);
    const [address, setAddress] = useState<string | undefined>();
    const [returnedAddresses, setReturnedAddresses] = useState<string[]>([]);
    const [loadingAddress, setLoadingAddress] = useState<boolean>(false);

    const handleInputChange = (index: number, value: string) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = value;
        setInputValues(newInputValues);
    };

    const handleAddRemoveInput = (index: number, action: 'add' | 'remove') => {
        const newInputValues = [...inputValues];

        if (action === 'add') {
            newInputValues.push('');
        } else if (action === 'remove') {
            newInputValues.splice(index, 1);
        }

        setInputValues(newInputValues);
    };

    const addAddresses = async () => {
        setLoadingAddress(true);
        const list = convertToObjects(inputValues);
        const addressList = await backend.add_addresses(list);
        return addressList;
    }

    const generateAddress = async () => {
        setLoadingAddress(true)
        const address = await backend.ethereum_address();
        if ('Ok' in address) {
            setLoadingAddress(false);
            setAddress(address.Ok.ethereum_address);
        }
        return;
    }

    const createJar = async () => {
        await addAddresses();
        await generateAddress();
        await getAddresses();
    }

    const getAddresses = async () => {
        const addressesSaved = await backend.get_addresses();
        const arrayOfAddresses = addressesSaved.map(obj => obj.ethereum_address);
        if (arrayOfAddresses) {
            setReturnedAddresses(arrayOfAddresses);
        }
        return arrayOfAddresses;
    }

    return (
        <div className="w-1/2 mx-auto">
            <div className="card bg-primary text-primary-content">
                {!address && !loadingAddress ? <div className="card-body">
                    <h2 className="card-title">Create a cookie jar</h2>
                    <p>List of addreses</p>
                    {inputValues.map((value, index) => (
                        <div className="flex flex-col gap-2" key={index}>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                placeholder="Enter a value"
                                className="input input-bordered w-full max-w-lg text-gray-900"
                            />
                            <button onClick={() => handleAddRemoveInput(index, 'remove')} className="text-xs mr-auto">Remove</button>
                        </div>
                    ))}
                    <div className="card-actions justify-end">
                        <button className="btn" onClick={() => { handleAddRemoveInput(0, 'add'); }}>Add New Address</button>
                        <button className="btn" onClick={() => { createJar() }}>Create Jar</button>
                    </div>
                </div> : null}
            </div>
            {loadingAddress ? <LoadingCard /> : null}
            {address ? <AddressCard ethereum_address={address} listOfAddresses={returnedAddresses} /> : null}
        </div>
    );
};

function convertToObjects(ethereumAddresses: string[]): ListOfAddresses[] {
    const resultArray: ListOfAddresses[] = [];
  
    ethereumAddresses.forEach((address: string) => {
      const addressObject: ListOfAddresses = {
        ethereum_address: address,
        github_link: [],
        verified_github: false,
        received_payout: false 
      };
      resultArray.push(addressObject);
    });
    return resultArray;
  }