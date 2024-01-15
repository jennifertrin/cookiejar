export const idlFactory = ({ IDL }) => {
  const ListOfAddresses = IDL.Record({
    'ethereum_address' : IDL.Text,
    'received_payout' : IDL.Bool,
    'verified_github' : IDL.Bool,
    'github_link' : IDL.Opt(IDL.Text),
  });
  const EthereumAddressReply = IDL.Record({ 'ethereum_address' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : EthereumAddressReply, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const SignatureReply = IDL.Record({ 'signature_hex' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : SignatureReply, 'Err' : IDL.Text });
  return IDL.Service({
    'add_addresses' : IDL.Func(
        [IDL.Vec(ListOfAddresses)],
        [IDL.Vec(ListOfAddresses)],
        [],
      ),
    'ethereum_address' : IDL.Func([], [Result], []),
    'get_addresses' : IDL.Func([], [IDL.Vec(ListOfAddresses)], ['query']),
    'get_public_repo_verification' : IDL.Func(
        [IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
    'is_address_listed' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'sign' : IDL.Func([IDL.Text], [Result_2], []),
    'update_addresses' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Bool, IDL.Bool],
        [IDL.Vec(ListOfAddresses)],
        [],
      ),
    'verify_ecdsa' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Bool],
        ['query'],
      ),
    'verify_signature_and_repo' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
