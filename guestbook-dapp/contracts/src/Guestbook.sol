// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Guestbook {
    struct Message{
        address author;
        string title;
        string text;
    }

    mapping (uint => Message) public messages;

    address public owner;

    // keeps track of how many messages exist and returns the latest one
    uint public messageCount = 0;

    event MessageWritten(uint id, address indexed author);
    event MessageEdited(uint id, address indexed editor);

    constructor () {
        owner = msg.sender;
    }

    // anyone can post a message
    function writeMessage(string memory _title, string memory _text) public checkEmptyString(_title, _text) {
        messages[messageCount] = Message(msg.sender, _title, _text);
        messageCount++;

        emit MessageWritten(messageCount - 1, msg.sender);
    }


    function editMessage(uint _id, string memory _title, string memory _text) public checkEmptyString(_title, _text){
        Message storage m = messages[_id];
        require(msg.sender == m.author, "Only author can edit");

        if (bytes(_title).length > 0) {
            m.title = _title;
        }

        if (bytes(_text).length > 0) {
            m.text = _text;
        }

        emit MessageEdited(messageCount -1, msg.sender);
    }

    function readMessage(uint _id) public view returns (string memory, string memory) {
        Message memory m = messages[_id];
        return (m.title, m.text);
    }

    function readLatestMessage() public view returns (string memory, string memory) {
        require(messageCount > 0, "No messages yet.");
        Message memory m = messages[messageCount - 1];
        return (m.title, m.text);
    }

    function getMessage(uint _id) public returns(string memory, string memory) {
        Message memory m = messages[_id];
        return (m.title, m.text);
    }

    function deleteMessage(uint _id) public {
        Message storage m = messages[_id];
        require(msg.sender == m.author, "Only author can delete");
        delete messages[_id];
    }

    // checking if the input string are empty
    // ensure at least one field is not empty
    modifier checkEmptyString(string memory _title, string memory _text) {
        require(bytes(_title).length > 0 || bytes(_text).length > 0 , "Both title and text are empty");
        _;
    }
}