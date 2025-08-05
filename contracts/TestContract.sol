// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public name = "Test";
    
    constructor() {}
    
    function getName() public view returns (string memory) {
        return name;
    }
}