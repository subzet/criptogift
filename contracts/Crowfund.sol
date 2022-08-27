// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Crowfund is Ownable {
    struct Contributor {
        uint256 amountContributed;
    }

    struct Project {
        uint256 deadline;
        uint256 threshold;
        bool exists;
        address owner;
        mapping(address => Contributor) contributors;
    }

    mapping(address => Project) receivers;

    event ProjectCreated(
        address receiver,
        address owner,
        uint256 deadline,
        uint256 threshold,
        uint256 createdAt
    );

    event ProjectDeleted(
        address receiver,
        address owner,
        address killer,
        uint256 deletedAt
    );

    function projectExists(address _addr) public view returns (bool) {
        return receivers[_addr].exists;
    }

    function createProject(
        uint256 _deadline,
        uint256 _threshold,
        address _receiver
    ) public {
        require(projectExists(_receiver) == false, "Project already exists");

        receivers[_receiver].deadline = _deadline;
        receivers[_receiver].exists = true;
        receivers[_receiver].threshold = _threshold;
        receivers[_receiver].owner = msg.sender;

        emit ProjectCreated(
            _receiver,
            msg.sender,
            _deadline,
            _threshold,
            block.timestamp
        );
    }

    function getProject(address _receiver)
        public
        view
        returns (
            uint256, //deadline
            uint256, //threshold
            bool, //exists
            address //owner
        )
    {
        require(projectExists(_receiver) == true, "Project does not exists");

        return (
            receivers[_receiver].deadline,
            receivers[_receiver].threshold,
            receivers[_receiver].exists,
            receivers[_receiver].owner
        );
    }

    function deleteProject(address _receiver) public {
        require(projectExists(_receiver) == true, "Project does not exists");

        require(
            receivers[_receiver].owner == msg.sender || owner() == msg.sender,
            "Can not delete project because you are not the owner"
        );

        receivers[_receiver].exists = false;

        emit ProjectDeleted(
            _receiver,
            receivers[_receiver].owner,
            msg.sender,
            block.timestamp
        );
    }
}
