const IdentityRegistry = artifacts.require("IdentityRegistry");

contract("IdentityRegistry", (accounts) => {
    let identityRegistry;
    const [admin, user1, user2, verifier1] = accounts;

    beforeEach(async () => {
        identityRegistry = await IdentityRegistry.new();
    });

    describe("初始化测试", () => {
        it("部署者应该成为管理员", async () => {
            const isAdmin = await identityRegistry.isAdmin(admin);
            assert.equal(isAdmin, true, "部署者应该是管理员");
        });
    });

    describe("用户注册测试", () => {
        it("用户应该能够注册", async () => {
            const emailHash = web3.utils.sha3("user1@example.com");
            const infoHash = web3.utils.sha3("user1 info");
            
            await identityRegistry.register(emailHash, infoHash, { from: user1 });
            
            const userInfo = await identityRegistry.getUserInfo(user1);
            assert.equal(userInfo.emailHash, emailHash, "邮箱哈希值应该匹配");
            assert.equal(userInfo.isVerified, false, "新用户应该未验证");
            assert.equal(userInfo.role, 0, "新用户角色应该是USER");
        });

        it("不能重复注册", async () => {
            const emailHash = web3.utils.sha3("user1@example.com");
            const infoHash = web3.utils.sha3("user1 info");
            
            await identityRegistry.register(emailHash, infoHash, { from: user1 });
            
            try {
                await identityRegistry.register(emailHash, infoHash, { from: user1 });
                assert.fail("应该抛出错误");
            } catch (error) {
                assert.include(error.message, "Already registered", "应该提示已注册");
            }
        });

        it("邮箱不能重复使用", async () => {
            const emailHash = web3.utils.sha3("user1@example.com");
            const infoHash = web3.utils.sha3("user1 info");
            
            await identityRegistry.register(emailHash, infoHash, { from: user1 });
            
            try {
                await identityRegistry.register(emailHash, infoHash, { from: user2 });
                assert.fail("应该抛出错误");
            } catch (error) {
                assert.include(error.message, "Email already registered", "应该提示邮箱已注册");
            }
        });
    });

    describe("验证机构测试", () => {
        it("管理员可以设置验证机构", async () => {
            await identityRegistry.setVerifier(verifier1, true, { from: admin });
            const isVerifier = await identityRegistry.isVerifier(verifier1);
            assert.equal(isVerifier, true, "应该成功设置为验证机构");
        });

        it("非管理员不能设置验证机构", async () => {
            try {
                await identityRegistry.setVerifier(verifier1, true, { from: user1 });
                assert.fail("应该抛出错误");
            } catch (error) {
                assert.include(error.message, "Not an admin", "应该提示不是管理员");
            }
        });
    });

    describe("用户验证测试", () => {
        beforeEach(async () => {
            // 设置验证机构
            await identityRegistry.setVerifier(verifier1, true, { from: admin });
            
            // 注册用户
            const emailHash = web3.utils.sha3("user1@example.com");
            const infoHash = web3.utils.sha3("user1 info");
            await identityRegistry.register(emailHash, infoHash, { from: user1 });
        });

        it("验证机构可以验证用户", async () => {
            await identityRegistry.verifyUser(user1, { from: verifier1 });
            const userInfo = await identityRegistry.getUserInfo(user1);
            assert.equal(userInfo.isVerified, true, "用户应该被验证");
        });

        it("非验证机构不能验证用户", async () => {
            try {
                await identityRegistry.verifyUser(user1, { from: user2 });
                assert.fail("应该抛出错误");
            } catch (error) {
                assert.include(error.message, "Not a verifier", "应该提示不是验证机构");
            }
        });

        it("不能重复验证用户", async () => {
            await identityRegistry.verifyUser(user1, { from: verifier1 });
            
            try {
                await identityRegistry.verifyUser(user1, { from: verifier1 });
                assert.fail("应该抛出错误");
            } catch (error) {
                assert.include(error.message, "Already verified", "应该提示已经验证");
            }
        });
    });

    describe("管理员测试", () => {
        it("管理员可以设置其他管理员", async () => {
            await identityRegistry.setAdmin(user1, true, { from: admin });
            const isAdmin = await identityRegistry.isAdmin(user1);
            assert.equal(isAdmin, true, "应该成功设置为管理员");
        });

        it("非管理员不能设置管理员", async () => {
            try {
                await identityRegistry.setAdmin(user1, true, { from: user2 });
                assert.fail("应该抛出错误");
            } catch (error) {
                assert.include(error.message, "Not an admin", "应该提示不是管理员");
            }
        });
    });
}); 