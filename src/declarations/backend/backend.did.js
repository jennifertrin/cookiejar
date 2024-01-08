export const idlFactory = ({ IDL }) => {
  const ListOfAddresses = IDL.Record({
    'ethereum_address' : IDL.Text,
    'received_payout' : IDL.Bool,
  });
  const EthereumAddressReply = IDL.Record({ 'ethereum_address' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : EthereumAddressReply, 'Err' : IDL.Text });
  const SignatureReply = IDL.Record({ 'signature_hex' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : SignatureReply, 'Err' : IDL.Text });
  const SignatureVerificationReply = IDL.Record({
    'is_signature_valid' : IDL.Bool,
  });
  const Result_2 = IDL.Variant({
    'Ok' : SignatureVerificationReply,
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'add_addresses' : IDL.Func(
        [IDL.Vec(ListOfAddresses)],
        [IDL.Vec(ListOfAddresses)],
        [],
      ),
    'ethereum_address' : IDL.Func([], [Result], []),
    'get_addresses' : IDL.Func([], [IDL.Vec(ListOfAddresses)], ['query']),
    'sign' : IDL.Func([IDL.Text], [Result_1], []),
    'verify' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_2], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
