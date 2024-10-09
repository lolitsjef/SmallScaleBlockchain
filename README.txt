Created by: Matthew Gunton, Blake Wilkey, and Jefferson Van Buskirk

Building Block/Blockchain
To read file(s) and create a blockchain
  1) Run: node index.js
  2) After bring prompted for filename(s) enter as many files as you would like (separated by comma, no spaces)
      ex: <filename1>.txt,<filename2>.txt,<filename3>.<filename1>txt 
  3) A file named <filename1>.block.out will be generated with the current blockchain

Validating Blockchain
  To validate a Blockchain file(<name>.block.out) 
  1) node index.js --validate 
  2) enter <filename>.block.out
  3) Console should print out whether the Blockchain is valid or not

Balance + Proof of Membership:
  1) node index.js --validate --service <account name>
  2) enter <filename>.block.out
  3) if the account exists in the blockchain:
    a) Console will validate the current blockchain and return the balace with the     hashes to prove the accounts membership and balance. 
    b) if it does not exist, then it will return false