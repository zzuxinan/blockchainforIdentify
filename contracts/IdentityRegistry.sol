// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityRegistry {
    struct UserInfo {
        string email;
        string personalInfo;
        bool isVerified;
        uint256 registrationTime;
        bool exists;
        bool isPending;
    }

    address public owner;
    mapping(address => UserInfo) public users;
    mapping(address => bool) public admins;
    address[] public pendingUsers;

    event UserRegistered(address indexed user, string email, uint256 registrationTime);
    event UserVerified(address indexed user, bool approved);
    event UserRejected(address indexed user, string reason);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function register(string memory email, string memory personalInfo) public {
        require(!users[msg.sender].exists, "User already registered");
        
        users[msg.sender] = UserInfo({
            email: email,
            personalInfo: personalInfo,
            isVerified: false,
            registrationTime: block.timestamp,
            exists: true,
            isPending: true
        });
        
        pendingUsers.push(msg.sender);
        emit UserRegistered(msg.sender, email, block.timestamp);
    }

    function approveUser(address user) public onlyAdmin {
        require(users[user].exists, "User does not exist");
        require(!users[user].isVerified, "User already verified");
        require(users[user].isPending, "User not in pending status");
        
        users[user].isVerified = true;
        users[user].isPending = false;
        removePendingUser(user);
        emit UserVerified(user, true);
    }

    function rejectUser(address user, string memory reason) public onlyAdmin {
        require(users[user].exists, "User does not exist");
        require(!users[user].isVerified, "User already verified");
        require(users[user].isPending, "User not in pending status");
        
        users[user].isPending = false;
        removePendingUser(user);
        emit UserRejected(user, reason);
    }

    function addAdmin(address newAdmin) public onlyOwner {
        require(!admins[newAdmin], "Address is already admin");
        admins[newAdmin] = true;
        emit AdminAdded(newAdmin);
    }

    function removeAdmin(address admin) public onlyOwner {
        require(admin != owner, "Cannot remove owner from admin");
        require(admins[admin], "Address is not admin");
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function isAdmin(address user) public view returns (bool) {
        return admins[user];
    }

    function getUserStatus(address user) public view returns (
        bool exists,
        bool isVerified,
        bool isPending,
        uint256 registrationTime
    ) {
        UserInfo memory info = users[user];
        return (info.exists, info.isVerified, info.isPending, info.registrationTime);
    }

    function getPendingUsers() public view returns (
        address[] memory addresses,
        string[] memory emails,
        string[] memory personalInfos,
        uint256[] memory registrationTimes
    ) {
        uint256 length = pendingUsers.length;
        addresses = new address[](length);
        emails = new string[](length);
        personalInfos = new string[](length);
        registrationTimes = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address userAddr = pendingUsers[i];
            UserInfo memory user = users[userAddr];
            addresses[i] = userAddr;
            emails[i] = user.email;
            personalInfos[i] = user.personalInfo;
            registrationTimes[i] = user.registrationTime;
        }
        return (addresses, emails, personalInfos, registrationTimes);
    }

    function removePendingUser(address user) private {
        for (uint i = 0; i < pendingUsers.length; i++) {
            if (pendingUsers[i] == user) {
                pendingUsers[i] = pendingUsers[pendingUsers.length - 1];
                pendingUsers.pop();
                break;
            }
        }
    }
} 