const Dapp = {

    hospitalAddress: undefined,
    patientAddress: undefined,

    createNewAccount: function() {
      Dapp.web3.personal.newAccount(
        prompt("Please enter your password"),
        function(error, address) {
          if (error) {
            alert(error);
          } else {
            Dapp.setHospitalAddress(address);
            $(".nav-tabs .nav-link").removeClass("disabled");
          }
        }
      );
    },
    importHospitalAddress: function() {
        var address = prompt("Please enter address", "0x9ffe008c97c3cf72d373cc1f19544ef04a243a15");
        if (!Dapp.web3.isAddress(address)) {
          alert("Please input a valid address!");
          return;
        }

        Dapp.web3.personal.unlockAccount(
          address,
          prompt("Please enter your password for this address"),
          function(error, result) {
            if (error) {
              alert(error);
            } else {
              Dapp.setHospitalAddress(address);
              $(".nav-tabs .nav-link").removeClass("disabled");
            }
          }
        );
    },

    setHospitalAddress: function(address) {
        Dapp.hospitalAddress = address;
        $(".user-address").text(address);
        Dapp.refreshAdminBalance();
    },

    refreshAdminBalance: function() {
        if (Dapp.hospitalAddress) {
            Dapp.web3.eth.getBalance(Dapp.hospitalAddress, function(error, weiAmount) {
                var ethValue = Dapp.web3.fromWei(weiAmount, "ether");
                $(".user-balance").text(ethValue);
            });
        }
    },

    createNewTest: function() {
        Dapp.web3.eth.defaultAccount = Dapp.hospitalAddress;
        Dapp.web3.personal.unlockAccount(
          Dapp.hospitalAddress,
          prompt("Please enter your password for this hospital address"),
          function(error, result) {
            if (error) {
              alert(error);
            } else {
                var pContract = Dapp.web3.eth.contract(compiled_contracts.abi);
                var test = $("#idTest").val();
                var treatMent = $("#idTreatMent").val();
                pContract.at(Dapp.patientAddress).addHistory(test, treatMent, {
                    from: Dapp.hospitalAddress,
                    gas: '4700000'
                }, function(e, contract){
                    if(!e) {
                        console.log("add new test success ", contract);
                    }
                });
                $('#frmTest').addClass('d-none'); $('#btnShowFormTest').show();
            }
          }
        )
        
    },

    getPatient: function() {
        var address = $("#existingPatient").val();
        Dapp.patientAddress = address;
        
        var pContract = Dapp.web3.eth.contract(compiled_contracts.abi);
        var patient= pContract.at(address);
        var name = patient.name();
        var age = patient.age();
        var historyLength = patient.getHistorySize();
        var histories = []
        for(var i = 0; i < historyLength; i++) {
            histories.push({
                test: patient.histories(i)[0],
                treatment: patient.histories(i)[1],
                address: patient.histories(i)[2]
            });
        }
        

        var pollTemplate = doT.template(document.getElementById('templatePatientInfo').text, undefined, undefined);
        document.getElementById('patientInfo').innerHTML = pollTemplate({'name': name, 'age': age, 'histories': histories});
    },

    createNewPatient: function() {
        var pName = $("#patientName").val();
        var pAge = $("#patientAge").val();
        var pContract = Dapp.web3.eth.contract(compiled_contracts.abi);
        pContract.new(
            pName,
            pAge,
            {
                data: compiled_contracts.data,
                from: Dapp.hospitalAddress,
                gas: 4700000
            }, function(e, contract){
                console.log(contract);
                if (!e) {
                    console.log('Patient contract created at: ' + contract.address);
                    if(contract.address) {
                        $("#alertAddressPatient").addClass("show").removeClass("d-none");
                        $("#msgCreatePatient").text(contract.address);
                        Dapp.patientAddress = contract.address;
                    }
                } else {
                  console.log(e);
                }
            }
        )
    }
};

var intRefreshBalance = setInterval(Dapp.refreshAdminBalance, 2000);

window.addEventListener("load", function() {
  if (typeof web3 !== "undefined") {
    console.log("Web3 Detected! " + web3.currentProvider.constructor.name);
    Dapp.web3 = new Web3(web3.currentProvider);
  } else {
    console.log("No Web3 Detected... using HTTP Provider");
    Dapp.web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:8545")
    );
  }

});
