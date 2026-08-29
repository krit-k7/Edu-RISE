import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Code, Terminal } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="mb-xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Shield size={48} className="text-accent mx-auto mb-md" />
          <h1 className="title-lg mb-sm">About ScholarShield</h1>
          <p className="text-secondary text-lg">
            Privacy-preserving eligibility verification built on the Midnight Network.
          </p>
        </motion.div>

        <div className="space-y-lg">
          <motion.section 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="title-md mb-sm flex items-center">
              <BookOpen className="mr-sm text-accent" size={24} /> The Problem
            </h2>
            <p className="text-secondary leading-relaxed">
              Traditional scholarship applications require students to submit highly sensitive 
              personal information, such as their family's annual income and their academic transcripts. 
              This data is often stored on centralized servers, creating significant privacy risks and 
              potential for data breaches.
            </p>
          </motion.section>

          <motion.section 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="title-md mb-sm flex items-center">
              <Code className="mr-sm text-accent" size={24} /> The ZK Solution
            </h2>
            <p className="text-secondary leading-relaxed mb-md">
              ScholarShield utilizes Midnight's Zero-Knowledge (ZK) capabilities to invert this model. 
              Instead of sending your data to an authority, the authority's rules (the smart contract) 
              are sent to your device.
            </p>
            <ul className="list-disc pl-lg text-secondary space-y-sm">
              <li>Your GPA and Income act as <strong>private witnesses</strong>.</li>
              <li>A local WASM circuit computes whether you meet the criteria.</li>
              <li>Only a cryptographic proof (a True/False assertion) is submitted to the blockchain.</li>
              <li>Your private data never leaves your browser.</li>
            </ul>
          </motion.section>

          <motion.section 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="title-md mb-sm flex items-center">
              <Terminal className="mr-sm text-accent" size={24} /> Open Source
            </h2>
            <p className="text-secondary leading-relaxed mb-md">
              This project was built for the <strong>Midnight New Moon to Full Hackathon</strong>. 
              The smart contract is written in Compact, and the frontend uses React and the Midnight.js SDK.
            </p>
            <a 
              href="https://github.com/DeepSaha25/ScholarShield" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary inline-flex"
            >
              View Source Code on GitHub
            </a>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
