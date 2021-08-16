# PolygonTokenHarvester


Assists with moving any given token from the child chain to the root chain. Made for Polygon

> It needs to be deployed at the same address on both chains. Uses CREATE2 on deploy to achieve that

## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Globals](#globals)
- [Modifiers](#modifiers)
  - [onlyOnRoot](#onlyonroot)
  - [onlyOnChild](#onlyonchild)
- [Functions](#functions)
  - [initialize](#initialize)
  - [setWithdrawCooldown](#setwithdrawcooldown)
  - [withdrawOnRoot](#withdrawonroot)
  - [transferToOwner](#transfertoowner)
  - [withdrawAndTransferToOwner](#withdrawandtransfertoowner)
  - [withdrawOnChild](#withdrawonchild)
- [Events](#events)
  - [TransferToOwner](#transfertoowner)
  - [WithdrawOnRoot](#withdrawonroot)
  - [WithdrawOnChild](#withdrawonchild)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Globals

> Note this contains internal vars as well due to a bug in the docgen procedure

| Var | Type |
| --- | --- |
| rootChainManager | address |
| lastWithdraw | mapping(address => uint256) |
| withdrawCooldown | uint256 |


## Modifiers

### onlyOnRoot
Allows the call only on the root chain

> Checks is based on rootChainManager being set

#### Declaration
```solidity
  modifier onlyOnRoot
```


### onlyOnChild
Allows the call only on the child chain

> Checks is based on rootChainManager being not set

#### Declaration
```solidity
  modifier onlyOnChild
```



## Functions

### initialize
PolygonTokenHarvester initializer

> Needs to be called after deployment. Get addresses from https://github.com/maticnetwork/static/tree/master/network


#### Declaration
```solidity
  function initialize(
    uint256 _withdrawCooldown,
    address _rootChainManager
  ) public initializer
```

#### Modifiers:
| Modifier |
| --- |
| initializer |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_withdrawCooldown` | uint256 | Number of blocks needed between withdrawals
|`_rootChainManager` | address | Address of Polygon rootChainManager. Set to zero address on child chain

### setWithdrawCooldown
Sets the minimum number of blocks that must pass between withdrawals

> This limit is set to not spam the withdrawal process with lots of small withdrawals


#### Declaration
```solidity
  function setWithdrawCooldown(
    uint256 _withdrawCooldown
  ) public onlyOwner onlyOnChild
```

#### Modifiers:
| Modifier |
| --- |
| onlyOwner |
| onlyOnChild |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_withdrawCooldown` | uint256 | Number of blocks needed between withdrawals

### withdrawOnRoot
Withdraws to itself exited funds from Polygon

> Forwards the exit call to the Polygon rootChainManager


#### Declaration
```solidity
  function withdrawOnRoot(
    bytes _data
  ) public onlyOnRoot returns (bytes)
```

#### Modifiers:
| Modifier |
| --- |
| onlyOnRoot |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_data` | bytes | Exit payload created with the Matic SDK

#### Returns:
| Type | Description |
| --- | --- |
|`Bytes` | return of the rootChainManager exit call
### transferToOwner
Transfers full balance of token to owner

> Use this after withdrawOnRoot to transfer what you have exited from Polygon to owner


#### Declaration
```solidity
  function transferToOwner(
    address _token
  ) public onlyOnRoot
```

#### Modifiers:
| Modifier |
| --- |
| onlyOnRoot |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_token` | address | Address of token to transfer

### withdrawAndTransferToOwner
Exit funds from polygon and transfer to owner

> Calls withdrawOnRoot then transferToOwner


#### Declaration
```solidity
  function withdrawAndTransferToOwner(
    bytes _data,
    address _token
  ) public onlyOnRoot returns (bytes)
```

#### Modifiers:
| Modifier |
| --- |
| onlyOnRoot |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_data` | bytes | Exit payload created with the Matic SDK
|`_token` | address | Address of token to transfer

### withdrawOnChild
Withdraws full token balance from the child chain

> Emits WithdrawOnChild on succesful withdraw and burn


#### Declaration
```solidity
  function withdrawOnChild(
    address _childToken
  ) public onlyOnChild
```

#### Modifiers:
| Modifier |
| --- |
| onlyOnChild |

#### Args:
| Arg | Type | Description |
| --- | --- | --- |
|`_childToken` | address | Address of token to withdraw



## Events

### TransferToOwner
Logs a transfer of tokens to owner

> Emitted when transferToOwner is called

  

#### Params:
| Param | Type | Indexed | Description |
| --- | --- | :---: | --- |
|`caller` | address | :white_check_mark: | Address that called transferToOwner
|`owner` | address | :white_check_mark: | Address that the funds have been transferred to
|`token` | address | :white_check_mark: | Address of the transferred token
|`amount` | uint256 |  | The amount of tokens that were sent to the child chain
### WithdrawOnRoot
Logs a withdrawal being made on the root chain

> Emitted when withdrawOnRoot is called

  

#### Params:
| Param | Type | Indexed | Description |
| --- | --- | :---: | --- |
|`caller` | address | :white_check_mark: | Address that called withdrawOnRoot
### WithdrawOnChild
Logs withdrawal being made on the child chain

> Emitted when withdrawOnChild is called

  

#### Params:
| Param | Type | Indexed | Description |
| --- | --- | :---: | --- |
|`caller` | address | :white_check_mark: | Address that called withdrawOnChild
|`token` | address | :white_check_mark: | Address of the withdrawn token
|`amount` | uint256 |  | The amount of tokens that were withdrawn
