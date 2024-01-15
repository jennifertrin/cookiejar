import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface EthereumAddressReply { 'ethereum_address' : string }
export interface ListOfAddresses {
  'ethereum_address' : string,
  'received_payout' : boolean,
  'verified_github' : boolean,
  'github_link' : [] | [string],
}
export type Result = { 'Ok' : EthereumAddressReply } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : boolean } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : SignatureReply } |
  { 'Err' : string };
export interface SignatureReply { 'signature_hex' : string }
export interface _SERVICE {
  'add_addresses' : ActorMethod<
    [Array<ListOfAddresses>],
    Array<ListOfAddresses>
  >,
  'ethereum_address' : ActorMethod<[], Result>,
  'get_addresses' : ActorMethod<[], Array<ListOfAddresses>>,
  'get_public_repo_verification' : ActorMethod<[string, string], Result_1>,
  'is_address_listed' : ActorMethod<[string], boolean>,
  'sign' : ActorMethod<[string], Result_2>,
  'update_addresses' : ActorMethod<
    [string, [] | [string], boolean, boolean],
    Array<ListOfAddresses>
  >,
  'verify_ecdsa' : ActorMethod<[string, string, string], boolean>,
  'verify_signature_and_repo' : ActorMethod<
    [string, string, string, string, string],
    Result_1
  >,
}
