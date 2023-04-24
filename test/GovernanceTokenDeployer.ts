import {ethers, config} from "hardhat";
import {expect} from "chai";

describe("GovernanceTokenDeployer", function () {

    it('Should sign deployment of a governance token', async function () {
        const [owner] = await ethers.getSigners();

        const accounts = config.networks.hardhat.accounts
        console.log('Accounts from config:', accounts);
        const index = 0;
        const wallet = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`)

        const GovernanceTokenFactory = await ethers.getContractFactory("GovernanceToken");

        const unsignedTx = GovernanceTokenFactory.getDeployTransaction({"gasPrice": 900000000, "gasLimit": 1_000_000})
        // console.log('Unsigned tx:', unsignedTx)


        const signedTx = await wallet.signTransaction(unsignedTx)
        const decoded = ethers.utils.RLP.decode(signedTx)
        // console.log('Decoded:', decoded)
        const r = decoded[decoded.length-2]
        const s = decoded[decoded.length-1]
        const v = decoded[decoded.length-3]
        console.log("v: ",v)
        console.log("r: ",r)
        console.log("s: ",s)
        // console.log('Signed tx:', signedTx)

        const recoded = ethers.utils.RLP.encode(decoded)

        expect(recoded).to.equal(signedTx)

        const pubKey = ethers.utils.recoverPublicKey(signedTx, {"r": r, "s": s, "v": v})
        console.log('Pub key:', pubKey)
        const address = ethers.utils.computeAddress(pubKey)
        console.log('Address:', address)


        const v_2= "0x1b"
        const r_2 = "0x1820182018201820182018201820182018201820182018201820182018201820"
        const s_2 =  "0x1820182018201820182018201820182018201820182018201820182018201820"

        decoded[decoded.length-2] = r_2
        decoded[decoded.length-1] = s_2
        decoded[decoded.length-3] = v_2

        const recoded_2 = ethers.utils.RLP.encode(decoded)

        const pubKey_2 = ethers.utils.recoverPublicKey(recoded_2, {"r": r_2, "s": s_2, "v": v_2})
        console.log('Pub key 2:', pubKey_2)
        const address_2 = ethers.utils.computeAddress(pubKey_2)
        console.log('Address 2:', address_2)

        expect(address_2).not.to.equal(address)

        const provideTx = await wallet.signTransaction({
            to: address_2,
            value: ethers.utils.parseUnits("900000000000000", "wei"),
            gasPrice: 900000000,
            gasLimit: 1_000_000,
        })

        await ethers.provider.sendTransaction(provideTx)

        await ethers.provider.sendTransaction(recoded_2)

        // const governanceTokenDeployer = await GovernanceTokenFactory.deploy();

    })

})