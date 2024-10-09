const crypto = require('crypto');
const readlineSync = require('readline-sync');
const fs = require('fs');
const readline = require('readline');
const once = require('events').once;

async function processLineByLine(input) {
try{
  const fileStream = fs.createReadStream(input);
  return await readingFileStream(fileStream)
}catch(e){
  throw new Error(e);
}
}

function readingFileStream(fileStream){
   return new Promise((resolve, reject)=>{
    try{
         const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity
                   });
                                                               // Note: we use the crlfDelay option to recognize all instances of CR LF
         const fileValues = [];
         rl.on('line', (line) => {
             const inputs = line.split(" ");
             if(inputs.length == 2) fileValues.push(new InputObj(inputs[0], parseInt(inputs[1])));
         })
	.on('close', () => {
//		  console.log('file closed');
		  resolve(fileValues);
	});
     }catch(e){
         console.log("ERROR ",e);
	reject(e)
     }
})
}

function readBlockChainFile(fileStream){
return new Promise((resolve, reject)=>{
    try{
         const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity
                   });
                                                             
         const blockchain = [];
         let mtrh;
         let pbh;
         let timestamp;
         let diff;
         let nonce;
         let values = [];
         let headerHash;
         let readingVals = false;
         let a = false,
             b = false,
             c = false,
             d = false,
             e = false,
             f = false;
         rl.on('line', (line) => {
             const inputs = line.split(" ");
              if(inputs.length == 2){
                if(inputs[0] === "merkleTreeRootHash:"){
                    mtrh = inputs[1];
                    a = true;
                }
                if (inputs[0] === "prevBlockHash:"){
                    pbh = inputs[1];
                    b = true;
                }
                if (inputs[0] === "unixTimeStamp:"){
                    timestamp = inputs[1];
                    c = true;
                }
                if (inputs[0] === "difficulty:"){
                    diff = inputs[1];
                    d = true;
                }
                if (inputs[0] === "nonce:"){
                    nonce = inputs[1];
                    e = true;
                }
                if(inputs[1] === "headerHash:"){
                  headerHash = inputs[1];
                  f = false;
                }
                if (line === "END HEADER"){
                  readingVals = true;
                }
                if (line !== "END HEADER" && line !== "END BLOCK" && readingVals){
                 values.push(line);
                }
              }
            if (line === "END BLOCK" && a && b && c && d && e){
              blockchain.push(new BlockTwo(pbh, mtrh, timestamp, diff, nonce, values));
              a = false;
              b = false;
              c = false;
              d = false;
              e = false;
              f = false;
              readingVals = false;
              values = [];
            }
         })
	.on('close', () => {
		  resolve(blockchain);
	});
     }catch(e){
        console.log("ERROR ",e);
	      reject(e)
     }
})
}

function InputObj(addr, balance) {
         this.addr = addr;
         this.bal = balance;
}

function hasher(value) {
       let hash = crypto.createHmac('sha256', 'B R A S I L'); //shart256
       hash.update(value);
       return hash.digest('hex');
};


//Build recursively builds the tree from the leaves up.
//Iterating over two elements in an array at a time, hashing them and adding the hash to a new array, until only the root is left
function build (data) { // array of strings to be further hashed
  let index = 0;
	let A2 = [];
  let index2 = 0;

  //if only given one element
  if (data.length == 1){
    return hasher(data[index]);
  }

  //if odd length
  let oddElement;
  if (data.length % 2 == 1){
    oddElement = data.pop();
  }

	for (i = 0; i < data.length/2; i++){
     	//hash the two elements together
		A2[index2++] = hasher(data[index++] +""+data[index++]);
 	  	    //might need to set node a = hasher then set nodes children and then set A2[index2] = node;
	}
  if(typeof oddElement === "String"){
    A2[index2] = oddElement
  }
	if (A2.length > 1){
          	return (build(A2));
	}
	else {
     	      	return A2[0];
      }
}
function buildTree (data, tree) { // array of strings to be further hashed
  let index = 0;
  let A2 = [];
  let index2 = 0;

  //if only given one element
  if (data.length == 1){
    const root = new MerkleNode(null, null, hasher(data[index].hash));
    root.LC = data[index];
    tree.push(root);
    return root.hash;
  }

  //if odd length
  let oddElement;
  if (data.length % 2 == 1){
    oddElement = data.pop();
  }

	for (i = 0; i < data.length/2; i++){
     	//hash the two elements together
     		const node = new MerkleNode(null, null, hasher(data[index].hash+""+data[index+1].hash));
                node.LC = data[index];
	        node.RC = data[index+1];
                index+= 2;
		A2[index2++] = node;
                tree.push(node);
 	  	    //might need to set node a = hasher then set nodes children and then set A2[index2] = node;
	}
  if(typeof oddElement === "object"){
    A2[index2] = oddElement
  }
	if (A2.length > 1){
          	return (buildTree(A2, tree));
	}
	else {
     	      	return A2[0].hash;
      }
}

