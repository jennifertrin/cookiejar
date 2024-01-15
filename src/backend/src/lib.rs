use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use ic_cdk::{query, update};
use std::str::FromStr;
use ethers_core::types::{Address, RecoveryMessage, Signature, H160};
use hex::decode;
use std::sync::Mutex;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod
};
use serde_json::Value;

#[derive(CandidType, Serialize, Debug)]
struct EthereumAddressReply {
    pub ethereum_address: String, 
}

#[derive(CandidType, Serialize, Debug)]
struct SignatureReply {
    pub signature_hex: String,
}

#[derive(CandidType, Serialize, Debug)]
struct SignatureVerificationReply {
    pub is_signature_valid: bool,
}

type CanisterId = Principal;

#[derive(CandidType, Serialize, Debug)]
struct ECDSAPublicKey {
    pub canister_id: Option<CanisterId>,
    pub derivation_path: Vec<Vec<u8>>,
    pub key_id: EcdsaKeyId,
}

#[derive(CandidType, Deserialize, Debug)]
struct ECDSAPublicKeyReply {
    pub public_key: Vec<u8>,
    pub chain_code: Vec<u8>,
}

#[derive(CandidType, Serialize, Debug)]
struct SignWithECDSA {
    pub message_hash: Vec<u8>,
    pub derivation_path: Vec<Vec<u8>>,
    pub key_id: EcdsaKeyId,
}

#[derive(CandidType, Deserialize, Debug)]
struct SignWithECDSAReply {
    pub signature: Vec<u8>,
}

#[derive(CandidType, Serialize, Debug, Clone)]
struct EcdsaKeyId {
    pub curve: EcdsaCurve,
    pub name: String,
}

