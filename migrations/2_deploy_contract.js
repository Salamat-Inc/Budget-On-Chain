const Budget = artifacts.require("Budget");

module.exports = function(deployer) {
  deployer.deploy(Budget);
};
