// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityRegistry is Ownable {
    // 用户角色枚举
    enum Role {
        USER,
        VERIFIER,
        ADMIN
    }

    // 用户信息结构
    struct UserInfo {
        bytes32 emailHash;
        bytes32 infoHash;
        bool isVerified;
        Role role;
        uint256 registrationTime;
    }

    // 事件定义
    event UserRegistered(address indexed user, bytes32 emailHash);
    event UserVerified(address indexed user);
    event RoleChanged(address indexed user, Role role);

    // 状态变量
    mapping(address => UserInfo) public users;
    mapping(bytes32 => bool) public registeredEmailHashes;
    mapping(address => bool) public isVerifier;
    mapping(address => bool) public isAdmin;

    // 修饰器
    modifier onlyVerified() {
        require(users[msg.sender].isVerified, "User not verified");
        _;
    }

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Not a verifier");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not an admin");
        _;
    }

    // 构造函数
    constructor() Ownable(msg.sender) {
        // 部署者自动成为管理员
        isAdmin[msg.sender] = true;
        users[msg.sender] = UserInfo({
            emailHash: bytes32(0),
            infoHash: bytes32(0),
            isVerified: true,
            role: Role.ADMIN,
            registrationTime: block.timestamp
        });
    }

    // 用户注册
    function register(bytes32 emailHash, bytes32 infoHash) external {
        require(users[msg.sender].registrationTime == 0, "Already registered");
        require(!registeredEmailHashes[emailHash], "Email already registered");

        users[msg.sender] = UserInfo({
            emailHash: emailHash,
            infoHash: infoHash,
            isVerified: false,
            role: Role.USER,
            registrationTime: block.timestamp
        });

        registeredEmailHashes[emailHash] = true;
        emit UserRegistered(msg.sender, emailHash);
    }

    // 验证用户
    function verifyUser(address user) external onlyVerifier {
        require(users[user].registrationTime > 0, "User not registered");
        require(!users[user].isVerified, "Already verified");

        users[user].isVerified = true;
        emit UserVerified(user);
    }

    // 设置验证机构
    function setVerifier(address verifier, bool status) external onlyAdmin {
        isVerifier[verifier] = status;
        if (status) {
            users[verifier].role = Role.VERIFIER;
        }
        emit RoleChanged(verifier, users[verifier].role);
    }

    // 设置管理员
    function setAdmin(address admin, bool status) external onlyAdmin {
        isAdmin[admin] = status;
        if (status) {
            users[admin].role = Role.ADMIN;
        }
        emit RoleChanged(admin, users[admin].role);
    }

    // 获取用户信息
    function getUserInfo(address user) external view returns (
        bytes32 emailHash,
        bytes32 infoHash,
        bool isVerified,
        Role role,
        uint256 registrationTime
    ) {
        UserInfo memory userInfo = users[user];
        return (
            userInfo.emailHash,
            userInfo.infoHash,
            userInfo.isVerified,
            userInfo.role,
            userInfo.registrationTime
        );
    }
} 