function MerkleNode(balance, address, hash){
	this.bal = balance;
	this.addr = address;
	this.hash = hash;
	this.LC = null;
	this.RC = null;
}

function BlockTwo(prevHash, merkRoot, ts, d, nonce, vals, hh){
  this.header = {
    prevBlockHash: prevHash,
		merkleTreeRootHash: merkRoot,
		unixTimeStamp: ts,
		difficulty: d,
		nonce: nonce
  };
  this.headerHash = hh;
  this.inputs = vals;
}

function Block(prevHash, merkRoot, ts, d, vals){
	const values = [];
	for(let i = 0; i < vals.length; i++){
		values.push(vals[i].addr+" "+vals[i].bal);
	}
	//calculating the nonce
	const targetValue = Math.pow(2, 256) * d;
	let n, hash;
	do{
		n = Math.random();
		hash = parseInt(hasher(merkRoot+n), 16);
	}while(hash > targetValue);
	this.header = {
		prevBlockHash: prevHash,
		merkleTreeRootHash: merkRoot,
		unixTimeStamp: ts,
		difficulty: d,
		nonce: n
	};
  this.headerHash = hash;
	this.inputs = values;
}

async function printBlockchain(blockchain, fname, printAccounts){
  let str = "";
	for(let i = 0; i < blockchain.length; i++){
		str += 'BEGIN BLOCK\n';
		str += 'BEGIN HEADER\n';
		for(const [key, value] of Object.entries(blockchain[i].header)){
			str += key+": "+value+"\n";
		}
		str += "END HEADER\n";
		if(printAccounts){
			for(let input of blockchain[i].inputs){
	      str += input+"\n";
			}
		}

		str += 'END BLOCK\n\n';
    await writeFile(str, fname);
	}
}

function writeFile(str, name){
  return new Promise((resolve, reject)=>{
    fs.writeFile('./'+name, str, err => {
    if (err) reject(err);
    resolve();
  })
})
}

function validateBlock(block){
  if(block.inputs.length == 0) throw new Error("No Accounts are Recorded");
  const data = block.inputs.map(element=>{
    const arr = element.split(" ");
    return new MerkleNode(arr[1], arr[0], hasher(arr[0]+""+arr[1]));
  })
  const tree = [];
  const merkleTreeRootHash = buildTree(data, tree);
  if(merkleTreeRootHash !== block.header.merkleTreeRootHash) throw new Error("Merkle root hash is not as expected for block:"+block.header.merkleTreeRootHash);

  const targetValue = Math.pow(2, 256) * block.header.difficulty;
	let hash = parseInt(hasher(block.header.merkleTreeRootHash+block.header.nonce), 16);
  if(hash > targetValue) throw new Error("Hash value is not as expected for block:"+block.header.merkleTreeRootHash);
  return true;
}

function validateBlockchain(blockchain){
  for(let i = blockchain.length - 1; i >= 1; i--){
    if(!validateBlock(blockchain[i])) return false; 
    const expectedPrevHash = hasher(stringify(blockchain[i-1].header));
    if(expectedPrevHash !== blockchain[i].header.prevBlockHash) throw new Error("Hash of previous header does not equal hash of current at block from start #"+i);
    const prevTimeStamp = blockchain[i-1].header.timestamp;
    if(prevTimeStamp > blockchain[i].header.timestamp) throw new Error("Bad Timestamp for block from start #"+i);
  }
  if(!validateBlock(blockchain[0])) return false;
  if(blockchain[0].header.prevBlockHash != 0) return false;
  return true;
}

function ProofMerkleNode(val, addy, hash, dot){
  this.val = val;
  this.addr = addy;
  this.hash = hash;
  this.dot = dot;
  this.LC = null;
	this.RC = null;
}

