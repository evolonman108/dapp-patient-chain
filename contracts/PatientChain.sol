pragma solidity ^0.4.17;

contract Patient {

	struct History {
		string test;
		string treatment;
		address doctor;
	}

	string public name;
	int public age;
	History[] public histories;

	constructor(string pName, int pAge) public {
		name = pName;
		age = pAge;
	}

	function addHistory(string test, string treatment) public 
	{
		History memory h = History({
			test: test,
			treatment: treatment,
			doctor: msg.sender
		});	
		histories.push(h);
    }

	function getHistorySize() public view returns(uint) {
        return histories.length;
    }

}