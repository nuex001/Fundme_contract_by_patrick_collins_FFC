import { ethers } from "./ethers-5.1.esm.min.js"
import { abi } from "./constants.js"
import { contractAddress } from "./constants.js"

const connectButton = document.querySelector("#connectButton");
const fundButton = document.querySelector("#fundButton");
const balanceButton = document.querySelector("#balanceButton");
const withdrawButton = document.querySelector("#withdrawButton");

/**
 * @CONNECT
 * use a window object window.ethereum for metamask if it's not undefined,then request for connection
 */
const connect = async () => {
    try {
        if (typeof window.ethereum !== "undefined") {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            console.log("Connected");
            connectButton.textContent = "Connected!"
        } else {
            connectButton.textContent = "Please Install metamask"
        }
    } catch (error) {
        console.log(error);
    }
}


// GET BALANCE 
/**
 * @GET_BALANCE
 */
const getBalance = async () => {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress)
        console.log(balance);
        console.log(ethers.utils.formatEther(balance));//conv erts it to readable number (js)
    }
}



// TRANSACTION MINE / LISTENER

const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}...`);
    // return new Promise()
    // listen for the transaction to finish
    // provider.once is async in nature
    // so we have to create our own promise and run our provider.once in the promise to cancel the sync nature
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        })
    })

}



// FUND FUNCTION
/**
 * @Fund
 * to send a transaction to the blockchain,one of the things that we 100% always nedd is the
 *@PROVIDER / Connection to the blockchain 
 *@SIGNER / wallet / someone with some gas
 *@CONTRACT that we are interacting with
 *^ @ABI & @ADDRESS 
 * For the Abi we have to get the Abi from the compiled contract
 * For the contract address,we are currently using our local node server to lunch it and copy the local contract address
 */
const fund = async () => {

    const ethAmount = document.querySelector("#ethAmount").value;
    console.log(`Funding with ${ethAmount}.....`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner() //is gonna return whatever wallet is connect from the provider
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //   hey,wait for this transaction to finish
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!!");
        } catch (error) {
            // console.log(error.message.includes("User denied"));
            if (error.message.includes("User denied")) {
                console.log("Transaction rejected by user");
            } else {
                console.log(error);
            }
        }

    }
}

// WITHDRAW FUNCTION

const withdraw = async () => {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing....");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner() //is gonna return whatever wallet is connect from the provider
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!!");
        } catch (error) {
            console.log(error);
        }
    }
}


// EVENT LISTENER

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
// window.addEventListener("load", () => {
//     console.log(ethers);
// })