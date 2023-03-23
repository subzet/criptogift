// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Crowfund is Ownable {
    using SafeMath for uint256;

    struct Project {
        uint256 deadline;
        uint256 amountContributed;
        bool exists;
        address owner;
    }

    mapping(address => Project) receivers;

    event ProjectCreated(
        address receiver,
        address owner,
        uint256 deadline,
        uint256 createdAt
    );

    event ProjectDeleted(
        address receiver,
        address owner,
        address killer,
        uint256 deletedAt
    );

    event ProjectDonation(address receiver, uint256 amount);

    function projectExists(address _addr) private view returns (bool) {
        return receivers[_addr].exists;
    }

    function createProject(uint256 _deadline, address _receiver) public {
        require(projectExists(_receiver) == false, "Project already exists");

        require(
            block.timestamp < _deadline,
            "Deadline should be in the future"
        );

        receivers[_receiver].deadline = _deadline;
        receivers[_receiver].exists = true;
        receivers[_receiver].owner = msg.sender;
        receivers[_receiver].amountContributed = 0;

        emit ProjectCreated(_receiver, msg.sender, _deadline, block.timestamp);
    }

    function getProject(
        address _receiver
    )
        public
        view
        returns (
            uint256, //deadline
            bool, //exists
            address, //owner
            uint256 // amount contributed
        )
    {
        require(projectExists(_receiver) == true, "Project does not exists");

        return (
            receivers[_receiver].deadline,
            receivers[_receiver].exists,
            receivers[_receiver].owner,
            receivers[_receiver].amountContributed
        );
    }

    function getTotalAmountContributed(
        address _receiver
    ) public view returns (uint256) {
        require(projectExists(_receiver) == true, "Project does not exists");

        return receivers[_receiver].amountContributed;
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

    function contribute(address _receiver) public payable {
        require(projectExists(_receiver) == true, "Project does not exists");

        require(
            block.timestamp < receivers[_receiver].deadline,
            "Project crowdfund has already finished."
        );

        require(_receiver != address(0), "Receiver address can not be 0x0");

        require(msg.value > 0, "You must provider a value greater than 0");

        receivers[_receiver].amountContributed = receivers[_receiver]
            .amountContributed
            .add(msg.value);

        emit ProjectDonation(_receiver, msg.value);
    }

    function resetProject() private {
        receivers[msg.sender].exists = false;
    }

    function claim() public {
        require(projectExists(msg.sender) == true, "Project does not exists");

        require(
            block.timestamp > receivers[msg.sender].deadline,
            "Can't withdraw yet"
        );

        uint256 amount = receivers[msg.sender].amountContributed;

        resetProject();

        payable(msg.sender).transfer(amount);
    }
}
