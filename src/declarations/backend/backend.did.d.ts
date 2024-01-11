import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface EthereumAddressReply { 'ethereum_address' : string }
export interface ListOfAddresses {
  'ethereum_address' : string,
  'received_payout' : boolean,
}
export type Result = { 'Ok' : EthereumAddressReply } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : SignatureReply } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : SignatureVerificationReply } |
  { 'Err' : string };
export interface SignatureReply { 'signature_hex' : string }
export interface SignatureVerificationReply { 'is_signature_valid' : boolean }
export interface _SERVICE {
  'add_addresses' : ActorMethod<
    [Array<ListOfAddresses>],
    Array<ListOfAddresses>
  >,
  'ethereum_address' : ActorMethod<[], Result>,
  'get_addresses' : ActorMethod<[], Array<ListOfAddresses>>,
  'is_address_listed' : ActorMethod<[string], boolean>,
  'sign' : ActorMethod<[string], Result_1>,
  'verify' : ActorMethod<[string, string, string], Result_2>,
  'verify_claim' : ActorMethod<
    [string, string, string, string, string],
    Result_2
  >,
}
