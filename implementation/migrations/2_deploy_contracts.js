// bitcoin-spv
const BytesLib = artifacts.require('BytesLib')
const BTCUtils = artifacts.require('BTCUtils')
const ValidateSPV = artifacts.require('ValidateSPV')
const CheckBitcoinSigs = artifacts.require('CheckBitcoinSigs')

// logging
const OutsourceDepositLogging = artifacts.require('OutsourceDepositLogging')
const DepositLog = artifacts.require('DepositLog')

// deposit
const DepositStates = artifacts.require('DepositStates')
const DepositUtils = artifacts.require('DepositUtils')
const DepositFunding = artifacts.require('DepositFunding')
const DepositRedemption = artifacts.require('DepositRedemption')
const DepositLiquidation = artifacts.require('DepositLiquidation')
const Deposit = artifacts.require('Deposit')

// price oracle
const PriceOracleV1 = artifacts.require('PriceOracleV1')

// system
const TBTCConstants = artifacts.require('TBTCConstants')
const TBTCSystem = artifacts.require('TBTCSystem')

// keep
const KeepBridge = artifacts.require('KeepBridge')
const TBTCToken = artifacts.require('TBTCToken')
const KeepRegistryAddress = '0xca961E001d2551186731b384fA2Dddf96Ba474bD' // KeepRegistry contract address

// deposit factory
const DepositFactory = artifacts.require('DepositFactory')

// uniswap
const { deployUniswap } = require('../uniswap')
const UniswapDeployment = artifacts.require('UniswapDeployment')

const all = [BytesLib, BTCUtils, ValidateSPV, TBTCConstants, CheckBitcoinSigs,
  OutsourceDepositLogging, DepositLog, DepositStates, DepositUtils,
  DepositFunding, DepositRedemption, DepositLiquidation, Deposit, TBTCSystem,
  KeepBridge, PriceOracleV1]

module.exports = (deployer, network, accounts) => {
  const PRICE_ORACLE_OPERATOR = accounts[0]
  const PRICE_ORACLE_DEFAULT_PRICE = '323200000000'

  deployer.then(async () => {
    try {
      const { factory, exchange } = await deployUniswap(web3, accounts)
      // Save the deployed addresses to the UniswapDeployment contract
      await deployer.deploy(UniswapDeployment, factory.options.address, exchange.options.address)
    } catch (err) {
      throw new Error(`uniswap deployment failed: ${err}`)
    }

    // bitcoin-spv
    await deployer.deploy(BytesLib)
    await deployer.link(BytesLib, all)

    await deployer.deploy(BTCUtils)
    await deployer.link(BTCUtils, all)

    await deployer.deploy(ValidateSPV)
    await deployer.link(ValidateSPV, all)

    await deployer.deploy(CheckBitcoinSigs)
    await deployer.link(CheckBitcoinSigs, all)

    // constants
    await deployer.deploy(TBTCConstants)
    await deployer.link(TBTCConstants, all)

    // logging
    await deployer.deploy(OutsourceDepositLogging)
    await deployer.link(OutsourceDepositLogging, all)

    // deposit
    await deployer.deploy(DepositStates)
    await deployer.link(DepositStates, all)

    await deployer.deploy(DepositUtils)
    await deployer.link(DepositUtils, all)

    await deployer.deploy(DepositLiquidation)
    await deployer.link(DepositLiquidation, all)

    await deployer.deploy(DepositRedemption)
    await deployer.link(DepositRedemption, all)

    await deployer.deploy(DepositFunding)
    await deployer.link(DepositFunding, all)

    await deployer.deploy(Deposit)

    // price oracle
    await deployer.deploy(PriceOracleV1, PRICE_ORACLE_OPERATOR, PRICE_ORACLE_DEFAULT_PRICE)

    // system
    await deployer.deploy(TBTCSystem)

    await deployer.deploy(TBTCToken)

    // keep
    await deployer.deploy(KeepBridge).then((instance) => {
      instance.initialize(KeepRegistryAddress)
    })

    // deposit factory
    await deployer.deploy(DepositFactory, Deposit.address)
  })
}
