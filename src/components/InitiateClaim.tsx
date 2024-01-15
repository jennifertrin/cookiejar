import React, { useState } from 'react';
import ClaimButton from './ClaimButton';

interface InitiateClaimProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function InitiateClaim({ open, setOpen }: InitiateClaimProps) {
    const [githubLink, setGithubLink] = useState<string | null>();

    return (
        <div className="flex flex-col gap-4">
            {open ?
                <div className="flex">
                    <span>Contribution GitHub link</span>
                    <input type="text" placeholder="Github Link" className="input input-bordered w-full max-w-xs" onChange={(e) => setGithubLink(e.target.value)} />
                </div> :
                <button className="btn btn-info" onClick={() => setOpen(!open)}>Initiate Claim</button>
            }
            {githubLink ? <ClaimButton githubLink={githubLink} /> : null}
        </div>
    );
};