function balance(searchAddr, blockchain){
  let blockWithAddy = -1;
  let bal = 0;
  const forwardHashes = [];
  forwardHashes.unshift(hasher(stringify(blockchain[blockchain.length -1])));
  for(let i = blockchain.length - 1; i >= 0; i--){
    forwardHashes.unshift(blockchain[i].prevHash);
    for(let j = 0; j < blockchain[i].inputs.length; j++){
      const addyByval = blockchain[i].inputs[j].split(" ");
      const addy = addyByval[0];
      if(addy == searchAddr){
        blockWithAddy = i;
        bal = addyByval[1];
        forwardHashes.shift();
        break;
      }
    }
    if(blockWithAddy != -1) break;
  }
  if(blockWithAddy == -1) return false;

  const block = blockchain[blockWithAddy];
  const data = block.inputs.map(element=>{
    const arr = element.split(" ");
    return new ProofMerkleNode(arr[1], arr[0], hasher(arr[0]+""+arr[1]), arr[0] === searchAddr);
  });
  const proof = [];
  let rootHash = buildProof(data, proof);
  proof.push(rootHash);
  return {
    balance: bal,
    hashes: proof,
    header: block.header,
    };
}

function buildProof(data, proof){
  let index = 0;
  let A2 = [];
  let index2 = 0;

  //if only given one element
  if (data.length == 1){
    const root = new ProofMerkleNode(null, null, hasher(data[index].hash), true);
    root.LC = data[index];
    proof.push(data[0].hash);
    return root.hash;
  }

  //if odd length
  let oddElement;
  if (data.length % 2 == 1){
    oddElement = data.pop();
  }

	for (i = 0; i < data.length/2; i++){
     	//hash the two elements together
        const dot = data[index+1].dot || data[index].dot;
     		const node = new ProofMerkleNode(null, null, hasher(data[index].hash+""+data[index+1].hash), dot);
        if(dot){
          proof.push( data[index+1].dot ? data[index+1].hash : data[index].hash );
          proof.push( data[index+1].dot ? data[index].hash : data[index+1].hash );
        }
        node.LC = data[index];
	      node.RC = data[index+1];
        index += 2;
		    A2[index2++] = node;
 	  	    //might need to set node a = hasher then set nodes children and then set A2[index2] = node;
	}
  if(typeof oddElement === "object"){
    A2[index2] = oddElement; 
  }
  
	if (A2.length > 1){
          	return buildProof(A2, proof);
	}
	else {
     	      return A2[0].hash;
      }
}

function checkParams(args){
  let results = {};
  for(let i = 0; i < args.length; i++){
    if(args[i] === "--no-accounts"){
      results.noaccounts = true;
    }
    if(args[i] === "--validate"){
      results.validate = true;
    }
    if(args[i] === "--service"){
      results.service = true;
    }
    if(args[i-1] === "--service"){
      results.account = args[i];
    }
  }
  results.service = typeof results.service === "undefined" ? false : true;
  results.noaccounts = typeof results.noaccounts === "undefined" ? false : true;
  results.validate = typeof results.validate === "undefined" ? false : true;

  if(!results.validate && results.service){
    throw new Error("You need to validate a blockchain before you can service an account from it");
  }

  if(results.service && typeof results.account === "undefined"){
    throw new Error("You need to enter an account number to service its balance");
  }
  return results;
}

function stringify(obj){
  let str = "";
  for(let i of Object.keys(obj)){
    str += i+": "+obj[i];
  }
  return str;
}

async function main(args){
  try{
  let results = args ? checkParams(args) : checkParams([]);
  
  let blockchain = [];
  if(results.validate){
    const input = readlineSync.question("Please enter the file name of the blockchain, including its file extension\n");
    const fileStream = fs.createReadStream(input);
    blockchain = await readBlockChainFile(fileStream);
    if(!validateBlockchain(blockchain)) throw new Error("Invalid Blockchain");
    console.log("Valid Blockchain");
    if(results.service){
      let bal = balance(results.account, blockchain);
      console.log("Balance: ",bal);
    }
    return;
  }

  const input = readlineSync.question("Please enter the file name of the input:\n").split(",");
  for(let i = 0; i < input.length; i++){
	  const data = await processLineByLine(input[i]);
	  const tree = [];
	  const dataObj = data.map(obj=>new MerkleNode(obj.bal, obj.addr, hasher(obj.addr+""+obj.bal)));
	  const merkleTreeRootHash = buildProof(dataObj, tree);
	  const prevHash = i == 0 ? 0 : hasher(stringify(blockchain[blockchain.length -1].header));
	  const block = new Block(prevHash, merkleTreeRootHash, Math.floor(new Date().getTime() / 1000), .5, data);
	  blockchain.push(block);
  }
  //console.log(blockchain);
  let fileName = input[0].split(".")[0]+".block.out";
  await printBlockchain(blockchain, fileName, !results.noaccounts);
  }catch(e){
    console.log("An Error Occured: ", e.message);
  }
}
main([process.argv[2], process.argv[3], process.argv[4]]);