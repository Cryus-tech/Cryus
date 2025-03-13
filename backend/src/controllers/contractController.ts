import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Contract } from '../models/Contract';
import { generateSmartContract, auditSmartContract, analyzeCode, generateContractTests } from '../services/aiService';

// Generate a new smart contract
export const generateContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      contractType,
      blockchain,
      tokenName,
      tokenSymbol,
      totalSupply,
      features,
      customFunctions,
      securityLevel,
      compliance,
      targetGas
    } = req.body;

    // Generate smart contract code using AI
    const contractCode = await generateSmartContract({
      contractType,
      blockchain,
      tokenName,
      tokenSymbol,
      totalSupply,
      features,
      customFunctions,
      securityLevel,
      compliance,
      targetGas
    });

    // Create a new contract document
    const contract = await Contract.create({
      user: req.user._id,
      contractType,
      blockchain,
      tokenName,
      tokenSymbol,
      totalSupply,
      features,
      customFunctions,
      securityLevel,
      compliance,
      code: contractCode,
    });

    res.status(201).json({
      status: 'success',
      data: {
        contract,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all contracts for the authenticated user
export const getContracts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contracts = await Contract.find({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      results: contracts.length,
      data: {
        contracts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific contract
export const getContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contract,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a contract
export const updateContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contract,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a contract
export const deleteContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Analyze a contract for security issues
export const analyzeContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    // Call the AI-powered security audit service
    const securityAnalysis = await auditSmartContract({
      contractCode: contract.code,
      blockchain: contract.blockchain,
      contractType: contract.contractType
    });

    // Update the contract with the analysis results
    contract.securityAnalysis = securityAnalysis;
    await contract.save();

    res.status(200).json({
      status: 'success',
      data: {
        contract: contract._id,
        analysis: securityAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Optimize contract code
export const optimizeContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    const { optimization = 'gas' } = req.body;

    // Get the language based on blockchain
    const language = contract.blockchain === 'Solana' ? 'Rust' : 'Solidity';

    // Call the code analysis and optimization service
    const optimizationResults = await analyzeCode({
      code: contract.code,
      language,
      optimization,
      securityCheck: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        contract: contract._id,
        optimization: optimizationResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate tests for a contract
export const generateTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    const { testingFramework } = req.body;

    // Generate test cases using AI
    const testCode = await generateContractTests({
      contractCode: contract.code,
      blockchain: contract.blockchain,
      testingFramework
    });

    // Update the contract with the generated tests
    contract.tests = testCode;
    await contract.save();

    res.status(200).json({
      status: 'success',
      data: {
        contract: contract._id,
        tests: testCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate an implementation of the contract
export const implementContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contractId } = req.params;
    const { implementationDetails } = req.body;

    const contract = await Contract.findOne({
      _id: contractId,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found',
      });
    }

    // In a real implementation, this would deploy the contract to a blockchain
    // or generate ready-to-deploy files
    const implementationResult = {
      status: 'success',
      files: [
        {
          name: `${contract.contractType.toLowerCase()}.${contract.blockchain === 'Solana' ? 'rs' : 'sol'}`,
          content: contract.code,
        },
        {
          name: `${contract.contractType.toLowerCase()}_tests.${contract.blockchain === 'Solana' ? 'ts' : 'js'}`,
          content: contract.tests || 'No tests generated yet',
        },
      ],
      deployment: {
        ready: true,
        estimatedGas: 1500000,
        recommendedNetwork: contract.blockchain === 'Solana' ? 'devnet' : 'goerli',
      },
    };

    res.status(200).json({
      status: 'success',
      data: {
        contract: contract._id,
        implementation: implementationResult,
      },
    });
  } catch (error) {
    next(error);
  }
}; 