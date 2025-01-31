const express = require('express');
const accountrouter = express.Router();
const accountValidator = require('./account-schema-validator');
const accountDao = require('./account-dao');
const Logger = require('../logger/logger');
const log = new Logger('Account-Controller');
const authTokenValidator = require('../middleware/auth-token-validator');

accountrouter.get('/getaccountdetails/:accountno', (req, res) => {
    // console.log({req});
    let accountNo = req.params.accountno;
    // console.log({res});
    accountDao.retrieveAccountDetails(accountNo, res)
        .then()
        .catch((err) => log.error(`Error in retrieving account details by account no. ${accountNo}: ` + err));
});

accountrouter.get('/getaccountdetailsbyusername/:username', (req, res) => {
    // console.log(req);
    let username = req.params.username;
    accountDao.retrieveAccountDetailsByUsername(username, res)
        .then()
        .catch((err) => log.error(`Error in retrieving account details by username ${username}: ` + err));
});

accountrouter.post('/createnewaccount', (req, res) => {
    // console.log(req);
    let newAccount = req.body;
    let { error } = accountValidator.validateCreateNewAccountSchema(newAccount);
    if (isNotValidSchema(error, res)) return;
    accountDao.createNewAccount(newAccount, res)
        .then()
        .catch((err) => log.error(`Error in creating new account for username ${newAccount.username}: ` + err));
});

accountrouter.post('/transferamount', (req, res) => {
    // console.log({req});
    let transferAmount = req.body;
    let { error } = accountValidator.validateTransferAmountSchema(transferAmount);
    if (isNotValidSchema(error, res)) return;
    if (isSameAccountNo(transferAmount.from.accountNo, transferAmount.to.accountNo, res)) return;
    if (transferAmount.from.amount !== transferAmount.to.amount) {
        res.status(400).send({
            messageCode: 'INVAMNT',
            message: 'Invalid transaction amount'
        });
        return;
    }
    accountDao.transferAmount(transferAmount, res, req.header('x-auth-token'))
        .then()
        .catch((err) => log.error(`Error in transaction from ${transferAmount.from.accountNo} to ${transferAmount.to.accountNo} of amount ${transferAmount.from.amount}: ` + err));
});

accountrouter.post('/addpayee', (req, res) => {
    // console.log(req);
    let newPayee = req.body;
    let { error } = accountValidator.validatePayeeSchema(newPayee);
    if (isNotValidSchema(error, res)) return;
    if (isSameAccountNo(newPayee.accountNo, newPayee.payee.accountNo, res)) return;
    accountDao.addPayee(newPayee, res)
        .then()
        .catch((err) => log.error(`Error in adding payee ${newPayee}: ` + err));
});

accountrouter.get('/getpayees/:accountno', (req, res) => {
    // console.log({req});
    let accountNo = req.query.acc;
    // console.log({res});
    accountDao.retrievePayeeList(accountNo, res)
        .then()
        .catch((err) => log.error(`Error in retrieving payee list for account no. ${accountNo}: ` + err));
});

accountrouter.post('/deletepayee', (req, res) => {
    let requestBody = req.query;
    let { error } = accountValidator.validatePayeeSchema(requestBody);
    if (isNotValidSchema(error, res)) return;
    if (isSameAccountNo(requestBody.accountNo, requestBody.payee.accountNo, res)) return;
    accountDao.deletePayee(requestBody.accountNo, requestBody.payee, res)
        .then()
        .catch((err) => log.error(`Error in deleting payee ${requestBody.payee} for account no. ${requestBody.accountNo}: ` + err));
});

accountrouter.post('/closeaccount', (req, res) => {
    let accountNo = req.query.accountNo;
    accountDao.closeAccount(accountNo, res)
        .then()
        .catch((err) => log.error(`Error in closing account with account no. ${accountNo}: ` + err));
});

accountrouter.post('/openclosedaccount', (req, res) => {
    let accountNo = req.query.accountNo;
    accountDao.openClosedAccount(accountNo, res)
        .then()
        .catch((err) => log.error(`Error in opening closed accountwith account no. ${accountNo}: ` + err));
});

accountrouter.get('/lastactivated/:accountno', (req, res) => {
    let accountNo = req.query.accountno;
    accountDao.retrieveLastActivatedStatus(accountNo, res)
        .then()
        .catch((err) => log.error(`Error in retrieving last activated status for account no. ${accountNo}: ` + err));
});

accountrouter.post('/updatelastactivated', (req, res) => {
    let accountNo = req.query.accountNo;
    accountDao.updateLastActivatedStatus(accountNo, res)
        .then()
        .catch((err) => log.error(`Error in updating last activated status for account no. ${accountNo}: ` + err));
});

function isNotValidSchema(error, res) {
    if (error) {
        log.error(`Schema validation error: ${error.details[0].message}`);
        res.status(400).send({
            messageCode: 'VALDERR',
            message: error.details[0].message
        });
        return true;
    }
    return false;
}

function isSameAccountNo(accountNo_1, accountNo_2, res) {
    if (accountNo_1 === accountNo_2) {
        log.error(`Transaction cannot be done on same account, from ${accountNo_1} to ${accountNo_2}`);
        res.status(400).send({
            messageCode: 'INVOPR',
            message: 'Operation cannot be done on same account no.'
        });
        return true;
    }
    return false;
}
