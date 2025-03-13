// Solana Web3.js 客户端示例
// 此示例展示如何与Cryus代币合约交互

const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const fs = require('fs');
const BN = require('bn.js');

// 连接到Solana网络
async function connectToNetwork() {
  // 连接到Solana开发网络
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  console.log('已连接到Solana开发网络');
  return connection;
}

// 加载钱包
function loadWallet(keypairFile) {
  const keypairData = JSON.parse(fs.readFileSync(keypairFile, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

// 创建代币铸造账户
async function createMintAccount(connection, payer, programId) {
  // 创建一个新的账户作为代币铸造账户
  const mintAccount = Keypair.generate();
  console.log('铸造账户公钥:', mintAccount.publicKey.toString());

  // 计算所需空间 (根据Mint结构大小)
  const mintSpace = 44; // 根据Mint结构的大小调整

  // 计算租金豁免金额
  const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(mintSpace);

  // 创建系统指令来创建账户
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintAccount.publicKey,
    lamports: rentExemptBalance,
    space: mintSpace,
    programId: programId,
  });

  // 创建初始化铸造账户的指令
  const initMintInstruction = new TransactionInstruction({
    keys: [
      { pubkey: mintAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
    ],
    programId: programId,
    data: Buffer.from([
      0, // 指令索引 (0 = InitializeMint)
      9, // 精度 (9位小数)
      ...payer.publicKey.toBuffer(), // 铸造权限
    ]),
  });

  // 创建并发送交易
  const transaction = new Transaction().add(
    createAccountInstruction,
    initMintInstruction
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintAccount],
    { commitment: 'confirmed' }
  );

  console.log('铸造账户创建交易签名:', signature);
  return mintAccount;
}

// 创建代币账户
async function createTokenAccount(connection, payer, programId, mintPubkey, owner) {
  // 创建一个新的账户作为代币账户
  const tokenAccount = Keypair.generate();
  console.log('代币账户公钥:', tokenAccount.publicKey.toString());

  // 计算所需空间 (根据TokenAccount结构大小)
  const tokenAccountSpace = 41; // 根据TokenAccount结构的大小调整

  // 计算租金豁免金额
  const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(tokenAccountSpace);

  // 创建系统指令来创建账户
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: tokenAccount.publicKey,
    lamports: rentExemptBalance,
    space: tokenAccountSpace,
    programId: programId,
  });

  // 创建初始化代币账户的指令 (这里我们假设合约内部有一个初始化代币账户的指令)
  // 注意：在实际合约中，您可能需要实现这个指令
  const initTokenAccountInstruction = new TransactionInstruction({
    keys: [
      { pubkey: tokenAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
    ],
    programId: programId,
    data: Buffer.from([
      4, // 指令索引 (4 = InitializeAccount，需要在合约中实现)
      ...owner.toBuffer(), // 账户所有者
    ]),
  });

  // 创建并发送交易
  const transaction = new Transaction().add(
    createAccountInstruction,
    initTokenAccountInstruction
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, tokenAccount],
    { commitment: 'confirmed' }
  );

  console.log('代币账户创建交易签名:', signature);
  return tokenAccount;
}

// 铸造代币
async function mintTokens(connection, payer, programId, mintPubkey, destinationPubkey, amount) {
  // 创建铸造代币的指令
  const mintInstruction = new TransactionInstruction({
    keys: [
      { pubkey: mintPubkey, isSigner: false, isWritable: true },
      { pubkey: destinationPubkey, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: programId,
    data: Buffer.from([
      1, // 指令索引 (1 = MintTo)
      ...new BN(amount).toArray('le', 8), // 金额 (小端序，8字节)
    ]),
  });

  // 创建并发送交易
  const transaction = new Transaction().add(mintInstruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  console.log('铸造代币交易签名:', signature);
}

// 转账代币
async function transferTokens(connection, payer, programId, sourcePubkey, destinationPubkey, amount) {
  // 创建转账代币的指令
  const transferInstruction = new TransactionInstruction({
    keys: [
      { pubkey: sourcePubkey, isSigner: false, isWritable: true },
      { pubkey: destinationPubkey, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: programId,
    data: Buffer.from([
      2, // 指令索引 (2 = Transfer)
      ...new BN(amount).toArray('le', 8), // 金额 (小端序，8字节)
    ]),
  });

  // 创建并发送交易
  const transaction = new Transaction().add(transferInstruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  console.log('转账代币交易签名:', signature);
}

// 销毁代币
async function burnTokens(connection, payer, programId, sourcePubkey, mintPubkey, amount) {
  // 创建销毁代币的指令
  const burnInstruction = new TransactionInstruction({
    keys: [
      { pubkey: sourcePubkey, isSigner: false, isWritable: true },
      { pubkey: mintPubkey, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: programId,
    data: Buffer.from([
      3, // 指令索引 (3 = Burn)
      ...new BN(amount).toArray('le', 8), // 金额 (小端序，8字节)
    ]),
  });

  // 创建并发送交易
  const transaction = new Transaction().add(burnInstruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  console.log('销毁代币交易签名:', signature);
}

// 主函数
async function main() {
  try {
    // 连接到Solana网络
    const connection = await connectToNetwork();

    // 加载钱包 (假设您有一个keypair.json文件)
    const payer = loadWallet('keypair.json');
    console.log('钱包公钥:', payer.publicKey.toString());

    // 程序ID (部署合约后获得的地址)
    const programId = new PublicKey('YOUR_PROGRAM_ID_HERE');

    // 创建铸造账户
    const mintAccount = await createMintAccount(connection, payer, programId);

    // 创建两个代币账户
    const tokenAccount1 = await createTokenAccount(connection, payer, programId, mintAccount.publicKey, payer.publicKey);
    const tokenAccount2 = await createTokenAccount(connection, payer, programId, mintAccount.publicKey, payer.publicKey);

    // 铸造代币到第一个账户
    await mintTokens(connection, payer, programId, mintAccount.publicKey, tokenAccount1.publicKey, 1000000000); // 1000 tokens with 9 decimals

    // 从第一个账户转账到第二个账户
    await transferTokens(connection, payer, programId, tokenAccount1.publicKey, tokenAccount2.publicKey, 500000000); // 500 tokens

    // 从第二个账户销毁一些代币
    await burnTokens(connection, payer, programId, tokenAccount2.publicKey, mintAccount.publicKey, 200000000); // 200 tokens

    console.log('示例完成');
  } catch (error) {
    console.error('错误:', error);
  }
}

// 运行主函数
main(); 