#[derive(CandidType, Serialize, Debug, Clone)]
pub enum EcdsaCurve {
    #[serde(rename = "secp256k1")]
    Secp256k1,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
struct ListOfAddresses {
    ethereum_address: String,
    github_link: Option<String>,
    verified_github: bool,
    received_payout: bool,
}

#[derive(Serialize, Deserialize)]
struct GitHub {
    owner: String,
    repo: String,
}

static ADDRESSES: Mutex<Vec<ListOfAddresses>> = Mutex::new(Vec::new());

#[update]
async fn add_addresses(address_list: Vec<ListOfAddresses>) -> Vec<ListOfAddresses> {
    let mut addresses = ADDRESSES.lock().unwrap();
    *addresses = address_list.clone();
    addresses.clone()
}

#[query]
async fn get_addresses() -> Vec<ListOfAddresses> {
    ADDRESSES.lock().unwrap().clone()
}

#[query]
async fn is_address_listed(checked_address: String) -> bool {
    let addresses = ADDRESSES.lock().unwrap();

    for address_entry in addresses.iter() {
        if address_entry.ethereum_address == checked_address {
            return true;
        }
    }
    return false;
}

#[update]
async fn update_addresses(
    ethereum_address: String,
    github_link: Option<String>,
    verified_github: bool,
    received_payout: bool,
) -> Vec<ListOfAddresses> {
    let mut addresses = ADDRESSES.lock().unwrap();

    if let Some(index) = find_address_index(ethereum_address, &addresses) {
        addresses[index].github_link = github_link;
        addresses[index].verified_github = verified_github;
        addresses[index].received_payout = received_payout;
    }
    
    addresses.clone()
}


#[update]
async fn ethereum_address() -> Result<EthereumAddressReply, String> {
    let request = ECDSAPublicKey {
        canister_id: None,
        derivation_path: vec![],
        key_id: EcdsaKeyIds::TestKeyLocalDevelopment.to_key_id(),
    };

    let (res,): (ECDSAPublicKeyReply,) =
        ic_cdk::call(mgmt_canister_id(), "ecdsa_public_key", (request,))
            .await
            .map_err(|e| format!("ecdsa_public_key failed {}", e.1))?;

    let public_key_hex = hex::encode(&res.public_key);
    let ethereum_address = hex_string_to_ethereum_address(&public_key_hex);

    Ok(EthereumAddressReply {
        ethereum_address
    })
}

#[update]
async fn sign(message: String) -> Result<SignatureReply, String> {
    let request = SignWithECDSA {
        message_hash: sha256(&message).to_vec(),
        derivation_path: vec![],
        key_id: EcdsaKeyIds::TestKeyLocalDevelopment.to_key_id(),
    };

    let (response,): (SignWithECDSAReply,) = ic_cdk::api::call::call_with_payment(
        mgmt_canister_id(),
        "sign_with_ecdsa", 
        (request,),
        25_000_000_000,
    )
    .await
    .map_err(|e| format!("sign_with_ecdsa failed {}", e.1))?;

    Ok(SignatureReply {
        signature_hex: hex::encode(&response.signature),
    })
}

#[update]
async fn verify_signature_and_repo(owner: String, repo: String, eth_address: String, message: String, signature: String) -> Result<bool, String> {
    let is_signature_valid = verify_ecdsa(eth_address.clone(), message.clone(), signature.clone()).await;

    if !is_signature_valid {
        return Err("Invalid signature".to_string());
    }

    let is_repo_verified = get_public_repo_verification(owner.clone(), repo.clone()).await;

    if is_repo_verified.is_ok() {
        match update_addresses(
            eth_address.clone(),
            Some(format!("https://github.com/{}/{}", owner, repo)),
            true,
            false,
        ).await {
            _ => {}
        }
    }

    is_repo_verified
}


#[query]
async fn verify_ecdsa(eth_address: String, message: String, signature: String) -> bool {
    Signature::from_str(&signature)
        .unwrap()
        .verify(
            RecoveryMessage::Data(message.into_bytes()),
            Address::from_str(&eth_address).unwrap(),
        )
        .is_ok()
}

#[update]
async fn get_public_repo_verification(owner: String, repo: String) -> Result<bool, String> {
    let url = format!(
        "https://api.github.com/repos/{}/{}",
        owner,
        repo
    );

    let request_headers = vec![
        HttpHeader {
            name: "X-GitHub-Api-Version".to_string(),
            value: "2022-11-28".to_string(),
        },
    ];

    let request = CanisterHttpRequestArgument {
        url: url.to_string(),
        method: HttpMethod::GET,
        body: None, 
        max_response_bytes: None, 
        transform: None,
        headers: request_headers,
    };

    match http_request(request,1_700_000_000).await {
        Ok((response,)) => {
            let str_body = String::from_utf8(response.body)
                .expect("Transformed response is not UTF-8 encoded.");
            if let Ok(parsed_json) = serde_json::from_str::<Value>(&str_body) {
                if let Some(private) = parsed_json.get("private").and_then(|v| v.as_bool()) {
                    if private {
                      return Ok(false)
                    } return Ok(true)
                }
            }
            return Ok(false)
        }
        Err((r, m)) => {
            let message = format!("The http_request resulted in an error. RejectionCode: {r:?}, Error: {m}");
            return Err(message);
        }
    }
}

fn mgmt_canister_id() -> CanisterId {
    CanisterId::from_str(&"aaaaa-aa").unwrap()
}

fn sha256(input: &String) -> [u8; 32] {
    use sha2::Digest;
    let mut hasher = sha2::Sha256::new();
    hasher.update(input.as_bytes());
    hasher.finalize().into()
}

enum EcdsaKeyIds {
    #[allow(unused)]
    TestKeyLocalDevelopment,
    #[allow(unused)]
    TestKey1,
    #[allow(unused)]
    ProductionKey1,
}

impl EcdsaKeyIds {
    fn to_key_id(&self) -> EcdsaKeyId {
        EcdsaKeyId {
            curve: EcdsaCurve::Secp256k1,
            name: match self {
                Self::TestKeyLocalDevelopment => "dfx_test_key",
                Self::TestKey1 => "test_key_1",
                Self::ProductionKey1 => "key_1",
            }
            .to_string(),
        }
    }
}

getrandom::register_custom_getrandom!(always_fail);
pub fn always_fail(_buf: &mut [u8]) -> Result<(), getrandom::Error> {
    Err(getrandom::Error::UNSUPPORTED)
}

fn hex_string_to_ethereum_address(public_key_hex: &str) -> String {
    let public_key_bytes = match decode(public_key_hex) {
        Ok(bytes) => bytes,
        Err(_) => return String::from("error_hex_to_bytes"),
    };

    let address_bytes = &public_key_bytes[public_key_bytes.len() - 20..];
    let address = H160::from_slice(address_bytes);

    format!("0x{:x}", address)
}

fn find_address_index(ethereum_address: String, addresses: &Vec<ListOfAddresses>) -> Option<usize> {
    addresses.iter().position(|addr| addr.ethereum_address == ethereum_address)
}

ic_cdk::export_candid!();