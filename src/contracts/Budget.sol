pragma solidity ^0.8.4;

contract Budget {
  
  mapping(address => string ) public AddressToBudgetHash;

  function get() public view returns (string memory) {
        return AddressToBudgetHash[msg.sender];
    }

  function set(address _addr, string memory _BudgetHash) public {
        require(msg.sender == _addr);
        AddressToBudgetHash[_addr] = _BudgetHash;
    }

}
